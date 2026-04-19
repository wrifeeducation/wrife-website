import { NextRequest, NextResponse } from 'next/server';
import { validatePupilSession } from '@/lib/pupil-auth';
import { getPool } from '@/lib/db';

async function verifyPupilExists(pupilId: string): Promise<boolean> {
  try {
    const pool = getPool();
    const result = await pool.query(
      'SELECT id FROM pupils WHERE id = $1 LIMIT 1',
      [pupilId]
    );
    return result.rows.length > 0;
  } catch (err) {
    console.error('[verifyPupilExists] DB error:', err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { pupilId, lessonId, classId, assignmentId, status = 'completed', progressPayload } = await request.json();

    if (!pupilId || !lessonId) {
      return NextResponse.json({ error: 'Pupil ID and Lesson ID are required' }, { status: 400 });
    }

    const validStatuses = ['not_started', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be: not_started, in_progress, or completed' }, { status: 400 });
    }

    const session = await validatePupilSession(pupilId);
    if (!session.valid) {
      const exists = await verifyPupilExists(pupilId);
      if (!exists) {
        return NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 });
      }
      console.warn(`[practice-complete] Pupil ${pupilId} has no active session but exists in pupils table — allowing progress save`);
    }

    const pool = getPool();

    const existingParams: any[] = [pupilId, parseInt(String(lessonId))];
    let existingSQL = `SELECT id, status FROM progress_records WHERE pupil_id = $1 AND lesson_id = $2`;

    if (assignmentId) {
      existingParams.push(String(assignmentId));
      existingSQL += ` AND assignment_id = $${existingParams.length}`;
    }

    existingSQL += ' LIMIT 1';

    const existingResult = await pool.query(existingSQL, existingParams);
    const existing = existingResult.rows[0] || null;

    if (existing && existing.status === 'completed' && status === 'in_progress') {
      return NextResponse.json({ progress: existing });
    }

    const now = new Date().toISOString();

    if (existing) {
      const setClauses: string[] = ['status = $1', 'updated_at = $2'];
      const updateParams: any[] = [status, now];

      if (progressPayload !== undefined) {
        updateParams.push(progressPayload);
        setClauses.push(`progress_payload = $${updateParams.length}`);
      }

      if (status === 'completed') {
        updateParams.push(now);
        setClauses.push(`completed_at = $${updateParams.length}`);
      }

      updateParams.push(existing.id);
      const updateSQL = `UPDATE progress_records SET ${setClauses.join(', ')} WHERE id = $${updateParams.length} RETURNING *`;

      const updateResult = await pool.query(updateSQL, updateParams);
      return NextResponse.json({ progress: updateResult.rows[0] });
    } else {
      const insertCols = ['pupil_id', 'lesson_id', 'class_id', 'assignment_id', 'status', 'updated_at'];
      const insertVals: any[] = [
        pupilId,
        parseInt(String(lessonId)),
        classId ? parseInt(String(classId)) : null,
        assignmentId ? String(assignmentId) : null,
        status,
        now,
      ];

      if (progressPayload !== undefined) {
        insertCols.push('progress_payload');
        insertVals.push(progressPayload);
      }

      if (status === 'completed') {
        insertCols.push('completed_at');
        insertVals.push(now);
      }

      const placeholders = insertVals.map((_, i) => `$${i + 1}`).join(', ');
      const insertSQL = `INSERT INTO progress_records (${insertCols.join(', ')}) VALUES (${placeholders}) RETURNING *`;

      const insertResult = await pool.query(insertSQL, insertVals);
      return NextResponse.json({ progress: insertResult.rows[0] });
    }
  } catch (error) {
    console.error('Practice complete error:', error);
    return NextResponse.json({ error: 'Could not save progress' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pupilId = searchParams.get('pupilId');
    const lessonId = searchParams.get('lessonId');
    const assignmentId = searchParams.get('assignmentId');

    if (!pupilId || !lessonId) {
      return NextResponse.json({ error: 'Pupil ID and Lesson ID are required' }, { status: 400 });
    }

    const pool = getPool();

    const params: any[] = [pupilId, parseInt(lessonId)];
    let sql = `SELECT * FROM progress_records WHERE pupil_id = $1 AND lesson_id = $2`;

    if (assignmentId) {
      params.push(assignmentId);
      sql += ` AND assignment_id = $${params.length}`;
    }

    sql += ' LIMIT 1';

    const result = await pool.query(sql, params);
    return NextResponse.json({ progress: result.rows[0] || null });
  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json({ error: 'Could not fetch progress' }, { status: 500 });
  }
}
