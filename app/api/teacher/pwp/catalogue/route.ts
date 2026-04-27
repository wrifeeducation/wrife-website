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

export async function GET(request: NextRequest) {
  try {
    const profile = await getTeacherProfile();
    if (!profile || !['teacher', 'admin', 'school_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = getPool();

    let schoolTier: string | null = null;
    if (profile.school_id) {
      const schoolRes = await pool.query(
        'SELECT subscription_tier FROM schools WHERE id = $1 LIMIT 1',
        [profile.school_id]
      );
      schoolTier = schoolRes.rows[0]?.subscription_tier ?? null;
    }

    const entitlements = getEntitlements(profile.membership_tier, schoolTier);
    const limit = entitlements.pwpLevelLimit;

    // PWP activities live in writing_levels (not pwp_activities)
    const result = await pool.query(
      `SELECT id, level_number, tier_number, level_id, activity_name, activity_type,
              learning_objective, prompt_title, expected_time_minutes,
              difficulty_level, age_range, tier_finale, milestone, display_order
       FROM writing_levels
       ORDER BY level_number ASC`
    );

    const maxUnlocked = limit === 'all' ? Infinity : (limit as number);

    const catalogue = result.rows.map((a: any) => ({
      ...a,
      locked: a.level_number > maxUnlocked,
    }));

    return NextResponse.json({
      activities: catalogue,
      tier: entitlements.tier,
      levelLimit: limit,
    });
  } catch (error: any) {
    console.error('PWP catalogue error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
