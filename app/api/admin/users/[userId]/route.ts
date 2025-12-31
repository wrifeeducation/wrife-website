import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin, AuthError } from '@/lib/admin-auth';
import { getPool } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await getAuthenticatedAdmin();
    const db = getPool();
    const { userId } = await params;

    const profileResult = await db.query(
      `SELECT id, email, display_name, first_name, last_name, role, membership_tier, school_id, created_at 
       FROM profiles WHERE id = $1`,
      [userId]
    );

    if (profileResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const profile = profileResult.rows[0];

    const classesResult = await db.query(
      `SELECT c.id, c.name, c.year_group, c.class_code, c.school_name, c.created_at,
              (SELECT COUNT(*) FROM pupils p WHERE p.class_id = c.id) as pupil_count
       FROM classes c WHERE c.teacher_id = $1
       ORDER BY c.created_at DESC`,
      [userId]
    );

    const classIds = classesResult.rows.map(c => c.id);
    let pupils: any[] = [];
    
    if (classIds.length > 0) {
      const pupilsResult = await db.query(
        `SELECT 
           p.id, p.class_id, p.first_name, p.last_name, p.display_name, 
           p.username, p.year_group, p.is_active, p.last_login_at, p.created_at,
           c.name as class_name, c.class_code,
           (SELECT COUNT(*) FROM pupil_activity_log pal WHERE pal.pupil_id = p.id) as activity_count,
           (SELECT COUNT(*) FROM submissions s WHERE s.pupil_id = p.id AND s.status = 'submitted') as submissions_count
         FROM pupils p
         LEFT JOIN classes c ON p.class_id = c.id
         WHERE p.class_id = ANY($1)
         ORDER BY c.name, p.first_name, p.last_name`,
        [classIds]
      );
      pupils = pupilsResult.rows;
    }

    const activityResult = await db.query(
      `SELECT activity_type, COUNT(*) as count, MAX(created_at) as last_activity
       FROM user_activity WHERE user_id = $1
       GROUP BY activity_type
       ORDER BY count DESC`,
      [userId]
    );

    return NextResponse.json({
      profile,
      classes: classesResult.rows,
      pupils,
      activity: activityResult.rows,
      stats: {
        classCount: classesResult.rows.length,
        pupilCount: pupils.length,
        totalActivities: activityResult.rows.reduce((sum, a) => sum + parseInt(a.count), 0),
      }
    });
  } catch (error: any) {
    console.error('Error fetching user details:', error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
