// lib/formulaGenerator.ts

export interface Formula {
  number: number;
  structure: string;
  concepts: string[];
  example: string;
  wordBank: string[];
  newElements: string[];
}

export interface FormulaGeneratorInput {
  lessonNumber: number;
  subject: string;
  subjectType: 'person' | 'animal' | 'place' | 'thing';
  conceptsCumulative: string[];
}

/**
 * FORMULA GENERATION FOR L10-15 (MVP)
 * 
 * This is simplified - uses hardcoded progressions for each lesson.
 * Later: Make adaptive based on mastery data.
 */

export function generateFormulas(input: FormulaGeneratorInput): Formula[] {
  const { lessonNumber, subject, subjectType } = input;

  // Get verb appropriate for subject type
  const verb = getAppropriateVerb(subject, subjectType);

  switch (lessonNumber) {
    case 10:
      return generateL10Formulas(subject, verb);
    case 11:
      return generateL11Formulas(subject, verb);
    case 12:
      return generateL12Formulas(subject, verb);
    case 13:
      return generateL13Formulas(subject, verb);
    case 14:
      return generateL14Formulas(subject, verb);
    case 15:
      return generateL15Formulas(subject, verb);
    default:
      throw new Error(`Lesson ${lessonNumber} not implemented`);
  }
}

/**
 * Get appropriate verb for subject type
 */
function getAppropriateVerb(subject: string, subjectType: string): string {
  // Subject-specific verb mappings
  const verbMappings: Record<string, { type: string; verb: string }> = {
    'Ben': { type: 'person', verb: 'runs' },
    'Mum': { type: 'person', verb: 'cooks' },
    'Teacher': { type: 'person', verb: 'teaches' },
    'Dog': { type: 'animal', verb: 'barks' },
    'Cat': { type: 'animal', verb: 'purrs' },
    'Bird': { type: 'animal', verb: 'flies' },
    'Fish': { type: 'animal', verb: 'swims' },
    'Rabbit': { type: 'animal', verb: 'hops' },
    'Lion': { type: 'animal', verb: 'roars' },
    'Elephant': { type: 'animal', verb: 'walks' },
    'Frog': { type: 'animal', verb: 'jumps' },
    'Butterfly': { type: 'animal', verb: 'flies' },
    'Bear': { type: 'animal', verb: 'growls' },
    'Library': { type: 'place', verb: 'opens' },
    'Park': { type: 'place', verb: 'sits' },
    'School': { type: 'place', verb: 'welcomes' },
    'Book': { type: 'thing', verb: 'sits' },
    'Car': { type: 'thing', verb: 'moves' },
    'Clock': { type: 'thing', verb: 'ticks' },
  };

  // Check if we have specific mapping (case-insensitive)
  const capitalizedSubject = subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase();
  if (verbMappings[capitalizedSubject]) {
    return verbMappings[capitalizedSubject].verb;
  }

  // Otherwise use default for type
  const defaultVerbs: Record<string, string> = {
    person: 'walks',
    animal: 'moves',
    place: 'stands',
    thing: 'sits',
  };

  return defaultVerbs[subjectType] || 'exists';
}

/**
 * LESSON 10: Noun + Verb only (2 formulas)
 */
function generateL10Formulas(subject: string, verb: string): Formula[] {
  return [
    {
      number: 1,
      structure: `subject + verb`,
      concepts: ['noun', 'verb'],
      example: `${subject} ${verb}`,
      wordBank: [],
      newElements: ['noun', 'verb'],
    },
    {
      number: 2,
      structure: `subject + verb`,
      concepts: ['noun', 'verb'],
      example: `${subject} ${verb}`,
      wordBank: [subject, verb],
      newElements: [],
    },
  ];
}

/**
 * LESSON 11: Add Determiner (3 formulas)
 */
function generateL11Formulas(subject: string, verb: string): Formula[] {
  const determiner = getAppropriateArticle(subject);
  
  return [
    {
      number: 1,
      structure: `subject + verb`,
      concepts: ['noun', 'verb'],
      example: `${subject} ${verb}`,
      wordBank: [],
      newElements: ['noun', 'verb'],
    },
    {
      number: 2,
      structure: `subject + verb`,
      concepts: ['noun', 'verb'],
      example: `${subject} ${verb}`,
      wordBank: [subject, verb],
      newElements: [],
    },
    {
      number: 3,
      structure: `determiner + subject + verb`,
      concepts: ['determiner', 'noun', 'verb'],
      example: `${determiner} ${subject.toLowerCase()} ${verb}`,
      wordBank: [subject, verb],
      newElements: ['determiner'],
    },
  ];
}

/**
 * LESSON 12: Add Adjective (3 formulas)
 */
function generateL12Formulas(subject: string, verb: string): Formula[] {
  const determiner = getAppropriateArticle(subject);
  const adjective = getAppropriateAdjective(subject);
  
  return [
    {
      number: 1,
      structure: `subject + verb`,
      concepts: ['noun', 'verb'],
      example: `${subject} ${verb}`,
      wordBank: [],
      newElements: ['noun', 'verb'],
    },
    {
      number: 2,
      structure: `determiner + subject + verb`,
      concepts: ['determiner', 'noun', 'verb'],
      example: `${determiner} ${subject.toLowerCase()} ${verb}`,
      wordBank: [subject, verb],
      newElements: ['determiner'],
    },
    {
      number: 3,
      structure: `determiner + adjective + subject + verb`,
      concepts: ['determiner', 'adjective', 'noun', 'verb'],
      example: `${determiner} ${adjective} ${subject.toLowerCase()} ${verb}`,
      wordBank: [determiner, subject, verb],
      newElements: ['adjective'],
    },
  ];
}

/**
 * LESSON 13: Add Adverb (4 formulas)
 */
function generateL13Formulas(subject: string, verb: string): Formula[] {
  const determiner = getAppropriateArticle(subject);
  const adjective = getAppropriateAdjective(subject);
  const adverb = getAppropriateAdverb(verb);
  
  return [
    {
      number: 1,
      structure: `subject + verb`,
      concepts: ['noun', 'verb'],
      example: `${subject} ${verb}`,
      wordBank: [],
      newElements: ['noun', 'verb'],
    },
    {
      number: 2,
      structure: `subject + adverb + verb`,
      concepts: ['noun', 'adverb', 'verb'],
      example: `${subject} ${adverb} ${verb}`,
      wordBank: [subject, verb],
      newElements: ['adverb'],
    },
    {
      number: 3,
      structure: `determiner + subject + adverb + verb`,
      concepts: ['determiner', 'noun', 'adverb', 'verb'],
      example: `${determiner} ${subject.toLowerCase()} ${adverb} ${verb}`,
      wordBank: [subject, adverb, verb],
      newElements: ['determiner'],
    },
    {
      number: 4,
      structure: `determiner + adjective + subject + adverb + verb`,
      concepts: ['determiner', 'adjective', 'noun', 'adverb', 'verb'],
      example: `${determiner} ${adjective} ${subject.toLowerCase()} ${adverb} ${verb}`,
      wordBank: [determiner, subject, adverb, verb],
      newElements: ['adjective'],
    },
  ];
}

/**
 * LESSON 14: Add Conjunction (4 formulas)
 */
function generateL14Formulas(subject: string, verb: string): Formula[] {
  const determiner = getAppropriateArticle(subject);
  const adjective = getAppropriateAdjective(subject);
  const adverb = getAppropriateAdverb(verb);
  const verb2 = getSecondVerb(verb);
  
  return [
    {
      number: 1,
      structure: `subject + verb`,
      concepts: ['noun', 'verb'],
      example: `${subject} ${verb}`,
      wordBank: [],
      newElements: ['noun', 'verb'],
    },
    {
      number: 2,
      structure: `subject + adverb + verb`,
      concepts: ['noun', 'adverb', 'verb'],
      example: `${subject} ${adverb} ${verb}`,
      wordBank: [subject, verb],
      newElements: ['adverb'],
    },
    {
      number: 3,
      structure: `determiner + adjective + subject + adverb + verb`,
      concepts: ['determiner', 'adjective', 'noun', 'adverb', 'verb'],
      example: `${determiner} ${adjective} ${subject.toLowerCase()} ${adverb} ${verb}`,
      wordBank: [subject, adverb, verb],
      newElements: ['determiner', 'adjective'],
    },
    {
      number: 4,
      structure: `determiner + adjective + subject + adverb + verb + and + verb`,
      concepts: ['determiner', 'adjective', 'noun', 'adverb', 'verb', 'conjunction'],
      example: `${determiner} ${adjective} ${subject.toLowerCase()} ${adverb} ${verb} and ${verb2}`,
      wordBank: [determiner, adjective, subject, adverb, verb],
      newElements: ['conjunction'],
    },
  ];
}

/**
 * LESSON 15: Add Pronoun (4 formulas)
 */
function generateL15Formulas(subject: string, verb: string): Formula[] {
  const determiner = getAppropriateArticle(subject);
  const adjective = getAppropriateAdjective(subject);
  const adverb = getAppropriateAdverb(verb);
  const pronoun = getAppropriatePronoun(subject);
  
  return [
    {
      number: 1,
      structure: `subject + verb`,
      concepts: ['noun', 'verb'],
      example: `${subject} ${verb}`,
      wordBank: [],
      newElements: ['noun', 'verb'],
    },
    {
      number: 2,
      structure: `determiner + adjective + subject + adverb + verb`,
      concepts: ['determiner', 'adjective', 'noun', 'adverb', 'verb'],
      example: `${determiner} ${adjective} ${subject.toLowerCase()} ${adverb} ${verb}`,
      wordBank: [subject, verb],
      newElements: ['determiner', 'adjective', 'adverb'],
    },
    {
      number: 3,
      structure: `determiner + adjective + subject + adverb + verb`,
      concepts: ['determiner', 'adjective', 'noun', 'adverb', 'verb'],
      example: `${determiner} ${adjective} ${subject.toLowerCase()} ${adverb} ${verb}`,
      wordBank: [determiner, adjective, subject, adverb, verb],
      newElements: [],
    },
    {
      number: 4,
      structure: `pronoun + adverb + verb`,
      concepts: ['pronoun', 'adverb', 'verb'],
      example: `${pronoun} ${adverb} ${verb}`,
      wordBank: [determiner, adjective, subject, adverb, verb],
      newElements: ['pronoun'],
    },
  ];
}

/**
 * Helper: Get appropriate article (the/a/an)
 */
function getAppropriateArticle(subject: string): string {
  // Vowel sounds get "an"
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  if (vowels.includes(subject[0].toLowerCase())) {
    return 'An';
  }
  
  return 'The';
}

/**
 * Helper: Get appropriate adjective for subject
 */
function getAppropriateAdjective(subject: string): string {
  const adjectiveMappings: Record<string, string> = {
    'Ben': 'energetic',
    'Mum': 'caring',
    'Teacher': 'patient',
    'Dog': 'playful',
    'Cat': 'sleepy',
    'Bird': 'colorful',
    'Fish': 'shiny',
    'Rabbit': 'fluffy',
    'Lion': 'mighty',
    'Elephant': 'gentle',
    'Frog': 'tiny',
    'Butterfly': 'beautiful',
    'Bear': 'furry',
    'Library': 'old',
    'Park': 'peaceful',
    'School': 'busy',
    'Book': 'interesting',
    'Car': 'fast',
    'Clock': 'antique',
  };
  
  const capitalizedSubject = subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase();
  return adjectiveMappings[capitalizedSubject] || 'big';
}

/**
 * Helper: Get appropriate adverb for verb
 */
function getAppropriateAdverb(verb: string): string {
  const adverbMappings: Record<string, string> = {
    'runs': 'quickly',
    'walks': 'slowly',
    'cooks': 'carefully',
    'teaches': 'patiently',
    'barks': 'loudly',
    'purrs': 'softly',
    'flies': 'gracefully',
    'swims': 'smoothly',
    'hops': 'quickly',
    'roars': 'loudly',
    'jumps': 'high',
    'growls': 'fiercely',
    'opens': 'quietly',
    'sits': 'peacefully',
    'welcomes': 'warmly',
    'moves': 'smoothly',
    'ticks': 'steadily',
  };
  
  return adverbMappings[verb] || 'slowly';
}

/**
 * Helper: Get second verb for conjunction
 */
function getSecondVerb(verb: string): string {
  const secondVerbMappings: Record<string, string> = {
    'runs': 'jumps',
    'walks': 'stops',
    'cooks': 'serves',
    'teaches': 'explains',
    'barks': 'wags',
    'purrs': 'sleeps',
    'flies': 'sings',
    'swims': 'splashes',
    'hops': 'stops',
    'roars': 'prowls',
    'jumps': 'lands',
    'growls': 'roars',
    'opens': 'closes',
    'sits': 'stands',
    'welcomes': 'helps',
    'moves': 'stops',
    'ticks': 'chimes',
  };
  
  return secondVerbMappings[verb] || 'rests';
}

/**
 * Helper: Get appropriate pronoun
 */
function getAppropriatePronoun(subject: string): string {
  // Male names
  if (['Ben', 'James', 'Tom', 'Sam'].includes(subject)) {
    return 'He';
  }
  
  // Female names
  if (['Mum', 'Sarah', 'Maya', 'Emma'].includes(subject)) {
    return 'She';
  }
  
  // Animals and things
  return 'It';
}
