import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getPool } from '@/lib/db';
import { getEntitlements } from '@/lib/entitlements';
import { DWP_LEVELS } from '@/lib/dwp-levels-data';

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

async function seedDWPLevelsIfEmpty(pool: any) {
  const countRes = await pool.query('SELECT COUNT(*) FROM writing_levels');
  const count = parseInt(countRes.rows[0].count, 10);
  if (count > 0) return;

  console.log('[DWP Catalogue] writing_levels is empty — auto-seeding from DWP_LEVELS data');

  for (const level of DWP_LEVELS) {
    await pool.query(
      `INSERT INTO writing_levels (
        level_number, tier_number, level_id, activity_name, activity_type,
        learning_objective, prompt_title, prompt_instructions, prompt_example,
        word_bank, rubric, passing_threshold, expected_time_minutes,
        difficulty_level, age_range, tier_finale, programme_finale,
        milestone, display_order
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
      ON CONFLICT (level_id) DO NOTHING`,
      [
        level.level_number,
        level.tier_number,
        level.level_id,
        level.activity_name,
        level.activity_type,
        level.learning_objective,
        level.prompt_title,
        level.prompt_instructions,
        level.prompt_example ?? null,
        level.word_bank ? JSON.stringify(level.word_bank) : null,
        JSON.stringify(level.rubric),
        level.passing_threshold,
        level.expected_time_minutes,
        level.difficulty_level,
        level.age_range,
        level.tier_finale,
        level.programme_finale,
        level.milestone,
        level.display_order,
      ]
    );
  }
  console.log(`[DWP Catalogue] Seeded ${DWP_LEVELS.length} DWP levels`);
}

export async function GET(request: NextRequest) {
  try {
    const profile = await getTeacherProfile();
    if (!profile || !['teacher', 'admin', 'school_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = getPool();

    await seedDWPLevelsIfEmpty(pool);

    let schoolTier: string | null = null;
    if (profile.school_id) {
      const schoolRes = await pool.query(
        'SELECT membership_tier FROM schools WHERE id = $1 LIMIT 1',
        [profile.school_id]
      );
      schoolTier = schoolRes.rows[0]?.membership_tier ?? null;
    }

    const entitlements = getEntitlements(profile.membership_tier, schoolTier);
    const limit = entitlements.dwpLevelLimit;

    const result = await pool.query(
      `SELECT id, level_number, tier_number, level_id, activity_name, activity_type,
              learning_objective, prompt_title, expected_time_minutes,
              passing_threshold, tier_finale, milestone, programme_finale
       FROM writing_levels
       ORDER BY tier_number ASC, level_number ASC`
    );

    const maxUnlocked = limit === 'all' ? Infinity : limit;

    const catalogue = result.rows.map((l: any) => ({
      ...l,
      locked: l.level_number > maxUnlocked,
    }));

    return NextResponse.json({
      levels: catalogue,
      tier: entitlements.tier,
      levelLimit: limit,
    });
  } catch (error: any) {
    console.error('DWP catalogue error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
