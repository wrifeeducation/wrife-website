import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assignmentId } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const pool = getPool();

    // Fetch assignment (UUID id)
    const assignmentResult = await pool.query(
      `SELECT a.id, a.lesson_id, a.class_id, a.title, a.instructions, a.due_date, a.created_at,
              c.name AS class_name, c.year_group,
              l.title AS lesson_title, l.lesson_number, l.part
       FROM assignments a
       JOIN classes c ON c.id = a.class_id
       LEFT JOIN lessons l ON l.id = a.lesson_id
       WHERE a.id = $1 AND a.teacher_id = $2`,
      [assignmentId, user.id]
    );

    if (assignmentResult.rows.length === 0) {
      return NextResponse.json({ error: 'Assignment not found or access denied' }, { status: 404 });
    }

    const assignment = assignmentResult.rows[0];

    // Fetch pupils in the class
    const pupilsResult = await pool.query(
      `SELECT p.id, p.first_name, p.last_name, p.display_name, p.username
       FROM pupils p
       JOIN class_members cm ON cm.pupil_id = p.id
       WHERE cm.class_id = $1 AND p.is_active = true
       ORDER BY p.first_name, p.last_name`,
      [assignment.class_id]
    );

    // Fetch writing attempts for pupils in this class (DWP/PWP writing data)
    const pupilIds = pupilsResult.rows.map(p => p.id);
    let writingAttempts: any[] = [];
    if (pupilIds.length > 0) {
      const attemptsResult = await pool.query(
        `SELECT wa.id, wa.pupil_id, wa.level_id, wa.pupil_writing, wa.status,
                wa.score, wa.percentage, wa.passed, wa.performance_band,
                wa.ai_assessment, wa.teacher_reviewed, wa.teacher_notes,
                wa.flagged_for_review, wa.time_submitted, wa.created_at,
                p.first_name, p.last_name
         FROM writing_attempts wa
         JOIN pupils p ON p.id = wa.pupil_id
         WHERE wa.pupil_id = ANY($1)
         ORDER BY wa.time_submitted DESC NULLS LAST`,
        [pupilIds]
      );
      writingAttempts = attemptsResult.rows.map(row => ({
        id: row.id,
        pupil_id: row.pupil_id,
        pupil_name: `${row.first_name} ${row.last_name || ''}`.trim(),
        level_id: row.level_id,
        content: row.pupil_writing,
        status: row.status || 'submitted',
        submitted_at: row.time_submitted,
        teacher_reviewed: row.teacher_reviewed,
        teacher_notes: row.teacher_notes,
        score: row.score,
        percentage: row.percentage,
        passed: row.passed,
        performance_band: row.performance_band,
        ai_assessment: row.ai_assessment,
        flagged_for_review: row.flagged_for_review,
        created_at: row.created_at,
      }));
    }

    return NextResponse.json({
      assignment,
      pupils: pupilsResult.rows,
      submissions: writingAttempts,
      assessments: [],
      progressRecords: [],
    });
  } catch (error: any) {
    console.error('Error fetching review data:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assignmentId } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { submissionId, teacherFeedback } = await request.json();
    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId is required' }, { status: 400 });
    }

    // Verify teacher owns the assignment
    const pool = getPool();
    const ownerCheck = await pool.query(
      'SELECT id FROM assignments WHERE id = $1 AND teacher_id = $2',
      [assignmentId, user.id]
    );
    if (ownerCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Assignment not found or access denied' }, { status: 404 });
    }

    // Save teacher feedback on the writing attempt
    const result = await pool.query(
      `UPDATE writing_attempts
       SET teacher_notes = $1, teacher_reviewed = true
       WHERE id = $2
       RETURNING id, teacher_reviewed, teacher_notes`,
      [teacherFeedback || null, submissionId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json({ submission: result.rows[0] });
  } catch (error: any) {
    console.error('Error saving feedback:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
