import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { pupilId } = await request.json();

    if (!pupilId) {
      return NextResponse.json({ error: 'Pupil ID required' }, { status: 400 });
    }

    const pool = getPool();

    const result = await pool.query(
      `SELECT id, lesson_number, date_written, formula_used, subject_chosen,
              sentence_text, story_part, ai_analysis_score, formula_correct,
              is_favorite, teacher_feedback
       FROM pwp_sentences
       WHERE pupil_id = $1
       ORDER BY date_written ASC`,
      [pupilId]
    );

    const sentences = result.rows.map(row => ({
      id: row.id,
      lessonNumber: row.lesson_number,
      dateWritten: row.date_written,
      formulaUsed: row.formula_used,
      subjectChosen: row.subject_chosen,
      sentenceText: row.sentence_text,
      storyPart: row.story_part,
      aiAnalysisScore: row.ai_analysis_score || 0,
      formulaCorrect: row.formula_correct || false,
      isFavorite: row.is_favorite || false,
      teacherFeedback: row.teacher_feedback,
    }));

    return NextResponse.json({ sentences });
  } catch (error) {
    console.error('Story history error:', error);
    return NextResponse.json({ error: 'Failed to fetch story history' }, { status: 500 });
  }
}
