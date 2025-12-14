"use client";

import { useState } from 'react';

interface Formula {
  structure: string;
  example: string;
  wordBank: string[];
  newElement: string;
}

const demoFormulas: Formula[] = [
  {
    structure: "Subject + Verb",
    example: "The dog [runs].",
    wordBank: ["The", "dog"],
    newElement: "runs"
  },
  {
    structure: "Subject + Verb + Object",
    example: "The dog [chases] the ball.",
    wordBank: ["The", "dog", "the", "ball"],
    newElement: "chases"
  },
  {
    structure: "Article + Adjective + Noun + Verb",
    example: "The [happy] dog runs.",
    wordBank: ["The", "dog", "runs"],
    newElement: "happy"
  }
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
    const sentence = userSentence.join(' ') + '.';
    const isCorrect = sentence.toLowerCase().includes(formula.newElement.toLowerCase());
    
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
            Learn grammar through sentence building. Click words from the bank, type new ones, and build correct sentences.
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
            className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden shadow-2xl"
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
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                    Formula
                  </span>
                  <span className="font-bold text-purple-800">{formula.structure}</span>
                </div>
                <p className="text-sm text-purple-700">
                  Example: {formula.example.replace('[', '<span class="underline font-bold">').replace(']', '</span>')}
                </p>
                <p className="text-xs text-purple-600 mt-2">
                  Type the <strong className="underline">{formula.newElement}</strong> word yourself!
                </p>
              </div>

              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">Word Bank (click to add):</p>
                <div className="flex flex-wrap gap-2">
                  {formula.wordBank.map((word, i) => (
                    <button
                      key={`${word}-${i}`}
                      onClick={() => handleWordClick(word)}
                      disabled={showSuccess}
                      className="px-4 py-2 bg-[var(--wrife-blue-soft)] text-[var(--wrife-blue)] rounded-lg font-medium hover:bg-[var(--wrife-blue)] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">Type your word:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={typedWord}
                    onChange={(e) => setTypedWord(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTypeSubmit()}
                    placeholder={`Type "${formula.newElement}"...`}
                    disabled={showSuccess}
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none disabled:opacity-50"
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
                      {userSentence.map((word, i) => (
                        <span
                          key={i}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            !formula.wordBank.includes(word)
                              ? 'bg-purple-100 text-purple-700 border border-purple-300'
                              : 'bg-white border border-gray-300 text-gray-700'
                          }`}
                        >
                          {word}
                        </span>
                      ))}
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
                    <strong>Hint:</strong> Make sure to type the word &quot;{formula.newElement}&quot; in your sentence. 
                    Try clicking words in the right order: {formula.wordBank.join(' + ')} + {formula.newElement}
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
                  disabled={userSentence.length < 2 || showSuccess}
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
