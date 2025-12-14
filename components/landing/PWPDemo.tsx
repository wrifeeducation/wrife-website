"use client";

import { useState, useMemo } from 'react';

interface FormulaStep {
  formulaNumber: number;
  structure: string;
  structureParts: { label: string; color: string }[];
  exampleParts: { label: string; word: string; color: string }[];
  newElementLabel: string;
  newElementHint: string;
  minWords: number;
  validateFn: (words: string[], previousWords: string[]) => { valid: boolean; hint?: string };
}

const createFormulas = (): FormulaStep[] => [
  {
    formulaNumber: 1,
    structure: "subject + verb",
    structureParts: [
      { label: "Subject", color: "bg-blue-500" },
      { label: "Verb", color: "bg-green-500" },
    ],
    exampleParts: [
      { label: "Subject", word: "Park", color: "bg-blue-500" },
      { label: "Verb", word: "sits", color: "bg-green-500" },
    ],
    newElementLabel: "Complete Sentence",
    newElementHint: "Type any subject + verb (e.g., Dog runs, Mary dances, Library opens)",
    minWords: 2,
    validateFn: (words) => {
      if (words.length < 2) return { valid: false, hint: "Your sentence needs at least 2 words: a subject and a verb" };
      if (words.length > 3) return { valid: false, hint: "Keep it simple for Formula 1 - just subject + verb" };
      return { valid: true };
    }
  },
  {
    formulaNumber: 2,
    structure: "subject + adverb + verb",
    structureParts: [
      { label: "Subject", color: "bg-blue-500" },
      { label: "Adverb", color: "bg-amber-500" },
      { label: "Verb", color: "bg-green-500" },
    ],
    exampleParts: [
      { label: "Subject", word: "Park", color: "bg-blue-500" },
      { label: "Adverb", word: "quietly", color: "bg-amber-500" },
      { label: "Verb", word: "sits", color: "bg-green-500" },
    ],
    newElementLabel: "Adverb",
    newElementHint: "Add an adverb (how it happens): quietly, slowly, quickly, happily...",
    minWords: 3,
    validateFn: (words, prevWords) => {
      if (words.length < 3) return { valid: false, hint: "Add an adverb between your subject and verb" };
      const cleanWord = (w: string) => w.toLowerCase().replace(/[,.:;!?]/g, '');
      const hasAdverb = words.some(w => {
        const clean = cleanWord(w);
        return clean.endsWith('ly') || ['fast', 'hard', 'well', 'early', 'daily'].includes(clean);
      });
      if (!hasAdverb) return { valid: false, hint: "Add an adverb (often ends in -ly) to describe HOW the action happens" };
      return { valid: true };
    }
  },
  {
    formulaNumber: 3,
    structure: "subject + adverb + verb + prep phrase",
    structureParts: [
      { label: "Subject", color: "bg-blue-500" },
      { label: "Adverb", color: "bg-amber-500" },
      { label: "Verb", color: "bg-green-500" },
      { label: "Prep Phrase", color: "bg-purple-500" },
    ],
    exampleParts: [
      { label: "Subject", word: "Park", color: "bg-blue-500" },
      { label: "Adverb", word: "quietly", color: "bg-amber-500" },
      { label: "Verb", word: "sits", color: "bg-green-500" },
      { label: "Prep Phrase", word: "in the town", color: "bg-purple-500" },
    ],
    newElementLabel: "Prepositional Phrase",
    newElementHint: "Add where/when: in the morning, at school, by the river...",
    minWords: 5,
    validateFn: (words, prevWords) => {
      if (words.length < 5) return { valid: false, hint: "Add a prepositional phrase (where or when) at the end" };
      const cleanWord = (w: string) => w.toLowerCase().replace(/[,.:;!?]/g, '');
      const preps = ['in', 'at', 'on', 'by', 'for', 'to', 'with', 'from', 'under', 'over', 'through', 'during', 'before', 'after'];
      const hasPrep = words.some(w => preps.includes(cleanWord(w)));
      if (!hasPrep) return { valid: false, hint: "Add a prepositional phrase starting with: in, at, on, by, for, etc." };
      return { valid: true };
    }
  },
  {
    formulaNumber: 4,
    structure: "det + adj + subject + adverb + verb + prep phrase",
    structureParts: [
      { label: "Det", color: "bg-gray-500" },
      { label: "Adj", color: "bg-pink-500" },
      { label: "Subject", color: "bg-blue-500" },
      { label: "Adverb", color: "bg-amber-500" },
      { label: "Verb", color: "bg-green-500" },
      { label: "Prep Phrase", color: "bg-purple-500" },
    ],
    exampleParts: [
      { label: "Det", word: "The", color: "bg-gray-500" },
      { label: "Adj", word: "peaceful", color: "bg-pink-500" },
      { label: "Subject", word: "park", color: "bg-blue-500" },
      { label: "Adverb", word: "quietly", color: "bg-amber-500" },
      { label: "Verb", word: "sits", color: "bg-green-500" },
      { label: "Prep Phrase", word: "in the town", color: "bg-purple-500" },
    ],
    newElementLabel: "Determiner + Adjective",
    newElementHint: "Add 'The old', 'A quiet', 'My little' before your subject",
    minWords: 7,
    validateFn: (words, prevWords) => {
      if (words.length < 7) return { valid: false, hint: "Add a determiner and adjective before your subject" };
      const determiners = ['the', 'a', 'an', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that'];
      const functionWords = ['the', 'a', 'an', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that', 'in', 'at', 'on', 'by', 'for', 'to', 'with', 'from', 'under', 'over', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being'];
      const cleanWord = (w: string) => w.toLowerCase().replace(/[,.:;!?]/g, '');
      const firstWord = cleanWord(words[0]);
      if (!determiners.includes(firstWord)) {
        return { valid: false, hint: "Start with a determiner: the, a, my, our..." };
      }
      const secondWord = cleanWord(words[1] || '');
      if (!secondWord || functionWords.includes(secondWord) || secondWord.length < 2) {
        return { valid: false, hint: "Add an adjective after the determiner: 'The OLD park', 'A QUIET library'..." };
      }
      return { valid: true };
    }
  },
  {
    formulaNumber: 5,
    structure: "time phrase + det + adj + subject + adverb + verb + prep phrase",
    structureParts: [
      { label: "Time", color: "bg-orange-500" },
      { label: "Det", color: "bg-gray-500" },
      { label: "Adj", color: "bg-pink-500" },
      { label: "Subject", color: "bg-blue-500" },
      { label: "Adverb", color: "bg-amber-500" },
      { label: "Verb", color: "bg-green-500" },
      { label: "Prep Phrase", color: "bg-purple-500" },
    ],
    exampleParts: [
      { label: "Time", word: "Every day,", color: "bg-orange-500" },
      { label: "Det", word: "the", color: "bg-gray-500" },
      { label: "Adj", word: "peaceful", color: "bg-pink-500" },
      { label: "Subject", word: "park", color: "bg-blue-500" },
      { label: "Adverb", word: "quietly", color: "bg-amber-500" },
      { label: "Verb", word: "sits", color: "bg-green-500" },
      { label: "Prep Phrase", word: "in the town", color: "bg-purple-500" },
    ],
    newElementLabel: "Time Phrase",
    newElementHint: "Add when: Every morning, Yesterday, On weekdays...",
    minWords: 9,
    validateFn: (words, prevWords) => {
      if (words.length < 9) return { valid: false, hint: "Add a time phrase at the beginning" };
      const cleanWord = (w: string) => w.toLowerCase().replace(/[,.:;!?]/g, '');
      const timeWords = ['every', 'yesterday', 'today', 'tomorrow', 'always', 'sometimes', 'never', 'often', 'usually', 'on', 'in', 'at', 'during', 'before', 'after'];
      const hasTimePhrase = timeWords.includes(cleanWord(words[0]));
      if (!hasTimePhrase) {
        return { valid: false, hint: "Start with a time phrase: Every morning, Yesterday, On weekdays..." };
      }
      return { valid: true };
    }
  },
  {
    formulaNumber: 6,
    structure: "time phrase + det + adj + subject + adverb + verb + enhanced prep phrase",
    structureParts: [
      { label: "Time", color: "bg-orange-500" },
      { label: "Det", color: "bg-gray-500" },
      { label: "Adj", color: "bg-pink-500" },
      { label: "Subject", color: "bg-blue-500" },
      { label: "Adverb", color: "bg-amber-500" },
      { label: "Verb", color: "bg-green-500" },
      { label: "Enhanced Prep", color: "bg-teal-500" },
    ],
    exampleParts: [
      { label: "Time", word: "Every day,", color: "bg-orange-500" },
      { label: "Det", word: "the", color: "bg-gray-500" },
      { label: "Adj", word: "peaceful", color: "bg-pink-500" },
      { label: "Subject", word: "park", color: "bg-blue-500" },
      { label: "Adverb", word: "quietly", color: "bg-amber-500" },
      { label: "Verb", word: "sits", color: "bg-green-500" },
      { label: "Enhanced Prep", word: "in the sunny town", color: "bg-teal-500" },
    ],
    newElementLabel: "Enhanced Ending",
    newElementHint: "Add an adjective to your ending: 'in the EARLY morning', 'at the BUSY school'",
    minWords: 10,
    validateFn: (words, prevWords) => {
      if (words.length < 10) return { valid: false, hint: "Add an adjective to enhance your ending" };
      const preps = ['in', 'at', 'on', 'by', 'for', 'to', 'with', 'from', 'under', 'over', 'through', 'during', 'before', 'after'];
      const functionWords = ['the', 'a', 'an', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that', 'in', 'at', 'on', 'by', 'for', 'to', 'with', 'from', 'under', 'over', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being'];
      const cleanWord = (w: string) => w.toLowerCase().replace(/[,.:;!?]/g, '');
      let lastPrepIndex = -1;
      for (let i = words.length - 1; i >= 0; i--) {
        if (preps.includes(cleanWord(words[i]))) {
          lastPrepIndex = i;
          break;
        }
      }
      if (lastPrepIndex === -1) {
        return { valid: false, hint: "Include a prepositional phrase at the end" };
      }
      const endingWords = words.slice(lastPrepIndex).map(w => cleanWord(w));
      if (endingWords.length < 3) {
        return { valid: false, hint: "Your ending needs more detail - add 'in the SUNNY town' style phrase" };
      }
      const hasDescriptiveWord = endingWords.some(w => w.length >= 3 && !functionWords.includes(w) && !preps.includes(w));
      if (!hasDescriptiveWord) {
        return { valid: false, hint: "Add a descriptive word in your ending: 'in the SUNNY town', 'at the BUSY school'" };
      }
      return { valid: true };
    }
  },
];

export default function PWPDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState<'subject' | 'practice' | 'paragraph'>('subject');
  const [userSubject, setUserSubject] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [builtSentence, setBuiltSentence] = useState<string[]>([]);
  const [previousWords, setPreviousWords] = useState<string[]>([]);
  const [typedNewWord, setTypedNewWord] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [wordWriteCounts, setWordWriteCounts] = useState<Record<string, number>>({});
  const [completedSentences, setCompletedSentences] = useState<string[]>([]);

  const formulas = useMemo(() => createFormulas(), []);
  const step = formulas[currentStep];
  const isFirstFormula = currentStep === 0;

  const wordCountProgression = useMemo(() => {
    return completedSentences.map(s => s.split(/\s+/).length);
  }, [completedSentences]);

  const handleWordClick = (word: string, wordIndex: number) => {
    let usedCount = 0;
    const targetCount = previousWords.filter((w, i) => i <= wordIndex && w === word).length;
    for (const w of builtSentence) {
      if (w === word) usedCount++;
      if (usedCount >= targetCount) return;
    }
    setBuiltSentence([...builtSentence, word]);
  };

  const isWordUsed = (word: string, wordIndex: number) => {
    let usedCount = 0;
    const targetCount = previousWords.filter((w, i) => i <= wordIndex && w === word).length;
    for (const w of builtSentence) {
      if (w === word) {
        usedCount++;
        if (usedCount >= targetCount) return true;
      }
    }
    return false;
  };

  const handleRemoveWord = (index: number) => {
    setBuiltSentence(builtSentence.filter((_, i) => i !== index));
  };

  const handleTypeSubmit = () => {
    if (typedNewWord.trim()) {
      const words = typedNewWord.trim().split(/\s+/);
      setBuiltSentence([...builtSentence, ...words]);
      setTypedNewWord('');
    }
  };

  const checkSentence = () => {
    const result = step.validateFn(builtSentence, previousWords);
    
    if (result.valid) {
      setShowSuccess(true);
      setFeedback({ type: 'success', message: 'Excellent! Your sentence follows the formula correctly!' });
      
      const newCounts = { ...wordWriteCounts };
      builtSentence.forEach(word => {
        const normalizedWord = word.toLowerCase().replace(/[,.]$/, '');
        newCounts[normalizedWord] = (newCounts[normalizedWord] || 0) + 1;
      });
      setWordWriteCounts(newCounts);
      
      const completedSentence = builtSentence.join(' ');
      setCompletedSentences([...completedSentences, completedSentence]);
      
      setTimeout(() => {
        if (currentStep < formulas.length - 1) {
          setPreviousWords([...builtSentence]);
          setCurrentStep(currentStep + 1);
          setBuiltSentence([]);
          setTypedNewWord('');
          setShowSuccess(false);
          setFeedback(null);
        } else {
          setPhase('paragraph');
        }
      }, 1800);
    } else {
      setFeedback({ type: 'error', message: result.hint || 'Try again!' });
    }
  };

  const resetSentence = () => {
    setBuiltSentence([]);
    setTypedNewWord('');
    setShowSuccess(false);
    setFeedback(null);
  };

  const resetDemo = () => {
    setPhase('subject');
    setUserSubject('');
    setCurrentStep(0);
    setBuiltSentence([]);
    setPreviousWords([]);
    setTypedNewWord('');
    setShowSuccess(false);
    setFeedback(null);
    setWordWriteCounts({});
    setCompletedSentences([]);
  };

  const startPractice = () => {
    if (userSubject.trim()) {
      setPhase('practice');
    }
  };

  const getTopRepeatedWords = () => {
    return Object.entries(wordWriteCounts)
      .filter(([word]) => word.length > 2 && !['the', 'in', 'a', 'an', 'at', 'on', 'by'].includes(word))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  return (
    <>
      <div 
        className="bg-white rounded-2xl overflow-hidden shadow-lg border border-[var(--wrife-border)] hover:shadow-xl transition-all cursor-pointer group"
        onClick={() => { setIsOpen(true); resetDemo(); }}
      >
        <div className="relative h-48 bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 text-center text-white">
            <div className="text-5xl mb-2">🧩</div>
            <div className="text-sm font-medium opacity-90">Build Sentences Step-by-Step</div>
          </div>
          <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium">
            Interactive
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2 group-hover:text-purple-600 transition-colors">
            Progressive Writing Practice
          </h3>
          <p className="text-sm text-[var(--wrife-text-muted)] mb-3">
            Choose your own subject and watch your sentence evolve from 2 words to 10+ words.
          </p>
          <div className="flex items-center gap-2 text-purple-600 text-sm font-medium">
            <span>Try Sentence Evolution</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
          <div 
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
              <div>
                <h2 className="text-xl font-bold">PWP Demo: Sentence Evolution</h2>
                <p className="text-sm opacity-90">
                  {phase === 'subject' ? 'Choose Your Subject' : 
                   phase === 'paragraph' ? 'Paragraph Challenge!' :
                   `Formula ${currentStep + 1} of ${formulas.length}`}
                </p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto max-h-[calc(90vh-72px)]">
              {phase === 'subject' && (
                <div className="space-y-5">
                  <div className="text-center">
                    <div className="text-4xl mb-3">✏️</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">First, Choose Your Subject</h3>
                    <p className="text-gray-600">Pick any person, animal, place, or thing to write about.</p>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <label className="block text-sm font-semibold text-purple-700 mb-2">
                      Type your subject:
                    </label>
                    <input
                      type="text"
                      value={userSubject}
                      onChange={(e) => setUserSubject(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && startPractice()}
                      placeholder="e.g., Dog, Library, Maria, Car..."
                      className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
                      autoFocus
                    />
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Need ideas?</p>
                    <div className="flex flex-wrap gap-2">
                      {['Dog', 'Library', 'Maria', 'Park', 'Ben', 'School', 'Bird', 'Castle'].map(idea => (
                        <button
                          key={idea}
                          onClick={() => setUserSubject(idea)}
                          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm hover:bg-purple-50 hover:border-purple-300 transition-colors"
                        >
                          {idea}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={startPractice}
                    disabled={!userSubject.trim()}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                      userSubject.trim()
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Start PWP Practice →
                  </button>
                </div>
              )}

              {phase === 'paragraph' && (
                <div className="space-y-5">
                  <div className="p-4 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl border-2 border-purple-300">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">🎓</span>
                      <h3 className="text-lg font-bold text-purple-700">Paragraph Challenge!</h3>
                    </div>
                    <p className="text-gray-700 mb-4">
                      You've mastered the sentence! Now imagine expanding it into a paragraph.
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <span>What happened before this moment?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <span>What can you see, hear, or feel?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <span>What happens next?</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <p className="font-semibold text-green-700 mb-2">Your Final Sentence:</p>
                    <p className="text-lg text-green-800 italic">
                      "{completedSentences[completedSentences.length - 1]}."
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="font-semibold text-blue-700 mb-2">📈 Sentence Evolution:</p>
                    <div className="space-y-1">
                      {completedSentences.map((sentence, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">{i + 1}</span>
                          <span className="text-gray-700 truncate">{sentence}</span>
                          <span className="text-xs text-gray-400 whitespace-nowrap">({sentence.split(/\s+/).length} words)</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {Object.keys(wordWriteCounts).length > 0 && (
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <p className="font-semibold text-amber-700 mb-2">📊 Word Practice Stats:</p>
                      <div className="flex flex-wrap gap-2">
                        {getTopRepeatedWords().map(([word, count]) => (
                          <span key={word} className="px-3 py-1 bg-amber-100 rounded-full text-sm">
                            <span className="font-medium text-amber-800">{word}</span>
                            <span className="text-amber-600 ml-1">×{count}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={resetDemo}
                    className="w-full py-3 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Try Again with Different Subject
                  </button>
                </div>
              )}

              {phase === 'practice' && (
                <>
                  {wordCountProgression.length > 0 && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Word Count Growth:</p>
                      <div className="flex items-center gap-1 flex-wrap">
                        {wordCountProgression.map((count, i) => (
                          <div key={i} className="flex items-center">
                            <span className="px-2 py-1 rounded text-sm font-bold bg-green-500 text-white">
                              {count}
                            </span>
                            <span className="mx-1 text-lg text-green-500">→</span>
                          </div>
                        ))}
                        <span className="px-2 py-1 rounded text-sm font-bold bg-purple-500 text-white ring-2 ring-purple-300">
                          {step.minWords}+
                        </span>
                        <span className="ml-2 text-xs text-gray-500">words</span>
                      </div>
                    </div>
                  )}

                  {completedSentences.length > 0 && (
                    <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                      <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">Sentence Evolution:</p>
                      <div className="space-y-1">
                        {completedSentences.map((sentence, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <span className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">{i + 1}</span>
                            <span className="text-gray-700">{sentence}</span>
                            <span className="text-xs text-gray-400">({sentence.split(/\s+/).length} words)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-4 mb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        FORMULA {step.formulaNumber}
                      </span>
                      <span className="text-sm text-gray-500">Your subject: <strong>{userSubject}</strong></span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-1.5 mb-4">
                      {step.structureParts.map((part, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className={`px-3 py-1.5 rounded-lg text-white font-bold text-sm ${part.color}`}>
                            {part.label}
                          </span>
                          {i < step.structureParts.length - 1 && (
                            <span className="text-xl font-bold text-gray-400">+</span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="bg-white/70 rounded-lg p-3 border border-indigo-100">
                      <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">Example:</p>
                      <div className="flex flex-wrap items-end gap-1.5">
                        {step.exampleParts.map((part, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <span className={`text-[10px] font-bold text-white px-1.5 py-0.5 rounded-t ${part.color}`}>
                              {part.label}
                            </span>
                            <span className={`px-2 py-1 rounded-b text-sm font-medium bg-white border-2 ${part.color.replace('bg-', 'border-').replace('-500', '-300')}`}>
                              {part.word}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {isFirstFormula ? (
                    <div className="mb-5">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-semibold text-gray-700">Type your complete sentence:</p>
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">
                          {step.newElementLabel}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{step.newElementHint}</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={typedNewWord}
                          onChange={(e) => setTypedNewWord(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setBuiltSentence(typedNewWord.trim().split(/\s+/));
                              setTypedNewWord('');
                            }
                          }}
                          placeholder={`e.g., ${userSubject} runs, ${userSubject} opens...`}
                          disabled={showSuccess}
                          className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none disabled:opacity-50"
                        />
                        <button
                          onClick={() => {
                            setBuiltSentence(typedNewWord.trim().split(/\s+/));
                            setTypedNewWord('');
                          }}
                          disabled={!typedNewWord.trim() || showSuccess}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          Your words from before <span className="text-gray-400 font-normal">(click each to add)</span>:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {previousWords.map((word, i) => {
                            const isUsed = isWordUsed(word, i);
                            return (
                              <button
                                key={`prev-${word}-${i}`}
                                onClick={() => handleWordClick(word, i)}
                                disabled={showSuccess || isUsed}
                                className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
                                  isUsed 
                                    ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed' 
                                    : 'bg-blue-100 text-blue-700 border-2 border-blue-300 hover:bg-blue-200 hover:shadow-md'
                                }`}
                              >
                                {word}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mb-5">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-sm font-semibold text-gray-700">Type the NEW element:</p>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${step.structureParts[0]?.color || 'bg-purple-500'}`}>
                            {step.newElementLabel}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{step.newElementHint}</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={typedNewWord}
                            onChange={(e) => setTypedNewWord(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleTypeSubmit()}
                            placeholder="Type new word(s)..."
                            disabled={showSuccess}
                            className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none disabled:opacity-50"
                          />
                          <button
                            onClick={handleTypeSubmit}
                            disabled={!typedNewWord.trim() || showSuccess}
                            className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="mb-5">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Your Sentence:</p>
                    <div className={`min-h-[60px] p-4 rounded-xl border-2 ${showSuccess ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'} flex flex-wrap items-center gap-2`}>
                      {builtSentence.length === 0 ? (
                        <span className="text-gray-400 italic">
                          {isFirstFormula ? 'Type your sentence above...' : 'Click previous words + type new element...'}
                        </span>
                      ) : (
                        <>
                          {builtSentence.map((word, i) => (
                            <span
                              key={i}
                              onClick={() => !showSuccess && handleRemoveWord(i)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                                previousWords.includes(word)
                                  ? 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-red-100 hover:text-red-700 hover:border-red-300'
                                  : 'bg-purple-100 text-purple-700 border border-purple-300 hover:bg-red-100 hover:text-red-700 hover:border-red-300'
                              }`}
                              title="Click to remove"
                            >
                              {word}
                            </span>
                          ))}
                          <span className="text-gray-600">.</span>
                        </>
                      )}
                    </div>
                    {builtSentence.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Current: {builtSentence.length} words
                        <span className="text-purple-600 ml-2">
                          (Target: {step.minWords}+ words)
                        </span>
                      </p>
                    )}
                  </div>

                  {feedback && (
                    <div className={`mb-5 p-4 rounded-xl text-center ${
                      feedback.type === 'success' 
                        ? 'bg-green-100 border border-green-300' 
                        : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                      <span className="text-2xl">{feedback.type === 'success' ? '🎉' : '💡'}</span>
                      <p className={`font-medium mt-1 ${
                        feedback.type === 'success' ? 'text-green-700' : 'text-yellow-700'
                      }`}>
                        {feedback.message}
                      </p>
                      {feedback.type === 'success' && currentStep < formulas.length - 1 && (
                        <p className="text-sm text-green-600 mt-1">Moving to next formula...</p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={resetSentence}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      onClick={checkSentence}
                      disabled={builtSentence.length === 0 || showSuccess}
                      className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Check Sentence
                    </button>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      {formulas.map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 flex-1 rounded-full transition-all ${
                            i < currentStep ? 'bg-green-500' : i === currentStep ? 'bg-purple-500' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-center text-gray-500 mt-2">
                      Progress: {currentStep + 1}/{formulas.length} formulas
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
