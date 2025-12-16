import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

interface AuthResult {
  userId: string;
  role: string;
  schoolId: string | null;
}

async function authenticateTeacher(): Promise<AuthResult | { error: string; status: number }> {
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

async function verifyClassOwnership(auth: AuthResult, classId: string): Promise<boolean> {
  if (auth.role === 'admin') {
    return true;
  }

  if (auth.role === 'teacher') {
    const { data, error } = await supabaseAdmin
      .from('classes')
      .select('id')
      .eq('id', classId)
      .eq('teacher_id', auth.userId)
      .single();
    return !error && !!data;
  }

  if (auth.role === 'school_admin' && auth.schoolId) {
    const { data, error } = await supabaseAdmin
      .from('classes')
      .select('id')
      .eq('id', classId)
      .eq('school_id', auth.schoolId)
      .single();
    return !error && !!data;
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateTeacher();
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await request.json();
    const { activity_id, class_id, instructions, due_date } = body;

    if (!activity_id || !class_id) {
      return NextResponse.json(
        { error: 'activity_id and class_id are required' },
        { status: 400 }
      );
    }

    const hasAccess = await verifyClassOwnership(authResult, class_id);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied - you do not have permission for this class' },
        { status: 403 }
      );
    }

    const result = await pool.query(
      `INSERT INTO pwp_assignments (activity_id, class_id, teacher_id, instructions, due_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [activity_id, class_id, authResult.userId, instructions || null, due_date || null]
    );

    return NextResponse.json({ success: true, id: result.rows[0]?.id });
  } catch (error: any) {
    console.error('Error creating PWP assignment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
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
      return NextResponse.json(
        { error: 'Access denied - you do not have permission for this class' },
        { status: 403 }
      );
    }

    const result = await pool.query(
      `SELECT pa.*, a.level, a.level_name, a.grammar_focus
       FROM pwp_assignments pa
       JOIN progressive_activities a ON pa.activity_id = a.id
       WHERE pa.class_id = $1
       ORDER BY pa.created_at DESC`,
      [classId]
    );

    return NextResponse.json({ assignments: result.rows });
  } catch (error: any) {
    console.error('Error fetching PWP assignments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
