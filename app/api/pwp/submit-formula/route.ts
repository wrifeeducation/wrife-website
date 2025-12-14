import { NextRequest, NextResponse } from 'next/server';

interface FormulaResult {
  correct: boolean;
  feedback: string;
  score: number;
  suggestions?: string[];
  words_saved: string[];
  repetition_count?: Record<string, number>;
}

const WORD_TYPES = {
  determiners: ['the', 'a', 'an', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'their'],
  adjectives: ['happy', 'big', 'small', 'fast', 'slow', 'brave', 'playful', 'red', 'blue', 'green', 'yellow', 'beautiful', 'tall', 'short', 'young', 'old', 'new', 'good', 'bad', 'great', 'little', 'large', 'tiny', 'huge', 'bright', 'dark', 'soft', 'hard', 'warm', 'cold', 'hot', 'cool', 'sweet', 'sour', 'loud', 'quiet', 'gentle', 'kind', 'clever', 'silly', 'funny', 'sad', 'angry', 'scared', 'excited', 'tired', 'hungry', 'thirsty', 'full', 'empty', 'peaceful', 'busy', 'early', 'late'],
  verbs: ['runs', 'run', 'jumps', 'jump', 'sleeps', 'sleep', 'eats', 'eat', 'plays', 'play', 'swims', 'swim', 'flies', 'fly', 'walks', 'walk', 'chases', 'chase', 'finds', 'find', 'sees', 'see', 'likes', 'like', 'catches', 'catch', 'sits', 'sit', 'stands', 'stand', 'climbs', 'climb', 'reads', 'read', 'writes', 'write', 'sings', 'sing', 'dances', 'dance', 'laughs', 'laugh', 'cries', 'cry', 'smiles', 'smile', 'talks', 'talk', 'listens', 'listen', 'helps', 'help', 'makes', 'make', 'takes', 'take', 'gives', 'give', 'goes', 'go', 'comes', 'come', 'is', 'are', 'was', 'were', 'has', 'have', 'had', 'opens', 'open', 'closes', 'close', 'welcomes', 'welcome', 'holds', 'hold', 'contains', 'contain', 'waits', 'wait', 'barks', 'bark'],
  adverbs: ['quickly', 'slowly', 'happily', 'sadly', 'loudly', 'quietly', 'always', 'never', 'often', 'sometimes', 'usually', 'rarely', 'here', 'there', 'everywhere', 'nowhere', 'now', 'then', 'soon', 'later', 'yesterday', 'today', 'tomorrow', 'very', 'really', 'quite', 'almost', 'nearly', 'just', 'only', 'also', 'too', 'well', 'badly', 'carefully', 'carelessly', 'easily', 'hardly', 'finally', 'suddenly', 'gently', 'kindly', 'softly'],
  prepositions: ['in', 'on', 'at', 'to', 'for', 'from', 'with', 'by', 'near', 'through', 'during', 'after', 'before', 'under', 'over', 'between', 'behind', 'beside', 'above', 'below'],
  time_starters: ['every', 'each', 'on', 'in', 'during', 'after', 'before']
};

function getWordType(word: string): string {
  const lower = word.toLowerCase().replace(/[,.]$/, '');
  if (WORD_TYPES.determiners.includes(lower)) return 'determiner';
  if (WORD_TYPES.adjectives.includes(lower)) return 'adjective';
  if (WORD_TYPES.verbs.includes(lower)) return 'verb';
  if (WORD_TYPES.adverbs.includes(lower)) return 'adverb';
  if (WORD_TYPES.prepositions.includes(lower)) return 'preposition';
  return 'noun';
}

function extractWords(sentence: string): string[] {
  return sentence.trim().replace(/[.!?]$/, '').split(/\s+/).filter(w => w);
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
      words_saved: []
    };
  }

  if (WORD_TYPES.determiners.includes(firstWordLower)) {
    return {
      correct: false,
      feedback: 'Formula 1 should NOT start with a determiner like "The" or "A". Start directly with your subject.',
      score: 30,
      suggestions: [`Remove "${words[0]}" and start with "${subject}" directly`],
      words_saved: []
    };
  }

  if (firstWordLower !== subjectLower) {
    return {
      correct: false,
      feedback: `Your sentence should start with your chosen subject: "${subject}"`,
      score: 40,
      suggestions: [`Start with "${subject}"`],
      words_saved: []
    };
  }

  const secondWord = words[1]?.toLowerCase();
  if (!WORD_TYPES.verbs.includes(secondWord)) {
    return {
      correct: false,
      feedback: `"${words[1]}" doesn't appear to be a verb. The second word needs to be an action word.`,
      score: 50,
      suggestions: ['Use a verb like "opens", "sits", "runs", "walks"'],
      words_saved: []
    };
  }

  return {
    correct: true,
    feedback: `Perfect! "${words.join(' ')}" uses the formula correctly.`,
    score: 100,
    words_saved: words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
  };
}

function validateFormula2(words: string[], subject: string, previousWords: string[]): FormulaResult {
  const subjectLower = subject.toLowerCase();
  
  if (words.length !== 3) {
    return {
      correct: false,
      feedback: 'Formula 2 needs exactly 3 words: subject + adverb + verb.',
      score: 40,
      suggestions: [`Rewrite as: "${subject} [adverb] [verb]" - for example: "${subject} quietly opens"`],
      words_saved: previousWords
    };
  }

  const firstWordLower = words[0]?.toLowerCase();
  if (WORD_TYPES.determiners.includes(firstWordLower)) {
    return {
      correct: false,
      feedback: 'Formula 2 should NOT start with a determiner. Start with your subject.',
      score: 30,
      suggestions: [`Remove "${words[0]}" and start with "${subject}"`],
      words_saved: previousWords
    };
  }

  if (firstWordLower !== subjectLower) {
    return {
      correct: false,
      feedback: `Start with your subject "${subject}" then add an adverb, then your verb.`,
      score: 40,
      suggestions: [`Structure: ${subject} + [adverb] + [verb]`],
      words_saved: previousWords
    };
  }

  const secondWord = words[1]?.toLowerCase();
  if (!WORD_TYPES.adverbs.includes(secondWord)) {
    return {
      correct: false,
      feedback: `"${words[1]}" should be an adverb. Adverbs describe HOW the action happens.`,
      score: 50,
      suggestions: ['Use an adverb like "quietly", "slowly", "quickly", "gently"'],
      words_saved: previousWords
    };
  }

  const thirdWord = words[2]?.toLowerCase();
  if (!WORD_TYPES.verbs.includes(thirdWord)) {
    return {
      correct: false,
      feedback: `"${words[2]}" should be a verb. End with an action word.`,
      score: 60,
      suggestions: ['End with a verb like "opens", "sits", "runs"'],
      words_saved: previousWords
    };
  }

  return {
    correct: true,
    feedback: `Excellent! You've REWRITTEN your sentence with the adverb.`,
    score: 100,
    words_saved: words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()),
    repetition_count: {
      [subject]: 2,
      [words[2]]: 2
    }
  };
}

function validateGenericFormula(
  words: string[],
  formulaStructure: string,
  subject: string,
  previousWords: string[],
  formulaNumber: number
): FormulaResult {
  const structure = formulaStructure.toLowerCase();
  
  if (words.length < 2) {
    return {
      correct: false,
      feedback: 'Your sentence needs more words. Look at the formula structure.',
      score: 30,
      suggestions: ['Follow the formula pattern shown above'],
      words_saved: previousWords
    };
  }

  const hasVerb = words.some(w => WORD_TYPES.verbs.includes(w.toLowerCase()));
  if (!hasVerb) {
    return {
      correct: false,
      feedback: 'Your sentence needs a verb - an action word.',
      score: 40,
      suggestions: ['Add a verb like "opens", "sits", "runs", "walks"'],
      words_saved: previousWords
    };
  }

  const firstWordLower = words[0]?.toLowerCase().replace(',', '');
  const requiresDeterminerAtStart = structure.startsWith('determiner') || 
    structure.startsWith('det +') ||
    structure.startsWith('det+');
  const requiresTimePhrase = structure.includes('time phrase');
  const requiresFrontedAdverbial = structure.includes('fronted adverbial');

  if (!requiresDeterminerAtStart && !requiresTimePhrase && !requiresFrontedAdverbial) {
    if (WORD_TYPES.determiners.includes(firstWordLower)) {
      return {
        correct: false,
        feedback: `This formula doesn't start with a determiner. Check the structure.`,
        score: 40,
        suggestions: ['Look at the formula pattern - it may start with the subject directly'],
        words_saved: previousWords
      };
    }
  }

  if (requiresDeterminerAtStart && !WORD_TYPES.determiners.includes(firstWordLower)) {
    return {
      correct: false,
      feedback: 'This formula needs to start with a determiner like "The" or "A".',
      score: 50,
      suggestions: ['Start with "The" or "A"'],
      words_saved: previousWords
    };
  }

  let score = 70;
  const feedback: string[] = [];

  if (structure.includes('adverb') && words.some(w => WORD_TYPES.adverbs.includes(w.toLowerCase()))) {
    score += 10;
  } else if (structure.includes('adverb')) {
    feedback.push('Include an adverb like "quietly" or "slowly"');
  }

  if (structure.includes('adjective') && words.some(w => WORD_TYPES.adjectives.includes(w.toLowerCase()))) {
    score += 10;
  } else if (structure.includes('adjective')) {
    feedback.push('Include an adjective like "old" or "peaceful"');
  }

  if (structure.includes('prepositional phrase') || structure.includes('prep')) {
    const hasPreposition = words.some(w => WORD_TYPES.prepositions.includes(w.toLowerCase()));
    if (hasPreposition) {
      score += 10;
    } else {
      feedback.push('Add a prepositional phrase like "in the morning" or "near the park"');
    }
  }

  if (score >= 85) {
    return {
      correct: true,
      feedback: `Perfect! You REWROTE the complete sentence with the new element!`,
      score: Math.min(100, score),
      words_saved: words.map(w => w.replace(/[.,]$/, '')),
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
      words_saved: words.map(w => w.replace(/[.,]$/, ''))
    };
  } else {
    return {
      correct: false,
      feedback: 'Almost there! Check the formula structure and try again.',
      score,
      suggestions: feedback,
      words_saved: previousWords
    };
  }
}

function evaluateSentence(
  sentence: string,
  formulaStructure: string,
  subject: string,
  formulaNumber: number,
  previousWords: string[] = []
): FormulaResult {
  const words = extractWords(sentence);

  if (formulaNumber === 1) {
    return validateFormula1(words, subject);
  }

  if (formulaNumber === 2) {
    return validateFormula2(words, subject, previousWords);
  }

  return validateGenericFormula(words, formulaStructure, subject, previousWords, formulaNumber);
}

export async function POST(request: NextRequest) {
  try {
    const { 
      session_id, 
      formula_number, 
      pupil_sentence, 
      formula_structure,
      subject,
      previous_words = []
    } = await request.json();

    if (!session_id || formula_number === undefined || !pupil_sentence) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = evaluateSentence(
      pupil_sentence, 
      formula_structure || 'subject + verb', 
      subject || '',
      formula_number,
      previous_words
    );

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
