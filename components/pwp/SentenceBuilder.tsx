"use client";

import { useState, useRef, useEffect } from 'react';

interface SentenceToken {
  type: 'clicked' | 'typed';
  text: string;
  wordClass?: string;
}

interface SentenceBuilderProps {
  tokens: SentenceToken[];
  onTokensChange: (tokens: SentenceToken[]) => void;
  currentNewElement: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function SentenceBuilder({ 
  tokens, 
  onTokensChange, 
  currentNewElement,
  placeholder = "Click words or type here...",
  disabled = false 
}: SentenceBuilderProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' && inputValue.trim()) {
      e.preventDefault();
      const newToken: SentenceToken = {
        type: 'typed',
        text: inputValue.trim(),
        wordClass: currentNewElement
      };
      onTokensChange([...tokens, newToken]);
      setInputValue('');
    } else if (e.key === 'Backspace' && inputValue === '' && tokens.length > 0) {
      const lastToken = tokens[tokens.length - 1];
      if (lastToken.type === 'typed') {
        onTokensChange(tokens.slice(0, -1));
      }
    } else if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newToken: SentenceToken = {
        type: 'typed',
        text: inputValue.trim(),
        wordClass: currentNewElement
      };
      onTokensChange([...tokens, newToken]);
      setInputValue('');
    }
  };

  const handleTokenRemove = (index: number) => {
    if (disabled) return;
    const token = tokens[index];
    if (token.type === 'typed') {
      onTokensChange(tokens.filter((_, i) => i !== index));
    }
  };

  const getSentenceText = () => {
    const allWords = [...tokens.map(t => t.text), inputValue.trim()].filter(Boolean);
    return allWords.join(' ');
  };

  const focusInput = () => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  };

  return (
    <div className="mb-4">
      <div 
        onClick={focusInput}
        className={`min-h-[60px] p-3 rounded-lg border-2 transition-all duration-200 flex flex-wrap items-center gap-1.5 cursor-text
          ${disabled 
            ? 'bg-gray-50 border-gray-200' 
            : 'bg-white border-[var(--wrife-border)] focus-within:border-[var(--wrife-blue)] focus-within:ring-2 focus-within:ring-[var(--wrife-blue-soft)]'
          }`}
      >
        {tokens.map((token, index) => (
          <span
            key={`token-${index}`}
            onClick={(e) => {
              e.stopPropagation();
              handleTokenRemove(index);
            }}
            className={`px-2 py-1 rounded text-sm font-medium inline-flex items-center gap-1
              ${token.type === 'clicked' 
                ? 'bg-[var(--wrife-blue-soft)] text-[var(--wrife-blue)]' 
                : 'bg-[var(--wrife-yellow)] text-[var(--wrife-text-main)] cursor-pointer hover:opacity-80'
              }`}
            title={token.type === 'typed' ? 'Click to remove' : undefined}
          >
            {token.text}
            {token.type === 'typed' && !disabled && (
              <span className="text-xs opacity-60">×</span>
            )}
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          disabled={disabled}
          placeholder={tokens.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-[var(--wrife-text-main)] placeholder:text-gray-400"
        />
      </div>
      {tokens.length > 0 && (
        <p className="text-xs text-[var(--wrife-text-muted)] mt-1">
          Your sentence: <span className="font-medium">{getSentenceText()}</span>
        </p>
      )}
    </div>
  );
}

export type { SentenceToken };
