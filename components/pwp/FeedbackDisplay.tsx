"use client";

import { useState, useEffect } from 'react';

interface FeedbackDisplayProps {
  type: 'success' | 'error' | 'hint' | null;
  message: string;
  socraticQuestions?: string[];
  repetitionStats?: Record<string, number>;
  onContinue?: () => void;
  autoHide?: boolean;
}

export default function FeedbackDisplay({
  type,
  message,
  socraticQuestions = [],
  repetitionStats,
  onContinue,
  autoHide = false
}: FeedbackDisplayProps) {
  const [visible, setVisible] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    setVisible(true);
    setCurrentQuestion(0);
    
    if (autoHide && type === 'success') {
      const timer = setTimeout(() => {
        setVisible(false);
        onContinue?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [type, message, autoHide, onContinue]);

  if (!type || !visible) return null;

  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    hint: 'bg-yellow-50 border-yellow-200'
  }[type];

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    hint: 'text-yellow-800'
  }[type];

  const icon = {
    success: '✅',
    error: '❌',
    hint: '💡'
  }[type];

  return (
    <div className={`rounded-lg border-2 p-4 mb-4 ${bgColor}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <p className={`font-medium ${textColor}`}>{message}</p>
          
          {type === 'success' && repetitionStats && Object.keys(repetitionStats).length > 0 && (
            <div className="mt-3 text-sm text-green-700">
              <p className="font-medium mb-1">Word Repetition Progress:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(repetitionStats).map(([word, count]) => (
                  <span 
                    key={word} 
                    className="bg-green-100 px-2 py-1 rounded text-xs"
                  >
                    "{word}" × {count}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs opacity-75">
                This repetition builds long-term memory! 🧠
              </p>
            </div>
          )}
          
          {type === 'error' && socraticQuestions.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-red-700 font-medium mb-2">
                Think about this:
              </p>
              <div className="bg-white bg-opacity-60 rounded p-3">
                <p className="text-red-800">
                  {socraticQuestions[currentQuestion]}
                </p>
                {socraticQuestions.length > 1 && (
                  <div className="flex gap-2 mt-2">
                    {socraticQuestions.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentQuestion(i)}
                        className={`w-2 h-2 rounded-full ${
                          i === currentQuestion ? 'bg-red-500' : 'bg-red-200'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {onContinue && type === 'success' && (
            <button
              onClick={onContinue}
              className="mt-4 px-4 py-2 bg-[var(--wrife-blue)] text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors"
            >
              Next Formula →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
