"use client";

import { useState, useEffect, useCallback } from 'react';
import WordBank from './WordBank';
import SentenceBuilder, { SentenceToken } from './SentenceBuilder';
import FormulaDisplay from './FormulaDisplay';
import FeedbackDisplay from './FeedbackDisplay';

interface Formula {
  formula_number: number;
  formula_structure: string;
  labelled_example: string;
  word_bank: string[];
  new_element: string;
  new_element_examples?: string[];
  hint_text?: string;
  evolution_instruction?: string;
  concepts_used?: string[];
}

interface PWPSessionProps {
  sessionId: string;
  lessonNumber: number;
  lessonName: string;
  subject: string;
  formulas: Formula[];
  onComplete: (stats: SessionStats) => void;
  onFormulaSubmit: (formulaNumber: number, sentence: string) => Promise<{
    correct: boolean;
    feedback?: string;
    suggestions?: string[];
    repetitionStats?: Record<string, number>;
  }>;
}

interface SessionStats {
  formulasCompleted: number;
  totalFormulas: number;
  accuracy: number;
  duration: number;
  repetitionStats: Record<string, number>;
}

export default function PWPSession({
  sessionId,
  lessonNumber,
  lessonName,
  subject,
  formulas,
  onComplete,
  onFormulaSubmit
}: PWPSessionProps) {
  const [currentFormulaIndex, setCurrentFormulaIndex] = useState(0);
  const [tokens, setTokens] = useState<SentenceToken[]>([]);
  const [usedWordIndices, setUsedWordIndices] = useState<number[]>([]);
  const [completedSentences, setCompletedSentences] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'hint' | null;
    message: string;
    socraticQuestions?: string[];
    repetitionStats?: Record<string, number>;
  }>({ type: null, message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());
  const [overallRepetitionStats, setOverallRepetitionStats] = useState<Record<string, number>>({});

  const currentFormula = formulas[currentFormulaIndex];
  const isFirstFormula = currentFormulaIndex === 0;
  const isLastFormula = currentFormulaIndex === formulas.length - 1;

  const handleWordClick = useCallback((word: string, index: number) => {
    const newToken: SentenceToken = {
      type: 'clicked',
      text: word
    };
    setTokens(prev => [...prev, newToken]);
    setUsedWordIndices(prev => [...prev, index]);
  }, []);

  const handleTokensChange = useCallback((newTokens: SentenceToken[]) => {
    setTokens(newTokens);
    const clickedIndices = newTokens
      .filter(t => t.type === 'clicked')
      .map(t => currentFormula.word_bank.indexOf(t.text));
    setUsedWordIndices(clickedIndices.filter(i => i !== -1));
  }, [currentFormula?.word_bank]);

  const getCurrentSentence = () => {
    return tokens.map(t => t.text).join(' ');
  };

  const handleSubmit = async () => {
    const sentence = getCurrentSentence().trim();
    if (!sentence) return;

    setIsSubmitting(true);
    setFeedback({ type: null, message: '' });

    try {
      const result = await onFormulaSubmit(currentFormula.formula_number, sentence);
      
      if (result.correct) {
        const newRepStats = { ...overallRepetitionStats };
        sentence.split(' ').forEach(word => {
          const lowerWord = word.toLowerCase();
          newRepStats[lowerWord] = (newRepStats[lowerWord] || 0) + 1;
        });
        setOverallRepetitionStats(newRepStats);

        setFeedback({
          type: 'success',
          message: result.feedback || 'Excellent! Your sentence is correct!',
          repetitionStats: result.repetitionStats || newRepStats
        });
        
        setCompletedSentences(prev => [...prev, sentence]);
      } else {
        setFeedback({
          type: 'error',
          message: result.feedback || 'Not quite right. Try again!',
          socraticQuestions: result.suggestions
        });
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message: 'Something went wrong. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextFormula = () => {
    if (isLastFormula) {
      const duration = Math.round((Date.now() - startTime) / 1000);
      onComplete({
        formulasCompleted: formulas.length,
        totalFormulas: formulas.length,
        accuracy: Math.round((completedSentences.length / formulas.length) * 100),
        duration,
        repetitionStats: overallRepetitionStats
      });
    } else {
      setCurrentFormulaIndex(prev => prev + 1);
      setTokens([]);
      setUsedWordIndices([]);
      setFeedback({ type: null, message: '' });
    }
  };

  if (!currentFormula) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-[var(--wrife-border)]">
        <div className="mb-4 pb-4 border-b border-[var(--wrife-border)]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-[var(--wrife-text-muted)]">L{lessonNumber} PWP Practice</span>
              <h2 className="text-xl font-bold text-[var(--wrife-text-main)]">{lessonName}</h2>
            </div>
            <div className="text-right">
              <p className="text-sm text-[var(--wrife-text-muted)]">Your subject:</p>
              <p className="font-bold text-[var(--wrife-blue)]">{subject}</p>
            </div>
          </div>
        </div>

        <FormulaDisplay
          formulaNumber={currentFormula.formula_number}
          totalFormulas={formulas.length}
          formulaStructure={currentFormula.formula_structure}
          labelledExample={currentFormula.labelled_example}
          previousSentence={completedSentences[currentFormulaIndex - 1]}
          newElements={currentFormula.new_element ? [currentFormula.new_element] : []}
          hintText={currentFormula.hint_text}
        />

        {!isFirstFormula && currentFormula.word_bank.length > 0 && (
          <WordBank
            words={currentFormula.word_bank}
            onWordClick={handleWordClick}
            usedIndices={usedWordIndices}
            disabled={feedback.type === 'success'}
          />
        )}

        <SentenceBuilder
          tokens={tokens}
          onTokensChange={handleTokensChange}
          currentNewElement={currentFormula.new_element || ''}
          placeholder={isFirstFormula 
            ? `Write your complete sentence with "${subject}"...` 
            : "Click words and type new words to build your sentence..."
          }
          disabled={feedback.type === 'success'}
        />

        <FeedbackDisplay
          type={feedback.type}
          message={feedback.message}
          socraticQuestions={feedback.socraticQuestions}
          repetitionStats={feedback.repetitionStats}
          onContinue={feedback.type === 'success' ? handleNextFormula : undefined}
        />

        {feedback.type !== 'success' && (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || tokens.length === 0}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all duration-200
              ${isSubmitting || tokens.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-[var(--wrife-blue)] hover:bg-opacity-90 shadow-md hover:shadow-lg'
              }`}
          >
            {isSubmitting ? 'Checking...' : 'Check Sentence'}
          </button>
        )}
      </div>
    </div>
  );
}

export type { Formula, SessionStats };
