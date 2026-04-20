import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getPool } from '@/lib/db';
import { getEntitlements } from '@/lib/entitlements';

async function getTeacherProfile() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const pool = getPool();
  const byId = await pool.query(
    'SELECT id, role, membership_tier, school_id FROM profiles WHERE id = $1 LIMIT 1',
    [user.id]
  );
  if (byId.rows.length > 0) return byId.rows[0];

  if (user.email) {
    const byEmail = await pool.query(
      'SELECT id, role, membership_tier, school_id FROM profiles WHERE LOWER(email) = LOWER($1) LIMIT 1',
      [user.email]
    );
    if (byEmail.rows.length > 0) return byEmail.rows[0];
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const profile = await getTeacherProfile();
    if (!profile || !['teacher', 'admin', 'school_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = getPool();

    let schoolTier: string | null = null;
    if (profile.school_id) {
      const schoolRes = await pool.query(
        'SELECT membership_tier FROM schools WHERE id = $1 LIMIT 1',
        [profile.school_id]
      );
      schoolTier = schoolRes.rows[0]?.membership_tier ?? null;
    }

    const entitlements = getEntitlements(profile.membership_tier, schoolTier);

    if (!entitlements.canAssignWork) {
      return NextResponse.json(
        { error: 'Upgrade to Standard or Full to assign writing practice to your class.' },
        { status: 403 }
      );
    }

    const { level_id, class_id, instructions, due_date } = await request.json();

    if (!level_id || !class_id) {
      return NextResponse.json({ error: 'level_id and class_id are required' }, { status: 400 });
    }

    const levelRes = await pool.query(
      'SELECT level_number FROM writing_levels WHERE level_id = $1 LIMIT 1',
      [level_id]
    );
    if (levelRes.rows.length === 0) {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 });
    }

    const levelNumber = levelRes.rows[0].level_number;
    const limit = entitlements.dwpLevelLimit;
    if (limit !== 'all' && levelNumber > limit) {
      return NextResponse.json(
        { error: 'This level is not available on your current plan. Upgrade to access all levels.' },
        { status: 403 }
      );
    }

    const classRes = await pool.query(
      profile.role === 'admin'
        ? 'SELECT id FROM classes WHERE id = $1 LIMIT 1'
        : profile.role === 'school_admin' && profile.school_id
        ? 'SELECT id FROM classes WHERE id = $1 AND school_id = $2 LIMIT 1'
        : 'SELECT id FROM classes WHERE id = $1 AND teacher_id = $2 LIMIT 1',
      profile.role === 'admin'
        ? [class_id]
        : [class_id, profile.role === 'school_admin' ? profile.school_id : profile.id]
    );

    if (classRes.rows.length === 0) {
      return NextResponse.json({ error: 'Class not found or access denied' }, { status: 403 });
    }

    const result = await pool.query(
      `INSERT INTO dwp_assignments (level_id, class_id, teacher_id, instructions, due_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [level_id, class_id, profile.id, instructions || null, due_date || null]
    );

    return NextResponse.json({ success: true, id: result.rows[0]?.id });
  } catch (error: any) {
    console.error('DWP assign error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
