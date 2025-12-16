import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Pool } from 'pg';
import { supabaseAdmin } from '@/lib/supabase/admin';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


export async function GET(request: NextRequest) {
  try {


    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

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

    return NextResponse.json({ activities: result.rows });
  } catch (error: any) {
    console.error('Error fetching PWP activities:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
