import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lessonId, classId, title, instructions, dueDate } = await request.json();

    if (!lessonId || !classId) {
      return NextResponse.json({ error: 'lessonId and classId are required' }, { status: 400 });
    }

    const pool = getPool();

    const classCheck = await pool.query(
      'SELECT id FROM classes WHERE id = $1 AND teacher_id = $2',
      [classId, user.id]
    );
    if (classCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Class not found or access denied' }, { status: 403 });
    }

    const result = await pool.query(
      `INSERT INTO assignments (lesson_id, class_id, teacher_id, title, instructions, due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, lesson_id, class_id, teacher_id, title, instructions, due_date, created_at`,
      [lessonId, classId, user.id, title || 'Lesson Assignment', instructions || null, dueDate || null]
    );

    return NextResponse.json({ assignment: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = getPool();

    // Note: lesson assignments and writing_attempts are separate systems.
    // writing_attempts tracks DWP/PWP writing; lesson assignments track assigned lessons.
    const result = await pool.query(
      `SELECT
         a.id, a.lesson_id, a.class_id, a.title, a.instructions, a.due_date, a.created_at,
         c.name AS class_name,
         l.title AS lesson_title,
         l.lesson_number,
         (SELECT COUNT(*) FROM class_members cm WHERE cm.class_id = a.class_id) AS total_pupils,
         0 AS submitted_count,
         0 AS reviewed_count,
         '[]'::json AS pending_submissions
       FROM assignments a
       JOIN classes c ON c.id = a.class_id
       LEFT JOIN lessons l ON l.id = a.lesson_id
       WHERE a.teacher_id = $1
       ORDER BY a.created_at DESC`,
      [user.id]
    );

    return NextResponse.json({ assignments: result.rows });
  } catch (error: any) {
    console.error('Error fetching teacher assignments:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
