import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

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

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || !['teacher', 'admin', 'school_admin'].includes(profile.role)) {
    return { error: 'Unauthorized - teacher access required', status: 403 };
  }

  return { 
    userId: user.id, 
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

    const { data: members, error: membersError } = await supabaseAdmin
      .from('class_members')
      .select('pupil_id, pupils(id, first_name, last_name, year_group)')
      .eq('class_id', classId);

    if (membersError) {
      console.error('Error fetching class members:', membersError);
      return NextResponse.json({ error: 'Failed to fetch pupils' }, { status: 500 });
    }

    const pupils = (members || [])
      .map((m: any) => m.pupils)
      .filter(Boolean)
      .sort((a: any, b: any) => {
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
