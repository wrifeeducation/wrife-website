import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { pupilId, assignmentId, levelId, writing, wordCount, timeStarted, status = 'draft', timeSubmitted, timeElapsedSeconds } = await request.json();

    if (!pupilId || !assignmentId || !levelId) {
      return NextResponse.json({ error: 'pupilId, assignmentId, levelId are required' }, { status: 400 });
    }

    const pool = getPool();

    const existing = await pool.query(
      `SELECT id FROM writing_attempts WHERE dwp_assignment_id = $1 AND pupil_id = $2 AND status = 'draft' LIMIT 1`,
      [assignmentId, pupilId]
    );

    let attemptId: string;

    if (existing.rows.length > 0) {
      attemptId = existing.rows[0].id;
      const setClauses = [
        'pupil_writing = $1',
        'word_count = $2',
        'status = $3',
      ];
      const values: any[] = [writing || '', wordCount || 0, status];

      if (status === 'submitted') {
        setClauses.push(`time_submitted = $${values.length + 1}`);
        values.push(timeSubmitted || new Date().toISOString());
        if (timeElapsedSeconds !== undefined) {
          setClauses.push(`time_elapsed_seconds = $${values.length + 1}`);
          values.push(timeElapsedSeconds);
        }
      }

      values.push(attemptId);
      await pool.query(
        `UPDATE writing_attempts SET ${setClauses.join(', ')} WHERE id = $${values.length}`,
        values
      );
    } else {
      const insertRes = await pool.query(
        `INSERT INTO writing_attempts
         (pupil_id, dwp_assignment_id, level_id, pupil_writing, word_count, status, time_started, time_submitted, time_elapsed_seconds)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          pupilId, assignmentId, levelId,
          writing || '', wordCount || 0,
          status,
          timeStarted || new Date().toISOString(),
          status === 'submitted' ? (timeSubmitted || new Date().toISOString()) : null,
          status === 'submitted' ? (timeElapsedSeconds || null) : null,
        ]
      );
      attemptId = insertRes.rows[0].id;
    }

    return NextResponse.json({ success: true, attemptId });
  } catch (error: any) {
    console.error('[DWP draft save]', error);
    return NextResponse.json({ error: 'Could not save draft' }, { status: 500 });
  }
}
