import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { pupilId } = await request.json();

    if (!pupilId) {
      return NextResponse.json({ error: 'Pupil ID required' }, { status: 400 });
    }

    const pool = getPool();

    // Get pupil info with profile
    const pupilResult = await pool.query(
      `SELECT p.id, p.first_name, p.last_name, p.year_group, p.class_id,
              c.name as class_name,
              pp.current_lesson, pp.adaptation_level, pp.daily_login_streak,
              pp.total_words_written, pp.story_type
       FROM pupils p
       LEFT JOIN classes c ON p.class_id = c.id
       LEFT JOIN pupil_profiles pp ON p.id = pp.pupil_id
       WHERE p.id = $1`,
      [pupilId]
    );

    if (pupilResult.rows.length === 0) {
      return NextResponse.json({ error: 'Pupil not found' }, { status: 404 });
    }

    const row = pupilResult.rows[0];
    const pupil = {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name || '',
      yearGroup: row.year_group,
      className: row.class_name || 'Unknown',
      currentLesson: row.current_lesson || 1,
      adaptationLevel: row.adaptation_level || 'core',
      dailyLoginStreak: row.daily_login_streak || 0,
      totalWordsWritten: row.total_words_written || 0,
      storyType: row.story_type || 'happy',
    };

    // Activity summary by W-level
    const activityResult = await pool.query(
      `SELECT w_level,
              COUNT(*) as total_attempts,
              ROUND(AVG(percentage)) as avg_percentage,
              COUNT(CASE WHEN mastery_achieved = true THEN 1 END) as mastery_count
       FROM activity_progress
       WHERE pupil_id = $1
       GROUP BY w_level
       ORDER BY w_level`,
      [pupilId]
    );

    const activitySummary = activityResult.rows.map(r => ({
      wLevel: r.w_level,
      totalAttempts: parseInt(r.total_attempts),
      avgPercentage: parseInt(r.avg_percentage || '0'),
      masteryCount: parseInt(r.mastery_count || '0'),
    }));

    // PWP Sentences
    const sentencesResult = await pool.query(
      `SELECT id, lesson_number, date_written, sentence_text, story_part,
              ai_analysis_score, formula_correct
       FROM pwp_sentences
       WHERE pupil_id = $1
       ORDER BY date_written ASC`,
      [pupilId]
    );

    const sentences = sentencesResult.rows.map(r => ({
      id: r.id,
      lessonNumber: r.lesson_number,
      dateWritten: r.date_written,
      sentenceText: r.sentence_text,
      storyPart: r.story_part,
      aiAnalysisScore: r.ai_analysis_score || 0,
      formulaCorrect: r.formula_correct || false,
    }));

    // Formal assessments
    const assessmentResult = await pool.query(
      `SELECT id, lesson_number, assessment_date, total_score, percentage, mastery_status
       FROM formal_assessments
       WHERE pupil_id = $1
       ORDER BY assessment_date DESC`,
      [pupilId]
    );

    const assessments = assessmentResult.rows.map(r => ({
      id: r.id,
      lessonNumber: r.lesson_number,
      assessmentDate: r.assessment_date,
      totalScore: r.total_score || 0,
      percentage: r.percentage || 0,
      masteryStatus: r.mastery_status || 'needs_intervention',
    }));

    // Teacher notes
    const notesResult = await pool.query(
      `SELECT id, note_text, priority, created_at
       FROM teacher_notes
       WHERE pupil_id = $1
       ORDER BY created_at DESC`,
      [pupilId]
    );

    const notes = notesResult.rows.map(r => ({
      id: r.id,
      noteText: r.note_text,
      priority: r.priority,
      createdAt: r.created_at,
    }));

    return NextResponse.json({
      pupil,
      activitySummary,
      sentences,
      assessments,
      notes,
    });
  } catch (error) {
    console.error('Pupil detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch pupil detail' }, { status: 500 });
  }
}
