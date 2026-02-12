'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface WordBank {
  people: string[];
  places: string[];
  things: string[];
}

export default function WordBankPage() {
  const [wordBank, setWordBank] = useState<WordBank>({ people: [], places: [], things: [] });
  const [newWord, setNewWord] = useState('');
  const [category, setCategory] = useState<'people' | 'places' | 'things'>('people');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('pupilSession');
    if (!stored) {
      router.push('/pupil/login');
      return;
    }

    const session = JSON.parse(stored);
    fetchWordBank(session.pupilId);
  }, [router]);

  async function fetchWordBank(pupilId: string) {
    try {
      const response = await fetch('/api/journey/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pupilId }),
      });

      if (response.ok) {
        const data = await response.json();
        setWordBank(data.profile?.personalWordBank || { people: [], places: [], things: [] });
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddWord() {
    if (!newWord.trim()) return;
    setSaving(true);

    const stored = localStorage.getItem('pupilSession');
    if (!stored) return;
    const session = JSON.parse(stored);

    const updated = {
      ...wordBank,
      [category]: [...wordBank[category], newWord.trim()],
    };

    try {
      await fetch('/api/journey/update-word-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pupilId: session.pupilId, wordBank: updated }),
      });

      setWordBank(updated);
      setNewWord('');
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveWord(cat: keyof WordBank, word: string) {
    const stored = localStorage.getItem('pupilSession');
    if (!stored) return;
    const session = JSON.parse(stored);

    const updated = {
      ...wordBank,
      [cat]: wordBank[cat].filter(w => w !== word),
    };

    try {
      await fetch('/api/journey/update-word-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pupilId: session.pupilId, wordBank: updated }),
      });
      setWordBank(updated);
    } catch (err) {
      console.error('Error:', err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-r-transparent"></div>
      </div>
    );
  }

  const categoryConfig = {
    people: { emoji: '👤', color: 'blue', label: 'People' },
    places: { emoji: '🏠', color: 'green', label: 'Places' },
    things: { emoji: '🎾', color: 'amber', label: 'Things' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/journey" className="text-gray-500 hover:text-gray-700 text-sm font-semibold">
            ← Back
          </Link>
          <h1 className="text-lg font-bold text-purple-700" style={{ fontFamily: "'Comic Sans MS', cursive" }}>
            My Word Bank
          </h1>
          <div></div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <p className="text-gray-600 mb-6 text-center" style={{ fontFamily: "'Comic Sans MS', cursive" }}>
          These are your special words for writing stories!
        </p>

        {/* Add Word */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm mb-6">
          <h3 className="font-bold text-gray-800 mb-3" style={{ fontFamily: "'Comic Sans MS', cursive" }}>
            Add a New Word
          </h3>
          <div className="flex gap-2 mb-3">
            {(Object.keys(categoryConfig) as (keyof typeof categoryConfig)[]).map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat as any)}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${
                  category === cat
                    ? `bg-${categoryConfig[cat].color}-500 text-white`
                    : 'bg-gray-100 text-gray-600'
                }`}
                style={category === cat ? { backgroundColor: cat === 'people' ? '#3B82F6' : cat === 'places' ? '#22C55E' : '#F59E0B' } : {}}
              >
                {categoryConfig[cat].emoji} {categoryConfig[cat].label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder={`Type a ${category === 'people' ? 'person' : category === 'places' ? 'place' : 'thing'}...`}
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
            />
            <button
              onClick={handleAddWord}
              disabled={!newWord.trim() || saving}
              className="px-6 py-2 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>

        {/* Word Lists */}
        {(Object.keys(categoryConfig) as (keyof typeof categoryConfig)[]).map(cat => (
          <div key={cat} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm mb-4">
            <h3 className="font-bold text-gray-800 mb-3" style={{ fontFamily: "'Comic Sans MS', cursive" }}>
              {categoryConfig[cat].emoji} {categoryConfig[cat].label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {wordBank[cat].length === 0 ? (
                <p className="text-sm text-gray-400">No words yet. Add some!</p>
              ) : (
                wordBank[cat].map(word => (
                  <span
                    key={word}
                    className="group px-4 py-2 rounded-full text-sm font-semibold border-2 cursor-default"
                    style={{
                      backgroundColor: cat === 'people' ? '#DBEAFE' : cat === 'places' ? '#DCFCE7' : '#FEF3C7',
                      borderColor: cat === 'people' ? '#93C5FD' : cat === 'places' ? '#86EFAC' : '#FCD34D',
                      color: cat === 'people' ? '#1D4ED8' : cat === 'places' ? '#15803D' : '#B45309',
                    }}
                  >
                    {word}
                    <button
                      onClick={() => handleRemoveWord(cat, word)}
                      className="ml-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600"
                    >
                      &times;
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
