import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const assignmentId = searchParams.get('id');
  const pupilId = searchParams.get('pupilId');

  if (!assignmentId || !pupilId) {
    return NextResponse.json({ error: 'id and pupilId are required' }, { status: 400 });
  }

  const pool = getPool();

  try {
    // Fetch the assignment + activity data
    const assignmentRes = await pool.query(
      `SELECT pa.id, pa.activity_id, pa.class_id, pa.instructions, pa.due_date, pa.created_at,
              pg.level, pg.level_name, pg.grammar_focus, pg.sentence_structure,
              pg.instructions AS activity_instructions, pg.examples, pg.practice_prompts
       FROM pwp_assignments pa
       JOIN progressive_activities pg ON pg.id = pa.activity_id
       WHERE pa.id = $1
       LIMIT 1`,
      [parseInt(assignmentId, 10)]
    );

    if (assignmentRes.rows.length === 0) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    const row = assignmentRes.rows[0];

    // Verify pupil is in the class
    const enrollmentRes = await pool.query(
      `SELECT 1 FROM class_members WHERE class_id = $1 AND pupil_id = $2 LIMIT 1`,
      [row.class_id, pupilId]
    );

    if (enrollmentRes.rows.length === 0) {
      return NextResponse.json({ error: 'Not enrolled in this class' }, { status: 403 });
    }

    // Parse JSON fields
    let examples = row.examples;
    let practicePrompts = row.practice_prompts;
    if (typeof examples === 'string') { try { examples = JSON.parse(examples); } catch {} }
    if (typeof practicePrompts === 'string') { try { practicePrompts = JSON.parse(practicePrompts); } catch {} }

    // Fetch existing submission if any
    const submissionRes = await pool.query(
      `SELECT id, content AS pupil_writing, status, submitted_at
       FROM pwp_submissions
       WHERE pwp_assignment_id = $1 AND pupil_id = $2
       ORDER BY created_at DESC LIMIT 1`,
      [parseInt(assignmentId, 10), pupilId]
    );
    const existingSubmission = submissionRes.rows[0] || null;

    return NextResponse.json({
      assignment: {
        id: row.id,
        activity_id: row.activity_id,
        class_id: row.class_id,
        instructions: row.instructions,
        due_date: row.due_date,
        created_at: row.created_at,
      },
      activity: {
        level: row.level,
        level_name: row.level_name,
        grammar_focus: row.grammar_focus,
        sentence_structure: row.sentence_structure,
        instructions: row.activity_instructions,
        examples,
        practice_prompts: practicePrompts,
      },
      existingSubmission,
    });
  } catch (error: any) {
    console.error('[PWP assignment fetch]', error);
    return NextResponse.json({ error: 'Could not load assignment' }, { status: 500 });
  }
}
