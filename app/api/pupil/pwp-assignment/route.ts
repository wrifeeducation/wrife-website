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

    // Fetch existing submission + any assessment in one query
    const submissionRes = await pool.query(
      `SELECT
         ps.id, ps.content AS pupil_writing, ps.status, ps.submitted_at,
         pa.grammar_accuracy, pa.structure_correctness, pa.feedback,
         pa.corrections, pa.improved_example, pa.teacher_note, pa.created_at AS assessed_at
       FROM pwp_submissions ps
       LEFT JOIN pwp_assessments pa ON pa.pwp_submission_id = ps.id
       WHERE ps.pwp_assignment_id = $1 AND ps.pupil_id = $2
       ORDER BY ps.created_at DESC, pa.created_at DESC
       LIMIT 1`,
      [parseInt(assignmentId, 10), pupilId]
    );

    let existingSubmission: Record<string, any> | null = null;
    let existingAssessment: Record<string, any> | null = null;

    if (submissionRes.rows.length > 0) {
      const r = submissionRes.rows[0];
      existingSubmission = {
        id: r.id,
        pupil_writing: r.pupil_writing,
        status: r.status,
        submitted_at: r.submitted_at,
      };
      // Return assessment if one exists regardless of submission status
      if (r.grammar_accuracy !== null || r.feedback !== null) {
        existingAssessment = {
          grammar_accuracy: r.grammar_accuracy,
          structure_correctness: r.structure_correctness,
          feedback: r.feedback,
          corrections: typeof r.corrections === 'string' ? JSON.parse(r.corrections) : (r.corrections || []),
          improved_example: r.improved_example,
          teacher_note: r.teacher_note,
          assessed_at: r.assessed_at,
        };
      }
    }

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
      existingAssessment,
    });
  } catch (error: any) {
    console.error('[PWP assignment fetch]', error);
    return NextResponse.json({ error: 'Could not load assignment' }, { status: 500 });
  }
}
