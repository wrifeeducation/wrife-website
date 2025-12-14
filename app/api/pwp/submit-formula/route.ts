import { NextRequest, NextResponse } from 'next/server';

interface FormulaResult {
  correct: boolean;
  feedback: string;
  score: number;
  suggestions?: string[];
}

const WORD_TYPES = {
  determiners: ['the', 'a', 'an', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'their'],
  adjectives: ['happy', 'big', 'small', 'fast', 'slow', 'brave', 'playful', 'red', 'blue', 'green', 'yellow', 'beautiful', 'tall', 'short', 'young', 'old', 'new', 'good', 'bad', 'great', 'little', 'large', 'tiny', 'huge', 'bright', 'dark', 'soft', 'hard', 'warm', 'cold', 'hot', 'cool', 'sweet', 'sour', 'loud', 'quiet', 'gentle', 'kind', 'clever', 'silly', 'funny', 'sad', 'angry', 'scared', 'excited', 'tired', 'hungry', 'thirsty', 'full', 'empty'],
  verbs: ['runs', 'run', 'jumps', 'jump', 'sleeps', 'sleep', 'eats', 'eat', 'plays', 'play', 'swims', 'swim', 'flies', 'fly', 'walks', 'walk', 'chases', 'chase', 'finds', 'find', 'sees', 'see', 'likes', 'like', 'catches', 'catch', 'sits', 'sit', 'stands', 'stand', 'climbs', 'climb', 'reads', 'read', 'writes', 'write', 'sings', 'sing', 'dances', 'dance', 'laughs', 'laugh', 'cries', 'cry', 'smiles', 'smile', 'talks', 'talk', 'listens', 'listen', 'helps', 'help', 'makes', 'make', 'takes', 'take', 'gives', 'give', 'goes', 'go', 'comes', 'come', 'is', 'are', 'was', 'were', 'has', 'have', 'had'],
  adverbs: ['quickly', 'slowly', 'happily', 'sadly', 'loudly', 'quietly', 'always', 'never', 'often', 'sometimes', 'usually', 'rarely', 'here', 'there', 'everywhere', 'nowhere', 'now', 'then', 'soon', 'later', 'yesterday', 'today', 'tomorrow', 'very', 'really', 'quite', 'almost', 'nearly', 'just', 'only', 'also', 'too', 'well', 'badly', 'carefully', 'carelessly', 'easily', 'hardly', 'finally', 'suddenly', 'gently', 'kindly']
};

function analyzeWord(word: string): string {
  const lower = word.toLowerCase();
  if (WORD_TYPES.determiners.includes(lower)) return 'determiner';
  if (WORD_TYPES.adjectives.includes(lower)) return 'adjective';
  if (WORD_TYPES.verbs.includes(lower)) return 'verb';
  if (WORD_TYPES.adverbs.includes(lower)) return 'adverb';
  return 'noun';
}

function evaluateSentence(sentence: string, formulaStructure: string): FormulaResult {
  const words = sentence.trim().replace(/[.!?]$/, '').split(/\s+/).filter(w => w);
  
  if (words.length < 2) {
    return {
      correct: false,
      feedback: 'Your sentence needs at least two words. Try adding more!',
      score: 20,
      suggestions: ['Add a verb to show what happens', 'Make sure you have a subject and an action']
    };
  }

  const hasVerb = words.some(w => WORD_TYPES.verbs.includes(w.toLowerCase()));
  if (!hasVerb) {
    return {
      correct: false,
      feedback: 'Good start! But your sentence needs a verb - a doing word like "runs" or "plays".',
      score: 40,
      suggestions: ['Add a verb like "runs", "jumps", or "plays"']
    };
  }

  const structure = formulaStructure.toLowerCase();
  let score = 60;
  const feedback: string[] = [];

  if (structure.includes('det') && words.some(w => WORD_TYPES.determiners.includes(w.toLowerCase()))) {
    score += 10;
  } else if (structure.includes('det')) {
    feedback.push('Try starting with "The" or "A"');
  }

  if (structure.includes('adj') && words.some(w => WORD_TYPES.adjectives.includes(w.toLowerCase()))) {
    score += 10;
  } else if (structure.includes('adj')) {
    feedback.push('Add a describing word like "happy" or "big"');
  }

  if (structure.includes('adv') && words.some(w => WORD_TYPES.adverbs.includes(w.toLowerCase()))) {
    score += 10;
  } else if (structure.includes('adv')) {
    feedback.push('Add a word that tells how, like "quickly" or "happily"');
  }

  const endsWithPunctuation = /[.!?]$/.test(sentence.trim());
  const startsWithCapital = /^[A-Z]/.test(sentence.trim());
  
  if (endsWithPunctuation) score += 5;
  if (startsWithCapital) score += 5;

  if (score >= 90) {
    return {
      correct: true,
      feedback: 'Excellent work! Your sentence follows the formula perfectly!',
      score: Math.min(100, score)
    };
  } else if (score >= 70) {
    return {
      correct: true,
      feedback: 'Great job! Your sentence is well-structured.',
      score,
      suggestions: feedback.length > 0 ? feedback : undefined
    };
  } else {
    return {
      correct: false,
      feedback: 'Good effort! Try to include all the parts of the formula.',
      score,
      suggestions: feedback
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session_id, formula_number, pupil_sentence, formula_structure } = await request.json();

    if (!session_id || formula_number === undefined || !pupil_sentence) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = evaluateSentence(pupil_sentence, formula_structure || 'N + V');

    return NextResponse.json({
      session_id,
      formula_number,
      ...result
    });

  } catch (error) {
    console.error('Submit formula error:', error);
    return NextResponse.json({ error: 'Failed to evaluate formula' }, { status: 500 });
  }
}
