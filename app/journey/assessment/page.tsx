'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PupilSession {
  pupilId: string;
  pupilName: string;
  yearGroup: number;
}

type AssessmentPart = 'A' | 'B' | 'C' | 'D';

interface PartAQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface PartBSentence {
  sentence: string;
  formula: string;
}

export default function FormalAssessmentPage() {
  const [session, setSession] = useState<PupilSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPart, setCurrentPart] = useState<AssessmentPart>('A');
  const [lessonNumber, setLessonNumber] = useState(1);

  // Part A state
  const [partAQuestions] = useState<PartAQuestion[]>([
    { question: 'Which word is a noun?', options: ['running', 'dog', 'quickly', 'blue'], correctAnswer: 'dog' },
    { question: 'Which word is a verb?', options: ['table', 'jumps', 'happy', 'under'], correctAnswer: 'jumps' },
    { question: 'Which word is an adjective?', options: ['slowly', 'house', 'bright', 'swim'], correctAnswer: 'bright' },
    { question: 'Which word is an adverb?', options: ['cat', 'red', 'quietly', 'walk'], correctAnswer: 'quietly' },
    { question: 'What is a noun?', options: ['A doing word', 'A naming word', 'A describing word', 'A joining word'], correctAnswer: 'A naming word' },
    { question: 'Which is a complete sentence?', options: ['The big dog', 'Running fast', 'The cat sat on the mat.', 'Very happy today'], correctAnswer: 'The cat sat on the mat.' },
    { question: 'What does a verb tell us?', options: ['The name of something', 'What something does', 'What something looks like', 'Where something is'], correctAnswer: 'What something does' },
    { question: 'Which word is a determiner?', options: ['run', 'the', 'happy', 'fast'], correctAnswer: 'the' },
    { question: 'Which sentence follows Subject + Verb + Object?', options: ['The dog barked loudly.', 'The cat chased the mouse.', 'Under the big tree.', 'Happy and excited.'], correctAnswer: 'The cat chased the mouse.' },
    { question: 'Which word class does "beautiful" belong to?', options: ['Noun', 'Verb', 'Adjective', 'Adverb'], correctAnswer: 'Adjective' },
  ]);
  const [partAAnswers, setPartAAnswers] = useState<string[]>(new Array(10).fill(''));

  // Part B state
  const [partBSentences] = useState<PartBSentence[]>([
    { sentence: 'The happy dog chased the ball.', formula: 'Determiner + Adjective + Noun + Verb + Determiner + Noun' },
    { sentence: 'My mum baked a cake.', formula: 'Determiner + Noun + Verb + Determiner + Noun' },
    { sentence: 'The tall tree stood quietly.', formula: 'Determiner + Adjective + Noun + Verb + Adverb' },
    { sentence: 'A bright star shone in the sky.', formula: 'Determiner + Adjective + Noun + Verb + Prepositional Phrase' },
    { sentence: 'Yesterday, the children played in the park.', formula: 'Adverbial + Determiner + Noun + Verb + Prepositional Phrase' },
  ]);
  const [partBAnswers, setPartBAnswers] = useState<string[]>(new Array(5).fill(''));

  // Part C state
  const [partCAnswer, setPartCAnswer] = useState('');

  // Part D state
  const [partDAnswer, setPartDAnswer] = useState('');

  // Results
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<{
    partA: number;
    partB: number;
    partC: number;
    partD: number;
    total: number;
    percentage: number;
    masteryStatus: string;
  } | null>(null);

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
      fetchAssessmentData(parsed.pupilId);
    } catch {
      router.push('/pupil/login');
    }
  }, [router]);

  async function fetchAssessmentData(pupilId: string) {
    try {
      const response = await fetch('/api/journey/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pupilId }),
      });
      if (response.ok) {
        const data = await response.json();
        setLessonNumber(data.profile?.currentLesson || 1);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitAssessment() {
    if (!session) return;

    // Score Part A (10 points)
    const partAScore = partAAnswers.reduce((score, answer, i) => {
      return score + (answer === partAQuestions[i].correctAnswer ? 1 : 0);
    }, 0);

    // Part B, C, D would normally be AI-scored, but we'll submit to the API
    try {
      const response = await fetch('/api/journey/submit-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pupilId: session.pupilId,
          lessonNumber,
          partAResponses: partAAnswers,
          partAScore,
          partBResponses: partBAnswers,
          partCResponse: partCAnswer,
          partDResponse: partDAnswer,
          yearGroup: session.yearGroup,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Error submitting assessment:', err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-r-transparent"></div>
      </div>
    );
  }

  if (submitted && results) {
    const masteryParts = [
      results.partA >= 8,
      results.partB >= 8,
      results.partC >= 4,
      results.partD >= 4,
    ].filter(Boolean).length;

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border-2 border-indigo-200">
          <div className="text-6xl mb-4">
            {results.masteryStatus === 'mastered' ? '🏆' : results.masteryStatus === 'nearly_there' ? '⭐' : '💪'}
          </div>
          <h1
            className="text-2xl font-bold mb-4"
            style={{
              fontFamily: "'Comic Sans MS', cursive",
              color: results.masteryStatus === 'mastered' ? '#27AE60' : results.masteryStatus === 'nearly_there' ? '#E67E22' : '#E74C3C',
            }}
          >
            {results.masteryStatus === 'mastered' ? 'Mastery Achieved!' : results.masteryStatus === 'nearly_there' ? 'Nearly There!' : 'Keep Practising!'}
          </h1>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: 'Part A (Recognition)', score: results.partA, max: 10 },
              { label: 'Part B (Application)', score: results.partB, max: 10 },
              { label: 'Part C (Creation)', score: results.partC, max: 5 },
              { label: 'Part D (Explanation)', score: results.partD, max: 5 },
            ].map((part, i) => {
              const pct = (part.score / part.max) * 100;
              return (
                <div key={i} className={`p-3 rounded-xl border ${pct >= 80 ? 'border-green-200 bg-green-50' : pct >= 60 ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'}`}>
                  <p className="text-xs text-gray-600">{part.label}</p>
                  <p className="text-xl font-bold">{part.score}/{part.max}</p>
                  <span className={`text-xs font-bold ${pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {pct >= 80 ? '✓ Mastered' : pct >= 60 ? '⚠ Close' : '✗ Needs Work'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-3xl font-bold">{results.percentage}%</p>
            <p className="text-sm text-gray-500">
              Total: {results.total}/30 &bull; {masteryParts}/4 parts mastered
            </p>
          </div>

          <Link href="/journey">
            <button className="w-full bg-indigo-500 text-white py-3 rounded-full font-bold hover:bg-indigo-600 transition">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const parts: { key: AssessmentPart; label: string; emoji: string }[] = [
    { key: 'A', label: 'Recognition', emoji: '🔍' },
    { key: 'B', label: 'Application', emoji: '🎯' },
    { key: 'C', label: 'Creation', emoji: '✏️' },
    { key: 'D', label: 'Explanation', emoji: '💬' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/journey" className="text-gray-500 hover:text-gray-700 text-sm font-semibold">
            ← Back
          </Link>
          <h1 className="text-lg font-bold text-indigo-700" style={{ fontFamily: "'Comic Sans MS', cursive" }}>
            Lesson {lessonNumber} Assessment
          </h1>
          <div></div>
        </div>
      </div>

      {/* Part Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="max-w-3xl mx-auto flex gap-2">
          {parts.map(p => (
            <button
              key={p.key}
              onClick={() => setCurrentPart(p.key)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
                currentPart === p.key
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {p.emoji} Part {p.key}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Part A: Multiple Choice Recognition */}
        {currentPart === 'A' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: "'Comic Sans MS', cursive" }}>
              Part A: Recognition (10 marks)
            </h2>
            {partAQuestions.map((q, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="font-semibold text-gray-800 mb-3">
                  {i + 1}. {q.question}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => {
                        const newAnswers = [...partAAnswers];
                        newAnswers[i] = opt;
                        setPartAAnswers(newAnswers);
                      }}
                      className={`p-3 rounded-lg border-2 text-sm font-semibold transition ${
                        partAAnswers[i] === opt
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={() => setCurrentPart('B')}
              className="w-full py-3 bg-indigo-500 text-white rounded-full font-bold hover:bg-indigo-600 transition"
            >
              Next: Part B →
            </button>
          </div>
        )}

        {/* Part B: Sentence Analysis */}
        {currentPart === 'B' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: "'Comic Sans MS', cursive" }}>
              Part B: Application (10 marks)
            </h2>
            <p className="text-gray-600 mb-4">
              Write the formula for each sentence. Identify the word classes.
            </p>
            {partBSentences.map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="font-semibold text-gray-800 mb-2">
                  {i + 1}. &ldquo;{s.sentence}&rdquo;
                </p>
                <textarea
                  value={partBAnswers[i]}
                  onChange={(e) => {
                    const newAnswers = [...partBAnswers];
                    newAnswers[i] = e.target.value;
                    setPartBAnswers(newAnswers);
                  }}
                  placeholder="Write the formula (e.g., Determiner + Adjective + Noun + Verb + Object)"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  rows={2}
                />
              </div>
            ))}
            <div className="flex gap-3">
              <button onClick={() => setCurrentPart('A')} className="flex-1 py-3 border-2 border-gray-300 text-gray-600 rounded-full font-bold">
                ← Part A
              </button>
              <button onClick={() => setCurrentPart('C')} className="flex-1 py-3 bg-indigo-500 text-white rounded-full font-bold hover:bg-indigo-600">
                Next: Part C →
              </button>
            </div>
          </div>
        )}

        {/* Part C: Creation */}
        {currentPart === 'C' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: "'Comic Sans MS', cursive" }}>
              Part C: Creation (5 marks)
            </h2>
            <p className="text-gray-600 mb-4">
              Write one original sentence using the formula: Subject + Verb + Object.
              Make it personal and creative!
            </p>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <textarea
                value={partCAnswer}
                onChange={(e) => setPartCAnswer(e.target.value)}
                placeholder="Write your original sentence here..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-lg"
                rows={3}
                style={{ fontFamily: "'Comic Sans MS', cursive" }}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCurrentPart('B')} className="flex-1 py-3 border-2 border-gray-300 text-gray-600 rounded-full font-bold">
                ← Part B
              </button>
              <button onClick={() => setCurrentPart('D')} className="flex-1 py-3 bg-indigo-500 text-white rounded-full font-bold hover:bg-indigo-600">
                Next: Part D →
              </button>
            </div>
          </div>
        )}

        {/* Part D: Explanation */}
        {currentPart === 'D' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: "'Comic Sans MS', cursive" }}>
              Part D: Explanation (5 marks)
            </h2>
            <p className="text-gray-600 mb-4">
              Explain what a noun, verb, and adjective are. How do they work together in a sentence?
              Pretend you are teaching a friend!
            </p>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <textarea
                value={partDAnswer}
                onChange={(e) => setPartDAnswer(e.target.value)}
                placeholder="Explain in your own words..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-lg"
                rows={5}
                style={{ fontFamily: "'Comic Sans MS', cursive" }}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCurrentPart('C')} className="flex-1 py-3 border-2 border-gray-300 text-gray-600 rounded-full font-bold">
                ← Part C
              </button>
              <button
                onClick={handleSubmitAssessment}
                className="flex-1 py-3 bg-green-500 text-white rounded-full font-bold hover:bg-green-600 transition text-lg"
              >
                Submit Assessment ✓
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
