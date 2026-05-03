/**
 * POST /api/teacher/pwp/advance-level
 *
 * Teacher action: advance a pupil with mastery_signal=true to the next chain level.
 * Increments current_level, resets mastery_points to 0, and clears mastery_signal.
 *
 * Request body:
 * {
 *   pupilId: string  — the pupil's UUID
 *   classId: string  — the class UUID (used to verify teacher ownership)
 * }
 *
 * Response:
 * {
 *   newLevel: number
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getPool } from '@/lib/db';

const MAX_CHAIN_LEVEL = 30;

async function getTeacherProfile() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } },
  );
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const pool = getPool();
  const res = await pool.query(
    'SELECT id, role FROM profiles WHERE id = $1 LIMIT 1',
    [user.id],
  );
  return res.rows[0] ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const teacher = await getTeacherProfile();
    if (!teacher || !['teacher', 'school_admin', 'admin'].includes(teacher.role)) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const body = await req.json();
    const { pupilId, classId } = body as { pupilId?: string; classId?: string };

    if (!pupilId || !classId) {
      return NextResponse.json(
        { error: 'pupilId and classId are required' },
        { status: 400 },
      );
    }

    const pool = getPool();

    // Verify teacher owns this class
    const classCheck = await pool.query(
      'SELECT id FROM classes WHERE id = $1 AND teacher_id = $2 LIMIT 1',
      [classId, teacher.id],
    );
    if (classCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Class not found or you do not own it' },
        { status: 404 },
      );
    }

    // Verify pupil is in this class
    const memberCheck = await pool.query(
      'SELECT 1 FROM class_members WHERE class_id = $1 AND pupil_id = $2 LIMIT 1',
      [classId, pupilId],
    );
    if (memberCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Pupil is not in this class' },
        { status: 404 },
      );
    }

    // Fetch current level record
    const levelRes = await pool.query(
      `SELECT current_level, mastery_signal
       FROM pwp_pupil_levels
       WHERE pupil_id = $1 AND class_id = $2
       LIMIT 1`,
      [pupilId, classId],
    );

    if (levelRes.rows.length === 0) {
      // No level row yet — nothing to advance
      return NextResponse.json(
        { error: 'No level record found for this pupil in this class' },
        { status: 404 },
      );
    }

    const { current_level, mastery_signal } = levelRes.rows[0];

    if (!mastery_signal) {
      return NextResponse.json(
        { error: 'Mastery signal is not set for this pupil — advance not permitted' },
        { status: 409 },
      );
    }

    if (current_level >= MAX_CHAIN_LEVEL) {
      return NextResponse.json(
        { error: `Pupil is already at the maximum chain level (L${MAX_CHAIN_LEVEL})` },
        { status: 409 },
      );
    }

    const newLevel = current_level + 1;

    await pool.query(
      `UPDATE pwp_pupil_levels
       SET current_level   = $1,
           mastery_points  = 0,
           mastery_signal  = false,
           updated_at      = NOW()
       WHERE pupil_id = $2 AND class_id = $3`,
      [newLevel, pupilId, classId],
    );

    return NextResponse.json({ newLevel });
  } catch (err) {
    console.error('[pwp/advance-level] error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
