/**
 * GET /api/teacher/dwp-leaderboard?classId=<id>
 * Returns all class members with their writing_progress stats for leaderboard display.
 * Pupils who haven't started DWP appear with zero scores.
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
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const pool = getPool();
  const res = await pool.query(
    'SELECT id, role FROM profiles WHERE id = $1 LIMIT 1',
    [user.id],
  );
  return res.rows[0] as { id: string; role: string } | undefined;
}

export async function GET(request: NextRequest) {
  try {
    const teacher = await getTeacherProfile();
    if (!teacher || !['teacher', 'school_admin', 'admin'].includes(teacher.role)) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    if (!classId) {
      return NextResponse.json({ error: 'classId is required' }, { status: 400 });
    }

    const pool = getPool();

    // Verify teacher owns the class (admins bypass)
    if (teacher.role !== 'admin') {
      const owns = await pool.query(
        'SELECT 1 FROM classes WHERE id = $1 AND teacher_id = $2 LIMIT 1',
        [classId, teacher.id],
      );
      if (owns.rows.length === 0) {
        return NextResponse.json({ error: 'You do not own this class' }, { status: 403 });
      }
    }

    const result = await pool.query(
      `SELECT
         p.id                                                      AS pupil_id,
         COALESCE(p.display_name, p.first_name || ' ' || COALESCE(p.last_name, '')) AS name,
         p.first_name,
         p.last_name,
         COALESCE(wp.total_levels_passed, 0)                      AS levels_passed,
         COALESCE(wp.current_streak, 0)                           AS current_streak,
         COALESCE(wp.longest_streak, 0)                           AS longest_streak,
         COALESCE(wp.mastery_count, 0)                            AS mastery_count,
         wp.average_score,
         COALESCE(wp.total_attempts, 0)                           AS total_attempts,
         wp.last_activity_date
       FROM class_members cm
       JOIN pupils p ON p.id = cm.pupil_id
       LEFT JOIN writing_progress wp ON wp.pupil_id = p.id
       WHERE cm.class_id = $1
         AND p.is_active = TRUE
       ORDER BY p.first_name, p.last_name`,
      [classId],
    );

    return NextResponse.json({ pupils: result.rows });
  } catch (err: unknown) {
    console.error('[/api/teacher/dwp-leaderboard] error:', err);
    const message = err instanceof Error ? err.message : 'Failed to load leaderboard';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
