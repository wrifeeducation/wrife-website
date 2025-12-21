import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getAuthenticatedAdmin, AuthError } from '@/lib/admin-auth';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    await getAuthenticatedAdmin();
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }

  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [
      activeUsersResult,
      eventBreakdownResult,
      dailyActivityResult,
      recentActivityResult,
      userCountsResult,
    ] = await Promise.all([
      pool.query(`
        SELECT 
          COUNT(DISTINCT CASE WHEN created_at >= $1 THEN user_id END) as today,
          COUNT(DISTINCT CASE WHEN created_at >= $2 THEN user_id END) as week,
          COUNT(DISTINCT CASE WHEN created_at >= $3 THEN user_id END) as month
        FROM user_activity
        WHERE user_id IS NOT NULL
      `, [today, weekAgo, monthAgo]),

      pool.query(`
        SELECT 
          event_type,
          user_role,
          COUNT(*) as count
        FROM user_activity
        WHERE created_at >= $1
        GROUP BY event_type, user_role
        ORDER BY count DESC
      `, [weekAgo]),

      pool.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as events,
          COUNT(DISTINCT user_id) as unique_users
        FROM user_activity
        WHERE created_at >= $1
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 14
      `, [new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()]),

      pool.query(`
        SELECT 
          ua.id,
          ua.user_id,
          ua.user_role,
          ua.event_type,
          ua.event_data,
          ua.page_path,
          ua.created_at,
          p.email,
          p.display_name
        FROM user_activity ua
        LEFT JOIN profiles p ON ua.user_id = p.id
        ORDER BY ua.created_at DESC
        LIMIT 50
      `),

      pool.query(`
        SELECT 
          role,
          COUNT(*) as count
        FROM profiles
        GROUP BY role
      `),
    ]);

    const activeUsers = activeUsersResult.rows[0] || { today: 0, week: 0, month: 0 };
    
    const eventBreakdown: Record<string, Record<string, number>> = {};
    for (const row of eventBreakdownResult.rows) {
      if (!eventBreakdown[row.event_type]) {
        eventBreakdown[row.event_type] = {};
      }
      eventBreakdown[row.event_type][row.user_role || 'unknown'] = parseInt(row.count);
    }

    const dailyActivity = dailyActivityResult.rows.map(row => ({
      date: row.date,
      events: parseInt(row.events),
      uniqueUsers: parseInt(row.unique_users),
    })).reverse();

    const recentActivity = recentActivityResult.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      userRole: row.user_role,
      eventType: row.event_type,
      eventData: row.event_data,
      pagePath: row.page_path,
      createdAt: row.created_at,
      email: row.email,
      displayName: row.display_name,
    }));

    const userCounts: Record<string, number> = {};
    for (const row of userCountsResult.rows) {
      userCounts[row.role] = parseInt(row.count);
    }

    return NextResponse.json({
      activeUsers: {
        today: parseInt(activeUsers.today) || 0,
        week: parseInt(activeUsers.week) || 0,
        month: parseInt(activeUsers.month) || 0,
      },
      eventBreakdown,
      dailyActivity,
      recentActivity,
      userCounts,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
