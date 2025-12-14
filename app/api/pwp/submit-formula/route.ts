import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || undefined,
});

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

function getExampleVerbForSubject(subject: string): string {
  const lowerSubject = subject.toLowerCase();
  const animals = ['dog', 'cat', 'bird', 'fish', 'rabbit', 'horse', 'mouse', 'elephant', 'lion', 'tiger', 'frog', 'butterfly', 'bear'];
  const places = ['library', 'school', 'park', 'museum', 'shop', 'beach', 'house', 'building'];
  
  if (animals.some(a => lowerSubject.includes(a))) {
    if (lowerSubject.includes('frog')) return 'jumps';
    if (lowerSubject.includes('bird') || lowerSubject.includes('butterfly')) return 'flies';
    if (lowerSubject.includes('fish')) return 'swims';
    if (lowerSubject.includes('dog')) return 'barks';
    return 'runs';
  }
  if (places.some(p => lowerSubject.includes(p))) return 'opens';
  return 'walks';
}

function extractWords(sentence: string): string[] {
  return sentence.trim().replace(/[.!?]$/, '').split(/\s+/).filter(w => w);
}

function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[,.]$/, '');
}

function matchesSubject(inputWord: string, expectedSubject: string): boolean {
  const input = inputWord.toLowerCase().replace(/[,.]$/, '');
  const expected = expectedSubject.toLowerCase();
  
  if (input === expected) return true;
  
  if (input === expected + 's') return true;
  if (input + 's' === expected) return true;
  
  if (expected.endsWith('y') && input === expected.slice(0, -1) + 'ies') return true;
  if (input.endsWith('y') && expected === input.slice(0, -1) + 'ies') return true;
  
  if (expected.endsWith('s') || expected.endsWith('x') || expected.endsWith('ch') || expected.endsWith('sh')) {
    if (input === expected + 'es') return true;
  }
  if (input.endsWith('es') && (expected === input.slice(0, -2) || expected === input.slice(0, -1))) return true;
  
  return false;
}

function isValidVerb(word: string): boolean {
  const input = word.toLowerCase().replace(/[,.]$/, '');
  
  if (WORD_TYPES.verbs.includes(input)) return true;
  
  const verbRoots = ['run', 'jump', 'sleep', 'eat', 'play', 'swim', 'fly', 'walk', 'chase', 'find', 'see', 'like', 'catch', 'sit', 'stand', 'climb', 'read', 'write', 'sing', 'dance', 'laugh', 'cry', 'smile', 'talk', 'listen', 'help', 'make', 'take', 'give', 'go', 'come', 'open', 'close', 'welcome', 'hold', 'contain', 'wait', 'bark', 'hop', 'skip', 'gallop', 'crawl', 'dive', 'soar', 'glide', 'leap', 'bounce', 'sprint', 'dash', 'waddle', 'slither', 'hunt', 'graze', 'roam', 'prowl'];
  
  for (const root of verbRoots) {
    if (input === root) return true;
    if (input === root + 's') return true;
    if (input === root + 'es') return true;
    if (input === root + 'ing') return true;
    if (input === root + 'ed') return true;
    
    if (root.endsWith('e')) {
      if (input === root.slice(0, -1) + 'ing') return true;
      if (input === root + 'd') return true;
    }
    
    if (root.endsWith('y')) {
      if (input === root.slice(0, -1) + 'ies') return true;
      if (input === root.slice(0, -1) + 'ied') return true;
    }
    
    const lastChar = root[root.length - 1];
    const secondLastChar = root[root.length - 2];
    const vowels = 'aeiou';
    if (!vowels.includes(lastChar) && vowels.includes(secondLastChar) && root.length <= 4) {
      if (input === root + lastChar + 'ing') return true;
      if (input === root + lastChar + 'ed') return true;
    }
  }
  
  return false;
}

function wordsMatch(word1: string, word2: string): boolean {
  const w1 = word1.toLowerCase().replace(/[,.]$/, '');
  const w2 = word2.toLowerCase().replace(/[,.]$/, '');
  
  if (w1 === w2) return true;
  
  if (matchesSubject(w1, w2)) return true;
  
  if (isValidVerb(w1) && isValidVerb(w2)) {
    const getVerbRoot = (verb: string): string => {
      if (verb.endsWith('ing')) return verb.slice(0, -3);
      if (verb.endsWith('ied')) return verb.slice(0, -3) + 'y';
      if (verb.endsWith('ed')) return verb.slice(0, -2);
      if (verb.endsWith('ies')) return verb.slice(0, -3) + 'y';
      if (verb.endsWith('es')) return verb.slice(0, -2);
      if (verb.endsWith('s')) return verb.slice(0, -1);
      return verb;
    };
    const root1 = getVerbRoot(w1);
    const root2 = getVerbRoot(w2);
    if (root1 === root2 || root1 === w2 || w1 === root2) return true;
  }
  
  return false;
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
    const hasMatch = currentNormalized.some(cw => wordsMatch(cw, prevWord));
    if (!hasMatch) {
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
      if (!wordsMatch(actualWord || '', expectedWord)) {
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
      if (!wordsMatch(actualWord || '', expectedWord)) {
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
    const exampleVerb = getExampleVerbForSubject(subject);
    return {
      correct: false,
      feedback: 'Formula 1 needs exactly 2 words: your subject + a verb.',
      score: 40,
      suggestions: [`Write just: "${subject} [verb]" - for example: "${subject} ${exampleVerb}"`],
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

  if (!matchesSubject(words[0], subject)) {
    return {
      correct: false,
      feedback: `Your sentence should start with your chosen subject: "${subject}"`,
      score: 40,
      suggestions: [`Start with "${subject}" or "${subject}s"`],
      words_saved: [],
      previous_sentence: ''
    };
  }

  const secondWord = words[1]?.toLowerCase();
  if (!isValidVerb(secondWord)) {
    return {
      correct: false,
      feedback: `"${words[1]}" doesn't appear to be a verb. The second word needs to be an action word.`,
      score: 50,
      suggestions: ['Use a verb like "opens", "sits", "runs", "walks", "fly", "flies"'],
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

  if (!matchesSubject(words[0], subject)) {
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
  
  if (!matchesSubject(words[0], prevSubject)) {
    return {
      correct: false,
      feedback: `Keep your subject "${prevSubject}" at the start.`,
      score: 45,
      suggestions: [`Your previous sentence was: "${previousSentence}". Keep the subject and verb, add an adverb in between.`],
      words_saved: previousWords,
      previous_sentence: previousSentence
    };
  }
  
  if (!isValidVerb(words[2])) {
    return {
      correct: false,
      feedback: `Keep a verb at the end. Your previous verb was "${prevVerb}".`,
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
  if (!isValidVerb(thirdWord)) {
    return {
      correct: false,
      feedback: `"${words[2]}" should be a verb. End with an action word.`,
      score: 60,
      suggestions: ['End with a verb like "opens", "sits", "runs", "fly", "flies"'],
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

  const hasVerb = words.some(w => isValidVerb(normalizeWord(w)));
  if (!hasVerb) {
    return {
      correct: false,
      feedback: 'Your sentence needs a verb - an action word.',
      score: 40,
      suggestions: ['Add a verb like "opens", "sits", "runs", "walks", "fly", "flies"'],
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

async function evaluateWithAI(
  sentence: string,
  formulaStructure: string,
  subject: string,
  formulaNumber: number,
  previousWords: string[] = [],
  previousSentence: string = ''
): Promise<FormulaResult> {
  const words = extractWords(sentence);
  
  const systemPrompt = `You are assessing a simple sentence for a children's writing exercise.

TASK: Check if the sentence has the correct structure for Formula 1: subject + verb (exactly 2 words).

EXAMPLES OF CORRECT SENTENCES:
- "Birds fly" ✓ (birds=subject, fly=verb)
- "Fish swims" ✓ (fish=subject, swims=verb)
- "Frog jumps" ✓ (frog=subject, jumps=verb)
- "Dog runs" ✓ (dog=subject, runs=verb)
- "Cat sleeps" ✓ (cat=subject, sleeps=verb)

COMMON VERBS TO RECOGNIZE: fly, flies, swim, swims, run, runs, jump, jumps, walk, walks, eat, eats, sleep, sleeps, sing, sings, dance, dances, play, plays, bark, barks, hop, hops, crawl, crawls, glide, glides

ACCEPT IF:
- Has 2 words
- First word is a noun (the subject)
- Second word is a verb (action word)
- Accept any plural form: "birds fly" is correct if subject is "bird"

REJECT ONLY IF:
- Not 2 words
- Starts with "the", "a", or "an"
- Second word is clearly NOT a verb

Return JSON: {"correct": true/false, "score": 0-100, "feedback": "encouraging message", "suggestions": null or ["hint"]}`;

  const userPrompt = `Assess this sentence:

Subject chosen: "${subject}"
Formula ${formulaNumber}: ${formulaStructure}
${previousSentence ? `Previous sentence: "${previousSentence}"` : ''}
Pupil's sentence: "${sentence}"

Does this sentence follow the formula structure? Remember to be lenient on word forms and minor errors.`;

  if (formulaNumber > 1) {
    return evaluateSentence(sentence, formulaStructure, subject, formulaNumber, previousWords, previousSentence);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 300,
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('No AI response');
    }

    const aiResult = JSON.parse(responseText);
    
    const savedWords = words.map(w => w.replace(/[,.]$/, ''));
    const sentenceClean = savedWords.join(' ');
    
    return {
      correct: aiResult.correct === true,
      feedback: aiResult.feedback || (aiResult.correct ? 'Well done!' : 'Try again.'),
      score: typeof aiResult.score === 'number' ? aiResult.score : (aiResult.correct ? 100 : 50),
      suggestions: aiResult.suggestions || undefined,
      words_saved: aiResult.correct ? savedWords : previousWords,
      previous_sentence: aiResult.correct ? sentenceClean : previousSentence,
      repetition_count: aiResult.correct ? { [subject]: formulaNumber } : undefined
    };
  } catch (error) {
    console.error('AI validation error, falling back to rule-based:', error);
    return evaluateSentence(sentence, formulaStructure, subject, formulaNumber, previousWords, previousSentence);
  }
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

    console.log('PWP Submit received:', {
      pupil_sentence,
      subject,
      formula_number,
      sentenceLength: pupil_sentence?.length,
      words: extractWords(pupil_sentence || ''),
      wordsCount: extractWords(pupil_sentence || '').length
    });

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
