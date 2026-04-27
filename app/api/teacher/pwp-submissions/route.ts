import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getPool } from '@/lib/db';

// PATCH /api/teacher/pwp-submissions?id=<submissionId>
// Body: { status: 'reviewed' }
export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = getPool();

    // Resolve profile
    let profileRow: { id: string; role: string } | null = null;
    const byId = await pool.query('SELECT id, role FROM profiles WHERE id = $1 LIMIT 1', [user.id]);
    if (byId.rows.length > 0) profileRow = byId.rows[0];
    else if (user.email) {
      const byEmail = await pool.query(
        'SELECT id, role FROM profiles WHERE LOWER(email) = LOWER($1) LIMIT 1', [user.email]
      );
      if (byEmail.rows.length > 0) profileRow = byEmail.rows[0];
    }

    if (!profileRow || !['teacher', 'admin', 'school_admin'].includes(profileRow.role)) {
      return NextResponse.json({ error: 'Teacher access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('id');
    if (!submissionId) {
      return NextResponse.json({ error: 'Submission id is required' }, { status: 400 });
    }

    const { status } = await request.json();
    if (!['reviewed', 'submitted'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // For teachers, verify class ownership
    if (profileRow.role === 'teacher') {
      const check = await pool.query(
        `SELECT ps.id FROM pwp_submissions ps
         JOIN pwp_assignments pa ON pa.id = ps.pwp_assignment_id
         JOIN classes c ON c.id::text = pa.class_id::text
         WHERE ps.id = $1 AND c.teacher_id = $2 LIMIT 1`,
        [submissionId, profileRow.id]
      );
      if (check.rows.length === 0) {
        return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
      }
    }

    await pool.query(
      `UPDATE pwp_submissions SET status = $1 WHERE id = $2`,
      [status, submissionId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[PWP submission PATCH]', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
