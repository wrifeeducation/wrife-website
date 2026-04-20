import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getPool } from '@/lib/db';

async function authenticateTeacher() {
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
    return { error: 'Unauthorized - please log in', status: 401 } as const;
  }

  const pool = getPool();
  let profileRow: { id: string; role: string; school_id: string | null } | null = null;

  const byId = await pool.query(
    'SELECT id, role, school_id FROM profiles WHERE id = $1 LIMIT 1',
    [user.id]
  );
  if (byId.rows.length > 0) {
    profileRow = byId.rows[0];
  } else if (user.email) {
    const byEmail = await pool.query(
      'SELECT id, role, school_id FROM profiles WHERE LOWER(email) = LOWER($1) LIMIT 1',
      [user.email]
    );
    if (byEmail.rows.length > 0) {
      profileRow = byEmail.rows[0];
    }
  }

  if (!profileRow || !['teacher', 'admin', 'school_admin'].includes(profileRow.role)) {
    return { error: 'Unauthorized - teacher access required', status: 403 } as const;
  }

  return {
    userId: profileRow.id,
    role: profileRow.role,
    schoolId: profileRow.school_id,
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

  const pool = getPool();

  try {
    let classRow: any = null;

    if (authResult.role === 'admin') {
      const res = await pool.query(
        'SELECT id, name, year_group, class_code, school_name FROM classes WHERE id = $1 LIMIT 1',
        [classId]
      );
      classRow = res.rows[0] || null;
    } else if (authResult.role === 'teacher') {
      const res = await pool.query(
        'SELECT id, name, year_group, class_code, school_name FROM classes WHERE id = $1 AND teacher_id = $2 LIMIT 1',
        [classId, authResult.userId]
      );
      classRow = res.rows[0] || null;
    } else if (authResult.role === 'school_admin' && authResult.schoolId) {
      const res = await pool.query(
        'SELECT id, name, year_group, class_code, school_name FROM classes WHERE id = $1 AND school_id = $2 LIMIT 1',
        [classId, authResult.schoolId]
      );
      classRow = res.rows[0] || null;
    }

    if (!classRow) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const pupilsResult = await pool.query(
      `SELECT id, first_name, last_name, username, pin_display, year_group, is_active
       FROM pupils
       WHERE class_id = $1 AND is_active = TRUE
       ORDER BY first_name ASC, last_name ASC`,
      [classId]
    );

    return NextResponse.json({
      classData: classRow,
      pupils: pupilsResult.rows,
    });
  } catch (error) {
    console.error('Error in class-login-cards API:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
