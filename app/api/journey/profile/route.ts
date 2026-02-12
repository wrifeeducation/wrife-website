import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { pupilId } = await request.json();

    if (!pupilId) {
      return NextResponse.json({ error: 'Pupil ID required' }, { status: 400 });
    }

    const pool = getPool();

    // Get or create pupil profile
    let profileResult = await pool.query(
      'SELECT * FROM pupil_profiles WHERE pupil_id = $1',
      [pupilId]
    );

    if (profileResult.rows.length === 0) {
      // Create profile
      await pool.query(
        `INSERT INTO pupil_profiles (pupil_id, current_lesson, adaptation_level, personal_word_bank, story_type, daily_login_streak, longest_streak, total_words_written, badges_earned)
         VALUES ($1, 1, 'core', $2, 'happy', 0, 0, 0, '[]')
         ON CONFLICT DO NOTHING`,
        [pupilId, JSON.stringify({ people: ['Mum', 'Dad', 'My friend'], places: ['school', 'the park', 'home'], things: ['dog', 'cat', 'ball'] })]
      );

      profileResult = await pool.query(
        'SELECT * FROM pupil_profiles WHERE pupil_id = $1',
        [pupilId]
      );
    }

    const profile = profileResult.rows[0];

    // Update login streak
    const today = new Date().toISOString().split('T')[0];
    const lastStreakDate = profile?.last_streak_date;

    if (lastStreakDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = 1;
      if (lastStreakDate === yesterdayStr) {
        newStreak = (profile?.daily_login_streak || 0) + 1;
      }

      const longestStreak = Math.max(newStreak, profile?.longest_streak || 0);

      await pool.query(
        `UPDATE pupil_profiles
         SET daily_login_streak = $1, longest_streak = $2, last_streak_date = $3, updated_at = NOW()
         WHERE pupil_id = $4`,
        [newStreak, longestStreak, today, pupilId]
      );

      if (profile) {
        profile.daily_login_streak = newStreak;
        profile.longest_streak = longestStreak;
      }
    }

    // Get story word count (from pwp_sentences)
    const wordCountResult = await pool.query(
      `SELECT COALESCE(SUM(array_length(regexp_split_to_array(sentence_text, '\\s+'), 1)), 0) as total_words
       FROM pwp_sentences WHERE pupil_id = $1`,
      [pupilId]
    );
    const storyWordCount = parseInt(wordCountResult.rows[0]?.total_words || '0');

    // Check if today's practice is complete
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const practiceResult = await pool.query(
      `SELECT COUNT(*) as count FROM activity_progress
       WHERE pupil_id = $1 AND completed_at >= $2`,
      [pupilId, todayStart.toISOString()]
    );
    const todayPracticeComplete = parseInt(practiceResult.rows[0]?.count || '0') >= 5;

    // Check if today's story sentence is written
    const storyResult = await pool.query(
      `SELECT COUNT(*) as count FROM pwp_sentences
       WHERE pupil_id = $1 AND date_written >= $2`,
      [pupilId, todayStart.toISOString()]
    );
    const todayStoryComplete = parseInt(storyResult.rows[0]?.count || '0') > 0;

    // Get recent activities
    const recentResult = await pool.query(
      `(SELECT 'practice' as type,
              CONCAT('Lesson ', lesson_number, ' - ', w_level) as label,
              percentage as score,
              to_char(completed_at, 'DD Mon') as date
       FROM activity_progress
       WHERE pupil_id = $1
       ORDER BY completed_at DESC
       LIMIT 3)
       UNION ALL
       (SELECT 'story' as type,
               CONCAT('Story - Lesson ', lesson_number) as label,
               COALESCE(ai_analysis_score, 0) as score,
               to_char(date_written, 'DD Mon') as date
        FROM pwp_sentences
        WHERE pupil_id = $1
        ORDER BY date_written DESC
        LIMIT 2)
       ORDER BY date DESC
       LIMIT 5`,
      [pupilId]
    );

    return NextResponse.json({
      profile: {
        currentLesson: profile?.current_lesson || 1,
        dailyLoginStreak: profile?.daily_login_streak || 0,
        longestStreak: profile?.longest_streak || 0,
        totalWordsWritten: storyWordCount,
        storyType: profile?.story_type || 'happy',
        adaptationLevel: profile?.adaptation_level || 'core',
        badgesEarned: profile?.badges_earned || [],
        personalWordBank: profile?.personal_word_bank || { people: [], places: [], things: [] },
      },
      storyWordCount,
      todayPracticeComplete,
      todayStoryComplete,
      recentActivities: recentResult.rows,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
