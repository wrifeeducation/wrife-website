/**
 * POST /api/teacher/submissions/approve
 * Teacher approves AI feedback — this makes it visible to the pupil.
 *
 * Body:    { submissionId: string, teacherNote?: string }
 * Returns: { success: true, submission: SubmissionRow }
 *
 * Sets status = 'reviewed', reviewed_at = now(), reviewed_by = teacher.id,
 * and (if provided) teacher_feedback = teacherNote.
 *
 * Separate from POST /api/assess — assessment generates the AI scores;
 * this endpoint is the teacher's explicit gate before the pupil sees anything.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getPool } from '@/lib/db';

// ─── Auth ───────────────────────────────────────────────────────────────────

async function getTeacherProfile() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } },
  );
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const pool = getPool();
  const res = await pool.query(
    'SELECT id, role FROM profiles WHERE id = $1 LIMIT 1',
    [user.id],
  );
  return res.rows[0] as { id: string; role: string } | undefined;
}

// ─── POST ────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const teacher = await getTeacherProfile();
    if (!teacher || !['teacher', 'school_admin', 'admin'].includes(teacher.role)) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const body = await request.json() as { submissionId?: string; teacherNote?: string };
    const { submissionId, teacherNote } = body;

    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId is required' }, { status: 400 });
    }

    const pool = getPool();

    // ── Fetch submission + class to verify ownership ────────────────────────
    const subRes = await pool.query(
      `SELECT s.id, s.status, s.class_id, a.class_id AS assignment_class_id
       FROM submissions s
       JOIN assignments a ON a.id = s.assignment_id
       WHERE s.id = $1
       LIMIT 1`,
      [submissionId],
    );

    if (subRes.rows.length === 0) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const sub = subRes.rows[0] as {
      id: string;
      status: string;
      class_id: string | null;
      assignment_class_id: string;
    };

    const classId = sub.class_id ?? sub.assignment_class_id;

    // Admins bypass ownership check
    if (teacher.role !== 'admin') {
      const owns = await pool.query(
        'SELECT 1 FROM classes WHERE id = $1 AND teacher_id = $2 LIMIT 1',
        [classId, teacher.id],
      );
      if (owns.rows.length === 0) {
        return NextResponse.json({ error: 'You do not own this class' }, { status: 403 });
      }
    }

    // ── Update submission ───────────────────────────────────────────────────
    const updateRes = await pool.query(
      `UPDATE submissions
       SET
         status       = 'reviewed',
         reviewed_at  = now(),
         reviewed_by  = $1,
         teacher_note = COALESCE($2, teacher_note)
       WHERE id = $3
       RETURNING *`,
      [teacher.id, teacherNote?.trim() || null, submissionId],
    );

    console.log(`[/api/teacher/submissions/approve] approved ${submissionId} by ${teacher.id}`);
    return NextResponse.json({ success: true, submission: updateRes.rows[0] });
  } catch (err: unknown) {
    console.error('[/api/teacher/submissions/approve] error:', err);
    const message = err instanceof Error ? err.message : 'Approval failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
