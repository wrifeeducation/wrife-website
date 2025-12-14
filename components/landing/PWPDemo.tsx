"use client";

import { useState, useMemo } from 'react';

interface FormulaStep {
  formulaNumber: number;
  structure: string;
  structureParts: { label: string; color: string }[];
  exampleParts: { label: string; word: string; color: string }[];
  previousWords: string[];
  newElement: { label: string; words: string[]; placeholder: string };
  targetSentence: string[];
}

const demoSession: FormulaStep[] = [
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
    previousWords: [],
    newElement: { label: "Complete Sentence", words: ["Library", "opens"], placeholder: "Type your sentence (e.g., Library opens)" },
    targetSentence: ["Library", "opens"],
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
    previousWords: ["Library", "opens"],
    newElement: { label: "Adverb", words: ["quietly"], placeholder: "Type an adverb (how it happens)" },
    targetSentence: ["Library", "quietly", "opens"],
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
    previousWords: ["Library", "quietly", "opens"],
    newElement: { label: "Prepositional Phrase", words: ["in", "the", "morning"], placeholder: "Type where/when (e.g., in the morning)" },
    targetSentence: ["Library", "quietly", "opens", "in", "the", "morning"],
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
    previousWords: ["Library", "quietly", "opens", "in", "the", "morning"],
    newElement: { label: "Determiner + Adjective", words: ["The", "old"], placeholder: "Type determiner + adjective (e.g., The old)" },
    targetSentence: ["The", "old", "Library", "quietly", "opens", "in", "the", "morning"],
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
    previousWords: ["The", "old", "Library", "quietly", "opens", "in", "the", "morning"],
    newElement: { label: "Time Phrase", words: ["Every", "weekday,"], placeholder: "Type a time phrase (e.g., Every weekday,)" },
    targetSentence: ["Every", "weekday,", "The", "old", "Library", "quietly", "opens", "in", "the", "morning"],
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
    previousWords: ["Every", "weekday,", "The", "old", "Library", "quietly", "opens", "in", "the", "morning"],
    newElement: { label: "Enhanced Adjective", words: ["early"], placeholder: "Add an adjective to morning (e.g., early)" },
    targetSentence: ["Every", "weekday,", "The", "old", "Library", "quietly", "opens", "in", "the", "early", "morning"],
  },
];

export default function PWPDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [builtSentence, setBuiltSentence] = useState<string[]>([]);
  const [typedNewWord, setTypedNewWord] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [wordWriteCounts, setWordWriteCounts] = useState<Record<string, number>>({});
  const [showParagraphPrompt, setShowParagraphPrompt] = useState(false);

  const step = demoSession[currentStep];
  const isFirstFormula = currentStep === 0;
  const isFinalStep = currentStep === demoSession.length - 1;

  const wordCountProgression = useMemo(() => {
    return demoSession.map(s => s.targetSentence.length);
  }, []);

  const handleWordClick = (word: string, wordIndex: number) => {
    const wordKey = `${word}-${wordIndex}`;
    const isUsed = builtSentence.some((w, i) => {
      const builtWordKey = `${w}-${step.previousWords.indexOf(w)}`;
      return builtWordKey === wordKey;
    });
    
    if (!isUsed) {
      setBuiltSentence([...builtSentence, word]);
    }
  };

  const isWordUsed = (word: string, wordIndex: number) => {
    let usedCount = 0;
    const targetCount = step.previousWords.filter((w, i) => i <= wordIndex && w === word).length;
    for (let i = 0; i < builtSentence.length; i++) {
      if (builtSentence[i] === word) {
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
    const userJoined = builtSentence.join(' ').toLowerCase().trim();
    const targetJoined = step.targetSentence.join(' ').toLowerCase().trim();
    
    const isCorrect = userJoined === targetJoined;
    
    if (isCorrect) {
      setShowSuccess(true);
      
      const newCounts = { ...wordWriteCounts };
      step.targetSentence.forEach(word => {
        const normalizedWord = word.toLowerCase().replace(/[,.]$/, '');
        newCounts[normalizedWord] = (newCounts[normalizedWord] || 0) + 1;
      });
      setWordWriteCounts(newCounts);
      
      setTimeout(() => {
        if (currentStep < demoSession.length - 1) {
          setCurrentStep(currentStep + 1);
          setBuiltSentence([]);
          setTypedNewWord('');
          setShowSuccess(false);
          setAttempts(0);
        } else {
          setShowParagraphPrompt(true);
        }
      }, 1800);
    } else {
      setAttempts(attempts + 1);
    }
  };

  const resetSentence = () => {
    setBuiltSentence([]);
    setTypedNewWord('');
    setShowSuccess(false);
    setAttempts(0);
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setBuiltSentence([]);
    setTypedNewWord('');
    setShowSuccess(false);
    setAttempts(0);
    setWordWriteCounts({});
    setShowParagraphPrompt(false);
  };

  const getWordCountForStep = (stepIndex: number) => {
    return demoSession[stepIndex].targetSentence.length;
  };

  const getTopRepeatedWords = () => {
    return Object.entries(wordWriteCounts)
      .filter(([word]) => !['the', 'in', 'a', 'an'].includes(word))
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
            Watch one sentence evolve from 2 words to 11+ words as you add grammatical elements step by step.
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
                  {showParagraphPrompt ? 'Bonus: Paragraph Challenge!' : `Formula ${currentStep + 1} of ${demoSession.length}`}
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
              {showParagraphPrompt ? (
                <div className="space-y-5">
                  <div className="p-4 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl border-2 border-purple-300">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">🎓</span>
                      <h3 className="text-lg font-bold text-purple-700">Paragraph Challenge!</h3>
                    </div>
                    <p className="text-gray-700 mb-4">
                      You've mastered the sentence! Now imagine expanding it into a paragraph. 
                      Think about these questions:
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <span>Who visits the old library in the early morning?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <span>What books are on the dusty shelves?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <span>Why does the library open so quietly?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <span>What sounds can you hear inside?</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <p className="font-semibold text-green-700 mb-2">Your Final Sentence:</p>
                    <p className="text-lg text-green-800 italic">
                      "{demoSession[demoSession.length - 1].targetSentence.join(' ')}."
                    </p>
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

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-center">
                    <p className="text-lg font-bold text-purple-700 mb-2">Amazing work!</p>
                    <div className="text-sm text-purple-600 mb-3">
                      <p>Word count journey: {wordCountProgression.slice(0, currentStep + 1).join(' → ')} words</p>
                      <p className="mt-1 text-purple-500">That's {Math.round((getWordCountForStep(demoSession.length - 1) / getWordCountForStep(0)) * 100)}% growth!</p>
                    </div>
                    <button
                      onClick={resetDemo}
                      className="px-6 py-2 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Word Count Growth:</p>
                    <div className="flex items-center gap-1 flex-wrap">
                      {wordCountProgression.map((count, i) => (
                        <div key={i} className="flex items-center">
                          <span className={`px-2 py-1 rounded text-sm font-bold ${
                            i < currentStep 
                              ? 'bg-green-500 text-white' 
                              : i === currentStep 
                                ? 'bg-purple-500 text-white ring-2 ring-purple-300' 
                                : 'bg-gray-200 text-gray-500'
                          }`}>
                            {count}
                          </span>
                          {i < wordCountProgression.length - 1 && (
                            <span className={`mx-1 text-lg ${i < currentStep ? 'text-green-500' : 'text-gray-300'}`}>→</span>
                          )}
                        </div>
                      ))}
                      <span className="ml-2 text-xs text-gray-500">words</span>
                    </div>
                  </div>

                  {currentStep > 0 && (
                    <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                      <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">Sentence Evolution So Far:</p>
                      <div className="space-y-1">
                        {demoSession.slice(0, currentStep).map((s, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <span className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">{i + 1}</span>
                            <span className="text-gray-700">{s.targetSentence.join(' ')}</span>
                            <span className="text-xs text-gray-400">({getWordCountForStep(i)} words)</span>
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
                      <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">Labelled Example:</p>
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
                          {step.newElement.label}
                        </span>
                      </div>
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
                          placeholder={step.newElement.placeholder}
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
                          Your words from before <span className="text-gray-400 font-normal">(click each word in order)</span>:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {step.previousWords.map((word, i) => {
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
                          <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${step.structureParts[step.structureParts.length - 1]?.color || step.structureParts[0]?.color || 'bg-purple-500'}`}>
                            {step.newElement.label}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={typedNewWord}
                            onChange={(e) => setTypedNewWord(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleTypeSubmit()}
                            placeholder={step.newElement.placeholder}
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
                                step.previousWords.includes(word)
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
                        {currentStep > 0 && (
                          <span className="text-green-600 ml-2">
                            (↑ from {getWordCountForStep(currentStep - 1)} words)
                          </span>
                        )}
                        <span className="text-purple-600 ml-2">
                          Target: {step.targetSentence.length} words
                        </span>
                      </p>
                    )}
                  </div>

                  {showSuccess && (
                    <div className="mb-5 p-4 bg-green-100 border border-green-300 rounded-xl text-center">
                      <span className="text-2xl">🎉</span>
                      <p className="font-bold text-green-700 mt-1">Excellent! You REWROTE your sentence with the new element!</p>
                      <p className="text-sm text-green-600 mt-1">
                        {getWordCountForStep(0)} → {getWordCountForStep(currentStep)} words
                      </p>
                      {currentStep < demoSession.length - 1 && (
                        <p className="text-sm text-green-600 mt-1">Moving to next formula...</p>
                      )}
                      {isFinalStep && (
                        <p className="text-sm text-purple-600 mt-1 font-medium">Get ready for the paragraph challenge!</p>
                      )}
                    </div>
                  )}

                  {attempts > 0 && !showSuccess && (
                    <div className="mb-5 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <p className="text-sm text-yellow-700">
                        <strong>Hint:</strong> {isFirstFormula 
                          ? `Type: "${step.targetSentence.join(' ')}"` 
                          : `Click your previous words in order, then add "${step.newElement.words.join(' ')}" as the new element.`}
                      </p>
                      <p className="text-xs text-yellow-600 mt-2">
                        Target: {step.targetSentence.join(' ')}
                      </p>
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

                  {Object.keys(wordWriteCounts).length > 0 && currentStep > 0 && (
                    <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">Word Practice Stats:</p>
                      <div className="flex flex-wrap gap-2">
                        {getTopRepeatedWords().map(([word, count]) => (
                          <span key={word} className="px-2 py-1 bg-amber-100 rounded text-xs">
                            <span className="font-medium text-amber-800">{word}</span>
                            <span className="text-amber-600 ml-1">×{count}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      {demoSession.map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 flex-1 rounded-full transition-all ${
                            i < currentStep ? 'bg-green-500' : i === currentStep ? 'bg-purple-500' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-center text-gray-500 mt-2">
                      Progress: {currentStep + 1}/{demoSession.length} formulas
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
