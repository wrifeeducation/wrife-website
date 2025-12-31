import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin, AuthError } from '@/lib/admin-auth';
import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.PROD_DATABASE_URL || process.env.DATABASE_URL;
    pool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

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
      `SELECT id, name, year_group, class_code, school_name, created_at
       FROM classes WHERE teacher_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    const classIds = classesResult.rows.map(c => c.id);
    let pupils: any[] = [];
    
    if (classIds.length > 0) {
      const pupilsResult = await db.query(
        `SELECT 
           cm.id, cm.class_id, cm.pupil_name, cm.pupil_email, cm.pupil_id, cm.created_at,
           c.name as class_name,
           p.display_name as profile_display_name, p.membership_tier
         FROM class_members cm
         LEFT JOIN classes c ON cm.class_id = c.id
         LEFT JOIN profiles p ON cm.pupil_id = p.id
         WHERE cm.class_id = ANY($1)
         ORDER BY c.name, cm.pupil_name`,
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
