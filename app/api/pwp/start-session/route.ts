import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

declare global {
  var pgPool: Pool | undefined;
}

function getPool(): Pool {
  if (!globalThis.pgPool) {
    globalThis.pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
    });
  }
  return globalThis.pgPool;
}

interface Formula {
  formula_number: number;
  formula_structure: string;
  labelled_example: string;
  word_bank: string[];
  new_elements: string[];
  hint_text?: string;
}

const FORMULA_TEMPLATES: Record<string, (subject: string) => Formula> = {
  noun_verb: (subject) => ({
    formula_number: 1,
    formula_structure: 'N + V',
    labelled_example: `The [N]${subject}[/N] [V]runs[/V].`,
    word_bank: ['runs', 'jumps', 'sleeps', 'eats', 'plays', 'swims', 'flies', 'walks'],
    new_elements: ['noun', 'verb'],
    hint_text: 'Start with your subject, then add what it does.'
  }),
  det_noun_verb: (subject) => ({
    formula_number: 2,
    formula_structure: 'Det + N + V',
    labelled_example: `[Det]The[/Det] [N]${subject}[/N] [V]runs[/V].`,
    word_bank: ['The', 'A', 'An', 'runs', 'jumps', 'sleeps', 'eats', 'plays'],
    new_elements: ['determiner'],
    hint_text: 'Add a word like "The" or "A" before your subject.'
  }),
  det_adj_noun_verb: (subject) => ({
    formula_number: 3,
    formula_structure: 'Det + Adj + N + V',
    labelled_example: `[Det]The[/Det] [Adj]happy[/Adj] [N]${subject}[/N] [V]runs[/V].`,
    word_bank: ['The', 'A', 'happy', 'big', 'small', 'fast', 'slow', 'brave', 'runs', 'jumps', 'plays'],
    new_elements: ['adjective'],
    hint_text: 'Describe your subject with a word like "happy" or "big".'
  }),
  det_adj_noun_verb_adv: (subject) => ({
    formula_number: 4,
    formula_structure: 'Det + Adj + N + V + Adv',
    labelled_example: `[Det]The[/Det] [Adj]happy[/Adj] [N]${subject}[/N] [V]runs[/V] [Adv]quickly[/Adv].`,
    word_bank: ['The', 'A', 'happy', 'big', 'fast', 'runs', 'jumps', 'quickly', 'slowly', 'happily', 'always', 'never'],
    new_elements: ['adverb'],
    hint_text: 'Add a word that tells us how the action is done.'
  }),
  det_noun_verb_det_noun: (subject) => ({
    formula_number: 5,
    formula_structure: 'Det + N + V + Det + N',
    labelled_example: `[Det]The[/Det] [N]${subject}[/N] [V]chases[/V] [Det]the[/Det] [N]ball[/N].`,
    word_bank: ['The', 'A', 'chases', 'finds', 'sees', 'likes', 'ball', 'toy', 'bone', 'leaf'],
    new_elements: ['object'],
    hint_text: 'Add what your subject acts upon.'
  }),
  full_sentence: (subject) => ({
    formula_number: 6,
    formula_structure: 'Det + Adj + N + V + Adv + Det + Adj + N',
    labelled_example: `[Det]The[/Det] [Adj]playful[/Adj] [N]${subject}[/N] [V]catches[/V] [Adv]quickly[/Adv] [Det]a[/Det] [Adj]red[/Adj] [N]ball[/N].`,
    word_bank: ['The', 'A', 'playful', 'happy', 'big', 'catches', 'finds', 'quickly', 'happily', 'red', 'small', 'ball', 'toy'],
    new_elements: ['full_sentence'],
    hint_text: 'Build a complete sentence with all the elements you have learned.'
  })
};

const STAGE_FORMULAS: Record<string, string[]> = {
  foundation: ['noun_verb', 'det_noun_verb', 'det_adj_noun_verb', 'det_adj_noun_verb_adv'],
  development: ['det_noun_verb', 'det_adj_noun_verb', 'det_adj_noun_verb_adv', 'det_noun_verb_det_noun'],
  application: ['det_adj_noun_verb', 'det_adj_noun_verb_adv', 'det_noun_verb_det_noun', 'full_sentence'],
  advanced: ['det_adj_noun_verb_adv', 'det_noun_verb_det_noun', 'full_sentence']
};

export async function POST(request: NextRequest) {
  try {
    const { lesson_number, subject_text } = await request.json();

    if (!lesson_number || !subject_text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const pool = getPool();
    const result = await pool.query(
      'SELECT * FROM curriculum_map WHERE lesson_number = $1',
      [lesson_number]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const curriculum = result.rows[0];
    const stage = curriculum.pwp_stage || 'foundation';
    const minFormulas = curriculum.pwp_formula_count_min || 2;
    const maxFormulas = curriculum.pwp_formula_count_max || 4;

    const availableFormulas = STAGE_FORMULAS[stage] || STAGE_FORMULAS.foundation;
    const numFormulas = Math.min(
      Math.floor(Math.random() * (maxFormulas - minFormulas + 1)) + minFormulas,
      availableFormulas.length
    );

    const selectedFormulas: Formula[] = [];
    const usedIndices = new Set<number>();

    for (let i = 0; i < numFormulas; i++) {
      let index: number;
      do {
        index = Math.floor(Math.random() * availableFormulas.length);
      } while (usedIndices.has(index) && usedIndices.size < availableFormulas.length);
      usedIndices.add(index);

      const templateKey = availableFormulas[index];
      const formula = FORMULA_TEMPLATES[templateKey](subject_text);
      formula.formula_number = i + 1;
      selectedFormulas.push(formula);
    }

    const sessionId = `pwp_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    return NextResponse.json({
      session_id: sessionId,
      formulas: selectedFormulas,
      lesson_number,
      subject: subject_text,
      stage
    });

  } catch (error) {
    console.error('Start session error:', error);
    return NextResponse.json({ error: 'Failed to start session' }, { status: 500 });
  }
}
