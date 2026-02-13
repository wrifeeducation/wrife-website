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
      return NextResponse.json({ error: 'Invalid or expired pupil session' }, { status: 401 });
    }

    const pool = getPool();

    const [streakResult, badgesResult, writingResult, activityResult] = await Promise.all([
      pool.query(
        'SELECT current_streak, longest_streak, total_logins FROM pupil_streaks WHERE pupil_id = $1',
        [pupilId]
      ),
      pool.query(
        `SELECT badge_type, badge_name, badge_description, earned_at 
         FROM pupil_badges WHERE pupil_id = $1 ORDER BY earned_at DESC`,
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
        badgeType: b.badge_type,
        badgeName: b.badge_name,
        badgeDescription: b.badge_description,
        earnedAt: b.earned_at,
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
