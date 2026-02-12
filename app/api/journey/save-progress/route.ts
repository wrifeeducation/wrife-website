import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      pupilId,
      lessonNumber,
      activityNumber,
      activityType,
      wLevel,
      score,
      totalPossible,
      timeSpentSeconds,
      responses,
    } = body;

    if (!pupilId || !lessonNumber || !activityNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const pool = getPool();
    const percentage = totalPossible > 0 ? Math.round((score / totalPossible) * 100) : 0;
    const masteryAchieved = percentage >= 80;

    await pool.query(
      `INSERT INTO activity_progress
       (pupil_id, lesson_number, activity_number, activity_type, w_level, score, total_possible, percentage, mastery_achieved, time_spent_seconds, responses)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        pupilId,
        lessonNumber,
        activityNumber,
        activityType || 'unknown',
        wLevel || 'W1',
        score,
        totalPossible,
        percentage,
        masteryAchieved,
        timeSpentSeconds || 0,
        JSON.stringify(responses || {}),
      ]
    );

    // Check if all activities for this lesson are complete with mastery
    const completionResult = await pool.query(
      `SELECT COUNT(*) as total,
              COUNT(CASE WHEN mastery_achieved = true THEN 1 END) as mastered
       FROM activity_progress
       WHERE pupil_id = $1 AND lesson_number = $2
       AND completed_at >= CURRENT_DATE`,
      [pupilId, lessonNumber]
    );

    const total = parseInt(completionResult.rows[0]?.total || '0');
    const mastered = parseInt(completionResult.rows[0]?.mastered || '0');

    // If enough activities mastered, consider advancing lesson
    let advancedLesson = false;
    if (total >= 5 && mastered >= 4) {
      await pool.query(
        `UPDATE pupil_profiles
         SET current_lesson = GREATEST(current_lesson, $1 + 1), updated_at = NOW()
         WHERE pupil_id = $2 AND current_lesson <= $1`,
        [lessonNumber, pupilId]
      );
      advancedLesson = true;

      // Award streak badge if applicable
      const streakResult = await pool.query(
        'SELECT daily_login_streak FROM pupil_profiles WHERE pupil_id = $1',
        [pupilId]
      );
      const streak = streakResult.rows[0]?.daily_login_streak || 0;
      if (streak >= 5) {
        await pool.query(
          `UPDATE pupil_profiles
           SET badges_earned = badges_earned || $1::jsonb
           WHERE pupil_id = $2
           AND NOT badges_earned @> $1::jsonb`,
          [JSON.stringify(['streak_5']), pupilId]
        );
      }
    }

    return NextResponse.json({
      saved: true,
      percentage,
      masteryAchieved,
      advancedLesson,
      totalComplete: total,
      totalMastered: mastered,
    });
  } catch (error) {
    console.error('Save progress error:', error);
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
  }
}
