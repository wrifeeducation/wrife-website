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

async function updateConceptMastery(
  pool: Pool,
  pupilId: string,
  conceptsUsed: string[],
  lessonNumber: number,
  isCorrect: boolean
): Promise<void> {
  if (!pupilId || conceptsUsed.length === 0) return;

  try {
    for (const concept of conceptsUsed) {
      if (concept === 'noun' || concept === 'verb') continue;
      
      await pool.query(`
        INSERT INTO concept_mastery (
          id, pupil_id, concept, lesson_introduced, current_lesson,
          total_uses, correct_uses, recent_uses, recent_correct,
          trend, mastery_status, last_used, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $3,
          1, $4::int, 1, $4::int,
          'stable', 
          CASE WHEN $4 THEN 'PRACTICING' ELSE 'NEW' END,
          NOW(), NOW()
        )
        ON CONFLICT (pupil_id, concept) DO UPDATE SET
          current_lesson = $3,
          total_uses = concept_mastery.total_uses + 1,
          correct_uses = concept_mastery.correct_uses + $4::int,
          recent_uses = LEAST(concept_mastery.recent_uses + 1, 10),
          recent_correct = CASE 
            WHEN concept_mastery.recent_uses >= 10 
            THEN concept_mastery.recent_correct - 
                 FLOOR(concept_mastery.recent_correct::float / 10)::int + $4::int
            ELSE concept_mastery.recent_correct + $4::int
          END,
          trend = CASE
            WHEN concept_mastery.correct_uses::float / NULLIF(concept_mastery.total_uses, 0) < 
                 (concept_mastery.recent_correct::float / NULLIF(concept_mastery.recent_uses, 0))
            THEN 'improving'
            WHEN concept_mastery.correct_uses::float / NULLIF(concept_mastery.total_uses, 0) >
                 (concept_mastery.recent_correct::float / NULLIF(concept_mastery.recent_uses, 0))
            THEN 'declining'
            ELSE 'stable'
          END,
          mastery_status = CASE
            WHEN (concept_mastery.correct_uses + $4::int)::float / 
                 (concept_mastery.total_uses + 1) >= 0.85 
                 AND concept_mastery.total_uses >= 10
            THEN 'MASTERED'
            WHEN (concept_mastery.correct_uses + $4::int)::float / 
                 (concept_mastery.total_uses + 1) >= 0.65
            THEN 'PRACTICING'
            ELSE 'NEW'
          END,
          last_used = NOW(),
          updated_at = NOW()
      `, [pupilId, concept, lessonNumber, isCorrect ? 1 : 0]);
    }
  } catch (error) {
    console.error('Error updating concept mastery:', error);
  }
}

interface FormulaResult {
  correct: boolean;
  feedback: string;
  score: number;
  suggestions?: string[];
  words_saved: string[];
  previous_sentence: string;
  repetition_count?: Record<string, number>;
}

const WORD_TYPES = {
  determiners: ['the', 'a', 'an', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'their'],
  adjectives: ['happy', 'big', 'small', 'fast', 'slow', 'brave', 'playful', 'red', 'blue', 'green', 'yellow', 'beautiful', 'tall', 'short', 'young', 'old', 'new', 'good', 'bad', 'great', 'little', 'large', 'tiny', 'huge', 'bright', 'dark', 'soft', 'hard', 'warm', 'cold', 'hot', 'cool', 'sweet', 'sour', 'loud', 'quiet', 'gentle', 'kind', 'clever', 'silly', 'funny', 'sad', 'angry', 'scared', 'excited', 'tired', 'hungry', 'thirsty', 'full', 'empty', 'peaceful', 'busy', 'early', 'late'],
  verbs: ['runs', 'run', 'jumps', 'jump', 'sleeps', 'sleep', 'eats', 'eat', 'plays', 'play', 'swims', 'swim', 'flies', 'fly', 'walks', 'walk', 'chases', 'chase', 'finds', 'find', 'sees', 'see', 'likes', 'like', 'catches', 'catch', 'sits', 'sit', 'stands', 'stand', 'climbs', 'climb', 'reads', 'read', 'writes', 'write', 'sings', 'sing', 'dances', 'dance', 'laughs', 'laugh', 'cries', 'cry', 'smiles', 'smile', 'talks', 'talk', 'listens', 'listen', 'helps', 'help', 'makes', 'make', 'takes', 'take', 'gives', 'give', 'goes', 'go', 'comes', 'come', 'is', 'are', 'was', 'were', 'has', 'have', 'had', 'opens', 'open', 'closes', 'close', 'welcomes', 'welcome', 'holds', 'hold', 'contains', 'contain', 'waits', 'wait', 'barks', 'bark'],
  adverbs: ['quickly', 'slowly', 'happily', 'sadly', 'loudly', 'quietly', 'always', 'never', 'often', 'sometimes', 'usually', 'rarely', 'here', 'there', 'everywhere', 'nowhere', 'now', 'then', 'soon', 'later', 'yesterday', 'today', 'tomorrow', 'very', 'really', 'quite', 'almost', 'nearly', 'just', 'only', 'also', 'too', 'well', 'badly', 'carefully', 'carelessly', 'easily', 'hardly', 'finally', 'suddenly', 'gently', 'kindly', 'softly'],
  prepositions: ['in', 'on', 'at', 'to', 'for', 'from', 'with', 'by', 'near', 'through', 'during', 'after', 'before', 'under', 'over', 'between', 'behind', 'beside', 'above', 'below']
};

function extractWords(sentence: string): string[] {
  return sentence.trim().replace(/[.!?]$/, '').split(/\s+/).filter(w => w);
}

function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[,.]$/, '');
}

function checkWordOrderPreservation(
  currentWords: string[], 
  previousWords: string[],
  formulaStructure: string
): { 
  valid: boolean; 
  issue: 'missing' | 'reordered' | 'none'; 
  details: string[];
} {
  const currentNormalized = currentWords.map(normalizeWord);
  const previousNormalized = previousWords.map(normalizeWord);
  
  const missingWords: string[] = [];
  for (const prevWord of previousNormalized) {
    if (!currentNormalized.includes(prevWord)) {
      missingWords.push(prevWord);
    }
  }
  
  if (missingWords.length > 0) {
    return {
      valid: false,
      issue: 'missing',
      details: missingWords
    };
  }
  
  const structure = formulaStructure.toLowerCase();
  const addsAtStart = structure.includes('determiner +') || 
                      structure.startsWith('determiner') ||
                      structure.includes('time phrase') ||
                      structure.includes('fronted adverbial');
  
  if (addsAtStart) {
    const newElementCount = currentWords.length - previousWords.length;
    const startIndex = newElementCount > 0 ? newElementCount : 0;
    
    for (let i = 0; i < previousNormalized.length; i++) {
      const expectedWord = previousNormalized[i];
      const actualWord = currentNormalized[startIndex + i];
      if (expectedWord !== actualWord) {
        return {
          valid: false,
          issue: 'reordered',
          details: [`Expected "${previousWords[i]}" but found "${currentWords[startIndex + i] || 'nothing'}"`]
        };
      }
    }
  } else {
    for (let i = 0; i < previousNormalized.length; i++) {
      const expectedWord = previousNormalized[i];
      const actualWord = currentNormalized[i];
      if (expectedWord !== actualWord) {
        return {
          valid: false,
          issue: 'reordered',
          details: [`Word order changed. Keep your previous sentence intact and add the new element.`]
        };
      }
    }
  }
  
  return {
    valid: true,
    issue: 'none',
    details: []
  };
}

function validateFormula1(words: string[], subject: string): FormulaResult {
  const subjectLower = subject.toLowerCase();
  const firstWordLower = words[0]?.toLowerCase();
  
  if (words.length !== 2) {
    return {
      correct: false,
      feedback: 'Formula 1 needs exactly 2 words: your subject + a verb.',
      score: 40,
      suggestions: [`Write just: "${subject} [verb]" - for example: "${subject} opens"`],
      words_saved: [],
      previous_sentence: ''
    };
  }

  if (WORD_TYPES.determiners.includes(firstWordLower)) {
    return {
      correct: false,
      feedback: 'Formula 1 should NOT start with a determiner like "The" or "A". Start directly with your subject.',
      score: 30,
      suggestions: [`Remove "${words[0]}" and start with "${subject}" directly`],
      words_saved: [],
      previous_sentence: ''
    };
  }

  if (firstWordLower !== subjectLower) {
    return {
      correct: false,
      feedback: `Your sentence should start with your chosen subject: "${subject}"`,
      score: 40,
      suggestions: [`Start with "${subject}"`],
      words_saved: [],
      previous_sentence: ''
    };
  }

  const secondWord = words[1]?.toLowerCase();
  if (!WORD_TYPES.verbs.includes(secondWord)) {
    return {
      correct: false,
      feedback: `"${words[1]}" doesn't appear to be a verb. The second word needs to be an action word.`,
      score: 50,
      suggestions: ['Use a verb like "opens", "sits", "runs", "walks"'],
      words_saved: [],
      previous_sentence: ''
    };
  }

  const savedWords = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  const sentence = savedWords.join(' ');
  
  return {
    correct: true,
    feedback: `Perfect! "${sentence}" uses the formula correctly.`,
    score: 100,
    words_saved: savedWords,
    previous_sentence: sentence
  };
}

function validateFormula2(words: string[], subject: string, previousWords: string[], previousSentence: string): FormulaResult {
  const subjectLower = subject.toLowerCase();
  
  if (words.length !== 3) {
    return {
      correct: false,
      feedback: 'Formula 2 needs exactly 3 words: subject + adverb + verb.',
      score: 40,
      suggestions: [`Rewrite as: "${subject} [adverb] [verb]" - for example: "${subject} quietly opens"`],
      words_saved: previousWords,
      previous_sentence: previousSentence
    };
  }

  const firstWordLower = words[0]?.toLowerCase();
  if (WORD_TYPES.determiners.includes(firstWordLower)) {
    return {
      correct: false,
      feedback: 'Formula 2 should NOT start with a determiner. Start with your subject.',
      score: 30,
      suggestions: [`Remove "${words[0]}" and start with "${subject}"`],
      words_saved: previousWords,
      previous_sentence: previousSentence
    };
  }

  if (firstWordLower !== subjectLower) {
    return {
      correct: false,
      feedback: `Start with your subject "${subject}" then add an adverb, then your verb.`,
      score: 40,
      suggestions: [`Structure: ${subject} + [adverb] + [verb]`],
      words_saved: previousWords,
      previous_sentence: previousSentence
    };
  }

  const prevSubject = previousWords[0];
  const prevVerb = previousWords[1];
  
  if (normalizeWord(words[0]) !== normalizeWord(prevSubject)) {
    return {
      correct: false,
      feedback: `Keep your subject "${prevSubject}" at the start.`,
      score: 45,
      suggestions: [`Your previous sentence was: "${previousSentence}". Keep the subject and verb, add an adverb in between.`],
      words_saved: previousWords,
      previous_sentence: previousSentence
    };
  }
  
  if (normalizeWord(words[2]) !== normalizeWord(prevVerb)) {
    return {
      correct: false,
      feedback: `Keep your verb "${prevVerb}" from Formula 1. Don't change it!`,
      score: 45,
      suggestions: [`Your verb was "${prevVerb}". Write: ${subject} [adverb] ${prevVerb}`],
      words_saved: previousWords,
      previous_sentence: previousSentence
    };
  }

  const secondWord = words[1]?.toLowerCase();
  if (!WORD_TYPES.adverbs.includes(secondWord)) {
    return {
      correct: false,
      feedback: `"${words[1]}" should be an adverb. Adverbs describe HOW the action happens.`,
      score: 50,
      suggestions: ['Use an adverb like "quietly", "slowly", "quickly", "gently"'],
      words_saved: previousWords,
      previous_sentence: previousSentence
    };
  }

  const thirdWord = words[2]?.toLowerCase();
  if (!WORD_TYPES.verbs.includes(thirdWord)) {
    return {
      correct: false,
      feedback: `"${words[2]}" should be a verb. End with an action word.`,
      score: 60,
      suggestions: ['End with a verb like "opens", "sits", "runs"'],
      words_saved: previousWords,
      previous_sentence: previousSentence
    };
  }

  const savedWords = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  const sentence = savedWords.join(' ');

  return {
    correct: true,
    feedback: `Excellent! You've REWRITTEN your sentence with the adverb.`,
    score: 100,
    words_saved: savedWords,
    previous_sentence: sentence,
    repetition_count: {
      [subject]: 2,
      [words[2]]: 2
    }
  };
}

function validateFormula3Plus(
  words: string[],
  formulaStructure: string,
  subject: string,
  previousWords: string[],
  previousSentence: string,
  formulaNumber: number
): FormulaResult {
  const structure = formulaStructure.toLowerCase();
  
  if (words.length < previousWords.length) {
    return {
      correct: false,
      feedback: `Your sentence is shorter than before! You need to REWRITE the previous sentence AND add the new element.`,
      score: 30,
      suggestions: [`Previous sentence was: "${previousSentence}". Add the new element to it.`],
      words_saved: previousWords,
      previous_sentence: previousSentence
    };
  }

  const orderCheck = checkWordOrderPreservation(words, previousWords, formulaStructure);
  if (!orderCheck.valid) {
    const feedbackMsg = orderCheck.issue === 'missing' 
      ? `You need to include all your previous words. Missing: ${orderCheck.details.join(', ')}`
      : orderCheck.details[0] || 'Keep your previous words in the same order.';
    return {
      correct: false,
      feedback: feedbackMsg,
      score: 40,
      suggestions: [`Your previous sentence was: "${previousSentence}". Make sure to include all those words.`],
      words_saved: previousWords,
      previous_sentence: previousSentence
    };
  }

  const hasVerb = words.some(w => WORD_TYPES.verbs.includes(normalizeWord(w)));
  if (!hasVerb) {
    return {
      correct: false,
      feedback: 'Your sentence needs a verb - an action word.',
      score: 40,
      suggestions: ['Add a verb like "opens", "sits", "runs", "walks"'],
      words_saved: previousWords,
      previous_sentence: previousSentence
    };
  }

  const firstWordLower = normalizeWord(words[0]);
  const requiresDeterminerAtStart = structure.startsWith('determiner') || 
    structure.startsWith('det +');
  const requiresTimePhrase = structure.includes('time phrase');
  const requiresFrontedAdverbial = structure.includes('fronted adverbial');

  if (!requiresDeterminerAtStart && !requiresTimePhrase && !requiresFrontedAdverbial) {
    if (WORD_TYPES.determiners.includes(firstWordLower)) {
      return {
        correct: false,
        feedback: `This formula doesn't start with a determiner. Check the structure.`,
        score: 40,
        suggestions: ['Look at the formula pattern - it may start with the subject directly'],
        words_saved: previousWords,
        previous_sentence: previousSentence
      };
    }
  }

  if (requiresDeterminerAtStart && !WORD_TYPES.determiners.includes(firstWordLower)) {
    return {
      correct: false,
      feedback: 'This formula needs to start with a determiner like "The" or "A".',
      score: 50,
      suggestions: ['Start with "The" or "A"'],
      words_saved: previousWords,
      previous_sentence: previousSentence
    };
  }

  let score = 70;
  const feedback: string[] = [];

  if (structure.includes('adverb') && words.some(w => WORD_TYPES.adverbs.includes(normalizeWord(w)))) {
    score += 10;
  } else if (structure.includes('adverb') && !structure.includes('fronted adverbial')) {
    feedback.push('Include an adverb like "quietly" or "slowly"');
  }

  if (structure.includes('adjective') && words.some(w => WORD_TYPES.adjectives.includes(normalizeWord(w)))) {
    score += 10;
  } else if (structure.includes('adjective')) {
    feedback.push('Include an adjective like "old" or "peaceful"');
  }

  if (structure.includes('prepositional phrase') || structure.includes('prep')) {
    const hasPreposition = words.some(w => WORD_TYPES.prepositions.includes(normalizeWord(w)));
    if (hasPreposition) {
      score += 10;
    } else {
      feedback.push('Add a prepositional phrase like "in the morning" or "near the park"');
    }
  }

  const savedWords = words.map(w => w.replace(/[,.]$/, ''));
  const sentence = savedWords.join(' ');

  if (score >= 85) {
    return {
      correct: true,
      feedback: `Perfect! You REWROTE the complete sentence with the new element!`,
      score: Math.min(100, score),
      words_saved: savedWords,
      previous_sentence: sentence,
      repetition_count: {
        [subject]: formulaNumber
      }
    };
  } else if (score >= 70) {
    return {
      correct: true,
      feedback: 'Good job! Your sentence follows the formula.',
      score,
      suggestions: feedback.length > 0 ? feedback : undefined,
      words_saved: savedWords,
      previous_sentence: sentence
    };
  } else {
    return {
      correct: false,
      feedback: 'Almost there! Check the formula structure and try again.',
      score,
      suggestions: feedback,
      words_saved: previousWords,
      previous_sentence: previousSentence
    };
  }
}

function evaluateSentence(
  sentence: string,
  formulaStructure: string,
  subject: string,
  formulaNumber: number,
  previousWords: string[] = [],
  previousSentence: string = ''
): FormulaResult {
  const words = extractWords(sentence);

  if (formulaNumber === 1) {
    return validateFormula1(words, subject);
  }

  if (formulaNumber === 2) {
    return validateFormula2(words, subject, previousWords, previousSentence);
  }

  return validateFormula3Plus(words, formulaStructure, subject, previousWords, previousSentence, formulaNumber);
}

export async function POST(request: NextRequest) {
  try {
    const { 
      session_id, 
      formula_number, 
      pupil_sentence, 
      formula_structure,
      subject,
      previous_words = [],
      previous_sentence = '',
      pupil_id,
      lesson_number,
      concepts_used = []
    } = await request.json();

    if (!session_id || formula_number === undefined || !pupil_sentence) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = evaluateSentence(
      pupil_sentence, 
      formula_structure || 'subject + verb', 
      subject || '',
      formula_number,
      previous_words,
      previous_sentence
    );

    if (pupil_id && lesson_number && concepts_used.length > 0) {
      const pool = getPool();
      await updateConceptMastery(
        pool,
        pupil_id,
        concepts_used,
        lesson_number,
        result.correct
      );
    }

    return NextResponse.json({
      session_id,
      formula_number,
      ...result,
      next_formula: result.correct ? formula_number + 1 : formula_number
    });

  } catch (error) {
    console.error('Submit formula error:', error);
    return NextResponse.json({ error: 'Failed to evaluate formula' }, { status: 500 });
  }
}
