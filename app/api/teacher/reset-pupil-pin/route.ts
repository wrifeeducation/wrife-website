import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getPool } from '@/lib/db';
import bcrypt from 'bcryptjs';

async function authenticateTeacher() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Unauthorized - please log in', status: 401 } as const;
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
    if (byEmail.rows.length > 0) {
      profileRow = byEmail.rows[0];
    }
  }

  if (!profileRow || !['teacher', 'admin', 'school_admin'].includes(profileRow.role)) {
    return { error: 'Unauthorized - teacher access required', status: 403 } as const;
  }

  return {
    userId: profileRow.id,
    role: profileRow.role,
    schoolId: profileRow.school_id,
  };
}

/**
 * POST /api/teacher/reset-pupil-pin
 * Body: { pupilId: string, newPin: string, classId: string }
 *
 * Resets a pupil's PIN. Stores bcrypt hash in password_hash and the
 * plaintext in pin_plaintext so it always appears on login cards.
 *
 * Authorisation: caller must be the teacher of classId,
 * or an admin / school_admin with access to the school.
 */
export async function POST(request: NextRequest) {
  const authResult = await authenticateTeacher();

  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  let body: { pupilId?: string; newPin?: string; classId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { pupilId, newPin, classId } = body;

  if (!pupilId || !newPin || !classId) {
    return NextResponse.json({ error: 'pupilId, newPin, and classId are required' }, { status: 400 });
  }

  if (!/^\d{4}$/.test(newPin)) {
    return NextResponse.json({ error: 'PIN must be exactly 4 digits' }, { status: 400 });
  }

  const pool = getPool();

  // Verify the teacher owns / has access to this class
  let classCheck;
  if (authResult.role === 'admin') {
    classCheck = await pool.query(
      'SELECT id FROM classes WHERE id = $1 LIMIT 1',
      [classId]
    );
  } else if (authResult.role === 'teacher') {
    classCheck = await pool.query(
      'SELECT id FROM classes WHERE id = $1 AND teacher_id = $2 LIMIT 1',
      [classId, authResult.userId]
    );
  } else if (authResult.role === 'school_admin' && authResult.schoolId) {
    classCheck = await pool.query(
      'SELECT id FROM classes WHERE id = $1 AND school_id = $2 LIMIT 1',
      [classId, authResult.schoolId]
    );
  } else {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  if (!classCheck || classCheck.rows.length === 0) {
    return NextResponse.json({ error: 'Class not found or access denied' }, { status: 404 });
  }

  // Verify the pupil is a member of this class
  const memberCheck = await pool.query(
    `SELECT p.id FROM pupils p
     JOIN class_members cm ON cm.pupil_id = p.id
     WHERE p.id = $1 AND cm.class_id = $2
     LIMIT 1`,
    [pupilId, classId]
  );

  if (memberCheck.rows.length === 0) {
    return NextResponse.json({ error: 'Pupil not found in this class' }, { status: 404 });
  }

  // Hash the new PIN and save both hash + plaintext
  const newHash = await bcrypt.hash(newPin, 10);
  await pool.query(
    'UPDATE pupils SET password_hash = $1, pin_plaintext = $2 WHERE id = $3',
    [newHash, newPin, pupilId]
  );

  return NextResponse.json({ success: true, pin_display: newPin });
}
