import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Pool } from 'pg';

function getPool() {
  return new Pool({
    connectionString: process.env.PROD_DATABASE_URL || process.env.DATABASE_URL,
  });
}

interface AuthResult {
  userId: string;
  role: string;
  schoolId: string | null;
}

async function authenticateTeacher(): Promise<AuthResult | { error: string; status: number }> {
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

  const pool = getPool();
  let profileRow: { id: string; role: string; school_id: string | null } | null = null;

  // Try by user ID first, then email fallback
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
    return { error: 'Unauthorized - teacher access required', status: 403 };
  }

  return { 
    userId: profileRow.id, 
    role: profileRow.role,
    schoolId: profileRow.school_id
  };
}

async function verifyClassOwnership(auth: AuthResult, classId: string): Promise<boolean> {
  if (auth.role === 'admin') {
    return true;
  }

  const pool = getPool();

  if (auth.role === 'teacher') {
    const result = await pool.query(
      'SELECT id FROM classes WHERE id = $1 AND teacher_id = $2 LIMIT 1',
      [classId, auth.userId]
    );
    return result.rows.length > 0;
  }

  if (auth.role === 'school_admin' && auth.schoolId) {
    const result = await pool.query(
      'SELECT id FROM classes WHERE id = $1 AND school_id = $2 LIMIT 1',
      [classId, auth.schoolId]
    );
    return result.rows.length > 0;
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateTeacher();
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const pool = getPool();
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
    await pool.end();

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

    const pool = getPool();
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
      `SELECT pa.*, a.level, a.level_name, a.grammar_focus, a.sentence_structure
       FROM pwp_assignments pa
       JOIN progressive_activities a ON pa.activity_id = a.id
       WHERE pa.class_id = $1
       ORDER BY pa.created_at DESC`,
      [classId]
    );
    await pool.end();

    return NextResponse.json({ assignments: result.rows });
  } catch (error: any) {
    console.error('Error fetching PWP assignments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateTeacher();
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const pool = getPool();
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('id');

    if (!assignmentId) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const checkResult = await pool.query(
      'SELECT class_id FROM pwp_assignments WHERE id = $1',
      [assignmentId]
    );

    if (checkResult.rows.length === 0) {
      await pool.end();
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    const classId = checkResult.rows[0].class_id;
    const hasAccess = await verifyClassOwnership(authResult, classId);
    if (!hasAccess) {
      await pool.end();
      return NextResponse.json(
        { error: 'Access denied - you do not have permission for this class' },
        { status: 403 }
      );
    }

    await pool.query('DELETE FROM pwp_assignments WHERE id = $1', [assignmentId]);
    await pool.end();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting PWP assignment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
