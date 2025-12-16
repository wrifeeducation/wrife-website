import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      );
    }

    const profileResult = await pool.query(
      'SELECT role FROM profiles WHERE id = $1',
      [user.id]
    );

    if (profileResult.rows.length === 0 || !['teacher', 'admin', 'school_admin'].includes(profileResult.rows[0].role)) {
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

    return NextResponse.json({ activities: result.rows });
  } catch (error: any) {
    console.error('Error fetching PWP activities:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
