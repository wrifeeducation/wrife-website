/**
 * GET /api/teacher/dwp-completions?assignmentId=<id>
 * Returns per-pupil completion status for a DWP assignment.
 *
 * Joins class_members → pupils → writing_attempts (LEFT JOIN so pupils
 * who haven't started still appear). Returns every class member with
 * their latest attempt for the given assignment (or null if not started).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getPool } from '@/lib/db';

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

export async function GET(request: NextRequest) {
  try {
    const teacher = await getTeacherProfile();
    if (!teacher || !['teacher', 'school_admin', 'admin'].includes(teacher.role)) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');
    if (!assignmentId) {
      return NextResponse.json({ error: 'assignmentId is required' }, { status: 400 });
    }

    const pool = getPool();

    // Verify teacher owns the assignment's class (admins bypass)
    if (teacher.role !== 'admin') {
      const owns = await pool.query(
        `SELECT 1
         FROM dwp_assignments da
         JOIN classes c ON c.id = da.class_id
         WHERE da.id = $1 AND c.teacher_id = $2
         LIMIT 1`,
        [assignmentId, teacher.id],
      );
      if (owns.rows.length === 0) {
        return NextResponse.json({ error: 'You do not own this assignment' }, { status: 403 });
      }
    }

    // Get class_id for this assignment
    const assignRes = await pool.query(
      'SELECT class_id FROM dwp_assignments WHERE id = $1 LIMIT 1',
      [assignmentId],
    );
    if (assignRes.rows.length === 0) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }
    const { class_id } = assignRes.rows[0] as { class_id: string };

    // Fetch all class members + their best attempt for this assignment
    const result = await pool.query(
      `SELECT
         p.id               AS pupil_id,
         COALESCE(p.display_name, p.first_name || ' ' || p.last_name) AS name,
         wa.id              AS attempt_id,
         wa.status          AS attempt_status,
         wa.percentage,
         wa.performance_band,
         wa.passed,
         wa.intervention_flagged,
         wa.time_submitted
       FROM class_members cm
       JOIN pupils p ON p.id = cm.pupil_id
       LEFT JOIN LATERAL (
         SELECT *
         FROM writing_attempts
         WHERE pupil_id = p.id
           AND dwp_assignment_id = $1
         ORDER BY created_at DESC
         LIMIT 1
       ) wa ON true
       WHERE cm.class_id = $2
       ORDER BY p.first_name, p.last_name`,
      [assignmentId, class_id],
    );

    return NextResponse.json({ pupils: result.rows });
  } catch (err: unknown) {
    console.error('[/api/teacher/dwp-completions] error:', err);
    const message = err instanceof Error ? err.message : 'Failed to load completions';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
