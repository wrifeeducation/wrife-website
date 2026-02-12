import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pupilId, noteText, priority, lessonContext } = body;

    if (!pupilId || !noteText) {
      return NextResponse.json({ error: 'Pupil ID and note text required' }, { status: 400 });
    }

    const pool = getPool();

    // For now, use a placeholder teacher ID - in production this would come from the session
    const teacherId = '00000000-0000-0000-0000-000000000001';

    const result = await pool.query(
      `INSERT INTO teacher_notes (pupil_id, teacher_id, lesson_context, note_text, priority)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, note_text, priority, created_at`,
      [pupilId, teacherId, lessonContext || null, noteText, priority || 'medium']
    );

    return NextResponse.json({
      note: {
        id: result.rows[0].id,
        noteText: result.rows[0].note_text,
        priority: result.rows[0].priority,
        createdAt: result.rows[0].created_at,
      },
    });
  } catch (error) {
    console.error('Add note error:', error);
    return NextResponse.json({ error: 'Failed to add note' }, { status: 500 });
  }
}
