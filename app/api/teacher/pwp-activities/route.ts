import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Pool } from 'pg';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getPool() {
  return new Pool({
    connectionString: process.env.PROD_DATABASE_URL || process.env.DATABASE_URL,
  });
}

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const pool = getPool();

    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      );
    }

    // Try to find profile by user ID first
    let { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();

    // If not found by ID, try by email (handles cross-environment accounts)
    if (profileError?.code === 'PGRST116' && user.email) {
      const emailResult = await supabaseAdmin
        .from('profiles')
        .select('id, role')
        .ilike('email', user.email)
        .single();
      
      if (!emailResult.error) {
        profile = emailResult.data;
        profileError = null;
      }
    }

    if (profileError || !profile || !['teacher', 'admin', 'school_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - teacher access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const yearGroup = searchParams.get('yearGroup');

    let query = 'SELECT * FROM progressive_activities';
    const params: any[] = [];

    if (yearGroup) {
      const yearGroupNum = parseInt(yearGroup);
      query += ' WHERE year_group_min <= $1 AND year_group_max >= $1';
      params.push(yearGroupNum);
    }

    query += ' ORDER BY level ASC';

    const result = await pool.query(query, params);
    await pool.end();

    return NextResponse.json({ activities: result.rows });
  } catch (error: any) {
    console.error('Error fetching PWP activities:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
