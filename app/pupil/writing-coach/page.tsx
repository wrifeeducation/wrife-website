"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface PupilSession {
  pupilId: string;
  pupilName: string;
  classId: string;
  className: string;
  classCode: string;
  yearGroup: number;
}

interface WordClassItem {
  word: string;
  wordClass: string;
  correct: boolean;
}

interface CheckAnalysis {
  wordClassAnalysis: WordClassItem[];
  formulaAdherence: number;
  grammarAccuracy: number;
  meaningClarity: number;
  personalConnection: number;
  totalScore: number;
  percentage: number;
  mastery: boolean;
  feedback: string;
  suggestion: string;
}

interface BadgeEarned {
  badgeName: string;
  badgeDescription: string;
}

interface WordBank {
  people: string[];
  places: string[];
  things: string[];
}

type StoryPart = 'beginning' | 'middle' | 'end';
type WordBankTab = 'people' | 'places' | 'things';
type HintType = 'formula' | 'grammar' | 'vocabulary';
type PageState = 'writing' | 'checked' | 'submitted';

const FORMULAS = [
  { label: 'Subject + Verb', example: 'The cat sat.' },
  { label: 'Subject + Verb + Object', example: 'The dog chased the ball.' },
  { label: 'Subject + Verb + Adverb', example: 'The bird sang beautifully.' },
  { label: 'Adjective + Subject + Verb + Object', example: 'The brave knight saved the princess.' },
  { label: 'Subject + Verb + Object + Prepositional Phrase', example: 'The girl placed the book on the shelf.' },
];

const WORD_CLASS_COLOURS: Record<string, { bg: string; text: string; label: string }> = {
  noun: { bg: '#DBEAFE', text: '#3B82F6', label: 'Noun' },
  verb: { bg: '#DCFCE7', text: '#22C55E', label: 'Verb' },
  adjective: { bg: '#FEF3C7', text: '#F59E0B', label: 'Adjective' },
  adverb: { bg: '#EDE9FE', text: '#8B5CF6', label: 'Adverb' },
  determiner: { bg: '#F3F4F6', text: '#6B7280', label: 'Determiner' },
  preposition: { bg: '#FCE7F3', text: '#EC4899', label: 'Preposition' },
  pronoun: { bg: '#CCFBF1', text: '#14B8A6', label: 'Pronoun' },
  conjunction: { bg: '#E0E7FF', text: '#6366F1', label: 'Conjunction' },
  interjection: { bg: '#FEE2E2', text: '#EF4444', label: 'Interjection' },
  punctuation: { bg: '#F3F4F6', text: '#9CA3AF', label: 'Punctuation' },
};

function CircularProgress({ percentage }: { percentage: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const colour = percentage >= 75 ? '#22C55E' : percentage >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={colour} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <span className="absolute text-2xl font-bold" style={{ color: colour }}>
        {percentage}%
      </span>
    </div>
  );
}

function ScoreBar({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = max > 0 ? (score / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-[var(--wrife-text-muted)] w-28 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-3">
        <div
          className="h-3 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: pct >= 75 ? '#22C55E' : pct >= 50 ? '#F59E0B' : '#3B82F6' }}
        />
      </div>
      <span className="text-sm font-bold text-[var(--wrife-text-main)] w-10 text-right">{score}/{max}</span>
    </div>
  );
}

export default function WritingCoachPage() {
  const router = useRouter();
  const [session, setSession] = useState<PupilSession | null>(null);
  const [loading, setLoading] = useState(true);

  const [pageState, setPageState] = useState<PageState>('writing');
  const [formulaIndex, setFormulaIndex] = useState(1);
  const [formulaOpen, setFormulaOpen] = useState(true);
  const [storyPart, setStoryPart] = useState<StoryPart>('beginning');
  const [subject, setSubject] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [sentenceText, setSentenceText] = useState('');

  const [wordBank, setWordBank] = useState<WordBank>({ people: [], places: [], things: [] });
  const [wordBankTab, setWordBankTab] = useState<WordBankTab>('people');
  const [wordBankLoading, setWordBankLoading] = useState(false);
  const [storyType, setStoryType] = useState<'happy' | 'sad' | 'funny'>('happy');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);

  const [checking, setChecking] = useState(false);
  const [analysis, setAnalysis] = useState<CheckAnalysis | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [newBadges, setNewBadges] = useState<BadgeEarned[]>([]);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const badgeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [hintDropdownOpen, setHintDropdownOpen] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintText, setHintText] = useState('');
  const [showHint, setShowHint] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('pupilSession');
    if (!stored) {
      router.push('/pupil/login');
      return;
    }
    try {
      const parsed = JSON.parse(stored) as PupilSession;
      setSession(parsed);
      setLoading(false);
      fetchWordBank();
    } catch {
      localStorage.removeItem('pupilSession');
      router.push('/pupil/login');
    }
  }, [router]);

  useEffect(() => {
    return () => {
      if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);
    };
  }, []);

  async function fetchWordBank() {
    setWordBankLoading(true);
    try {
      const res = await fetch(`/api/pupil/word-bank?pupilId=${session?.pupilId}`);
      if (res.ok) {
        const data = await res.json();
        setWordBank(data);
      }
    } catch {
    } finally {
      setWordBankLoading(false);
    }
  }

  async function handleSuggest() {
    setSuggestLoading(true);
    try {
      const res = await fetch('/api/pupil/word-bank/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pupilId: session?.pupilId, category: wordBankTab, storyType }),
      });
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      }
    } catch {
    } finally {
      setSuggestLoading(false);
    }
  }

  async function handleCheck() {
    if (!session || !sentenceText.trim()) return;
    setChecking(true);
    setShowHint(false);
    try {
      const res = await fetch('/api/pupil/writing-coach/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pupilId: session.pupilId,
          lessonNumber: 1,
          formulaUsed: FORMULAS[formulaIndex].label,
          subjectChosen: subject || customSubject || undefined,
          sentenceText: sentenceText.trim(),
          storyPart,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data.analysis);
        setSessionId(data.sessionId);
        setPageState('checked');
      }
    } catch {
    } finally {
      setChecking(false);
    }
  }

  async function handleSubmit() {
    if (!sessionId) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/pupil/writing-coach/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) {
        const data = await res.json();
        setPageState('submitted');
        if (data.newBadges && data.newBadges.length > 0) {
          setNewBadges(data.newBadges);
          setShowBadgeModal(true);
          badgeTimerRef.current = setTimeout(() => setShowBadgeModal(false), 5000);
        }
      }
    } catch {
    } finally {
      setSubmitting(false);
    }
  }

  function handleRevise() {
    setAnalysis(null);
    setSessionId(null);
    setPageState('writing');
    setShowHint(false);
    setHintText('');
    setTimeout(() => textareaRef.current?.focus(), 100);
  }

  function handleNewSentence() {
    setSentenceText('');
    setSubject('');
    setCustomSubject('');
    setAnalysis(null);
    setSessionId(null);
    setPageState('writing');
    setShowHint(false);
    setHintText('');
    setNewBadges([]);
  }

  async function handleHint(type: HintType) {
    if (!session) return;
    setHintDropdownOpen(false);
    setHintLoading(true);
    try {
      const res = await fetch('/api/pupil/writing-coach/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pupilId: session.pupilId,
          formulaUsed: FORMULAS[formulaIndex].label,
          sentenceText: sentenceText.trim(),
          hintType: type,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setHintText(data.hint);
        setShowHint(true);
      }
    } catch {
    } finally {
      setHintLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent" />
          <p className="mt-4 text-sm text-[var(--wrife-text-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const currentFormula = FORMULAS[formulaIndex];

  return (
    <div className="min-h-screen bg-[var(--wrife-bg)]">
      <Navbar />

      <div className="bg-gradient-to-r from-[var(--wrife-blue)] to-blue-600 text-white py-5">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              ✍️ Writing Coach
            </h1>
            <p className="text-blue-100 text-sm mt-0.5">
              Hi {session.pupilName}! Let&apos;s write an amazing sentence.
            </p>
          </div>
          <button
            onClick={() => router.push('/pupil/dashboard')}
            className="px-4 py-2 rounded-full text-sm font-semibold bg-white/20 hover:bg-white/30 transition min-h-[44px]"
          >
            Dashboard
          </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* Formula Reference Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--wrife-border)] overflow-hidden">
          <button
            onClick={() => setFormulaOpen(!formulaOpen)}
            className="w-full flex items-center justify-between px-5 py-4 text-left min-h-[44px]"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">📐</span>
              <span className="font-bold text-[var(--wrife-text-main)]">Sentence Formula</span>
            </div>
            <svg
              className={`w-5 h-5 text-[var(--wrife-text-muted)] transition-transform duration-200 ${formulaOpen ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {formulaOpen && (
            <div className="px-5 pb-5 border-t border-[var(--wrife-border)] pt-4 space-y-3 animate-[fadeIn_0.2s_ease-out]">
              <div>
                <label className="block text-sm font-medium text-[var(--wrife-text-muted)] mb-1.5">Choose your formula:</label>
                <select
                  value={formulaIndex}
                  onChange={(e) => setFormulaIndex(Number(e.target.value))}
                  disabled={pageState !== 'writing'}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[var(--wrife-border)] bg-[var(--wrife-bg)] text-[var(--wrife-text-main)] font-semibold text-base focus:border-[var(--wrife-blue)] focus:outline-none min-h-[44px]"
                >
                  {FORMULAS.map((f, i) => (
                    <option key={f.label} value={i}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-[var(--wrife-text-muted)] mb-1">Example:</p>
                <p className="text-base font-medium text-[var(--wrife-blue)] italic">&ldquo;{currentFormula.example}&rdquo;</p>
              </div>
            </div>
          )}
        </div>

        {/* Story Part Selector */}
        {pageState === 'writing' && (
          <div className="bg-white rounded-2xl shadow-sm border border-[var(--wrife-border)] p-5">
            <p className="text-sm font-medium text-[var(--wrife-text-muted)] mb-3">Which part of the story is this sentence for?</p>
            <div className="flex gap-2">
              {(['beginning', 'middle', 'end'] as StoryPart[]).map((part) => (
                <button
                  key={part}
                  onClick={() => setStoryPart(part)}
                  className={`flex-1 py-3 rounded-full text-sm font-bold transition-all min-h-[44px] capitalize
                    ${storyPart === part
                      ? 'bg-[var(--wrife-blue)] text-white shadow-md'
                      : 'bg-[var(--wrife-bg)] text-[var(--wrife-text-muted)] hover:bg-blue-50'
                    }`}
                >
                  {part === 'beginning' ? '🌅 Beginning' : part === 'middle' ? '🏔️ Middle' : '🌇 End'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subject Picker */}
        {pageState === 'writing' && (
          <div className="bg-white rounded-2xl shadow-sm border border-[var(--wrife-border)] p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <h2 className="font-bold text-[var(--wrife-text-main)]">Pick Your Subject</h2>
            </div>

            <div className="flex gap-1 bg-[var(--wrife-bg)] rounded-xl p-1">
              {(['people', 'places', 'things'] as WordBankTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setWordBankTab(tab); setSuggestions([]); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all min-h-[44px] capitalize
                    ${wordBankTab === tab
                      ? 'bg-white text-[var(--wrife-blue)] shadow-sm'
                      : 'text-[var(--wrife-text-muted)] hover:text-[var(--wrife-text-main)]'
                    }`}
                >
                  {tab === 'people' ? '👤' : tab === 'places' ? '📍' : '📦'} {tab}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {wordBankLoading ? (
                <p className="text-sm text-[var(--wrife-text-muted)]">Loading words...</p>
              ) : wordBank[wordBankTab].length === 0 ? (
                <p className="text-sm text-[var(--wrife-text-muted)]">No words yet — try suggesting some!</p>
              ) : (
                wordBank[wordBankTab].map((word) => (
                  <button
                    key={word}
                    onClick={() => { setSubject(word); setCustomSubject(''); }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[44px]
                      ${subject === word
                        ? 'bg-[var(--wrife-blue)] text-white shadow-md'
                        : 'bg-[var(--wrife-blue-soft)] text-[var(--wrife-blue)] hover:bg-[var(--wrife-blue)] hover:text-white'
                      }`}
                  >
                    {word}
                  </button>
                ))
              )}
            </div>

            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <label className="block text-xs text-[var(--wrife-text-muted)] mb-1">Or type your own:</label>
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => { setCustomSubject(e.target.value); if (e.target.value) setSubject(''); }}
                  placeholder="Type a subject..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-[var(--wrife-border)] focus:border-[var(--wrife-blue)] focus:outline-none text-base min-h-[44px]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={storyType}
                onChange={(e) => setStoryType(e.target.value as 'happy' | 'sad' | 'funny')}
                className="px-3 py-2 rounded-lg border border-[var(--wrife-border)] text-sm min-h-[44px]"
              >
                <option value="happy">😊 Happy story</option>
                <option value="sad">😢 Sad story</option>
                <option value="funny">😂 Funny story</option>
              </select>
              <button
                onClick={handleSuggest}
                disabled={suggestLoading}
                className="px-4 py-2 rounded-full text-sm font-semibold bg-[var(--wrife-yellow)] text-[var(--wrife-text-main)] hover:opacity-90 transition min-h-[44px] disabled:opacity-50"
              >
                {suggestLoading ? '✨ Thinking...' : '✨ Suggest Subjects'}
              </button>
            </div>

            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 animate-[fadeIn_0.3s_ease-out]">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSubject(s); setCustomSubject(''); }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[44px] border-2 border-dashed
                      ${subject === s
                        ? 'border-[var(--wrife-blue)] bg-[var(--wrife-blue)] text-white'
                        : 'border-[var(--wrife-yellow)] bg-yellow-50 text-[var(--wrife-text-main)] hover:bg-yellow-100'
                      }`}
                  >
                    ✨ {s}
                  </button>
                ))}
              </div>
            )}

            {(subject || customSubject) && (
              <div className="bg-green-50 rounded-xl p-3 text-sm">
                <span className="text-[var(--wrife-text-muted)]">Your subject: </span>
                <span className="font-bold text-green-700">{subject || customSubject}</span>
              </div>
            )}
          </div>
        )}

        {/* Writing Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--wrife-border)] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">✏️</span>
            <h2 className="font-bold text-[var(--wrife-text-main)]">Write Your Sentence</h2>
          </div>

          <textarea
            ref={textareaRef}
            value={sentenceText}
            onChange={(e) => setSentenceText(e.target.value)}
            disabled={pageState !== 'writing'}
            placeholder={`Write your sentence using: ${currentFormula.label}`}
            rows={4}
            className="w-full px-4 py-4 rounded-xl border-2 border-[var(--wrife-border)] focus:border-[var(--wrife-blue)] focus:outline-none text-lg leading-relaxed resize-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
            style={{ fontSize: '18px' }}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--wrife-text-muted)]">{sentenceText.length} characters</span>
            {pageState === 'writing' && (
              <button
                onClick={handleCheck}
                disabled={checking || !sentenceText.trim()}
                className="px-8 py-3 rounded-full text-base font-bold bg-[var(--wrife-blue)] text-white hover:opacity-90 transition-all min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {checking ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Checking...
                  </span>
                ) : (
                  '🔍 Check My Writing'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Hint Panel */}
        {showHint && hintText && (
          <div className="bg-yellow-50 rounded-2xl border-2 border-[var(--wrife-yellow)] p-5 animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="font-bold text-[var(--wrife-text-main)] mb-1">Here&apos;s a hint!</p>
                  <p className="text-base text-[var(--wrife-text-main)]">{hintText}</p>
                </div>
              </div>
              <button
                onClick={() => setShowHint(false)}
                className="text-[var(--wrife-text-muted)] hover:text-[var(--wrife-text-main)] p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Word Class Highlighter */}
        {pageState !== 'writing' && analysis && (
          <div className="bg-white rounded-2xl shadow-sm border border-[var(--wrife-border)] p-5 space-y-4 animate-[fadeIn_0.4s_ease-out]">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌈</span>
              <h2 className="font-bold text-[var(--wrife-text-main)]">Word Classes</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {analysis.wordClassAnalysis.map((item, i) => {
                const wc = WORD_CLASS_COLOURS[item.wordClass.toLowerCase()] || { bg: '#F3F4F6', text: '#6B7280', label: item.wordClass };
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span
                      className="px-3 py-2 rounded-xl text-base font-semibold"
                      style={{ backgroundColor: wc.bg, color: wc.text }}
                    >
                      {item.word}
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: wc.text }}>
                      {wc.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-3 pt-2 border-t border-[var(--wrife-border)]">
              {Object.entries(WORD_CLASS_COLOURS).filter(([key]) => !['interjection', 'punctuation'].includes(key)).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: val.text }} />
                  <span className="text-xs text-[var(--wrife-text-muted)]">{val.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Feedback Panel */}
        {pageState !== 'writing' && analysis && (
          <div className="bg-white rounded-2xl shadow-sm border border-[var(--wrife-border)] p-5 space-y-5 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <h2 className="font-bold text-[var(--wrife-text-main)]">Your Score</h2>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
              <CircularProgress percentage={analysis.percentage} />
              <div className="flex-1 space-y-3 w-full">
                <ScoreBar label="Formula" score={analysis.formulaAdherence} max={3} />
                <ScoreBar label="Grammar" score={analysis.grammarAccuracy} max={2} />
                <ScoreBar label="Clarity" score={analysis.meaningClarity} max={2} />
                <ScoreBar label="Connection" score={analysis.personalConnection} max={1} />
              </div>
            </div>

            <div className={`rounded-xl p-4 ${analysis.mastery ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {analysis.mastery ? (
                  <>
                    <span className="text-green-600 text-xl">✅</span>
                    <span className="font-bold text-green-700">Mastery Achieved!</span>
                  </>
                ) : (
                  <>
                    <span className="text-amber-500 text-xl">🌟</span>
                    <span className="font-bold text-amber-700">Nearly There!</span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm font-medium text-blue-800 mb-1">💬 Feedback</p>
                <p className="text-base text-[var(--wrife-text-main)]">{analysis.feedback}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-sm font-medium text-purple-800 mb-1">💡 Tip</p>
                <p className="text-base text-[var(--wrife-text-main)]">{analysis.suggestion}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {pageState === 'checked' && (
          <div className="flex flex-col sm:flex-row gap-3 animate-[fadeIn_0.6s_ease-out]">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-4 rounded-full text-base font-bold bg-green-500 text-white hover:bg-green-600 transition-all min-h-[44px] shadow-md disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : '✅ Submit My Sentence'}
            </button>
            <button
              onClick={handleRevise}
              className="flex-1 py-4 rounded-full text-base font-bold bg-[var(--wrife-bg)] text-[var(--wrife-text-main)] border-2 border-[var(--wrife-border)] hover:bg-gray-100 transition-all min-h-[44px]"
            >
              ✏️ Revise & Try Again
            </button>
            <div className="relative">
              <button
                onClick={() => setHintDropdownOpen(!hintDropdownOpen)}
                disabled={hintLoading}
                className="w-full sm:w-auto py-4 px-6 rounded-full text-base font-bold bg-[var(--wrife-yellow)] text-[var(--wrife-text-main)] hover:opacity-90 transition-all min-h-[44px] disabled:opacity-50"
              >
                {hintLoading ? '💭 Thinking...' : '💡 Get a Hint'}
              </button>
              {hintDropdownOpen && (
                <div className="absolute bottom-full mb-2 left-0 right-0 sm:left-auto sm:right-0 bg-white rounded-xl shadow-lg border border-[var(--wrife-border)] overflow-hidden z-10 min-w-[200px]">
                  {([
                    { type: 'formula' as HintType, label: '📐 Formula Hint', desc: 'Help with sentence structure' },
                    { type: 'grammar' as HintType, label: '📝 Grammar Hint', desc: 'Help with grammar rules' },
                    { type: 'vocabulary' as HintType, label: '📚 Vocabulary Hint', desc: 'Help with word choices' },
                  ]).map((item) => (
                    <button
                      key={item.type}
                      onClick={() => handleHint(item.type)}
                      className="w-full text-left px-4 py-3 hover:bg-[var(--wrife-bg)] transition min-h-[44px]"
                    >
                      <p className="font-semibold text-sm text-[var(--wrife-text-main)]">{item.label}</p>
                      <p className="text-xs text-[var(--wrife-text-muted)]">{item.desc}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submitted Success */}
        {pageState === 'submitted' && (
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl border-2 border-green-200 p-8 text-center space-y-4 animate-[fadeIn_0.4s_ease-out]">
            <div className="text-5xl">🎉</div>
            <h2 className="text-2xl font-bold text-[var(--wrife-text-main)]" style={{ fontFamily: 'var(--font-display)' }}>
              Well Done, {session.pupilName}!
            </h2>
            <p className="text-base text-[var(--wrife-text-muted)]">
              Your sentence has been submitted. Keep up the amazing writing!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={handleNewSentence}
                className="px-8 py-3 rounded-full text-base font-bold bg-[var(--wrife-blue)] text-white hover:opacity-90 transition min-h-[44px] shadow-md"
              >
                ✍️ Write Another Sentence
              </button>
              <button
                onClick={() => router.push('/pupil/dashboard')}
                className="px-8 py-3 rounded-full text-base font-bold bg-white text-[var(--wrife-text-main)] border-2 border-[var(--wrife-border)] hover:bg-gray-50 transition min-h-[44px]"
              >
                🏠 Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Badge Celebration Modal */}
      {showBadgeModal && newBadges.length > 0 && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-[fadeIn_0.3s_ease-out]"
          onClick={() => setShowBadgeModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center space-y-4 shadow-2xl animate-[bounceIn_0.5s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-6xl">🏆</div>
            <h2 className="text-2xl font-bold text-[var(--wrife-text-main)]" style={{ fontFamily: 'var(--font-display)' }}>
              New Badge{newBadges.length > 1 ? 's' : ''} Earned!
            </h2>
            <div className="space-y-3">
              {newBadges.map((badge) => (
                <div key={badge.badgeName} className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <p className="font-bold text-lg text-[var(--wrife-text-main)]">🌟 {badge.badgeName}</p>
                  <p className="text-sm text-[var(--wrife-text-muted)] mt-1">{badge.badgeDescription}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowBadgeModal(false)}
              className="px-6 py-3 rounded-full text-sm font-bold bg-[var(--wrife-yellow)] text-[var(--wrife-text-main)] hover:opacity-90 transition min-h-[44px]"
            >
              Awesome! 🎉
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.8); }
          50% { transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}