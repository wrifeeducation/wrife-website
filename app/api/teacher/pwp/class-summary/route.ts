/**
 * GET /api/teacher/pwp/class-summary?classId=<uuid>
 *
 * Returns today's chain completion grid for all pupils in a class.
 * Used by the PWPChainTab on the teacher class page (Phase A).
 *
 * Response shape:
 * {
 *   pupils: Array<{
 *     pupil_id: string
 *     first_name: string
 *     last_name: string | null
 *     current_level: number
 *     completed_today: boolean
 *     subject_noun: string | null
 *     new_formula_attempts: number | null
 *     mastery_signal: boolean
 *   }>
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getPool } from '@/lib/db';

async function getTeacherProfile() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } },
  );
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  const pool = getPool();
  const res = await pool.query(
    'SELECT id, role FROM profiles WHERE id = $1 LIMIT 1',
    [user.id],
  );
  return res.rows[0] ?? null;
}

export async function GET(req: NextRequest) {
  try {
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get('classId');

  if (!classId) {
    return NextResponse.json({ error: 'classId is required' }, { status: 400 });
  }

  const teacher = await getTeacherProfile();
  if (!teacher || !['teacher', 'school_admin', 'admin'].includes(teacher.role)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const pool = getPool();

  // Verify the teacher owns this class
  const classCheck = await pool.query(
    'SELECT id FROM classes WHERE id = $1 AND teacher_id = $2 LIMIT 1',
    [classId, teacher.id],
  );
  if (classCheck.rows.length === 0) {
    return NextResponse.json({ error: 'Class not found' }, { status: 404 });
  }

  // Get all pupils in the class with their PWP level (if any) and today's session (if any)
  const today = new Date().toISOString().split('T')[0];

  const result = await pool.query(
    `
    SELECT
      p.id                                   AS pupil_id,
      p.first_name,
      p.last_name,
      COALESCE(pl.current_level, 1)          AS current_level,
      COALESCE(pl.mastery_signal, false)     AS mastery_signal,
      CASE WHEN cs.id IS NOT NULL THEN true ELSE false END AS completed_today,
      cs.subject_noun,
      cs.new_formula_attempts
    FROM class_members cm
    JOIN pupils p ON p.id = cm.pupil_id
    LEFT JOIN pwp_pupil_levels pl
      ON pl.pupil_id = p.id AND pl.class_id = cm.class_id
    LEFT JOIN pwp_chain_sessions cs
      ON cs.pupil_id = p.id AND cs.class_id = cm.class_id AND cs.session_date = $2
    WHERE cm.class_id = $1
    ORDER BY p.first_name, p.last_name
    `,
    [classId, today],
  );

  return NextResponse.json({ pupils: result.rows });
  } catch (err) {
    console.error('[pwp/class-summary] error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
