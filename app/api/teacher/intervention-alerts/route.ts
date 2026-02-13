import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

interface Alert {
  pupilId: string;
  pupilName: string;
  className: string;
  alertType: 'low_engagement' | 'struggling' | 'intervention_needed';
  severity: 'high' | 'medium' | 'low';
  message: string;
  recommendations: string[];
  lastActive: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    const pool = getPool();

    let classFilter = '';
    const classParams: any[] = [user.id];

    if (classId) {
      classFilter = ' AND c.id = $2';
      classParams.push(classId);
    }

    const classesResult = await pool.query(
      `SELECT c.id, c.name FROM classes c WHERE c.teacher_id = $1${classFilter}`,
      classParams
    );

    if (classesResult.rows.length === 0) {
      return NextResponse.json({ alerts: [] });
    }

    const classIds = classesResult.rows.map((c: any) => c.id);
    const classMap = new Map<number, string>(classesResult.rows.map((c: any) => [c.id, c.name]));

    const alerts: Alert[] = [];

    const interventionResult = await pool.query(
      `SELECT DISTINCT ON (wpr.pupil_id, wpr.class_id) 
              wpr.pupil_id, wpr.class_id, wpr.mastery_rate, wpr.sentences_written,
              wpr.average_score, wpr.intervention_recommendations,
              p.first_name, p.last_name, p.display_name, p.updated_at
       FROM weekly_progress_reports wpr
       JOIN pupils p ON wpr.pupil_id = p.id
       WHERE wpr.class_id = ANY($1) AND wpr.intervention_needed = true
       ORDER BY wpr.pupil_id, wpr.class_id, wpr.week_start DESC`,
      [classIds]
    );

    for (const row of interventionResult.rows) {
      const pupilName = row.display_name || `${row.first_name} ${row.last_name || ''}`.trim();
      const recommendations = Array.isArray(row.intervention_recommendations) 
        ? row.intervention_recommendations 
        : [];
      
      const masteryRate = parseFloat(row.mastery_rate) || 0;
      const severity = masteryRate < 30 ? 'high' : masteryRate < 50 ? 'medium' : 'low';
      
      alerts.push({
        pupilId: row.pupil_id,
        pupilName,
        className: classMap.get(row.class_id) || 'Unknown',
        alertType: 'intervention_needed',
        severity,
        message: `${pupilName} has been flagged for intervention (mastery rate: ${masteryRate}%)`,
        recommendations: recommendations.length > 0 
          ? recommendations 
          : ['Schedule a 1:1 check-in', 'Review recent writing samples'],
        lastActive: row.updated_at ? new Date(row.updated_at).toISOString().split('T')[0] : null,
      });
    }

    const streakResult = await pool.query(
      `SELECT ps.pupil_id, ps.current_streak, ps.last_login_date,
              p.first_name, p.last_name, p.display_name,
              cm.class_id
       FROM pupil_streaks ps
       JOIN pupils p ON ps.pupil_id = p.id
       JOIN class_members cm ON cm.pupil_id = p.id
       WHERE cm.class_id = ANY($1)
         AND ps.current_streak = 0
         AND (ps.last_login_date IS NULL OR ps.last_login_date < CURRENT_DATE - INTERVAL '3 days')`,
      [classIds]
    );

    for (const row of streakResult.rows) {
      const pupilName = row.display_name || `${row.first_name} ${row.last_name || ''}`.trim();
      const lastActive = row.last_login_date;
      const daysInactive = lastActive 
        ? Math.floor((Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24))
        : null;

      const existing = alerts.find(a => a.pupilId === row.pupil_id && a.alertType === 'low_engagement');
      if (existing) continue;

      alerts.push({
        pupilId: row.pupil_id,
        pupilName,
        className: classMap.get(row.class_id) || 'Unknown',
        alertType: 'low_engagement',
        severity: daysInactive && daysInactive > 7 ? 'high' : 'medium',
        message: daysInactive 
          ? `${pupilName} hasn't been active for ${daysInactive} days`
          : `${pupilName} has no recent activity`,
        recommendations: [
          `Check in with ${pupilName}`,
          'Consider pairing with a buddy for motivation',
          'Set a small, achievable writing goal',
        ],
        lastActive: lastActive ? new Date(lastActive).toISOString().split('T')[0] : null,
      });
    }

    const strugglingResult = await pool.query(
      `SELECT wcs.pupil_id, 
              AVG(wcs.ai_score) as avg_score,
              COUNT(*) as session_count,
              p.first_name, p.last_name, p.display_name, p.updated_at,
              cm.class_id
       FROM writing_coach_sessions wcs
       JOIN pupils p ON wcs.pupil_id = p.id
       JOIN class_members cm ON cm.pupil_id = p.id
       WHERE cm.class_id = ANY($1)
         AND wcs.created_at >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY wcs.pupil_id, p.first_name, p.last_name, p.display_name, p.updated_at, cm.class_id
       HAVING AVG(wcs.ai_score) < 50`,
      [classIds]
    );

    for (const row of strugglingResult.rows) {
      const pupilName = row.display_name || `${row.first_name} ${row.last_name || ''}`.trim();
      const avgScore = parseFloat(row.avg_score) || 0;

      const existing = alerts.find(a => a.pupilId === row.pupil_id && a.alertType === 'struggling');
      if (existing) continue;

      alerts.push({
        pupilId: row.pupil_id,
        pupilName,
        className: classMap.get(row.class_id) || 'Unknown',
        alertType: 'struggling',
        severity: avgScore < 30 ? 'high' : 'medium',
        message: `${pupilName} is struggling with writing tasks (average score: ${avgScore.toFixed(0)}%)`,
        recommendations: [
          'Provide additional scaffolding for writing tasks',
          `Review ${pupilName}'s recent submissions for patterns`,
          'Consider adjusting difficulty level',
        ],
        lastActive: row.updated_at ? new Date(row.updated_at).toISOString().split('T')[0] : null,
      });
    }

    alerts.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    return NextResponse.json({ alerts });
  } catch (error: any) {
    console.error('Error fetching intervention alerts:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch alerts' }, { status: 500 });
  }
}
