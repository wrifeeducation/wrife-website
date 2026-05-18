import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getPool } from '@/lib/db';

/* ── Auth helpers (shared pattern across teacher routes) ──── */

interface AuthResult {
  userId: string;
  role: string;
  schoolId: string | null;
}

async function authenticateTeacher(): Promise<AuthResult | { error: string; status: number }> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Unauthorized - please log in', status: 401 };
  }

  const pool = getPool();
  let profileRow: { id: string; role: string; school_id: string | null } | null = null;

  const byId = await pool.query(
    'SELECT id, role, school_id FROM profiles WHERE id = $1 LIMIT 1',
    [user.id]
  );
  if (byId.rows.length > 0) {
    profileRow = byId.rows[0];
  } else if (user.email) {
    const byEmail = await pool.query(
      'SELECT id, role, school_id FROM profiles WHERE LOWER(email) = LOWER($1) LIMIT 1',
      [user.email]
    );
    if (byEmail.rows.length > 0) profileRow = byEmail.rows[0];
  }

  if (!profileRow || !['teacher', 'admin', 'school_admin'].includes(profileRow.role)) {
    return { error: 'Unauthorized - teacher access required', status: 403 };
  }

  return { userId: profileRow.id, role: profileRow.role, schoolId: profileRow.school_id };
}

async function verifyClassOwnership(auth: AuthResult, classId: string): Promise<boolean> {
  if (auth.role === 'admin') return true;
  const pool = getPool();
  if (auth.role === 'teacher') {
    const result = await pool.query(
      'SELECT id FROM classes WHERE id = $1 AND teacher_id = $2 LIMIT 1',
      [classId, auth.userId]
    );
    return result.rows.length > 0;
  }
  if (auth.role === 'school_admin' && auth.schoolId) {
    const result = await pool.query(
      'SELECT id FROM classes WHERE id = $1 AND school_id = $2 LIMIT 1',
      [classId, auth.schoolId]
    );
    return result.rows.length > 0;
  }
  return false;
}

/* ── GET /api/teacher/class-activity?classId=X ──────────── */
/*
 * Returns two datasets sourced from learning_events:
 *
 * 1. `pupilActivity` — per-pupil aggregates across all apps (PWP + IP)
 *    Join: class_members → pupils → learning_events via pupils.id = learning_events.pupil_id
 *    (Route A provisions Supabase auth with id = pupils.id, so this join is reliable
 *     for all school pupils regardless of which sub-app they're using)
 *
 * 2. `recentEvents` — last 20 events for the class (activity feed for teacher)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateTeacher();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json({ error: 'classId is required' }, { status: 400 });
    }

    const hasAccess = await verifyClassOwnership(authResult, classId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const pool = getPool();

    // ── Per-pupil learning_events aggregates (pivoted by app) ──
    const activityResult = await pool.query(
      `SELECT
         p.id                    AS pupil_id,
         p.first_name,
         p.last_name,

         -- PWP: count of distinct formula levels completed + highest level reached
         COUNT(*) FILTER (
           WHERE le.app = 'pwp' AND le.event_type = 'formula_completed'
         )::int                  AS pwp_formulas_completed,

         COALESCE(MAX(
           CASE WHEN le.app = 'pwp' AND le.event_type = 'formula_completed'
           THEN (le.event_data->>'level')::int END
         ), 0)::int              AS pwp_highest_level,

         COUNT(*) FILTER (
           WHERE le.app = 'pwp' AND le.event_type = 'chain_session_completed'
         )::int                  AS pwp_chain_sessions,

         MAX(le.created_at) FILTER (
           WHERE le.app = 'pwp'
         )                       AS pwp_last_active,

         -- IP: distinct lessons completed + total XP from lesson events
         COUNT(DISTINCT
           CASE WHEN le.app = 'ip' AND le.event_type = 'lesson_completed'
           THEN le.event_data->>'lesson_id' END
         )::int                  AS ip_lessons_completed,

         COALESCE(SUM(
           CASE WHEN le.app = 'ip' AND le.event_type = 'lesson_completed'
           THEN COALESCE((le.event_data->>'xp_earned')::int, 0)
           ELSE 0 END
         ), 0)::int              AS ip_total_xp,

         MAX(le.created_at) FILTER (
           WHERE le.app = 'ip'
         )                       AS ip_last_active,

         -- DWP: levels completed + total XP + last active
         COUNT(*) FILTER (
           WHERE le.app = 'dwp' AND le.event_type = 'level_completed'
         )::int                  AS dwp_levels_completed,

         COALESCE(SUM(
           CASE WHEN le.app = 'dwp' AND le.event_type = 'level_completed'
           THEN COALESCE((le.event_data->>'xp_earned')::int, 0)
           ELSE 0 END
         ), 0)::int              AS dwp_total_xp,

         MAX(le.created_at) FILTER (
           WHERE le.app = 'dwp'
         )                       AS dwp_last_active

       FROM class_members cm
       JOIN pupils p ON cm.pupil_id = p.id
       LEFT JOIN learning_events le ON le.pupil_id = p.id
       WHERE cm.class_id = $1
       GROUP BY p.id, p.first_name, p.last_name
       ORDER BY p.first_name, p.last_name`,
      [classId]
    );

    // ── Recent activity feed (last 20 events across the class) ──
    const feedResult = await pool.query(
      `SELECT
         le.id,
         le.pupil_id,
         CONCAT(p.first_name, ' ', COALESCE(p.last_name, '')) AS pupil_name,
         le.app,
         le.event_type,
         le.event_data,
         le.created_at
       FROM learning_events le
       JOIN class_members cm ON cm.pupil_id = le.pupil_id
       JOIN pupils p ON p.id = le.pupil_id
       WHERE cm.class_id = $1
       ORDER BY le.created_at DESC
       LIMIT 20`,
      [classId]
    );

    return NextResponse.json({
      pupilActivity: activityResult.rows,
      recentEvents:  feedResult.rows,
    });
  } catch (error: unknown) {
    console.error('Error fetching class activity:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
