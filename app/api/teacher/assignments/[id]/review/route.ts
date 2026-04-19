import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assignmentId = parseInt(id);
    if (isNaN(assignmentId)) {
      return NextResponse.json({ error: 'Invalid assignment ID' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const pool = getPool();

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

    const pupilsResult = await pool.query(
      `SELECT id, first_name, last_name FROM pupils WHERE class_id = $1 AND is_active = true ORDER BY first_name, last_name`,
      [assignment.class_id]
    );

    const submissionsResult = await pool.query(
      `SELECT s.id, s.pupil_id, s.content, s.status, s.submitted_at, s.teacher_feedback, s.created_at, s.updated_at,
              p.first_name, p.last_name
       FROM submissions s
       JOIN pupils p ON p.id = s.pupil_id
       WHERE s.assignment_id = $1
       ORDER BY s.submitted_at DESC NULLS LAST`,
      [assignmentId]
    );

    const submissions = submissionsResult.rows.map(row => ({
      id: row.id,
      pupil_id: row.pupil_id,
      content: row.content,
      status: row.status,
      submitted_at: row.submitted_at,
      teacher_feedback: row.teacher_feedback,
      created_at: row.created_at,
      updated_at: row.updated_at,
      pupil_name: `${row.first_name} ${row.last_name || ''}`.trim(),
    }));

    const submissionIds = submissions.map(s => s.id);
    let assessments: any[] = [];
    if (submissionIds.length > 0) {
      const assessmentsResult = await pool.query(
        `SELECT * FROM ai_assessments WHERE submission_id = ANY($1)`,
        [submissionIds]
      );
      assessments = assessmentsResult.rows;
    }

    let progressRecords: any[] = [];
    if (assignment.lesson_id) {
      try {
        const progressResult = await pool.query(
          `SELECT pupil_id, status FROM progress_records WHERE lesson_id = $1`,
          [assignment.lesson_id]
        );
        progressRecords = progressResult.rows;
      } catch {}
    }

    return NextResponse.json({
      assignment,
      pupils: pupilsResult.rows,
      submissions,
      assessments,
      progressRecords,
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
    const { id } = await params;
    const assignmentId = parseInt(id);
    if (isNaN(assignmentId)) {
      return NextResponse.json({ error: 'Invalid assignment ID' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { submissionId, teacherFeedback } = await request.json();
    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId is required' }, { status: 400 });
    }

    const pool = getPool();

    const ownerCheck = await pool.query(
      `SELECT s.id FROM submissions s
       JOIN assignments a ON a.id = s.assignment_id
       WHERE s.id = $1 AND a.id = $2 AND a.teacher_id = $3`,
      [submissionId, assignmentId, user.id]
    );
    if (ownerCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Submission not found or access denied' }, { status: 404 });
    }

    const result = await pool.query(
      `UPDATE submissions
       SET teacher_feedback = $1, status = 'reviewed', updated_at = now()
       WHERE id = $2
       RETURNING id, status, teacher_feedback, updated_at`,
      [teacherFeedback || null, submissionId]
    );

    return NextResponse.json({ submission: result.rows[0] });
  } catch (error: any) {
    console.error('Error saving feedback:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
