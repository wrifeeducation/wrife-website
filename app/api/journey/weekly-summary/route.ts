import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { pupilId } = await request.json();

    if (!pupilId) {
      return NextResponse.json({ error: 'Pupil ID required' }, { status: 400 });
    }

    const pool = getPool();

    // Get pupil info
    const pupilResult = await pool.query(
      `SELECT p.first_name, p.year_group, pp.current_lesson
       FROM pupils p
       LEFT JOIN pupil_profiles pp ON p.id = pp.pupil_id
       WHERE p.id = $1`,
      [pupilId]
    );

    if (pupilResult.rows.length === 0) {
      return NextResponse.json({ error: 'Pupil not found' }, { status: 404 });
    }

    const pupil = pupilResult.rows[0];

    // Get last week's sentences
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const sentencesResult = await pool.query(
      `SELECT sentence_text, formula_used, subject_chosen, story_part,
              ai_analysis_score, formula_correct
       FROM pwp_sentences
       WHERE pupil_id = $1 AND date_written >= $2
       ORDER BY date_written ASC`,
      [pupilId, weekStart.toISOString()]
    );

    const sentences = sentencesResult.rows;

    // Get last week's activity progress
    const activitiesResult = await pool.query(
      `SELECT COUNT(*) as total, ROUND(AVG(percentage)) as avg_score
       FROM activity_progress
       WHERE pupil_id = $1 AND completed_at >= $2`,
      [pupilId, weekStart.toISOString()]
    );

    const activitiesCompleted = parseInt(activitiesResult.rows[0]?.total || '0');
    const avgScore = parseInt(activitiesResult.rows[0]?.avg_score || '0');

    // Calculate weekly PWP scores
    let formulaConsistencyScore = 0;
    let subjectVariationScore = 0;
    let storyDevelopmentScore = 0;
    let independenceScore = 25; // Default

    if (sentences.length > 0) {
      // Formula consistency: 5 points per correct formula (max 25)
      const correctFormulas = sentences.filter((s: any) => s.formula_correct).length;
      formulaConsistencyScore = Math.min(correctFormulas * 5, 25);

      // Subject variation: unique subjects
      const uniqueSubjects = new Set(sentences.map((s: any) => s.subject_chosen)).size;
      const repeats = sentences.length - uniqueSubjects;
      subjectVariationScore = Math.max(25 - (Math.max(repeats - 1, 0) * 5), 0);

      // Story development: balance of parts
      const parts = { beginning: 0, middle: 0, end: 0 };
      sentences.forEach((s: any) => {
        if (s.story_part in parts) parts[s.story_part as keyof typeof parts]++;
      });
      const hasBeginning = parts.beginning > 0;
      const hasMiddle = parts.middle > 0;
      const hasEnd = parts.end > 0;
      storyDevelopmentScore = (hasBeginning ? 8 : 0) + (hasMiddle ? 9 : 0) + (hasEnd ? 8 : 0);

      // Independence: based on average AI score
      const avgAiScore = sentences.reduce((sum: number, s: any) => sum + (s.ai_analysis_score || 0), 0) / sentences.length;
      independenceScore = Math.min(Math.round(avgAiScore / 4), 25);
    }

    const totalScore = formulaConsistencyScore + subjectVariationScore + storyDevelopmentScore + independenceScore;

    // Generate AI summary
    let aiSummaryPupil = '';
    let aiSummaryTeacher = '';

    try {
      const prompt = `Summarize this pupil's progress last week:

Pupil: ${pupil.first_name}, Year ${pupil.year_group}, Lesson ${pupil.current_lesson || 1}
Activities completed: ${activitiesCompleted}
Average activity score: ${avgScore}%
PWP sentences written: ${sentences.length}
Weekly PWP score: ${totalScore}/100
Formula consistency: ${formulaConsistencyScore}/25
Subject variation: ${subjectVariationScore}/25
Story development: ${storyDevelopmentScore}/25
Independence: ${independenceScore}/25

Generate two summaries:
1. A 3-sentence encouraging summary for the pupil (age ${(pupil.year_group || 4) + 4}, simple language)
2. A 2-sentence professional note for the teacher about any concerns or recommendations

Return JSON only: {"pupilSummary": "...", "teacherSummary": "..."}`;

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        aiSummaryPupil = parsed.pupilSummary || '';
        aiSummaryTeacher = parsed.teacherSummary || '';
      }
    } catch (aiError) {
      console.error('AI summary error:', aiError);
      aiSummaryPupil = `You wrote ${sentences.length} sentences this week and completed ${activitiesCompleted} activities. Keep up the great work!`;
      aiSummaryTeacher = `${pupil.first_name} completed ${activitiesCompleted} activities (avg ${avgScore}%) and wrote ${sentences.length} PWP sentences. Weekly score: ${totalScore}/100.`;
    }

    // Save weekly assessment
    const weekStartDate = weekStart.toISOString().split('T')[0];

    await pool.query(
      `INSERT INTO weekly_assessments
       (pupil_id, week_start_date, formula_consistency_score, subject_variation_score,
        story_development_score, independence_score, total_score, sentences_analyzed,
        ai_summary_pupil, ai_summary_teacher)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT DO NOTHING`,
      [
        pupilId, weekStartDate,
        formulaConsistencyScore, subjectVariationScore,
        storyDevelopmentScore, independenceScore,
        totalScore, sentences.length,
        aiSummaryPupil, aiSummaryTeacher,
      ]
    );

    return NextResponse.json({
      weeklyScore: totalScore,
      breakdown: {
        formulaConsistency: formulaConsistencyScore,
        subjectVariation: subjectVariationScore,
        storyDevelopment: storyDevelopmentScore,
        independence: independenceScore,
      },
      activitiesCompleted,
      avgActivityScore: avgScore,
      sentencesWritten: sentences.length,
      aiSummaryPupil,
      aiSummaryTeacher,
      status: totalScore >= 80 ? 'excellent' : totalScore >= 60 ? 'on_track' : 'needs_support',
    });
  } catch (error) {
    console.error('Weekly summary error:', error);
    return NextResponse.json({ error: 'Failed to generate weekly summary' }, { status: 500 });
  }
}
