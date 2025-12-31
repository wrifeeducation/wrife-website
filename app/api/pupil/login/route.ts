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
    
    const result = await pool.query(
      `SELECT p.id, p.first_name, p.last_name, p.display_name, p.username, 
              p.password_hash, p.year_group, p.is_active, p.class_id,
              c.name as class_name, c.class_code,
              t.display_name as teacher_name
       FROM pupils p
       JOIN classes c ON p.class_id = c.id
       LEFT JOIN profiles t ON c.teacher_id = t.id
       WHERE LOWER(c.class_code) = LOWER($1) AND LOWER(p.username) = LOWER($2)`,
      [classCode.trim(), username.trim()]
    );

    if (result.rows.length === 0) {
      await pool.query(
        `INSERT INTO pupil_activity_log (pupil_id, class_id, event_type, event_data, ip_address)
         VALUES ('00000000-0000-0000-0000-000000000000', 0, 'login_failed', $1, $2)`,
        [JSON.stringify({ classCode, username, reason: 'not_found' }), request.headers.get('x-forwarded-for') || 'unknown']
      ).catch(() => {});
      
      return NextResponse.json({ error: 'Invalid class code or username' }, { status: 401 });
    }

    const pupil = result.rows[0];

    if (!pupil.is_active) {
      return NextResponse.json({ error: 'Account is disabled. Please contact your teacher.' }, { status: 403 });
    }

    const isValidPassword = await bcrypt.compare(pin, pupil.password_hash);

    if (!isValidPassword) {
      await pool.query(
        `INSERT INTO pupil_activity_log (pupil_id, class_id, event_type, event_data, ip_address)
         VALUES ($1, $2, 'login_failed', $3, $4)`,
        [pupil.id, pupil.class_id, JSON.stringify({ reason: 'wrong_pin' }), request.headers.get('x-forwarded-for') || 'unknown']
      );
      
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
    }

    const token = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 8);

    await pool.query(
      `INSERT INTO pupil_sessions (pupil_id, class_id, token, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [pupil.id, pupil.class_id, token, expiresAt]
    );

    await pool.query(
      'UPDATE pupils SET last_login_at = NOW() WHERE id = $1',
      [pupil.id]
    );

    await pool.query(
      `INSERT INTO pupil_activity_log (pupil_id, class_id, event_type, event_data, ip_address)
       VALUES ($1, $2, 'login', $3, $4)`,
      [pupil.id, pupil.class_id, JSON.stringify({ success: true }), request.headers.get('x-forwarded-for') || 'unknown']
    );

    const response = NextResponse.json({
      success: true,
      pupil: {
        id: pupil.id,
        firstName: pupil.first_name,
        lastName: pupil.last_name,
        displayName: pupil.display_name,
        username: pupil.username,
        yearGroup: pupil.year_group,
        classId: pupil.class_id,
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
