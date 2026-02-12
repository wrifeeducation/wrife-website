import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      pupilId,
      lessonNumber,
      partAResponses,
      partAScore,
      partBResponses,
      partCResponse,
      partDResponse,
      yearGroup,
    } = body;

    if (!pupilId) {
      return NextResponse.json({ error: 'Pupil ID required' }, { status: 400 });
    }

    // Part A is auto-scored (already provided)
    const finalPartAScore = partAScore || 0;

    // Score Parts B, C, D with AI
    let partBScore = 0;
    let partCScore = 0;
    let partDScore = 0;

    try {
      const prompt = `You are scoring a Year ${yearGroup || 4} pupil's writing assessment.

Part B - Sentence Analysis (10 points total, 2 per sentence):
The pupil was asked to identify the formula/word classes for these sentences.
Their answers: ${JSON.stringify(partBResponses || [])}
Score each 0-2: 2 = formula perfect and grammar perfect, 1 = mostly right, 0 = neither correct.

Part C - Creation (5 points):
The pupil wrote this original sentence: "${partCResponse || ''}"
Score on: Formula correct (2 points), Grammar accurate (1 point), Personal/creative (1 point), Complete sentence (1 point).

Part D - Explanation (5 points):
The pupil explained word classes: "${partDResponse || ''}"
Score on: Understands concept (2 points), Can teach it (2 points), Clear communication (1 point).

Return ONLY JSON:
{
  "partBScore": <0-10>,
  "partCScore": <0-5>,
  "partDScore": <0-5>,
  "partBFeedback": "<brief feedback>",
  "partCFeedback": "<brief feedback>",
  "partDFeedback": "<brief feedback>"
}`;

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const scores = JSON.parse(jsonMatch[0]);
        partBScore = Math.min(scores.partBScore || 0, 10);
        partCScore = Math.min(scores.partCScore || 0, 5);
        partDScore = Math.min(scores.partDScore || 0, 5);
      }
    } catch (aiError) {
      console.error('AI scoring error:', aiError);
      // Fallback scoring
      partBScore = (partBResponses || []).filter((r: string) => r.trim().length > 10).length * 2;
      partCScore = partCResponse && partCResponse.trim().length > 5 ? 3 : 0;
      partDScore = partDResponse && partDResponse.trim().length > 10 ? 3 : 0;
    }

    const totalScore = finalPartAScore + partBScore + partCScore + partDScore;
    const percentage = Math.round((totalScore / 30) * 100);

    // Determine mastery status
    const partsMastered = [
      finalPartAScore >= 8,
      partBScore >= 8,
      partCScore >= 4,
      partDScore >= 4,
    ].filter(Boolean).length;

    let masteryStatus = 'needs_intervention';
    if (partsMastered >= 3) masteryStatus = 'mastered';
    else if (partsMastered >= 2) masteryStatus = 'nearly_there';

    // Save to database
    const pool = getPool();

    await pool.query(
      `INSERT INTO formal_assessments
       (pupil_id, lesson_number, part_a_score, part_b_score, part_c_score, part_d_score,
        total_score, percentage, mastery_status, part_a_responses, part_b_responses,
        part_c_response, part_d_response)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        pupilId, lessonNumber || 1,
        finalPartAScore, partBScore, partCScore, partDScore,
        totalScore, percentage, masteryStatus,
        JSON.stringify(partAResponses || []),
        JSON.stringify(partBResponses || []),
        partCResponse || '',
        partDResponse || '',
      ]
    );

    // If mastered, advance the lesson
    if (masteryStatus === 'mastered') {
      await pool.query(
        `UPDATE pupil_profiles
         SET current_lesson = GREATEST(current_lesson, $1 + 1), updated_at = NOW()
         WHERE pupil_id = $2 AND current_lesson <= $1`,
        [lessonNumber || 1, pupilId]
      );
    }

    return NextResponse.json({
      results: {
        partA: finalPartAScore,
        partB: partBScore,
        partC: partCScore,
        partD: partDScore,
        total: totalScore,
        percentage,
        masteryStatus,
      },
    });
  } catch (error) {
    console.error('Submit assessment error:', error);
    return NextResponse.json({ error: 'Failed to submit assessment' }, { status: 500 });
  }
}
