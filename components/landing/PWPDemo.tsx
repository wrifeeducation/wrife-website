"use client";

import { useState } from 'react';

interface WordWithType {
  word: string;
  type: 'article' | 'adjective' | 'noun' | 'verb' | 'object' | 'where' | 'when';
}

interface FormulaPartExample {
  part: string;
  word: string;
  color: string;
}

interface Formula {
  structure: string[];
  structureColors: string[];
  example: FormulaPartExample[];
  wordBank: WordWithType[];
  targetWord: WordWithType;
  targetSentence: string[];
}

const typeColors: Record<string, { bg: string; text: string; border: string; label: string }> = {
  article: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', label: 'Article' },
  adjective: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', label: 'Adjective' },
  noun: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', label: 'Noun' },
  verb: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', label: 'Verb' },
  object: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300', label: 'Object' },
  where: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', label: 'Where' },
  when: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', label: 'When' },
};

const formulaPartColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-pink-500',
];

const demoFormulas: Formula[] = [
  {
    structure: ['Subject', 'Verb'],
    structureColors: ['bg-blue-500', 'bg-green-500'],
    example: [
      { part: 'Subject', word: 'The dog', color: 'bg-blue-500' },
      { part: 'Verb', word: 'runs', color: 'bg-green-500' },
    ],
    wordBank: [
      { word: 'The', type: 'article' },
      { word: 'dog', type: 'noun' },
    ],
    targetWord: { word: 'runs', type: 'verb' },
    targetSentence: ['The', 'dog', 'runs'],
  },
  {
    structure: ['Subject', 'Verb', 'Object'],
    structureColors: ['bg-blue-500', 'bg-green-500', 'bg-pink-500'],
    example: [
      { part: 'Subject', word: 'The dog', color: 'bg-blue-500' },
      { part: 'Verb', word: 'chases', color: 'bg-green-500' },
      { part: 'Object', word: 'the ball', color: 'bg-pink-500' },
    ],
    wordBank: [
      { word: 'The', type: 'article' },
      { word: 'dog', type: 'noun' },
      { word: 'the', type: 'article' },
      { word: 'ball', type: 'object' },
    ],
    targetWord: { word: 'chases', type: 'verb' },
    targetSentence: ['The', 'dog', 'chases', 'the', 'ball'],
  },
  {
    structure: ['Adjective', 'Noun', 'Verb', 'Where'],
    structureColors: ['bg-amber-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500'],
    example: [
      { part: 'Adjective', word: 'The happy', color: 'bg-amber-500' },
      { part: 'Noun', word: 'dog', color: 'bg-blue-500' },
      { part: 'Verb', word: 'runs', color: 'bg-green-500' },
      { part: 'Where', word: 'in the park', color: 'bg-purple-500' },
    ],
    wordBank: [
      { word: 'The', type: 'article' },
      { word: 'dog', type: 'noun' },
      { word: 'runs', type: 'verb' },
      { word: 'in the park', type: 'where' },
    ],
    targetWord: { word: 'happy', type: 'adjective' },
    targetSentence: ['The', 'happy', 'dog', 'runs', 'in the park'],
  },
];

export default function PWPDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentFormula, setCurrentFormula] = useState(0);
  const [userSentence, setUserSentence] = useState<string[]>([]);
  const [typedWord, setTypedWord] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const formula = demoFormulas[currentFormula];

  const handleWordClick = (word: string) => {
    setUserSentence([...userSentence, word]);
  };

  const handleTypeSubmit = () => {
    if (typedWord.trim()) {
      setUserSentence([...userSentence, typedWord.trim()]);
      setTypedWord('');
    }
  };

  const checkSentence = () => {
    const userJoined = userSentence.join(' ').toLowerCase();
    const targetJoined = formula.targetSentence.join(' ').toLowerCase();
    const isCorrect = userJoined === targetJoined;
    
    if (isCorrect) {
      setShowSuccess(true);
      setTimeout(() => {
        if (currentFormula < demoFormulas.length - 1) {
          setCurrentFormula(currentFormula + 1);
          setUserSentence([]);
          setShowSuccess(false);
          setAttempts(0);
        }
      }, 1500);
    } else {
      setAttempts(attempts + 1);
    }
  };

  const resetSentence = () => {
    setUserSentence([]);
    setTypedWord('');
    setShowSuccess(false);
    setAttempts(0);
  };

  const resetDemo = () => {
    setCurrentFormula(0);
    setUserSentence([]);
    setTypedWord('');
    setShowSuccess(false);
    setAttempts(0);
  };

  const getCurrentFormulaPosition = () => {
    const targetWords = formula.targetSentence;
    const currentIndex = userSentence.length;
    if (currentIndex >= targetWords.length) return -1;
    
    let position = 0;
    let wordCount = 0;
    for (const part of formula.example) {
      const wordsInPart = part.word.split(' ').length;
      if (currentIndex < wordCount + wordsInPart) {
        return position;
      }
      wordCount += wordsInPart;
      position++;
    }
    return -1;
  };

  const currentPosition = getCurrentFormulaPosition();

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
            Learn grammar through sentence building. Follow the formula pattern to build correct sentences.
          </p>
          <div className="flex items-center gap-2 text-purple-600 text-sm font-medium">
            <span>Try Formula Builder</span>
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
                <h2 className="text-xl font-bold">PWP Demo: Sentence Builder</h2>
                <p className="text-sm opacity-90">Formula {currentFormula + 1} of {demoFormulas.length}</p>
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
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-72px)]">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-5 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    FORMULA PATTERN
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {formula.structure.map((part, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span 
                        className={`px-4 py-2 rounded-lg text-white font-bold text-lg ${formula.structureColors[i]} ${currentPosition === i ? 'ring-4 ring-yellow-400 animate-pulse' : ''}`}
                      >
                        {part}
                      </span>
                      {i < formula.structure.length - 1 && (
                        <span className="text-2xl font-bold text-gray-400">+</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-white/70 rounded-lg p-4 border border-indigo-100">
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">Example with Labels:</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {formula.example.map((part, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="flex flex-col items-center">
                          <span className={`text-xs font-bold text-white px-2 py-0.5 rounded-t ${part.color}`}>
                            {part.part}
                          </span>
                          <span className={`px-3 py-1.5 rounded-b-lg text-sm font-medium bg-white border-2 ${part.color.replace('bg-', 'border-').replace('-500', '-300')}`}>
                            {part.word}
                          </span>
                        </div>
                        {i < formula.example.length - 1 && (
                          <span className="text-xl font-bold text-gray-400">+</span>
                        )}
                      </div>
                    ))}
                    <span className="text-gray-600 text-lg">.</span>
                  </div>
                </div>

                {currentPosition >= 0 && (
                  <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                    <p className="text-sm font-semibold text-yellow-800">
                      Now add: <span className={`inline-block px-2 py-0.5 rounded text-white ml-1 ${formula.structureColors[currentPosition]}`}>{formula.structure[currentPosition]}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Word Bank <span className="text-gray-400 font-normal">(click to add)</span>:</p>
                <div className="flex flex-wrap gap-2">
                  {formula.wordBank.map((item, i) => {
                    const colors = typeColors[item.type];
                    return (
                      <button
                        key={`${item.word}-${i}`}
                        onClick={() => handleWordClick(item.word)}
                        disabled={showSuccess}
                        className={`flex flex-col items-center px-4 py-2 ${colors.bg} border-2 ${colors.border} rounded-lg hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${colors.text} opacity-70`}>{colors.label}</span>
                        <span className={`font-semibold ${colors.text}`}>{item.word}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-sm font-semibold text-gray-700">Type the missing word:</p>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${typeColors[formula.targetWord.type].bg} ${typeColors[formula.targetWord.type].text}`}>
                    {typeColors[formula.targetWord.type].label}
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={typedWord}
                    onChange={(e) => setTypedWord(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTypeSubmit()}
                    placeholder={`Type "${formula.targetWord.word}"...`}
                    disabled={showSuccess}
                    className={`flex-1 px-4 py-2 border-2 rounded-lg focus:outline-none disabled:opacity-50 ${typeColors[formula.targetWord.type].border} focus:ring-2 focus:ring-purple-300`}
                  />
                  <button
                    onClick={handleTypeSubmit}
                    disabled={!typedWord.trim() || showSuccess}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">Your Sentence:</p>
                <div className={`min-h-[60px] p-4 rounded-xl border-2 ${showSuccess ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'} flex flex-wrap items-center gap-2`}>
                  {userSentence.length === 0 ? (
                    <span className="text-gray-400 italic">Click words or type to build your sentence...</span>
                  ) : (
                    <>
                      {userSentence.map((word, i) => {
                        const bankItem = formula.wordBank.find(w => w.word === word);
                        const isTarget = word.toLowerCase() === formula.targetWord.word.toLowerCase();
                        const wordType = isTarget ? formula.targetWord.type : (bankItem?.type || 'noun');
                        const colors = typeColors[wordType];
                        return (
                          <span
                            key={i}
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${colors.bg} ${colors.text} border ${colors.border}`}
                          >
                            {word}
                          </span>
                        );
                      })}
                      <span className="text-gray-600">.</span>
                    </>
                  )}
                </div>
              </div>

              {showSuccess && (
                <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-xl text-center">
                  <span className="text-2xl">🎉</span>
                  <p className="font-bold text-green-700 mt-1">Correct! Great job!</p>
                  {currentFormula < demoFormulas.length - 1 && (
                    <p className="text-sm text-green-600">Moving to next formula...</p>
                  )}
                </div>
              )}

              {attempts > 0 && !showSuccess && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="text-sm text-yellow-700">
                    <strong>Hint:</strong> Follow the formula pattern! Build: 
                    {formula.structure.map((part, i) => (
                      <span key={i}>
                        <span className={`inline-block px-1.5 py-0.5 mx-1 rounded text-xs font-bold text-white ${formula.structureColors[i]}`}>{part}</span>
                        {i < formula.structure.length - 1 && '+'}
                      </span>
                    ))}
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
                  disabled={userSentence.length === 0 || showSuccess}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Check Sentence
                </button>
              </div>

              {currentFormula === demoFormulas.length - 1 && showSuccess && (
                <div className="mt-6 text-center">
                  <p className="text-lg font-bold text-purple-700 mb-3">You completed all formulas!</p>
                  <button
                    onClick={resetDemo}
                    className="px-6 py-2 bg-purple-100 text-purple-700 font-medium rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
