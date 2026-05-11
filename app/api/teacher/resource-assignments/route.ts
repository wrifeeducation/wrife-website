import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getPool } from '@/lib/db';

/* ── Auth helpers (shared pattern across teacher routes) ──── */

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
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Unauthorized - please log in', status: 401 };
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
    if (byEmail.rows.length > 0) profileRow = byEmail.rows[0];
  }

  if (!profileRow || !['teacher', 'admin', 'school_admin'].includes(profileRow.role)) {
    return { error: 'Unauthorized - teacher access required', status: 403 };
  }

  return { userId: profileRow.id, role: profileRow.role, schoolId: profileRow.school_id };
}

async function verifyClassOwnership(auth: AuthResult, classId: number): Promise<boolean> {
  if (auth.role === 'admin') return true;
  const pool = getPool();
  if (auth.role === 'teacher') {
    const r = await pool.query(
      'SELECT id FROM classes WHERE id = $1 AND teacher_id = $2 LIMIT 1',
      [classId, auth.userId]
    );
    return r.rows.length > 0;
  }
  if (auth.role === 'school_admin' && auth.schoolId) {
    const r = await pool.query(
      'SELECT id FROM classes WHERE id = $1 AND school_id = $2 LIMIT 1',
      [classId, auth.schoolId]
    );
    return r.rows.length > 0;
  }
  return false;
}

/* ── POST /api/teacher/resource-assignments ─────────────────
 *
 * Body: { lessonFileId, lessonId, classId, title, fileType, fileUrl, message?, dueDate? }
 * Creates a resource_assignment row so pupils in that class can see the resource.
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateTeacher();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { lessonFileId, lessonId, classId, title, fileType, fileUrl, message, dueDate } =
      await request.json();

    if (!lessonFileId || !lessonId || !classId || !title || !fileType || !fileUrl) {
      return NextResponse.json({ error: 'lessonFileId, lessonId, classId, title, fileType, and fileUrl are required' }, { status: 400 });
    }

    const hasAccess = await verifyClassOwnership(authResult, Number(classId));
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const pool = getPool();

    // Prevent exact duplicates (same file already pushed to same class and still active)
    const existing = await pool.query(
      `SELECT id FROM resource_assignments
       WHERE lesson_file_id = $1 AND class_id = $2 AND status = 'active'
       LIMIT 1`,
      [lessonFileId, classId]
    );
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'This resource has already been pushed to that class' },
        { status: 409 }
      );
    }

    const result = await pool.query(
      `INSERT INTO resource_assignments
         (lesson_file_id, lesson_id, class_id, teacher_id, title, file_type, file_url, message, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        lessonFileId,
        lessonId,
        classId,
        authResult.userId,
        title,
        fileType,
        fileUrl,
        message || null,
        dueDate || null,
      ]
    );

    return NextResponse.json({ resourceAssignment: result.rows[0] }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating resource assignment:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/* ── GET /api/teacher/resource-assignments?classId=X ────────
 *
 * Returns active resource assignments for a class, joined with lesson info.
 * Used by:
 *   - TeacherAssignmentsTab (teacher view)
 *   - R3: /api/pupil/resource-assignments (pupil dashboard, via separate pupil route)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateTeacher();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json({ error: 'classId is required' }, { status: 400 });
    }

    const hasAccess = await verifyClassOwnership(authResult, Number(classId));
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const pool = getPool();

    const result = await pool.query(
      `SELECT
         ra.id,
         ra.lesson_file_id,
         ra.lesson_id,
         ra.class_id,
         ra.title,
         ra.file_type,
         ra.file_url,
         ra.message,
         ra.due_date,
         ra.status,
         ra.created_at,
         l.lesson_number,
         l.part        AS lesson_part,
         l.title       AS lesson_title
       FROM resource_assignments ra
       LEFT JOIN lessons l ON l.id = ra.lesson_id
       WHERE ra.class_id = $1
         AND ra.status = 'active'
       ORDER BY ra.created_at DESC`,
      [classId]
    );

    return NextResponse.json({ resourceAssignments: result.rows });
  } catch (error: unknown) {
    console.error('Error fetching resource assignments:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/* ── PATCH /api/teacher/resource-assignments?id=X ───────────
 *
 * Archive (soft-delete) a resource assignment.
 * Body: { status: 'archived' }
 */
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await authenticateTeacher();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { status } = await request.json();
    if (!['active', 'archived'].includes(status)) {
      return NextResponse.json({ error: 'status must be active or archived' }, { status: 400 });
    }

    const pool = getPool();

    // Verify ownership via teacher_id
    const check = await pool.query(
      `SELECT id FROM resource_assignments WHERE id = $1 AND teacher_id = $2 LIMIT 1`,
      [id, authResult.userId]
    );
    if (check.rows.length === 0 && authResult.role !== 'admin') {
      return NextResponse.json({ error: 'Not found or access denied' }, { status: 403 });
    }

    await pool.query(
      `UPDATE resource_assignments SET status = $1 WHERE id = $2`,
      [status, id]
    );

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error('Error updating resource assignment:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
