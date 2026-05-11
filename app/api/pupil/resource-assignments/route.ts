import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

/**
 * POST /api/pupil/resource-assignments
 * Body: { classId: string | number }
 *
 * Returns active resource assignments pushed by the teacher for the
 * pupil's class. Called from the pupil dashboard alongside fetchAssignments().
 * Auth: classId provided by the client localStorage session (same trust
 * model as /api/pupil/assignments).
 */
export async function POST(request: NextRequest) {
  try {
    const { classId } = await request.json();

    if (!classId) {
      return NextResponse.json({ error: 'classId is required' }, { status: 400 });
    }

    const pool = getPool();

    const result = await pool.query(
      `SELECT
         ra.id,
         ra.lesson_file_id,
         ra.lesson_id,
         ra.title,
         ra.file_type,
         ra.file_url,
         ra.message,
         ra.due_date,
         ra.created_at,
         l.lesson_number,
         l.part    AS lesson_part,
         l.title   AS lesson_title
       FROM resource_assignments ra
       LEFT JOIN lessons l ON l.id = ra.lesson_id
       WHERE ra.class_id = $1
         AND ra.status = 'active'
       ORDER BY ra.due_date ASC NULLS LAST, ra.created_at DESC`,
      [classId]
    );

    return NextResponse.json({ resourceAssignments: result.rows });
  } catch (error: unknown) {
    console.error('Error fetching pupil resource assignments:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
