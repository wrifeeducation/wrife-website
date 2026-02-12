'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PupilSession {
  pupilId: string;
  pupilName: string;
}

interface Sentence {
  id: string;
  lessonNumber: number;
  dateWritten: string;
  formulaUsed: string;
  subjectChosen: string;
  sentenceText: string;
  storyPart: string;
  aiAnalysisScore: number;
  formulaCorrect: boolean;
  isFavorite: boolean;
  teacherFeedback: string | null;
}

export default function StoryHistoryPage() {
  const [session, setSession] = useState<PupilSession | null>(null);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'beginning' | 'middle' | 'end'>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'story'>('timeline');
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('pupilSession');
    if (!stored) {
      router.push('/pupil/login');
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      setSession(parsed);
      fetchHistory(parsed.pupilId);
    } catch {
      router.push('/pupil/login');
    }
  }, [router]);

  async function fetchHistory(pupilId: string) {
    try {
      const response = await fetch('/api/journey/story-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pupilId }),
      });

      if (response.ok) {
        const data = await response.json();
        setSentences(data.sentences || []);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavorite(sentenceId: string) {
    try {
      await fetch('/api/journey/toggle-favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentenceId }),
      });

      setSentences(sentences.map(s =>
        s.id === sentenceId ? { ...s, isFavorite: !s.isFavorite } : s
      ));
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600" style={{ fontFamily: "'Comic Sans MS', cursive" }}>
            Loading your story...
          </p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const filteredSentences = filter === 'all'
    ? sentences
    : sentences.filter(s => s.storyPart === filter);

  const totalWords = sentences.reduce(
    (sum, s) => sum + s.sentenceText.split(' ').length,
    0
  );

  const partCounts = {
    beginning: sentences.filter(s => s.storyPart === 'beginning').length,
    middle: sentences.filter(s => s.storyPart === 'middle').length,
    end: sentences.filter(s => s.storyPart === 'end').length,
  };

  const storyPartColors: Record<string, string> = {
    beginning: 'bg-blue-100 text-blue-700 border-blue-300',
    middle: 'bg-green-100 text-green-700 border-green-300',
    end: 'bg-red-100 text-red-700 border-red-300',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/journey" className="text-gray-500 hover:text-gray-700 text-sm font-semibold">
            ← Back
          </Link>
          <h1 className="text-lg font-bold text-amber-700" style={{ fontFamily: "'Comic Sans MS', cursive" }}>
            My Story So Far
          </h1>
          <button
            onClick={() => window.print()}
            className="text-amber-600 hover:text-amber-700 text-sm font-semibold"
          >
            Print
          </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center shadow-sm">
            <p className="text-2xl font-bold text-amber-600">{sentences.length}</p>
            <p className="text-xs text-gray-500">Sentences</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center shadow-sm">
            <p className="text-2xl font-bold text-blue-600">{totalWords}</p>
            <p className="text-xs text-gray-500">Total Words</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center shadow-sm">
            <p className="text-2xl font-bold text-green-600">
              {sentences.filter(s => s.formulaCorrect).length}
            </p>
            <p className="text-xs text-gray-500">Correct Formula</p>
          </div>
        </div>

        {/* Story Part Balance */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-2">Story Balance</p>
          <div className="flex gap-2">
            <div className="flex-1 bg-blue-100 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-blue-700">{partCounts.beginning}</p>
              <p className="text-xs text-blue-600">Beginning</p>
            </div>
            <div className="flex-1 bg-green-100 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-green-700">{partCounts.middle}</p>
              <p className="text-xs text-green-600">Middle</p>
            </div>
            <div className="flex-1 bg-red-100 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-red-700">{partCounts.end}</p>
              <p className="text-xs text-red-600">End</p>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              viewMode === 'timeline'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Timeline View
          </button>
          <button
            onClick={() => setViewMode('story')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              viewMode === 'story'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Story View
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {(['all', 'beginning', 'middle', 'end'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                filter === f
                  ? 'bg-amber-200 text-amber-800'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Sentences */}
        {filteredSentences.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
            <div className="text-5xl mb-4">✍️</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2" style={{ fontFamily: "'Comic Sans MS', cursive" }}>
              Your Story Starts Here!
            </h3>
            <p className="text-gray-600 mb-4">
              Write your first sentence to begin your growing story.
            </p>
            <Link href="/journey/story">
              <button className="bg-amber-500 text-white px-6 py-3 rounded-full font-bold hover:bg-amber-600 transition">
                Start Writing
              </button>
            </Link>
          </div>
        ) : viewMode === 'story' ? (
          /* Story View - continuous prose */
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center" style={{ fontFamily: "'Comic Sans MS', cursive" }}>
              {session.pupilName}&apos;s Story
            </h3>
            <div className="space-y-1">
              {/* Group by story part */}
              {['beginning', 'middle', 'end'].map(part => {
                const partSentences = filteredSentences.filter(s => s.storyPart === part);
                if (partSentences.length === 0) return null;
                return (
                  <div key={part} className="mb-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mb-1 ${storyPartColors[part]}`}>
                      {part.charAt(0).toUpperCase() + part.slice(1)}
                    </span>
                    <p className="text-lg leading-relaxed text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive" }}>
                      {partSentences.map(s => s.sentenceText).join(' ')}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Timeline View */
          <div className="space-y-3">
            {filteredSentences.map((sentence) => (
              <div
                key={sentence.id}
                className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${storyPartColors[sentence.storyPart]}`}>
                      {sentence.storyPart === 'beginning' ? 'B' : sentence.storyPart === 'middle' ? 'M' : 'E'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Lesson {sentence.lessonNumber}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(sentence.dateWritten).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        sentence.aiAnalysisScore >= 80
                          ? 'bg-green-100 text-green-700'
                          : sentence.aiAnalysisScore >= 70
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {sentence.aiAnalysisScore}%
                    </span>
                    <button
                      onClick={() => toggleFavorite(sentence.id)}
                      className="text-lg"
                    >
                      {sentence.isFavorite ? '⭐' : '☆'}
                    </button>
                  </div>
                </div>

                <p className="text-lg text-gray-800 mb-2" style={{ fontFamily: "'Comic Sans MS', cursive" }}>
                  &ldquo;{sentence.sentenceText}&rdquo;
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Formula: {sentence.formulaUsed}</span>
                  <span>Subject: {sentence.subjectChosen}</span>
                </div>

                {sentence.teacherFeedback && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700">
                      <span className="font-bold">Teacher:</span> {sentence.teacherFeedback}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Word Count Growth - simple visualization */}
        {sentences.length > 1 && (
          <div className="mt-6 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <h4 className="text-sm font-bold text-gray-700 mb-3">Your Story Growth</h4>
            <div className="flex items-end gap-1" style={{ height: '60px' }}>
              {sentences.map((s, i) => {
                const words = s.sentenceText.split(' ').length;
                const maxWords = Math.max(...sentences.map(s => s.sentenceText.split(' ').length));
                const height = maxWords > 0 ? (words / maxWords) * 100 : 50;
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-t ${
                      s.formulaCorrect ? 'bg-green-400' : 'bg-yellow-400'
                    }`}
                    style={{ height: `${Math.max(height, 10)}%` }}
                    title={`${words} words - Lesson ${s.lessonNumber}`}
                  ></div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-1 text-center">
              Each bar = one sentence ({sentences.length} total)
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
