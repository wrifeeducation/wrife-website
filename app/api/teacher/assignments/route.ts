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
      [
        lessonId,
        classId,
        user.id,
        title || 'Lesson Assignment',
        instructions || null,
        dueDate || null,
      ]
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

    const result = await pool.query(
      `SELECT
         a.id, a.lesson_id, a.class_id, a.title, a.instructions, a.due_date, a.created_at,
         c.name AS class_name,
         l.title AS lesson_title,
         (SELECT COUNT(*) FROM class_members cm WHERE cm.class_id = a.class_id) AS total_pupils,
         COUNT(DISTINCT s.id) FILTER (WHERE s.status IN ('submitted', 'reviewed')) AS submitted_count,
         COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'reviewed') AS reviewed_count,
         COALESCE(
           json_agg(
             json_build_object(
               'id', s.id,
               'pupil_name', concat(p.first_name, ' ', COALESCE(p.last_name, '')),
               'submitted_at', s.submitted_at,
               'assignment_id', a.id,
               'assignment_title', a.title
             )
           ) FILTER (WHERE s.status = 'submitted'),
           '[]'
         ) AS pending_submissions
       FROM assignments a
       JOIN classes c ON c.id = a.class_id
       LEFT JOIN lessons l ON l.id = a.lesson_id
       LEFT JOIN submissions s ON s.assignment_id = a.id
       LEFT JOIN pupils p ON p.id = s.pupil_id
       WHERE a.teacher_id = $1
       GROUP BY a.id, c.name, l.title
       ORDER BY a.created_at DESC`,
      [user.id]
    );

    return NextResponse.json({ assignments: result.rows });
  } catch (error: any) {
    console.error('Error fetching teacher assignments:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
