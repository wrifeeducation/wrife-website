import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('pupil_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const pool = getPool();
    
    const result = await pool.query(
      `SELECT ps.pupil_id, ps.class_id, ps.expires_at,
              p.first_name, p.last_name, p.display_name, p.username, p.year_group,
              c.name as class_name, c.class_code,
              t.display_name as teacher_name
       FROM pupil_sessions ps
       JOIN pupils p ON ps.pupil_id = p.id
       JOIN classes c ON ps.class_id = c.id
       LEFT JOIN profiles t ON c.teacher_id = t.id
       WHERE ps.token = $1 AND ps.expires_at > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      const response = NextResponse.json({ error: 'Session expired' }, { status: 401 });
      response.cookies.delete('pupil_session');
      return response;
    }

    const session = result.rows[0];

    return NextResponse.json({
      pupil: {
        id: session.pupil_id,
        firstName: session.first_name,
        lastName: session.last_name,
        displayName: session.display_name,
        username: session.username,
        yearGroup: session.year_group,
        classId: session.class_id,
        className: session.class_name,
        teacherName: session.teacher_name
      }
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ error: 'Session check failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('pupil_session')?.value;

    if (token) {
      const pool = getPool();
      
      const sessionResult = await pool.query(
        'SELECT pupil_id, class_id FROM pupil_sessions WHERE token = $1',
        [token]
      );
      
      if (sessionResult.rows.length > 0) {
        const { pupil_id, class_id } = sessionResult.rows[0];
        
        await pool.query(
          `INSERT INTO pupil_activity_log (pupil_id, class_id, event_type, ip_address)
           VALUES ($1, $2, 'logout', $3)`,
          [pupil_id, class_id, request.headers.get('x-forwarded-for') || 'unknown']
        );
      }
      
      await pool.query('DELETE FROM pupil_sessions WHERE token = $1', [token]);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete('pupil_session');
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
