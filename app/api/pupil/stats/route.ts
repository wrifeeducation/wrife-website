import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { validatePupilSession } from '@/lib/pupil-auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pupilId = searchParams.get('pupilId');

    if (!pupilId) {
      return NextResponse.json({ error: 'Missing pupilId parameter' }, { status: 400 });
    }

    const session = await validatePupilSession(pupilId);
    if (!session.valid) {
      const pool = getPool();
      const check = await pool.query('SELECT id FROM pupils WHERE id = $1 LIMIT 1', [pupilId]);
      if (check.rows.length === 0) {
        return NextResponse.json({ error: 'Invalid or expired pupil session' }, { status: 401 });
      }
    }

    const pool = getPool();

    const [streakResult, badgesResult, writingResult, activityResult] = await Promise.all([
      pool.query(
        'SELECT current_streak, longest_streak, total_logins FROM pupil_streaks WHERE pupil_id = $1',
        [pupilId]
      ),
      // Fetch earned DWP badge slugs from writing_progress, then join badge definitions
      pool.query(
        `SELECT wb.badge_id, wb.badge_type, wb.badge_name, wb.badge_icon, wb.badge_description
         FROM writing_progress wp
         CROSS JOIN LATERAL jsonb_array_elements_text(
           CASE jsonb_typeof(wp.badges_earned)
             WHEN 'array'  THEN wp.badges_earned
             WHEN 'object' THEN (SELECT jsonb_agg(k) FROM jsonb_object_keys(wp.badges_earned) k)
             ELSE '[]'::jsonb
           END
         ) AS earned_slug
         JOIN writing_badges wb ON wb.badge_id = earned_slug
         WHERE wp.pupil_id = $1`,
        [pupilId]
      ),
      pool.query(
        `SELECT 
           COUNT(*)::int AS total_sentences,
           COUNT(*) FILTER (WHERE mastery = true)::int AS mastery_count,
           COALESCE(ROUND(AVG(ai_score)::numeric, 0), 0)::int AS average_score
         FROM writing_coach_sessions WHERE pupil_id = $1 AND status = 'submitted'`,
        [pupilId]
      ),
      pool.query(
        `SELECT 
           COUNT(*) FILTER (WHERE completed_at IS NOT NULL)::int AS total_completed,
           CASE WHEN COUNT(*) > 0 
             THEN ROUND((COUNT(*) FILTER (WHERE mastery_achieved = true)::numeric / COUNT(*)::numeric) * 100, 0)::int 
             ELSE 0 
           END AS mastery_rate
         FROM activity_progress WHERE pupil_id = $1`,
        [pupilId]
      ),
    ]);

    const streak = streakResult.rows[0] || { current_streak: 0, longest_streak: 0, total_logins: 0 };
    const writingStats = writingResult.rows[0] || { total_sentences: 0, mastery_count: 0, average_score: 0 };
    const activityStats = activityResult.rows[0] || { total_completed: 0, mastery_rate: 0 };

    return NextResponse.json({
      streak: {
        current: streak.current_streak,
        longest: streak.longest_streak,
        totalLogins: streak.total_logins,
      },
      badges: badgesResult.rows.map((b: Record<string, unknown>) => ({
        badgeId: b.badge_id,
        badgeType: b.badge_type,
        badgeName: b.badge_name,
        badgeIcon: b.badge_icon,
        badgeDescription: b.badge_description,
      })),
      writingStats: {
        totalSentences: writingStats.total_sentences,
        masteryCount: writingStats.mastery_count,
        averageScore: writingStats.average_score,
      },
      activityStats: {
        totalCompleted: activityStats.total_completed,
        masteryRate: activityStats.mastery_rate,
      },
    });
  } catch (error) {
    console.error('Pupil stats error:', error);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
