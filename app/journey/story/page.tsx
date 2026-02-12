'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PupilSession {
  pupilId: string;
  pupilName: string;
  yearGroup: number;
  classId: string;
}

interface FormulaInfo {
  structure: string;
  example: string;
  wordClasses: string[];
}

interface WordBank {
  people: string[];
  places: string[];
  things: string[];
}

interface AiAnalysis {
  formulaAdherence: number;
  grammarAccuracy: number;
  meaningClarity: number;
  personalConnection: number;
  totalScore: number;
  percentage: number;
  mastery: boolean;
  feedback: string;
  suggestions: string[];
  wordClassAnalysis: { word: string; class: string; correct: boolean }[];
}

export default function MyGrowingStoryPage() {
  const [session, setSession] = useState<PupilSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState(10);
  const [formula, setFormula] = useState<FormulaInfo | null>(null);
  const [wordBank, setWordBank] = useState<WordBank>({ people: [], places: [], things: [] });
  const [subjectsUsedThisWeek, setSubjectsUsedThisWeek] = useState<string[]>([]);
  const [showFormulaCard, setShowFormulaCard] = useState(true);

  const [selectedSubject, setSelectedSubject] = useState('');
  const [storyPart, setStoryPart] = useState<'beginning' | 'middle' | 'end'>('beginning');
  const [sentenceText, setSentenceText] = useState('');
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [suggestedSubjects, setSuggestedSubjects] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

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
      fetchStoryData(parsed.pupilId);
    } catch {
      router.push('/pupil/login');
    }
  }, [router]);

  async function fetchStoryData(pupilId: string) {
    try {
      const response = await fetch('/api/journey/story-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pupilId }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentLesson(data.currentLesson || 10);
        setFormula(data.formula || null);
        setWordBank(data.wordBank || { people: [], places: [], things: [] });
        setSubjectsUsedThisWeek(data.subjectsUsedThisWeek || []);
      }
    } catch (err) {
      console.error('Error fetching story data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckSentence() {
    if (!sentenceText.trim() || !session || !formula) return;
    setAnalyzing(true);
    setAnalysis(null);

    try {
      const response = await fetch('/api/journey/analyze-sentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pupilId: session.pupilId,
          yearGroup: session.yearGroup,
          lessonNumber: currentLesson,
          sentence: sentenceText.trim(),
          formulaStructure: formula.structure,
          wordBank,
          subject: selectedSubject,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('Error analyzing sentence:', err);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSubmitSentence() {
    if (!sentenceText.trim() || !session || !formula) return;

    try {
      const response = await fetch('/api/journey/submit-sentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pupilId: session.pupilId,
          lessonNumber: currentLesson,
          formulaUsed: formula.structure,
          subjectChosen: selectedSubject,
          sentenceText: sentenceText.trim(),
          storyPart,
          wordClasses: analysis?.wordClassAnalysis || [],
          aiAnalysisScore: analysis?.percentage || 0,
          formulaCorrect: analysis?.mastery || false,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Error submitting sentence:', err);
    }
  }

  async function handleSuggestSubjects() {
    if (!session || !formula) return;
    setLoadingSuggestions(true);

    try {
      const response = await fetch('/api/journey/suggest-subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          yearGroup: session.yearGroup,
          lessonNumber: currentLesson,
          wordBank,
          subjectsUsedThisWeek,
          storyType: 'happy',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestedSubjects(data.subjects || []);
      }
    } catch (err) {
      console.error('Error suggesting subjects:', err);
    } finally {
      setLoadingSuggestions(false);
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

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border-2 border-green-200">
          <div className="text-6xl mb-4">🌟</div>
          <h1
            className="text-3xl font-bold text-green-600 mb-2"
            style={{ fontFamily: "'Comic Sans MS', cursive" }}
          >
            Sentence Added!
          </h1>
          <p className="text-gray-600 mb-4">
            Your story is growing! You wrote:
          </p>
          <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-200">
            <p className="text-lg font-semibold text-gray-800 italic">
              &ldquo;{sentenceText}&rdquo;
            </p>
          </div>
          {analysis && (
            <div className="mb-4">
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                  analysis.mastery
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                Score: {analysis.percentage}%{' '}
                {analysis.mastery ? '✓ Mastery!' : ''}
              </span>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <Link href="/journey/story/history">
              <button className="w-full bg-amber-500 text-white py-3 rounded-full font-bold hover:bg-amber-600 transition">
                View My Story
              </button>
            </Link>
            <Link href="/journey">
              <button className="w-full bg-green-500 text-white py-3 rounded-full font-bold hover:bg-green-600 transition">
                Back Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const allSubjects = [
    ...wordBank.people,
    ...wordBank.places,
    ...wordBank.things,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/journey" className="text-gray-500 hover:text-gray-700 text-sm font-semibold">
            ← Back
          </Link>
          <h1 className="text-lg font-bold text-amber-700" style={{ fontFamily: "'Comic Sans MS', cursive" }}>
            My Growing Story
          </h1>
          <Link href="/journey/story/history" className="text-amber-600 hover:text-amber-700 text-sm font-semibold">
            View Story
          </Link>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Formula Reference Card */}
        {formula && (
          <div className="bg-white rounded-2xl shadow-md border-2 border-amber-200 mb-6">
            <button
              onClick={() => setShowFormulaCard(!showFormulaCard)}
              className="w-full p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">📐</span>
                <span className="font-bold text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive" }}>
                  Today&apos;s Formula
                </span>
              </div>
              <span className="text-gray-500">{showFormulaCard ? '▲' : '▼'}</span>
            </button>
            {showFormulaCard && (
              <div className="px-4 pb-4">
                <div className="bg-amber-50 rounded-xl p-4 mb-3">
                  <p className="font-bold text-lg text-amber-800 mb-2">
                    {formula.structure}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formula.wordClasses.map((wc, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-white rounded-full text-xs font-semibold border border-amber-200 text-amber-700"
                      >
                        {wc}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    Example: <em>{formula.example}</em>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Choose Subject */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 mb-6">
          <h3
            className="font-bold text-gray-800 mb-3"
            style={{ fontFamily: "'Comic Sans MS', cursive" }}
          >
            Choose Your Subject Today
          </h3>

          {subjectsUsedThisWeek.length > 0 && (
            <div className="mb-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-700">
                This week you&apos;ve used:{' '}
                {subjectsUsedThisWeek.map((s, i) => (
                  <span key={i} className="font-semibold">
                    {s}{i < subjectsUsedThisWeek.length - 1 ? ', ' : ''}
                  </span>
                ))}
                {' '}— Try something different!
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-3">
            {allSubjects.map((subject) => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  selectedSubject === subject
                    ? 'bg-amber-500 text-white'
                    : subjectsUsedThisWeek.includes(subject)
                    ? 'bg-gray-100 text-gray-400 line-through'
                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                }`}
              >
                {subject}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              placeholder="Or type your own subject..."
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <button
              onClick={handleSuggestSubjects}
              disabled={loadingSuggestions}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-semibold hover:bg-purple-200 transition text-sm"
            >
              {loadingSuggestions ? '...' : '💡 Suggest'}
            </button>
          </div>

          {suggestedSubjects.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestedSubjects.map((subject, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedSubject(subject)}
                  className="px-4 py-2 rounded-full text-sm font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition"
                >
                  {subject}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Story Part Selector */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 mb-6">
          <h3
            className="font-bold text-gray-800 mb-3"
            style={{ fontFamily: "'Comic Sans MS', cursive" }}
          >
            Story Part
          </h3>
          <div className="flex gap-3">
            {(['beginning', 'middle', 'end'] as const).map((part) => (
              <button
                key={part}
                onClick={() => setStoryPart(part)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition ${
                  storyPart === part
                    ? part === 'beginning'
                      ? 'bg-blue-500 text-white'
                      : part === 'middle'
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {part === 'beginning' ? '🏁 Beginning' : part === 'middle' ? '📖 Middle' : '🏆 End'}
              </button>
            ))}
          </div>
        </div>

        {/* Writing Area */}
        <div className="bg-white rounded-2xl shadow-md border-2 border-amber-200 p-5 mb-6">
          <h3
            className="font-bold text-gray-800 mb-3"
            style={{ fontFamily: "'Comic Sans MS', cursive" }}
          >
            Write Your Sentence
          </h3>

          {/* Formula scaffolding boxes */}
          {formula && currentLesson <= 12 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {formula.wordClasses.map((wc, i) => (
                <div
                  key={i}
                  className="px-4 py-2 bg-amber-50 border-2 border-dashed border-amber-300 rounded-lg text-center min-w-[80px]"
                >
                  <span className="text-xs text-amber-600 font-semibold">{wc}</span>
                </div>
              ))}
            </div>
          )}

          <textarea
            value={sentenceText}
            onChange={(e) => setSentenceText(e.target.value)}
            placeholder="Write your sentence here..."
            className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl text-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
            rows={3}
            style={{ fontFamily: "'Comic Sans MS', cursive" }}
          />

          {/* AI Analysis Result */}
          {analysis && (
            <div className="mt-4 space-y-3">
              {/* Word class highlighting */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-600 mb-2">Word Analysis:</p>
                <div className="flex flex-wrap gap-1">
                  {analysis.wordClassAnalysis.map((w, i) => (
                    <span
                      key={i}
                      className={`px-2 py-1 rounded text-sm font-semibold ${
                        w.correct
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      <span className="text-xs opacity-60">[{w.class}]</span> {w.word}
                    </span>
                  ))}
                </div>
              </div>

              {/* Score */}
              <div
                className={`p-4 rounded-xl border-2 ${
                  analysis.mastery
                    ? 'bg-green-50 border-green-300'
                    : 'bg-yellow-50 border-yellow-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg">
                    {analysis.mastery ? '✓ Great work!' : '💪 Nearly there!'}
                  </span>
                  <span className="text-lg font-bold">{analysis.percentage}%</span>
                </div>
                <p className="text-sm text-gray-700">{analysis.feedback}</p>
                {analysis.suggestions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 font-semibold">Suggestions:</p>
                    {analysis.suggestions.map((s, i) => (
                      <p key={i} className="text-xs text-gray-600">
                        • {s}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            {!analysis ? (
              <button
                onClick={handleCheckSentence}
                disabled={!sentenceText.trim() || analyzing}
                className="flex-1 px-6 py-3 rounded-full bg-blue-500 text-white font-bold hover:bg-blue-600 transition disabled:opacity-50 text-lg"
              >
                {analyzing ? 'Checking...' : '🔍 Check My Sentence'}
              </button>
            ) : analysis.mastery ? (
              <button
                onClick={handleSubmitSentence}
                className="flex-1 px-6 py-3 rounded-full bg-green-500 text-white font-bold hover:bg-green-600 transition text-lg"
              >
                ✓ Submit to My Story
              </button>
            ) : (
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => {
                    setAnalysis(null);
                  }}
                  className="flex-1 px-6 py-3 rounded-full border-2 border-amber-400 text-amber-700 font-bold hover:bg-amber-50 transition"
                >
                  Try Again
                </button>
                <button
                  onClick={handleSubmitSentence}
                  className="flex-1 px-6 py-3 rounded-full bg-amber-500 text-white font-bold hover:bg-amber-600 transition"
                >
                  Submit Anyway
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
