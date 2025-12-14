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
  labelled_parts: { text: string; label: string }[];
  new_element: string;
  new_element_examples: string[];
  hint_text: string;
  evolution_instruction: string;
}

interface FormulaDefinition {
  structure: string;
  example_parts: { text: string; label: string }[];
  new_element: string;
  new_element_examples: string[];
  hint_text: string;
  evolution_instruction: string;
}

const VERBS_FOR_PLACES = ['opens', 'sits', 'stands', 'welcomes', 'holds', 'contains', 'waits'];
const VERBS_FOR_PEOPLE = ['walks', 'runs', 'dances', 'sings', 'reads', 'writes', 'plays'];
const VERBS_FOR_ANIMALS = ['runs', 'jumps', 'sleeps', 'barks', 'flies', 'swims', 'plays'];
const VERBS_FOR_THINGS = ['sits', 'stands', 'waits', 'shines', 'moves', 'falls', 'floats'];

const ADVERBS = ['quietly', 'slowly', 'quickly', 'gently', 'happily', 'carefully', 'softly'];
const ADJECTIVES = ['old', 'quiet', 'busy', 'peaceful', 'small', 'large', 'bright', 'tired'];
const DETERMINERS = ['The', 'A', 'An', 'My', 'Our', 'This', 'That'];

const PREP_PHRASES_WHEN = ['in the morning', 'at nine o\'clock', 'on weekdays', 'every day', 'after lunch'];
const PREP_PHRASES_WHERE = ['in the town', 'near the park', 'by the river', 'on the hill', 'through the door'];

const TIME_PHRASES = ['Every morning,', 'Each day,', 'On weekdays,', 'In winter,', 'During summer,'];
const FRONTED_ADVERBIALS = ['Quietly,', 'Slowly,', 'Carefully,', 'Happily,', 'Gently,', 'Suddenly,'];

function getVerbsForSubject(subject: string): string[] {
  const places = ['library', 'school', 'park', 'museum', 'shop', 'beach', 'house', 'building', 'street', 'hospital', 'classroom', 'kitchen', 'bedroom', 'hall', 'office', 'forest', 'playground'];
  const animals = ['dog', 'cat', 'bird', 'fish', 'rabbit', 'horse', 'mouse', 'elephant', 'lion', 'tiger'];
  
  const lowerSubject = subject.toLowerCase();
  
  if (places.some(p => lowerSubject.includes(p))) {
    return VERBS_FOR_PLACES;
  }
  if (animals.some(a => lowerSubject.includes(a))) {
    return VERBS_FOR_ANIMALS;
  }
  if (/^[A-Z]/.test(subject) && !places.some(p => lowerSubject.includes(p))) {
    return VERBS_FOR_PEOPLE;
  }
  return VERBS_FOR_THINGS;
}

function generateProgressiveFormulas(
  subject: string,
  stage: string,
  minFormulas: number,
  maxFormulas: number
): Formula[] {
  const formulas: Formula[] = [];
  const verbs = getVerbsForSubject(subject);
  
  const exampleSubject = subject.toLowerCase().includes('library') ? 'Park' : 
                         subject.toLowerCase().includes('park') ? 'School' : 'Park';
  
  let formulaCount: number;
  switch (stage) {
    case 'foundation':
      formulaCount = Math.min(Math.max(minFormulas, 3), Math.min(maxFormulas, 4));
      break;
    case 'development':
      formulaCount = Math.min(Math.max(minFormulas, 5), Math.min(maxFormulas, 7));
      break;
    case 'application':
      formulaCount = Math.min(Math.max(minFormulas, 8), Math.min(maxFormulas, 10));
      break;
    case 'advanced':
      formulaCount = Math.min(Math.max(minFormulas, 10), Math.min(maxFormulas, 12));
      break;
    default:
      formulaCount = Math.min(Math.max(minFormulas, 3), Math.min(maxFormulas, 4));
  }

  const allFormulaDefs: FormulaDefinition[] = [
    {
      structure: 'subject + verb',
      example_parts: [
        { text: exampleSubject, label: 'subject' },
        { text: 'sits', label: 'verb' }
      ],
      new_element: 'verb',
      new_element_examples: verbs,
      hint_text: `Think: What does a ${subject.toLowerCase()} DO?`,
      evolution_instruction: 'Write your complete sentence using your subject and a verb.'
    },
    {
      structure: 'subject + adverb + verb',
      example_parts: [
        { text: exampleSubject, label: 'subject' },
        { text: 'quietly', label: 'adverb' },
        { text: 'sits', label: 'verb' }
      ],
      new_element: 'adverb',
      new_element_examples: ADVERBS,
      hint_text: 'Adverbs describe HOW the action happens.',
      evolution_instruction: 'REWRITE your Formula 1 sentence, adding an ADVERB between subject and verb.'
    },
    {
      structure: 'subject + adverb + verb + prepositional phrase',
      example_parts: [
        { text: exampleSubject, label: 'subject' },
        { text: 'quietly', label: 'adverb' },
        { text: 'sits', label: 'verb' },
        { text: 'in the town centre', label: 'prepositional phrase' }
      ],
      new_element: 'prepositional phrase',
      new_element_examples: [...PREP_PHRASES_WHEN, ...PREP_PHRASES_WHERE],
      hint_text: 'Prepositional phrases tell WHERE or WHEN.',
      evolution_instruction: 'REWRITE your Formula 2 sentence, adding a PREPOSITIONAL PHRASE at the end.'
    },
    {
      structure: 'determiner + adjective + subject + adverb + verb + prepositional phrase',
      example_parts: [
        { text: 'The', label: 'determiner' },
        { text: 'peaceful', label: 'adjective' },
        { text: exampleSubject.toLowerCase(), label: 'subject' },
        { text: 'quietly', label: 'adverb' },
        { text: 'sits', label: 'verb' },
        { text: 'in the town centre', label: 'prepositional phrase' }
      ],
      new_element: 'determiner + adjective',
      new_element_examples: DETERMINERS.flatMap(d => ADJECTIVES.map(a => `${d} ${a}`)),
      hint_text: 'Determiners: the, a, my, our. Adjectives: old, quiet, busy.',
      evolution_instruction: 'REWRITE your Formula 3 sentence, adding a DETERMINER and ADJECTIVE before your subject.'
    },
    {
      structure: 'determiner + adjective + subject + adverb + verb + preposition + determiner + adjective + object',
      example_parts: [
        { text: 'The', label: 'determiner' },
        { text: 'peaceful', label: 'adjective' },
        { text: exampleSubject.toLowerCase(), label: 'subject' },
        { text: 'quietly', label: 'adverb' },
        { text: 'sits', label: 'verb' },
        { text: 'in', label: 'preposition' },
        { text: 'the', label: 'determiner' },
        { text: 'busy', label: 'adjective' },
        { text: 'town centre', label: 'object' }
      ],
      new_element: 'adjective before object',
      new_element_examples: ADJECTIVES,
      hint_text: 'What KIND of place/thing? cold, bright, early, quiet.',
      evolution_instruction: 'REWRITE your Formula 4 sentence, making the prepositional phrase more descriptive with an ADJECTIVE.'
    },
    {
      structure: 'time phrase + determiner + adjective + subject + adverb + verb + prepositional phrase',
      example_parts: [
        { text: 'Every morning,', label: 'time phrase' },
        { text: 'the', label: 'determiner' },
        { text: 'peaceful', label: 'adjective' },
        { text: exampleSubject.toLowerCase(), label: 'subject' },
        { text: 'quietly', label: 'adverb' },
        { text: 'sits', label: 'verb' },
        { text: 'in the busy town centre', label: 'prepositional phrase' }
      ],
      new_element: 'time phrase',
      new_element_examples: TIME_PHRASES,
      hint_text: 'Time phrases: Every morning, Each day, On weekdays.',
      evolution_instruction: 'REWRITE your Formula 5 sentence, adding a TIME PHRASE at the start (followed by a comma).'
    },
    {
      structure: 'fronted adverbial + determiner + adjective + subject + adverb + verb + prepositional phrase',
      example_parts: [
        { text: 'Quietly,', label: 'fronted adverbial' },
        { text: 'the', label: 'determiner' },
        { text: 'peaceful', label: 'adjective' },
        { text: exampleSubject.toLowerCase(), label: 'subject' },
        { text: 'gently', label: 'adverb' },
        { text: 'welcomes', label: 'verb' },
        { text: 'visitors in the morning', label: 'prepositional phrase' }
      ],
      new_element: 'fronted adverbial',
      new_element_examples: FRONTED_ADVERBIALS,
      hint_text: 'Fronted adverbials: Quietly, Slowly, Carefully (with comma).',
      evolution_instruction: 'REWRITE with a FRONTED ADVERBIAL at the start to set the scene.'
    }
  ];

  for (let i = 0; i < formulaCount && i < allFormulaDefs.length; i++) {
    const def = allFormulaDefs[i];
    const labelledExample = def.example_parts.map(p => p.text).join(' ');
    
    const formula: Formula = {
      formula_number: i + 1,
      formula_structure: def.structure,
      labelled_example: labelledExample,
      labelled_parts: def.example_parts,
      new_element: def.new_element,
      new_element_examples: def.new_element_examples.slice(0, 6),
      hint_text: def.hint_text,
      evolution_instruction: def.evolution_instruction
    };
    
    formulas.push(formula);
  }

  return formulas;
}

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

    const formulas = generateProgressiveFormulas(
      subject_text,
      stage,
      minFormulas,
      maxFormulas
    );

    const sessionId = `pwp_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    return NextResponse.json({
      session_id: sessionId,
      formulas,
      lesson_number,
      subject: subject_text,
      stage,
      total_formulas: formulas.length,
      instructions: {
        rewrite_rule: 'You must REWRITE the entire sentence each time, adding the new element.',
        word_bank_usage: 'After each formula, you will receive words_saved. Use these for the next formula by clicking them, then type new words.',
        progression: 'Each formula builds on the previous one by adding ONE new element.',
        word_bank_note: 'The word_bank for each formula is built from YOUR previous submissions. After submitting Formula 1, those words become your word_bank for Formula 2.'
      }
    });

  } catch (error) {
    console.error('Start session error:', error);
    return NextResponse.json({ error: 'Failed to start session' }, { status: 500 });
  }
}
