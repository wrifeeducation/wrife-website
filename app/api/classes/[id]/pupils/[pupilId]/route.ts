import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';

function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pupilId: string }> }
) {
  try {
    const { id: classId, pupilId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const pool = getPool();
    const classCheck = await pool.query(
      'SELECT id, class_code FROM classes WHERE id = $1 AND teacher_id = $2',
      [classId, user.id]
    );
    if (classCheck.rows.length === 0) return NextResponse.json({ error: 'Class not found' }, { status: 404 });

    const result = await pool.query(
      `SELECT p.id, p.first_name, p.last_name, p.display_name, p.username,
              p.year_group, p.is_active, p.last_login_at, p.created_at,
              (SELECT COUNT(*) FROM pupil_activity_log pal WHERE pal.pupil_id = p.id) as activity_count
       FROM pupils p
       JOIN class_members cm ON cm.pupil_id = p.id
       WHERE p.id = $1 AND cm.class_id = $2`,
      [pupilId, classId]
    );

    if (result.rows.length === 0) return NextResponse.json({ error: 'Pupil not found' }, { status: 404 });
    return NextResponse.json({ pupil: { ...result.rows[0], class_code: classCheck.rows[0].class_code } });
  } catch (error) {
    console.error('Error fetching pupil:', error);
    return NextResponse.json({ error: 'Failed to fetch pupil' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pupilId: string }> }
) {
  try {
    const { id: classId, pupilId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { firstName, lastName, isActive } = body;
    const pool = getPool();

    const classCheck = await pool.query(
      'SELECT id FROM classes WHERE id = $1 AND teacher_id = $2', [classId, user.id]
    );
    if (classCheck.rows.length === 0) return NextResponse.json({ error: 'Class not found' }, { status: 404 });

    const memberCheck = await pool.query(
      'SELECT 1 FROM class_members WHERE class_id = $1 AND pupil_id = $2', [classId, pupilId]
    );
    if (memberCheck.rows.length === 0) return NextResponse.json({ error: 'Pupil not found in this class' }, { status: 404 });

    const displayName = firstName && lastName ? `${firstName} ${lastName}` : firstName || undefined;
    const result = await pool.query(
      `UPDATE pupils SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name),
       display_name = COALESCE($3, display_name), is_active = COALESCE($4, is_active), updated_at = NOW()
       WHERE id = $5 RETURNING id, first_name, last_name, display_name, username, year_group, is_active`,
      [firstName, lastName, displayName, isActive, pupilId]
    );
    return NextResponse.json({ pupil: result.rows[0] });
  } catch (error) {
    console.error('Error updating pupil:', error);
    return NextResponse.json({ error: 'Failed to update pupil' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pupilId: string }> }
) {
  try {
    const { id: classId, pupilId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const pool = getPool();
    const classCheck = await pool.query(
      'SELECT id FROM classes WHERE id = $1 AND teacher_id = $2', [classId, user.id]
    );
    if (classCheck.rows.length === 0) return NextResponse.json({ error: 'Class not found' }, { status: 404 });

    // Remove from class_members only (preserve pupil record)
    const result = await pool.query(
      'DELETE FROM class_members WHERE class_id = $1 AND pupil_id = $2 RETURNING pupil_id',
      [classId, pupilId]
    );
    if (result.rows.length === 0) return NextResponse.json({ error: 'Pupil not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing pupil:', error);
    return NextResponse.json({ error: 'Failed to remove pupil' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pupilId: string }> }
) {
  try {
    const { id: classId, pupilId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    if (body.action !== 'reset-password') return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    const pool = getPool();
    const classCheck = await pool.query(
      'SELECT id, class_code FROM classes WHERE id = $1 AND teacher_id = $2', [classId, user.id]
    );
    if (classCheck.rows.length === 0) return NextResponse.json({ error: 'Class not found' }, { status: 404 });

    const newPin = generatePin();
    const passwordHash = await bcrypt.hash(newPin, 10);
    const result = await pool.query(
      `UPDATE pupils SET password_hash = $1, updated_at = NOW()
       WHERE id = $2 RETURNING id, first_name, last_name, display_name, username`,
      [passwordHash, pupilId]
    );
    if (result.rows.length === 0) return NextResponse.json({ error: 'Pupil not found' }, { status: 404 });

    return NextResponse.json({
      pupil: result.rows[0],
      credentials: { classCode: classCheck.rows[0].class_code, username: result.rows[0].username, pin: newPin }
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
