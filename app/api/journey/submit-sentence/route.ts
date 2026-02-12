import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      pupilId,
      lessonNumber,
      formulaUsed,
      subjectChosen,
      sentenceText,
      storyPart,
      wordClasses,
      aiAnalysisScore,
      formulaCorrect,
    } = body;

    if (!pupilId || !sentenceText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const pool = getPool();

    // Insert the sentence
    const result = await pool.query(
      `INSERT INTO pwp_sentences
       (pupil_id, lesson_number, formula_used, subject_chosen, sentence_text, story_part,
        word_classes, ai_analysis_score, formula_correct)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        pupilId,
        lessonNumber || 10,
        formulaUsed || 'Subject + Verb + Object',
        subjectChosen || 'unknown',
        sentenceText,
        storyPart || 'beginning',
        JSON.stringify(wordClasses || []),
        aiAnalysisScore || 0,
        formulaCorrect || false,
      ]
    );

    // Update total words written in profile
    const wordCount = sentenceText.split(/\s+/).length;
    await pool.query(
      `UPDATE pupil_profiles
       SET total_words_written = total_words_written + $1, updated_at = NOW()
       WHERE pupil_id = $2`,
      [wordCount, pupilId]
    );

    // Check for badges
    const totalResult = await pool.query(
      'SELECT COUNT(*) as total FROM pwp_sentences WHERE pupil_id = $1',
      [pupilId]
    );
    const totalSentences = parseInt(totalResult.rows[0]?.total || '0');

    const newBadges: string[] = [];
    if (totalSentences === 1) newBadges.push('first_sentence');
    if (totalSentences === 10) newBadges.push('ten_sentences');
    if (totalSentences === 25) newBadges.push('quarter_century');
    if (totalSentences === 50) newBadges.push('half_century');

    for (const badge of newBadges) {
      await pool.query(
        `UPDATE pupil_profiles
         SET badges_earned = badges_earned || $1::jsonb
         WHERE pupil_id = $2
         AND NOT badges_earned @> $1::jsonb`,
        [JSON.stringify([badge]), pupilId]
      );
    }

    return NextResponse.json({
      success: true,
      sentenceId: result.rows[0]?.id,
      totalSentences,
      newBadges,
    });
  } catch (error) {
    console.error('Submit sentence error:', error);
    return NextResponse.json({ error: 'Failed to submit sentence' }, { status: 500 });
  }
}
