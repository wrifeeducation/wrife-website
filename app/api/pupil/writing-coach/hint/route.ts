import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { generateCompletion, parseJSONResponse } from '@/lib/llm-provider';
import { validatePupilSession } from '@/lib/pupil-auth';

const VALID_HINT_TYPES = ['formula', 'grammar', 'vocabulary'] as const;
type HintType = typeof VALID_HINT_TYPES[number];

export async function POST(request: NextRequest) {
  try {
    const { pupilId, formulaUsed, sentenceText, hintType } = await request.json();

    if (!pupilId || !formulaUsed || !hintType) {
      return NextResponse.json(
        { error: 'Missing required fields: pupilId, formulaUsed, hintType' },
        { status: 400 }
      );
    }

    if (!VALID_HINT_TYPES.includes(hintType as HintType)) {
      return NextResponse.json(
        { error: 'Invalid hintType. Must be: formula, grammar, or vocabulary' },
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

    const hintPrompts: Record<HintType, string> = {
      formula: `You are a friendly writing coach for a Year ${pupil.year_group} pupil (age ${Number(pupil.year_group || 2) + 5}).

The pupil is trying to write a sentence using this formula: "${formulaUsed}"
${sentenceText ? `Their current attempt: "${sentenceText}"` : 'They haven\'t started writing yet.'}

Generate ONE short guiding question (not an answer!) that helps them understand the formula pattern. Ask about what type of word should come next or what part of the formula they should focus on.

Examples of good hints:
- "What word class should come after 'The'?"
- "Can you think of a describing word for your subject?"
- "What action word could your character do?"

Do NOT give the answer directly. Ask a question that guides them.

Return JSON: {"hint": "<your guiding question>"}`,

      grammar: `You are a friendly writing coach for a Year ${pupil.year_group} pupil (age ${Number(pupil.year_group || 2) + 5}).

The pupil wrote: "${sentenceText || ''}"
Using formula: "${formulaUsed}"

Generate ONE short guiding question about grammar that helps them spot and fix any grammar issues themselves. Focus on things like capital letters, full stops, subject-verb agreement, or tense consistency.

Examples of good hints:
- "How should every sentence begin?"
- "What do we put at the end of a sentence?"
- "Does your verb match your subject? Try reading it aloud."

Do NOT correct the error directly. Ask a question that helps them find it.

Return JSON: {"hint": "<your guiding question>"}`,

      vocabulary: `You are a friendly writing coach for a Year ${pupil.year_group} pupil (age ${Number(pupil.year_group || 2) + 5}).

The pupil wrote: "${sentenceText || ''}"
Using formula: "${formulaUsed}"

Generate ONE short guiding question about vocabulary that encourages them to choose more interesting or precise words. Help them think about synonyms, descriptive language, or more specific word choices.

Examples of good hints:
- "Can you think of a more exciting word than 'nice'?"
- "What colour, size, or shape is your subject?"
- "Is there a stronger action word you could use instead?"

Do NOT suggest specific words. Ask a question that sparks their creativity.

Return JSON: {"hint": "<your guiding question>"}`,
    };

    const llmResponse = await generateCompletion({
      messages: [
        { role: 'user', content: hintPrompts[hintType as HintType] },
      ],
      temperature: 0.7,
      maxTokens: 200,
      jsonMode: true,
    });

    const parsed = parseJSONResponse<{ hint: string }>(llmResponse.content, {
      hint: 'Can you read your sentence aloud and check if it sounds right?',
    });

    if (sentenceText) {
      await pool.query(
        `UPDATE writing_coach_sessions
         SET hint_count = hint_count + 1, updated_at = NOW()
         WHERE pupil_id = $1 AND status = 'checked'
         AND id = (SELECT id FROM writing_coach_sessions WHERE pupil_id = $1 AND status = 'checked' ORDER BY created_at DESC LIMIT 1)`,
        [pupilId]
      );
    }

    return NextResponse.json({
      success: true,
      hint: parsed.hint,
      hintType,
    });
  } catch (error) {
    console.error('Writing coach hint error:', error);
    return NextResponse.json(
      { error: 'Failed to generate hint' },
      { status: 500 }
    );
  }
}
