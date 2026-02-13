import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

interface BadgeEarned {
  badgeName: string;
  badgeDescription: string;
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing required field: sessionId' },
        { status: 400 }
      );
    }

    const pool = getPool();

    const sessionResult = await pool.query(
      `SELECT id, pupil_id, status, mastery, story_part, subject_chosen
       FROM writing_coach_sessions
       WHERE id = $1`,
      [sessionId]
    );

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const session = sessionResult.rows[0];

    if (session.status === 'submitted') {
      return NextResponse.json(
        { error: 'Session already submitted' },
        { status: 400 }
      );
    }

    const pupilId = session.pupil_id;

    await pool.query(
      `UPDATE writing_coach_sessions SET status = 'submitted', updated_at = NOW() WHERE id = $1`,
      [sessionId]
    );

    const today = new Date().toISOString().split('T')[0];

    const streakResult = await pool.query(
      `SELECT id, current_streak, longest_streak, last_login_date, total_logins
       FROM pupil_streaks WHERE pupil_id = $1`,
      [pupilId]
    );

    if (streakResult.rows.length === 0) {
      await pool.query(
        `INSERT INTO pupil_streaks (pupil_id, current_streak, longest_streak, last_login_date, total_logins)
         VALUES ($1, 1, 1, $2, 1)`,
        [pupilId, today]
      );
    } else {
      const streak = streakResult.rows[0];
      const lastDate = streak.last_login_date
        ? new Date(streak.last_login_date).toISOString().split('T')[0]
        : null;

      if (lastDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newStreak: number;
        if (lastDate === yesterdayStr) {
          newStreak = streak.current_streak + 1;
        } else {
          newStreak = 1;
        }

        const newLongest = Math.max(newStreak, streak.longest_streak);

        await pool.query(
          `UPDATE pupil_streaks
           SET current_streak = $1, longest_streak = $2, last_login_date = $3, total_logins = total_logins + 1, updated_at = NOW()
           WHERE pupil_id = $4`,
          [newStreak, newLongest, today, pupilId]
        );
      }
    }

    const newBadges: BadgeEarned[] = [];

    const existingBadgesResult = await pool.query(
      `SELECT badge_name FROM pupil_badges WHERE pupil_id = $1`,
      [pupilId]
    );
    const existingBadges = new Set(existingBadgesResult.rows.map((r: { badge_name: string }) => r.badge_name));

    const submittedCountResult = await pool.query(
      `SELECT COUNT(*) as count FROM writing_coach_sessions WHERE pupil_id = $1 AND status = 'submitted'`,
      [pupilId]
    );
    const submittedCount = parseInt(submittedCountResult.rows[0].count, 10);

    if (submittedCount === 1 && !existingBadges.has('First Sentence')) {
      await pool.query(
        `INSERT INTO pupil_badges (pupil_id, badge_name, badge_description)
         VALUES ($1, 'First Sentence', 'Submitted your very first sentence!')
         ON CONFLICT (pupil_id, badge_name) DO NOTHING`,
        [pupilId]
      );
      newBadges.push({ badgeName: 'First Sentence', badgeDescription: 'Submitted your very first sentence!' });
    }

    if (!existingBadges.has('Five Star Writer')) {
      const masteryCountResult = await pool.query(
        `SELECT COUNT(*) as count FROM writing_coach_sessions
         WHERE pupil_id = $1 AND status = 'submitted' AND mastery = true`,
        [pupilId]
      );
      const masteryCount = parseInt(masteryCountResult.rows[0].count, 10);

      if (masteryCount >= 5) {
        await pool.query(
          `INSERT INTO pupil_badges (pupil_id, badge_name, badge_description)
           VALUES ($1, 'Five Star Writer', 'Achieved mastery on 5 sentences!')
           ON CONFLICT (pupil_id, badge_name) DO NOTHING`,
          [pupilId]
        );
        newBadges.push({ badgeName: 'Five Star Writer', badgeDescription: 'Achieved mastery on 5 sentences!' });
      }
    }

    if (session.story_part === 'beginning' && !existingBadges.has('Story Starter')) {
      const storyStarterResult = await pool.query(
        `SELECT COUNT(*) as count FROM writing_coach_sessions
         WHERE pupil_id = $1 AND status = 'submitted' AND story_part = 'beginning'`,
        [pupilId]
      );
      if (parseInt(storyStarterResult.rows[0].count, 10) >= 1) {
        await pool.query(
          `INSERT INTO pupil_badges (pupil_id, badge_name, badge_description)
           VALUES ($1, 'Story Starter', 'Wrote your first story beginning!')
           ON CONFLICT (pupil_id, badge_name) DO NOTHING`,
          [pupilId]
        );
        newBadges.push({ badgeName: 'Story Starter', badgeDescription: 'Wrote your first story beginning!' });
      }
    }

    if (!existingBadges.has('Streak Master 7')) {
      const currentStreakResult = await pool.query(
        `SELECT current_streak FROM pupil_streaks WHERE pupil_id = $1`,
        [pupilId]
      );
      if (currentStreakResult.rows.length > 0 && currentStreakResult.rows[0].current_streak >= 7) {
        await pool.query(
          `INSERT INTO pupil_badges (pupil_id, badge_name, badge_description)
           VALUES ($1, 'Streak Master 7', 'Practised writing for 7 days in a row!')
           ON CONFLICT (pupil_id, badge_name) DO NOTHING`,
          [pupilId]
        );
        newBadges.push({ badgeName: 'Streak Master 7', badgeDescription: 'Practised writing for 7 days in a row!' });
      }
    }

    if (!existingBadges.has('Word Explorer')) {
      const uniqueSubjectsResult = await pool.query(
        `SELECT COUNT(DISTINCT subject_chosen) as count
         FROM writing_coach_sessions
         WHERE pupil_id = $1 AND status = 'submitted' AND subject_chosen IS NOT NULL`,
        [pupilId]
      );
      if (parseInt(uniqueSubjectsResult.rows[0].count, 10) >= 10) {
        await pool.query(
          `INSERT INTO pupil_badges (pupil_id, badge_name, badge_description)
           VALUES ($1, 'Word Explorer', 'Used 10 or more unique subjects in your writing!')
           ON CONFLICT (pupil_id, badge_name) DO NOTHING`,
          [pupilId]
        );
        newBadges.push({ badgeName: 'Word Explorer', badgeDescription: 'Used 10 or more unique subjects in your writing!' });
      }
    }

    return NextResponse.json({
      success: true,
      sessionId,
      newBadges,
    });
  } catch (error) {
    console.error('Writing coach submit error:', error);
    return NextResponse.json(
      { error: 'Failed to submit sentence' },
      { status: 500 }
    );
  }
}
