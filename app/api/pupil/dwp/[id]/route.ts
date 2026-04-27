import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const pupilId = searchParams.get('pupilId');

  if (!pupilId) {
    return NextResponse.json({ error: 'pupilId is required' }, { status: 400 });
  }

  const assignmentId = parseInt(id);
  if (isNaN(assignmentId)) {
    return NextResponse.json({ error: 'Invalid assignment id' }, { status: 400 });
  }

  try {
    const pool = getPool();

    const assignmentRes = await pool.query(
      'SELECT id, level_id, class_id, teacher_id, instructions, due_date FROM dwp_assignments WHERE id = $1 LIMIT 1',
      [assignmentId]
    );

    if (assignmentRes.rows.length === 0) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    const assignment = assignmentRes.rows[0];

    const enrollmentRes = await pool.query(
      `SELECT p.id FROM pupils p
       JOIN class_members cm ON cm.pupil_id = p.id
       WHERE p.id = $1 AND cm.class_id = $2 AND p.is_active = TRUE LIMIT 1`,
      [pupilId, assignment.class_id]
    );

    if (enrollmentRes.rows.length === 0) {
      console.warn(`[DWP] Pupil ${pupilId} not in class ${assignment.class_id} for assignment ${assignmentId}`);
      return NextResponse.json({ error: 'You are not enrolled in this class' }, { status: 403 });
    }

    const levelRes = await pool.query(
      'SELECT * FROM writing_levels WHERE level_id = $1 LIMIT 1',
      [assignment.level_id]
    );

    if (levelRes.rows.length === 0) {
      return NextResponse.json({ error: 'Writing level not found' }, { status: 404 });
    }

    const level = levelRes.rows[0];
    if (level.word_bank && typeof level.word_bank === 'string') {
      try { level.word_bank = JSON.parse(level.word_bank); } catch {}
    }
    if (level.rubric && typeof level.rubric === 'string') {
      try { level.rubric = JSON.parse(level.rubric); } catch {}
    }

    const draftRes = await pool.query(
      `SELECT id, pupil_writing, status FROM writing_attempts
       WHERE dwp_assignment_id = $1 AND pupil_id = $2 AND status = 'draft'
       ORDER BY created_at DESC LIMIT 1`,
      [assignmentId, pupilId]
    );

    const draft = draftRes.rows[0] || null;

    return NextResponse.json({ assignment, level, draft });
  } catch (error: any) {
    console.error('[DWP GET assignment]', error);
    return NextResponse.json({ error: 'Could not load assignment' }, { status: 500 });
  }
}
