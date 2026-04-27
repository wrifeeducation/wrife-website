import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { classCode, username, pin } = body;

    if (!classCode || !username || !pin) {
      return NextResponse.json({
        error: 'Class code, username, and PIN are required'
      }, { status: 400 });
    }

    const pool = getPool();

    // Look up pupil via class_members join (not the legacy pupils.class_id)
    const result = await pool.query(
      `SELECT p.id, p.first_name, p.last_name, p.display_name, p.username,
              p.password_hash, p.year_group, p.is_active,
              c.id as class_uuid, c.name as class_name, c.class_code,
              t.display_name as teacher_name
       FROM pupils p
       JOIN class_members cm ON cm.pupil_id = p.id
       JOIN classes c ON c.id = cm.class_id
       LEFT JOIN profiles t ON c.teacher_id = t.id
       WHERE LOWER(c.class_code) = LOWER($1)
         AND LOWER(p.username) = LOWER($2)`,
      [classCode.trim(), username.trim()]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid class code or username' }, { status: 401 });
    }

    const pupil = result.rows[0];

    if (!pupil.is_active) {
      return NextResponse.json({ error: 'Account is disabled. Please contact your teacher.' }, { status: 403 });
    }

    // Try bcrypt first (for properly hashed passwords)
    let isValidPassword = await bcrypt.compare(pin, pupil.password_hash);

    // If bcrypt fails, check if this is a plain PIN from migration (4 digits, no bcrypt prefix)
    // Auto-upgrade to bcrypt hash on successful plain-PIN login
    if (!isValidPassword && /^\d{4}$/.test(pupil.password_hash) && pin === pupil.password_hash) {
      isValidPassword = true;
      const newHash = await bcrypt.hash(pin, 10);
      pool.query('UPDATE pupils SET password_hash = $1 WHERE id = $2', [newHash, pupil.id]).catch(() => {});
    }

    if (!isValidPassword) {
      // Log failed attempt (non-fatal)
      pool.query(
        `INSERT INTO pupil_activity_log (pupil_id, event_type, event_data, ip_address)
         VALUES ($1, 'login_failed', $2, $3)`,
        [pupil.id, JSON.stringify({ reason: 'wrong_pin' }), request.headers.get('x-forwarded-for') || 'unknown']
      ).catch(() => {});

      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
    }

    // Create session using correct column names
    const token = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 8);

    await pool.query(
      `INSERT INTO pupil_sessions (pupil_id, session_token, expires_at, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [pupil.id, token, expiresAt, request.headers.get('x-forwarded-for') || null]
    );

    // Update last login
    pool.query('UPDATE pupils SET last_login_at = NOW() WHERE id = $1', [pupil.id]).catch(() => {});

    // Log success (non-fatal)
    pool.query(
      `INSERT INTO pupil_activity_log (pupil_id, event_type, event_data, ip_address)
       VALUES ($1, 'login', $2, $3)`,
      [pupil.id, JSON.stringify({ success: true }), request.headers.get('x-forwarded-for') || 'unknown']
    ).catch(() => {});

    const response = NextResponse.json({
      success: true,
      pupil: {
        id: pupil.id,
        firstName: pupil.first_name,
        lastName: pupil.last_name,
        displayName: pupil.display_name,
        username: pupil.username,
        yearGroup: pupil.year_group,
        classId: pupil.class_uuid,
        className: pupil.class_name,
        teacherName: pupil.teacher_name
      }
    });

    response.cookies.set('pupil_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Pupil login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
