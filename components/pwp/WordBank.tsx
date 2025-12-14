"use client";

import { useState } from 'react';

interface WordBankProps {
  words: string[];
  onWordClick: (word: string, index: number) => void;
  usedIndices: number[];
  disabled?: boolean;
}

export default function WordBank({ words, onWordClick, usedIndices, disabled = false }: WordBankProps) {
  return (
    <div className="mb-4">
      <p className="text-sm text-[var(--wrife-text-muted)] mb-2">
        Click words from your previous sentence:
      </p>
      <div className="flex flex-wrap gap-2">
        {words.map((word, index) => {
          const isUsed = usedIndices.includes(index);
          return (
            <button
              key={`${word}-${index}`}
              onClick={() => !isUsed && !disabled && onWordClick(word, index)}
              disabled={isUsed || disabled}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isUsed 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed line-through' 
                  : disabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[var(--wrife-blue-soft)] text-[var(--wrife-blue)] hover:bg-[var(--wrife-blue)] hover:text-white cursor-pointer shadow-sm hover:shadow'
                }`}
            >
              {word}
            </button>
          );
        })}
      </div>
    </div>
  );
}
