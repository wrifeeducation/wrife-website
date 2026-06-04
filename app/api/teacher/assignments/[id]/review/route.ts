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

    // Fetch submissions FOR THIS ASSIGNMENT from the canonical `submissions`
    // table — the same source the teacher dashboard counts. Previously this read
    // `writing_attempts` (the DWP/PWP system, which has no link to lesson
    // assignments and is scoped by pupil, not assignment), so the review page's
    // counts could never match the dashboard's pending-review count (bug B4).
    const submissionsResult = await pool.query(
      `SELECT s.id, s.pupil_id, s.content, s.status, s.submitted_at, s.teacher_note,
              CONCAT(p.first_name, ' ', COALESCE(p.last_name, '')) AS pupil_name
       FROM submissions s
       JOIN pupils p ON p.id = s.pupil_id
       WHERE s.assignment_id = $1
       ORDER BY s.submitted_at DESC NULLS LAST`,
      [assignmentId]
    );

    const submissions = submissionsResult.rows.map(row => ({
      id: row.id,
      pupil_id: row.pupil_id,
      pupil_name: (row.pupil_name || '').trim(),
      content: row.content,
      status: row.status || 'submitted',
      submitted_at: row.submitted_at,
      teacher_feedback: row.teacher_note,
    }));

    return NextResponse.json({
      assignment,
      pupils: pupilsResult.rows,
      submissions,
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

    // Save feedback on the canonical `submissions` row AND mark it reviewed, so
    // the dashboard's pending-review count (which reads submissions.status)
    // decrements. Scoped to this assignment so a teacher can't review another
    // assignment's submission by id. (Previously this wrote
    // writing_attempts.teacher_reviewed, a different table neither counter reads.)
    const result = await pool.query(
      `UPDATE submissions
       SET status       = 'reviewed',
           teacher_note = $1,
           reviewed_at  = now(),
           reviewed_by  = $2
       WHERE id = $3 AND assignment_id = $4
       RETURNING id, status, teacher_note AS teacher_feedback, reviewed_at`,
      [teacherFeedback || null, user.id, submissionId, assignmentId]
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
