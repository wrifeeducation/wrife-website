import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getPool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const pool = getPool();
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - please log in' }, { status: 401 });
    }

    // Resolve profile (by id first, then by email for cross-env accounts)
    let profileRow: { id: string; role: string } | null = null;
    const byId = await pool.query(
      'SELECT id, role FROM profiles WHERE id = $1 LIMIT 1',
      [user.id]
    );
    if (byId.rows.length > 0) {
      profileRow = byId.rows[0];
    } else if (user.email) {
      const byEmail = await pool.query(
        'SELECT id, role FROM profiles WHERE LOWER(email) = LOWER($1) LIMIT 1',
        [user.email]
      );
      if (byEmail.rows.length > 0) profileRow = byEmail.rows[0];
    }

    if (!profileRow || !['teacher', 'admin', 'school_admin'].includes(profileRow.role)) {
      return NextResponse.json({ error: 'Unauthorized - teacher access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const yearGroup = searchParams.get('yearGroup');

    // Filter by year group using the year_group_min/max columns on progressive_activities
    let result;
    if (yearGroup) {
      const yg = parseInt(yearGroup, 10);
      result = await pool.query(
        `SELECT id, level, level_name, grammar_focus, sentence_structure, instructions,
                examples, practice_prompts, year_group_min, year_group_max
         FROM progressive_activities
         WHERE year_group_min <= $1 AND year_group_max >= $1
         ORDER BY level ASC`,
        [yg]
      );
    } else {
      result = await pool.query(
        `SELECT id, level, level_name, grammar_focus, sentence_structure, instructions,
                examples, practice_prompts, year_group_min, year_group_max
         FROM progressive_activities
         ORDER BY level ASC`
      );
    }

    return NextResponse.json({ activities: result.rows });
  } catch (error: any) {
    console.error('Error fetching PWP activities:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
