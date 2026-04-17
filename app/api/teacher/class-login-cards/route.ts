import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { getPool } from '@/lib/db';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface AuthResult {
  userId: string;
  role: string;
  schoolId: string | null;
}

async function authenticateTeacher(): Promise<AuthResult | { error: string; status: number }> {
  const supabaseAdmin = getSupabaseAdmin();
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { error: 'Unauthorized - please log in', status: 401 };
  }

  let { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, role, school_id')
    .eq('id', user.id)
    .single();

  if (profileError?.code === 'PGRST116' && user.email) {
    const emailResult = await supabaseAdmin
      .from('profiles')
      .select('id, role, school_id')
      .ilike('email', user.email)
      .single();
    
    if (!emailResult.error) {
      profile = emailResult.data;
      profileError = null;
    }
  }

  if (profileError || !profile || !['teacher', 'admin', 'school_admin'].includes(profile.role)) {
    return { error: 'Unauthorized - teacher access required', status: 403 };
  }

  return { 
    userId: profile.id, 
    role: profile.role,
    schoolId: profile.school_id
  };
}

export async function GET(request: NextRequest) {
  const authResult = await authenticateTeacher();
  
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('classId');

  if (!classId) {
    return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  try {
    const { data: classData, error: classError } = await supabaseAdmin
      .from('classes')
      .select('id, name, year_group, class_code, school_name')
      .eq('id', classId)
      .single();

    if (classError || !classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    if (authResult.role === 'teacher') {
      const { data: ownership, error: ownershipError } = await supabaseAdmin
        .from('classes')
        .select('id')
        .eq('id', classId)
        .eq('teacher_id', authResult.userId)
        .single();

      if (ownershipError || !ownership) {
        return NextResponse.json({ error: 'Access denied to this class' }, { status: 403 });
      }
    }

    const pool = getPool();
    const result = await pool.query(
      `SELECT id, first_name, last_name, username, pin_display, year_group, is_active
       FROM pupils
       WHERE class_id = $1 AND is_active = TRUE
       ORDER BY first_name ASC, last_name ASC`,
      [classId]
    );

    const pupils = result.rows.sort((a: any, b: any) => {
      const nameA = `${a.first_name} ${a.last_name || ''}`.toLowerCase();
      const nameB = `${b.first_name} ${b.last_name || ''}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    return NextResponse.json({
      classData,
      pupils
    });
  } catch (error) {
    console.error('Error in class-login-cards API:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
