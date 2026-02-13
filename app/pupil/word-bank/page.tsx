"use client";

import { useEffect, useState, useCallback } from 'react';
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

interface WordBank {
  people: string[];
  places: string[];
  things: string[];
}

type Category = 'people' | 'places' | 'things';
type StoryType = 'happy' | 'sad' | 'funny';

const CATEGORY_CONFIG: Record<Category, { label: string; emoji: string; color: string; bgColor: string; borderColor: string; softBg: string }> = {
  people: {
    label: 'People',
    emoji: '🧑',
    color: 'var(--wrife-blue)',
    bgColor: '#dbeafe',
    borderColor: '#93c5fd',
    softBg: 'var(--wrife-blue-soft)',
  },
  places: {
    label: 'Places',
    emoji: '🌍',
    color: 'var(--wrife-green)',
    bgColor: '#dcfce7',
    borderColor: '#86efac',
    softBg: 'var(--wrife-green-soft)',
  },
  things: {
    label: 'Things',
    emoji: '⭐',
    color: 'var(--wrife-yellow)',
    bgColor: '#fef9c3',
    borderColor: '#fde047',
    softBg: 'var(--wrife-yellow-soft)',
  },
};

const STORY_TYPES: { value: StoryType; label: string; emoji: string }[] = [
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'sad', label: 'Sad', emoji: '😢' },
  { value: 'funny', label: 'Funny', emoji: '😂' },
];

export default function WordBankPage() {
  const [session, setSession] = useState<PupilSession | null>(null);
  const [wordBank, setWordBank] = useState<WordBank>({ people: [], places: [], things: [] });
  const [loading, setLoading] = useState(true);
  const [inputValues, setInputValues] = useState<Record<Category, string>>({ people: '', places: '', things: '' });
  const [addingTo, setAddingTo] = useState<Category | null>(null);
  const [deletingWord, setDeletingWord] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);

  const [suggestCategory, setSuggestCategory] = useState<Category>('people');
  const [suggestStoryType, setSuggestStoryType] = useState<StoryType>('happy');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [addingSuggestion, setAddingSuggestion] = useState<string | null>(null);

  const router = useRouter();

  async function fetchWordBank(pupilId: string) {
    try {
      const res = await fetch(`/api/pupil/word-bank?pupilId=${pupilId}`);
      if (res.status === 401) {
        setAuthError(true);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setWordBank(data);
      }
    } catch (err) {
      console.error('Error fetching word bank:', err);
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem('pupilSession');
    if (!stored) {
      router.push('/pupil/login');
      return;
    }

    try {
      const parsed = JSON.parse(stored) as PupilSession;
      setSession(parsed);
      fetchWordBank(parsed.pupilId).finally(() => setLoading(false));
    } catch {
      localStorage.removeItem('pupilSession');
      router.push('/pupil/login');
    }
  }, [router]);

  async function handleAddWord(category: Category) {
    const word = inputValues[category].trim();
    if (!word) return;

    setAddingTo(category);
    try {
      const res = await fetch('/api/pupil/word-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pupilId: session?.pupilId, category, word }),
      });

      if (res.status === 401) {
        setAuthError(true);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setWordBank(data);
        setInputValues(prev => ({ ...prev, [category]: '' }));
      }
    } catch (err) {
      console.error('Error adding word:', err);
    } finally {
      setAddingTo(null);
    }
  }

  async function handleDeleteWord(category: Category, word: string) {
    setDeletingWord(word);
    try {
      const res = await fetch(`/api/pupil/word-bank/${encodeURIComponent(word)}?category=${category}&pupilId=${session?.pupilId}`, {
        method: 'DELETE',
      });

      if (res.status === 401) {
        setAuthError(true);
        return;
      }

      if (res.ok) {
        setWordBank(prev => ({
          ...prev,
          [category]: prev[category].filter(w => w !== word),
        }));
      }
    } catch (err) {
      console.error('Error deleting word:', err);
    } finally {
      setDeletingWord(null);
    }
  }

  async function handleGetSuggestions() {
    setSuggestLoading(true);
    setSuggestions([]);
    try {
      const res = await fetch('/api/pupil/word-bank/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pupilId: session?.pupilId, category: suggestCategory, storyType: suggestStoryType }),
      });

      if (res.status === 401) {
        setAuthError(true);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (err) {
      console.error('Error getting suggestions:', err);
    } finally {
      setSuggestLoading(false);
    }
  }

  async function handleAddSuggestion(word: string) {
    setAddingSuggestion(word);
    try {
      const res = await fetch('/api/pupil/word-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pupilId: session?.pupilId, category: suggestCategory, word }),
      });

      if (res.status === 401) {
        setAuthError(true);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setWordBank(data);
        setSuggestions(prev => prev.filter(s => s !== word));
      }
    } catch (err) {
      console.error('Error adding suggestion:', err);
    } finally {
      setAddingSuggestion(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent"></div>
          <p className="mt-4 text-sm text-[var(--wrife-text-muted)]">Loading your word bank...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  if (authError) {
    return (
      <div className="min-h-screen bg-[var(--wrife-bg)]">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-[var(--wrife-text-main)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            Session Expired
          </h2>
          <p className="text-[var(--wrife-text-muted)] mb-6 text-lg">
            Please log in again to access your word bank.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('pupilSession');
              router.push('/pupil/login');
            }}
            className="px-8 py-3 rounded-full text-lg font-bold text-white bg-[var(--wrife-blue)] hover:opacity-90 transition min-h-[44px]"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const totalWords = wordBank.people.length + wordBank.places.length + wordBank.things.length;

  return (
    <div className="min-h-screen bg-[var(--wrife-bg)]">
      <Navbar />

      <div className="bg-[var(--wrife-blue)] text-white py-6">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            📝 My Word Bank
          </h1>
          <p className="text-blue-100 text-sm mt-1">
            {session.pupilName} • {session.className}
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          {(Object.keys(CATEGORY_CONFIG) as Category[]).map(cat => {
            const config = CATEGORY_CONFIG[cat];
            return (
              <div
                key={cat}
                className="rounded-2xl p-4 text-center"
                style={{ backgroundColor: config.bgColor, border: `2px solid ${config.borderColor}` }}
              >
                <p className="text-3xl mb-1">{config.emoji}</p>
                <p className="text-2xl font-bold text-[var(--wrife-text-main)]">{wordBank[cat].length}</p>
                <p className="text-sm text-[var(--wrife-text-muted)]">{config.label}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center mb-6">
          <p className="text-lg font-semibold text-[var(--wrife-text-main)]">
            {totalWords} {totalWords === 1 ? 'word' : 'words'} in your bank
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {(Object.keys(CATEGORY_CONFIG) as Category[]).map(category => {
            const config = CATEGORY_CONFIG[category];
            const words = wordBank[category];

            return (
              <div
                key={category}
                className="rounded-2xl overflow-hidden border-2"
                style={{ borderColor: config.borderColor }}
              >
                <div
                  className="px-5 py-4 flex items-center gap-3"
                  style={{ backgroundColor: config.bgColor }}
                >
                  <span className="text-2xl">{config.emoji}</span>
                  <h2 className="text-xl font-bold text-[var(--wrife-text-main)]" style={{ fontFamily: 'var(--font-display)' }}>
                    {config.label}
                  </h2>
                  <span
                    className="ml-auto inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: config.color }}
                  >
                    {words.length}
                  </span>
                </div>

                <div className="bg-white p-4 min-h-[120px]">
                  {words.length === 0 ? (
                    <p className="text-sm text-[var(--wrife-text-muted)] text-center py-4">
                      No {category} added yet. Start building your word bank!
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {words.map(word => (
                        <span
                          key={word}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
                          style={{
                            backgroundColor: config.bgColor,
                            color: 'var(--wrife-text-main)',
                            border: `1px solid ${config.borderColor}`,
                          }}
                        >
                          {word}
                          <button
                            onClick={() => handleDeleteWord(category, word)}
                            disabled={deletingWord === word}
                            className="ml-1 w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-colors min-w-[20px] min-h-[20px]"
                            aria-label={`Remove ${word}`}
                          >
                            {deletingWord === word ? (
                              <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                              '×'
                            )}
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white px-4 pb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputValues[category]}
                      onChange={e => setInputValues(prev => ({ ...prev, [category]: e.target.value }))}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleAddWord(category);
                      }}
                      placeholder={`Add a ${category.slice(0, -1)}...`}
                      className="flex-1 min-h-[44px] px-4 rounded-full border-2 text-sm focus:outline-none transition-colors"
                      style={{ borderColor: config.borderColor }}
                      disabled={addingTo === category}
                    />
                    <button
                      onClick={() => handleAddWord(category)}
                      disabled={addingTo === category || !inputValues[category].trim()}
                      className="min-w-[44px] min-h-[44px] rounded-full text-white font-bold text-lg flex items-center justify-center transition-opacity disabled:opacity-50"
                      style={{ backgroundColor: config.color }}
                      aria-label={`Add to ${category}`}
                    >
                      {addingTo === category ? (
                        <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        '+'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border-2 border-purple-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-5 py-4">
            <h2 className="text-xl font-bold text-[var(--wrife-text-main)] flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
              <span className="text-2xl">✨</span>
              AI Suggestions
            </h2>
            <p className="text-sm text-[var(--wrife-text-muted)] mt-1">
              Get creative word ideas for your stories!
            </p>
          </div>

          <div className="bg-white p-5">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
                Story Type
              </label>
              <div className="flex gap-2 flex-wrap">
                {STORY_TYPES.map(st => (
                  <button
                    key={st.value}
                    onClick={() => setSuggestStoryType(st.value)}
                    className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all min-h-[44px]"
                    style={{
                      backgroundColor: suggestStoryType === st.value ? '#7c3aed' : '#f3f4f6',
                      color: suggestStoryType === st.value ? 'white' : 'var(--wrife-text-main)',
                    }}
                  >
                    {st.emoji} {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
                Category
              </label>
              <div className="flex gap-2 flex-wrap">
                {(Object.keys(CATEGORY_CONFIG) as Category[]).map(cat => {
                  const config = CATEGORY_CONFIG[cat];
                  return (
                    <button
                      key={cat}
                      onClick={() => setSuggestCategory(cat)}
                      className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all min-h-[44px]"
                      style={{
                        backgroundColor: suggestCategory === cat ? config.color : '#f3f4f6',
                        color: suggestCategory === cat ? 'white' : 'var(--wrife-text-main)',
                      }}
                    >
                      {config.emoji} {config.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleGetSuggestions}
              disabled={suggestLoading}
              className="w-full py-3 rounded-full text-lg font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all min-h-[44px] disabled:opacity-60"
            >
              {suggestLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Thinking...
                </span>
              ) : (
                '✨ Get AI Suggestions'
              )}
            </button>

            {suggestions.length > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-purple-50 border border-purple-200">
                <p className="text-sm font-semibold text-[var(--wrife-text-main)] mb-3">
                  Click a suggestion to add it to your {CATEGORY_CONFIG[suggestCategory].label} bank:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map(word => (
                    <button
                      key={word}
                      onClick={() => handleAddSuggestion(word)}
                      disabled={addingSuggestion === word}
                      className="px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[44px] hover:scale-105 active:scale-95"
                      style={{
                        backgroundColor: CATEGORY_CONFIG[suggestCategory].bgColor,
                        border: `2px solid ${CATEGORY_CONFIG[suggestCategory].borderColor}`,
                        color: 'var(--wrife-text-main)',
                        opacity: addingSuggestion === word ? 0.5 : 1,
                      }}
                    >
                      {addingSuggestion === word ? (
                        <span className="inline-flex items-center gap-1">
                          <span className="inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                          Adding...
                        </span>
                      ) : (
                        <span>+ {word}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
