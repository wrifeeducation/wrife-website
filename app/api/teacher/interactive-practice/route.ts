import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getPool } from '@/lib/db';

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

    const result = await pool.query(
      `SELECT
         p.id,
         p.first_name,
         p.last_name,
         COALESCE(SUM(pp.xp_earned), 0)::int AS total_xp,
         COUNT(DISTINCT pp.lesson_id) FILTER (
           WHERE pp.bronze_stars > 0 OR pp.silver_stars > 0 OR pp.gold_stars > 0
         )::int AS lessons_completed,
         COALESCE(MAX(ps.current_streak), 0)::int AS current_streak,
         GREATEST(MAX(pp.updated_at), MAX(ps.updated_at)) AS last_active
       FROM class_members cm
       JOIN pupils p ON cm.pupil_id = p.id
       LEFT JOIN practice_pupil_progress pp ON pp.pupil_id = p.id
       LEFT JOIN practice_streaks ps ON ps.pupil_id = p.id
       WHERE cm.class_id = $1
       GROUP BY p.id, p.first_name, p.last_name
       ORDER BY p.first_name, p.last_name`,
      [classId]
    );

    return NextResponse.json({ pupils: result.rows });
  } catch (error: unknown) {
    console.error('Error fetching Interactive Practice data:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
