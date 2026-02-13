import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { generateCompletion, parseJSONResponse } from '@/lib/llm-provider';
import { validatePupilSession } from '@/lib/pupil-auth';

interface WordClassItem {
  word: string;
  wordClass: string;
  correct: boolean;
}

interface CheckAnalysis {
  wordClassAnalysis: WordClassItem[];
  formulaAdherence: number;
  grammarAccuracy: number;
  meaningClarity: number;
  personalConnection: number;
  totalScore: number;
  percentage: number;
  mastery: boolean;
  feedback: string;
  suggestion: string;
}

export async function POST(request: NextRequest) {
  try {
    const { pupilId, lessonNumber, formulaUsed, subjectChosen, sentenceText, storyPart } = await request.json();

    if (!pupilId || !lessonNumber || !formulaUsed || !sentenceText) {
      return NextResponse.json(
        { error: 'Missing required fields: pupilId, lessonNumber, formulaUsed, sentenceText' },
        { status: 400 }
      );
    }

    const session = await validatePupilSession(pupilId);
    if (!session.valid) {
      return NextResponse.json(
        { error: 'Invalid or expired pupil session' },
        { status: 401 }
      );
    }

    const pupil = { first_name: session.firstName, year_group: session.yearGroup };
    const pool = getPool();

    const wordBankResult = await pool.query(
      `SELECT words FROM pupil_word_banks WHERE pupil_id = $1 AND lesson_number = $2`,
      [pupilId, lessonNumber]
    );

    const wordBank = wordBankResult.rows.length > 0 ? wordBankResult.rows[0].words : [];

    const recentSessionsResult = await pool.query(
      `SELECT sentence_text, formula_used, total_score, feedback
       FROM writing_coach_sessions
       WHERE pupil_id = $1
       ORDER BY created_at DESC
       LIMIT 5`,
      [pupilId]
    );

    const recentSessions = recentSessionsResult.rows;

    const recentContext = recentSessions.length > 0
      ? `\nRECENT WRITING HISTORY (for context on pupil's level):\n${recentSessions.map((s, i) => `${i + 1}. "${s.sentence_text}" (Formula: ${s.formula_used}, Score: ${s.total_score}/8)`).join('\n')}`
      : '';

    const wordBankContext = wordBank.length > 0
      ? `\nPUPIL'S WORD BANK: ${JSON.stringify(wordBank)}`
      : '';

    const systemPrompt = `You are WriFe's AI Writing Coach for primary school pupils (ages 6-10) in the UK. You analyse sentences for word class accuracy and formula adherence. Be encouraging, specific, and age-appropriate. Always return valid JSON.`;

    const userPrompt = `Analyse this pupil's sentence for their writing practice.

PUPIL INFO:
- Name: ${pupil.first_name}
- Year Group: ${pupil.year_group}
- Lesson Number: ${lessonNumber}

SENTENCE FORMULA: ${formulaUsed}
SUBJECT CHOSEN: ${subjectChosen || 'not specified'}
STORY PART: ${storyPart || 'not specified'}
${wordBankContext}
${recentContext}

PUPIL'S SENTENCE:
"${sentenceText}"

Analyse the sentence and return JSON with this exact structure:
{
  "wordClassAnalysis": [
    {"word": "The", "wordClass": "determiner", "correct": true},
    {"word": "cat", "wordClass": "noun", "correct": true}
  ],
  "formulaAdherence": <0-3 score: 0=no match, 1=partial, 2=mostly follows, 3=perfect match>,
  "grammarAccuracy": <0-2 score: 0=multiple errors, 1=minor errors, 2=correct>,
  "meaningClarity": <0-2 score: 0=unclear, 1=somewhat clear, 2=clear and vivid>,
  "personalConnection": <0-1 score: 0=generic, 1=shows personal choice/creativity>,
  "totalScore": <sum of above, 0-8>,
  "percentage": <totalScore/8 * 100, rounded>,
  "mastery": <true if percentage >= 75>,
  "feedback": "<2 encouraging sentences about what was done well, age-appropriate>",
  "suggestion": "<1 specific, actionable improvement tip>"
}

Word classes to use: noun, verb, adjective, adverb, determiner, preposition, conjunction, pronoun, interjection, punctuation.
Analyse EVERY word in the sentence individually.
Return ONLY valid JSON.`;

    const llmResponse = await generateCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      maxTokens: 1500,
      jsonMode: true,
    });

    const fallback: CheckAnalysis = {
      wordClassAnalysis: sentenceText.split(/\s+/).map((w: string) => ({
        word: w.replace(/[.,!?;:]/g, ''),
        wordClass: 'unknown',
        correct: false,
      })),
      formulaAdherence: 1,
      grammarAccuracy: 1,
      meaningClarity: 1,
      personalConnection: 0,
      totalScore: 3,
      percentage: 37.5,
      mastery: false,
      feedback: 'Good effort on your sentence! Keep practising and you will improve.',
      suggestion: 'Try to follow the sentence formula more closely.',
    };

    const analysis = parseJSONResponse<CheckAnalysis>(llmResponse.content, fallback);

    analysis.totalScore = (analysis.formulaAdherence || 0) +
      (analysis.grammarAccuracy || 0) +
      (analysis.meaningClarity || 0) +
      (analysis.personalConnection || 0);
    analysis.percentage = Math.round((analysis.totalScore / 8) * 100);
    analysis.mastery = analysis.percentage >= 75;

    const saveResult = await pool.query(
      `INSERT INTO writing_coach_sessions
        (pupil_id, lesson_number, formula_used, subject_chosen, sentence_text, story_part,
         word_class_analysis, formula_adherence, grammar_accuracy, meaning_clarity,
         personal_connection, total_score, percentage, mastery, feedback, suggestion,
         status, raw_llm_response)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'checked', $17)
       RETURNING id, created_at`,
      [
        pupilId,
        lessonNumber,
        formulaUsed,
        subjectChosen || null,
        sentenceText,
        storyPart || null,
        JSON.stringify(analysis.wordClassAnalysis),
        analysis.formulaAdherence,
        analysis.grammarAccuracy,
        analysis.meaningClarity,
        analysis.personalConnection,
        analysis.totalScore,
        analysis.percentage,
        analysis.mastery,
        analysis.feedback,
        analysis.suggestion,
        JSON.stringify({
          provider: llmResponse.provider,
          model: llmResponse.model,
          usage: llmResponse.usage,
        }),
      ]
    );

    const savedSession = saveResult.rows[0];

    return NextResponse.json({
      success: true,
      sessionId: savedSession.id,
      analysis: {
        wordClassAnalysis: analysis.wordClassAnalysis,
        formulaAdherence: analysis.formulaAdherence,
        grammarAccuracy: analysis.grammarAccuracy,
        meaningClarity: analysis.meaningClarity,
        personalConnection: analysis.personalConnection,
        totalScore: analysis.totalScore,
        percentage: analysis.percentage,
        mastery: analysis.mastery,
        feedback: analysis.feedback,
        suggestion: analysis.suggestion,
      },
    });
  } catch (error) {
    console.error('Writing coach check error:', error);
    return NextResponse.json(
      { error: 'Failed to analyse sentence' },
      { status: 500 }
    );
  }
}
