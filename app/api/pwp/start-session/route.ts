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
  concepts_used: string[];
  word_bank: string[];
}

interface ConceptMastery {
  concept: string;
  mastery_status: 'MASTERED' | 'PRACTICING' | 'NEW';
  score: number;
}

interface ConceptDefinition {
  concept: string;
  position: 'before_subject' | 'between_subject_verb' | 'after_verb' | 'sentence_start';
  requires?: string[];
  examples: string[];
  hint: string;
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

const CONCEPT_DEFINITIONS: Record<string, ConceptDefinition> = {
  'adverb': {
    concept: 'adverb',
    position: 'between_subject_verb',
    examples: ADVERBS,
    hint: 'Adverbs describe HOW the action happens.'
  },
  'prepositional_phrase': {
    concept: 'prepositional_phrase',
    position: 'after_verb',
    requires: ['adverb'],
    examples: [...PREP_PHRASES_WHEN, ...PREP_PHRASES_WHERE],
    hint: 'Prepositional phrases tell WHERE or WHEN.'
  },
  'determiner': {
    concept: 'determiner',
    position: 'before_subject',
    requires: ['prepositional_phrase'],
    examples: DETERMINERS,
    hint: 'Determiners: the, a, my, our.'
  },
  'adjective': {
    concept: 'adjective',
    position: 'before_subject',
    requires: ['determiner'],
    examples: ADJECTIVES,
    hint: 'Adjectives describe the noun.'
  },
  'time_phrase': {
    concept: 'time_phrase',
    position: 'sentence_start',
    requires: ['adjective', 'prepositional_phrase'],
    examples: TIME_PHRASES,
    hint: 'Time phrases: Every morning, Each day, On weekdays.'
  },
  'fronted_adverbial': {
    concept: 'fronted_adverbial',
    position: 'sentence_start',
    requires: ['time_phrase'],
    examples: FRONTED_ADVERBIALS,
    hint: 'Fronted adverbials: Quietly, Slowly, Carefully (with comma).'
  }
};

const PROGRESSION_ORDER = [
  'adverb',
  'prepositional_phrase',
  'determiner',
  'adjective',
  'time_phrase',
  'fronted_adverbial'
];

const CURRICULUM_TO_PWP_CONCEPTS: Record<string, string[]> = {
  'adverb': ['adverb'],
  'adjective': ['adjective'],
  'determiner': ['determiner'],
  'phrases': ['prepositional_phrase'],
  'phrase_types': ['prepositional_phrase'],
  'clauses': ['fronted_adverbial', 'time_phrase'],
  'clause_types': ['fronted_adverbial', 'time_phrase'],
  'sentence_structure': ['time_phrase', 'fronted_adverbial'],
  'fronted_adverbial': ['fronted_adverbial'],
  'prepositional_phrase': ['prepositional_phrase'],
  'time_phrase': ['time_phrase']
};

function mapCurriculumToPwpConcepts(curriculumConcepts: string[]): string[] {
  const pwpConcepts = new Set<string>();
  for (const c of curriculumConcepts) {
    const mapped = CURRICULUM_TO_PWP_CONCEPTS[c];
    if (mapped) {
      mapped.forEach(m => pwpConcepts.add(m));
    } else if (PROGRESSION_ORDER.includes(c)) {
      pwpConcepts.add(c);
    }
  }
  return Array.from(pwpConcepts);
}

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

async function getPupilMastery(pool: Pool, pupilId: string | null, concepts: string[]): Promise<ConceptMastery[]> {
  if (!pupilId) {
    return concepts.map(c => ({
      concept: c,
      mastery_status: 'NEW' as const,
      score: 50
    }));
  }

  try {
    const result = await pool.query(
      `SELECT concept, mastery_status, 
              COALESCE(correct_uses * 100.0 / NULLIF(total_uses, 0), 50) as score
       FROM concept_mastery 
       WHERE pupil_id = $1 AND concept = ANY($2)`,
      [pupilId, concepts]
    );

    const masteryMap = new Map<string, ConceptMastery>();
    for (const row of result.rows) {
      masteryMap.set(row.concept, {
        concept: row.concept,
        mastery_status: row.mastery_status || 'NEW',
        score: parseFloat(row.score) || 50
      });
    }

    return concepts.map(c => 
      masteryMap.get(c) || { concept: c, mastery_status: 'NEW' as const, score: 50 }
    );
  } catch (error) {
    console.error('Error fetching mastery data:', error);
    return concepts.map(c => ({
      concept: c,
      mastery_status: 'NEW' as const,
      score: 50
    }));
  }
}

function categorizeByMastery(masteryData: ConceptMastery[]): {
  mastered: string[];
  practicing: string[];
  newConcepts: string[];
} {
  const mastered: string[] = [];
  const practicing: string[] = [];
  const newConcepts: string[] = [];

  for (const m of masteryData) {
    if (m.mastery_status === 'MASTERED' || m.score >= 85) {
      mastered.push(m.concept);
    } else if (m.mastery_status === 'PRACTICING' || m.score >= 65) {
      practicing.push(m.concept);
    } else {
      newConcepts.push(m.concept);
    }
  }

  return { mastered, practicing, newConcepts };
}

function selectNextConcept(
  currentConcepts: string[],
  availableConcepts: string[],
  mastery: { mastered: string[]; practicing: string[]; newConcepts: string[] },
  formulaNumber: number,
  totalFormulas: number
): string | null {
  const unusedConcepts = PROGRESSION_ORDER.filter(c => 
    availableConcepts.includes(c) && !currentConcepts.includes(c)
  );

  if (unusedConcepts.length === 0) return null;

  const progressRatio = formulaNumber / totalFormulas;
  let conceptPool: string[];

  if (progressRatio <= 0.5) {
    conceptPool = unusedConcepts.filter(c => 
      mastery.mastered.includes(c) || mastery.practicing.includes(c)
    );
    if (conceptPool.length === 0) conceptPool = unusedConcepts;
  } else if (progressRatio <= 0.8) {
    conceptPool = unusedConcepts.filter(c => 
      mastery.mastered.includes(c) || mastery.practicing.includes(c) || mastery.newConcepts.includes(c)
    );
    if (conceptPool.length === 0) conceptPool = unusedConcepts;
  } else {
    conceptPool = unusedConcepts;
  }

  for (const concept of PROGRESSION_ORDER) {
    if (conceptPool.includes(concept)) {
      const def = CONCEPT_DEFINITIONS[concept];
      if (def?.requires) {
        const hasRequirements = def.requires.every(r => currentConcepts.includes(r));
        if (!hasRequirements) continue;
      }
      return concept;
    }
  }

  return conceptPool[0] || null;
}

function buildFormulaStructure(concepts: string[]): string {
  const parts: string[] = [];
  
  if (concepts.includes('fronted_adverbial')) {
    parts.push('fronted adverbial');
  } else if (concepts.includes('time_phrase')) {
    parts.push('time phrase');
  }
  
  if (concepts.includes('determiner')) {
    parts.push('determiner');
  }
  if (concepts.includes('adjective')) {
    parts.push('adjective');
  }
  
  parts.push('subject');
  
  if (concepts.includes('adverb')) {
    parts.push('adverb');
  }
  
  parts.push('verb');
  
  if (concepts.includes('prepositional_phrase')) {
    parts.push('prepositional phrase');
  }

  return parts.join(' + ');
}

function generateExample(
  subject: string,
  verb: string,
  concepts: string[],
  exampleSubject: string
): { text: string; parts: { text: string; label: string }[] } {
  const parts: { text: string; label: string }[] = [];
  
  const hasTimePhrase = concepts.includes('time_phrase');
  const hasFrontedAdverbial = concepts.includes('fronted_adverbial');
  const hasPrepPhrase = concepts.includes('prepositional_phrase');
  
  if (hasFrontedAdverbial) {
    parts.push({ text: 'Quietly,', label: 'fronted adverbial' });
  } else if (hasTimePhrase) {
    parts.push({ text: 'Every weekday,', label: 'time phrase' });
  }
  
  if (concepts.includes('determiner')) {
    parts.push({ text: 'The', label: 'determiner' });
  }
  if (concepts.includes('adjective')) {
    parts.push({ text: 'peaceful', label: 'adjective' });
  }
  
  const subjectText = concepts.includes('determiner') ? exampleSubject.toLowerCase() : exampleSubject;
  parts.push({ text: subjectText, label: 'subject' });
  
  if (concepts.includes('adverb')) {
    parts.push({ text: 'quietly', label: 'adverb' });
  }
  
  parts.push({ text: verb, label: 'verb' });
  
  if (hasPrepPhrase) {
    const prepText = (hasTimePhrase || hasFrontedAdverbial) 
      ? 'in the town centre' 
      : 'in the morning';
    parts.push({ text: prepText, label: 'prepositional phrase' });
  }

  return {
    text: parts.map(p => p.text).join(' '),
    parts
  };
}

function generateAdaptiveFormulas(
  subject: string,
  stage: string,
  minFormulas: number,
  maxFormulas: number,
  availableConcepts: string[],
  mastery: { mastered: string[]; practicing: string[]; newConcepts: string[] }
): Formula[] {
  const formulas: Formula[] = [];
  const verbs = getVerbsForSubject(subject);
  const exampleVerb = verbs[0] || 'sits';
  
  const exampleSubject = subject;
  
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

  let currentConcepts: string[] = ['noun', 'verb'];
  
  const f1Example = generateExample(subject, exampleVerb, [], exampleSubject);
  formulas.push({
    formula_number: 1,
    formula_structure: 'subject + verb',
    labelled_example: f1Example.text,
    labelled_parts: f1Example.parts,
    new_element: 'verb',
    new_element_examples: verbs.slice(0, 6),
    hint_text: `Think: What does a ${subject.toLowerCase()} DO?`,
    evolution_instruction: 'Write your complete sentence using your subject and a verb.',
    concepts_used: ['noun', 'verb'],
    word_bank: []
  });

  for (let i = 2; i <= formulaCount; i++) {
    const nextConcept = selectNextConcept(
      currentConcepts,
      availableConcepts,
      mastery,
      i,
      formulaCount
    );

    if (!nextConcept) break;

    let conceptsToAdd: string[] = [nextConcept];
    if (nextConcept === 'adjective' && !currentConcepts.includes('determiner') && availableConcepts.includes('determiner')) {
      conceptsToAdd = ['determiner', 'adjective'];
    }

    currentConcepts = [...currentConcepts, ...conceptsToAdd];
    
    const structureConcepts = currentConcepts.filter(c => c !== 'noun' && c !== 'verb');
    const structure = buildFormulaStructure(structureConcepts);
    const example = generateExample(subject, exampleVerb, structureConcepts, exampleSubject);
    
    const conceptDef = CONCEPT_DEFINITIONS[conceptsToAdd[conceptsToAdd.length - 1]];
    const newElementName = conceptsToAdd.length > 1 
      ? conceptsToAdd.join(' + ') 
      : conceptsToAdd[0].replace('_', ' ');
    
    const previousExample = formulas[formulas.length - 1].labelled_example;
    const previousWords = previousExample.replace(/[,.]$/g, '').split(' ');

    formulas.push({
      formula_number: i,
      formula_structure: structure,
      labelled_example: example.text,
      labelled_parts: example.parts,
      new_element: newElementName,
      new_element_examples: conceptDef?.examples.slice(0, 6) || [],
      hint_text: conceptDef?.hint || `Add a ${newElementName}.`,
      evolution_instruction: `REWRITE your Formula ${i-1} sentence, adding ${newElementName.toUpperCase()}.`,
      concepts_used: [...currentConcepts],
      word_bank: previousWords
    });
  }

  return formulas;
}

export async function POST(request: NextRequest) {
  try {
    const { lesson_number, subject_text, pupil_id } = await request.json();

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
    
    const conceptsCumulative: string[] = curriculum.concepts_cumulative || ['noun', 'verb'];
    
    const filteredConcepts = conceptsCumulative.filter(c => 
      c !== 'noun' && c !== 'verb' && c !== 'review'
    );
    
    const availableConcepts = mapCurriculumToPwpConcepts(filteredConcepts);

    const masteryData = await getPupilMastery(pool, pupil_id || null, availableConcepts);
    const mastery = categorizeByMastery(masteryData);

    const formulas = generateAdaptiveFormulas(
      subject_text,
      stage,
      minFormulas,
      maxFormulas,
      availableConcepts,
      mastery
    );

    const sessionId = `pwp_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    return NextResponse.json({
      session_id: sessionId,
      formulas,
      lesson_number,
      subject: subject_text,
      stage,
      total_formulas: formulas.length,
      concepts_available: conceptsCumulative,
      mastery_summary: {
        mastered: mastery.mastered,
        practicing: mastery.practicing,
        new: mastery.newConcepts
      },
      instructions: {
        rewrite_rule: 'You must REWRITE the entire sentence each time, adding the new element.',
        word_bank_usage: 'Click the words from your previous sentence to build, then type the new element.',
        progression: 'Each formula builds on the previous one by adding ONE new element.',
        word_bank_note: 'The word_bank shows your previous sentence words. Use them all, then add the new element.'
      }
    });

  } catch (error) {
    console.error('Start session error:', error);
    return NextResponse.json({ error: 'Failed to start session' }, { status: 500 });
  }
}
