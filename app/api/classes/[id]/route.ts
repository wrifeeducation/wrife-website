import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = getPool();
    
    const classResult = await pool.query(
      `SELECT c.*, 
              (SELECT COUNT(*) FROM pupils p WHERE p.class_id = c.id) as pupil_count
       FROM classes c
       WHERE c.id = $1 AND c.teacher_id = $2`,
      [classId, user.id]
    );

    if (classResult.rows.length === 0) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const pupilsResult = await pool.query(
      `SELECT id, first_name, last_name, display_name, username, year_group, 
              is_active, last_login_at, created_at
       FROM pupils
       WHERE class_id = $1
       ORDER BY first_name, last_name`,
      [classId]
    );

    return NextResponse.json({ 
      class: classResult.rows[0],
      pupils: pupilsResult.rows
    });
  } catch (error) {
    console.error('Error fetching class:', error);
    return NextResponse.json({ error: 'Failed to fetch class' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, yearGroup } = body;

    const pool = getPool();
    
    const result = await pool.query(
      `UPDATE classes 
       SET name = COALESCE($1, name), 
           year_group = COALESCE($2, year_group),
           updated_at = NOW()
       WHERE id = $3 AND teacher_id = $4
       RETURNING *`,
      [name, yearGroup, classId, user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json({ class: result.rows[0] });
  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json({ error: 'Failed to update class' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = getPool();
    
    const result = await pool.query(
      'DELETE FROM classes WHERE id = $1 AND teacher_id = $2 RETURNING id',
      [classId, user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json({ error: 'Failed to delete class' }, { status: 500 });
  }
}
