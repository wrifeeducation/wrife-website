import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { classId, pupilId } = await request.json();

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    const pool = getPool();

    const assignmentsResult = await pool.query(
      `SELECT a.id, a.lesson_id, a.class_id, a.teacher_id, a.title, a.instructions, a.due_date, a.created_at,
              l.lesson_number, l.part, l.title AS lesson_title, l.summary
       FROM assignments a
       LEFT JOIN lessons l ON l.id = a.lesson_id
       WHERE a.class_id = $1
       ORDER BY a.created_at DESC`,
      [classId]
    );

    let submissions: any[] = [];
    let progressRecords: any[] = [];

    if (pupilId) {
      try {
        const subsResult = await pool.query(
          'SELECT * FROM submissions WHERE pupil_id = $1',
          [pupilId]
        );
        submissions = subsResult.rows;
      } catch (err) {
        console.log('Submissions table may not exist, continuing without submissions');
      }

      try {
        const progressResult = await pool.query(
          'SELECT * FROM progress_records WHERE pupil_id = $1',
          [pupilId]
        );
        progressRecords = progressResult.rows;
      } catch (err) {
        console.log('Progress records may not exist, continuing');
      }
    }

    let pwpAssignments: any[] = [];
    let pwpSubmissions: any[] = [];

    try {
      const pwpResult = await pool.query(
        `SELECT pa.id, pa.activity_id, pa.instructions, pa.due_date, pa.created_at,
                pg.id AS pg_id, pg.level, pg.level_name, pg.grammar_focus,
                pg.sentence_structure, pg.instructions AS pg_instructions,
                pg.examples, pg.practice_prompts
         FROM pwp_assignments pa
         LEFT JOIN progressive_activities pg ON pg.id = pa.activity_id
         WHERE pa.class_id = $1
         ORDER BY pa.created_at DESC`,
        [String(classId)]
      );
      pwpAssignments = pwpResult.rows.map(row => ({
        id: row.id,
        activity_id: row.activity_id,
        instructions: row.instructions,
        due_date: row.due_date,
        created_at: row.created_at,
        progressive_activities: row.pg_id ? {
          id: row.pg_id,
          level: row.level,
          level_name: row.level_name,
          grammar_focus: row.grammar_focus,
          sentence_structure: row.sentence_structure,
          instructions: row.pg_instructions,
          examples: row.examples,
          practice_prompts: row.practice_prompts,
        } : null,
      }));
    } catch (err) {
      console.log('PWP assignments may not exist, continuing');
    }

    if (pupilId && pwpAssignments.length > 0) {
      try {
        const pwpIds = pwpAssignments.map((a: any) => a.id);
        const pwpSubResult = await pool.query(
          `SELECT * FROM pwp_submissions WHERE pupil_id = $1 AND pwp_assignment_id = ANY($2)`,
          [pupilId, pwpIds]
        );
        pwpSubmissions = pwpSubResult.rows;
      } catch (err) {
        console.log('PWP submissions may not exist, continuing');
      }
    }

    let dwpAssignments: any[] = [];
    let writingAttempts: any[] = [];

    try {
      const dwpResult = await pool.query(
        `SELECT da.id, da.level_id, da.instructions, da.due_date, da.created_at,
                wl.level_number, wl.tier_number, wl.activity_name, wl.prompt_title,
                wl.prompt_instructions, wl.learning_objective
         FROM dwp_assignments da
         LEFT JOIN writing_levels wl ON wl.level_id = da.level_id
         WHERE da.class_id = $1
         ORDER BY da.created_at DESC`,
        [classId]
      );
      dwpAssignments = dwpResult.rows.map(row => ({
        id: row.id,
        level_id: row.level_id,
        instructions: row.instructions,
        due_date: row.due_date,
        created_at: row.created_at,
        writing_levels: row.level_number ? {
          level_number: row.level_number,
          tier_number: row.tier_number,
          activity_name: row.activity_name,
          prompt_title: row.prompt_title,
          prompt_instructions: row.prompt_instructions,
          learning_objective: row.learning_objective,
        } : null,
      }));
    } catch (err) {
      console.log('DWP assignments may not exist, continuing');
    }

    if (pupilId && dwpAssignments.length > 0) {
      try {
        const dwpIds = dwpAssignments.map((a: any) => a.id);
        const attemptsResult = await pool.query(
          `SELECT * FROM writing_attempts WHERE pupil_id = $1 AND dwp_assignment_id = ANY($2)`,
          [pupilId, dwpIds]
        );
        writingAttempts = attemptsResult.rows;
      } catch (err) {
        console.log('Writing attempts may not exist, continuing');
      }
    }

    return NextResponse.json({
      assignments: assignmentsResult.rows,
      submissions,
      progressRecords,
      pwpAssignments,
      pwpSubmissions,
      dwpAssignments,
      writingAttempts,
    });
  } catch (error: any) {
    console.error('Fetch assignments error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
