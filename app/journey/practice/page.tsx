'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PupilSession {
  pupilId: string;
  pupilName: string;
  yearGroup: number;
  classId: string;
}

interface Activity {
  id: number;
  activityNumber: number;
  wLevel: string;
  activityType: string;
  title: string;
  instructions: string;
  content: ActivityContent;
  correctAnswers: string[] | Record<string, string>;
  hints: string[];
}

interface ActivityContent {
  type: string;
  question?: string;
  options?: string[];
  items?: string[];
  categories?: string[];
  pairs?: { left: string; right: string }[];
  sentence?: string;
  blanks?: string[];
  wordBank?: string[];
}

export default function PracticeActivitiesPage() {
  const [session, setSession] = useState<PupilSession | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentLesson, setCurrentLesson] = useState(1);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState<string | string[] | Record<string, string>>('');
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState('');
  const [hintLoading, setHintLoading] = useState(false);
  const [activityStartTime, setActivityStartTime] = useState<number>(Date.now());
  const [isComplete, setIsComplete] = useState(false);
  const [dragItems, setDragItems] = useState<string[]>([]);
  const [dropZones, setDropZones] = useState<Record<string, string>>({});
  const [matchPairs, setMatchPairs] = useState<Record<string, string>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
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
      fetchActivities(parsed.pupilId, parsed.yearGroup);
    } catch {
      router.push('/pupil/login');
    }
  }, [router]);

  async function fetchActivities(pupilId: string, yearGroup: number) {
    try {
      const response = await fetch('/api/journey/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pupilId, yearGroup }),
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
        setCurrentLesson(data.currentLesson || 1);
        setCurrentIndex(data.resumeAt || 0);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
      setActivityStartTime(Date.now());
    }
  }

  const currentActivity = activities[currentIndex];

  const resetActivityState = useCallback(() => {
    setAnswer('');
    setFeedback(null);
    setShowHint(false);
    setHintText('');
    setDragItems([]);
    setDropZones({});
    setMatchPairs({});
    setSelectedLeft(null);
    setActivityStartTime(Date.now());
  }, []);

  useEffect(() => {
    if (currentActivity?.content?.items) {
      setDragItems([...currentActivity.content.items]);
    }
  }, [currentIndex, currentActivity]);

  async function handleSubmitAnswer() {
    if (!currentActivity || !session) return;

    const timeSpent = Math.round((Date.now() - activityStartTime) / 1000);

    let isCorrect = false;
    let userAnswer = answer;

    const actType = currentActivity.activityType;

    if (actType === 'multiple_choice') {
      const correct = Array.isArray(currentActivity.correctAnswers)
        ? currentActivity.correctAnswers[0]
        : '';
      isCorrect = answer === correct;
    } else if (actType === 'fill_blank') {
      const correct = Array.isArray(currentActivity.correctAnswers)
        ? currentActivity.correctAnswers
        : [];
      if (Array.isArray(answer)) {
        isCorrect = answer.every(
          (a, i) => a.toLowerCase().trim() === (correct[i] || '').toLowerCase().trim()
        );
      }
    } else if (actType === 'sorting') {
      userAnswer = dropZones;
      const correct = currentActivity.correctAnswers as Record<string, string>;
      isCorrect = Object.keys(correct).every(
        (key) => dropZones[key] === correct[key]
      );
    } else if (actType === 'matching') {
      userAnswer = matchPairs;
      const correctPairs = currentActivity.content.pairs || [];
      isCorrect = correctPairs.every(
        (pair) => matchPairs[pair.left] === pair.right
      );
    } else if (actType === 'drag_drop') {
      userAnswer = dragItems;
      const correct = Array.isArray(currentActivity.correctAnswers)
        ? currentActivity.correctAnswers
        : [];
      isCorrect = JSON.stringify(dragItems) === JSON.stringify(correct);
    }

    if (isCorrect) {
      setScore((s) => s + 1);
    }
    setTotalAnswered((t) => t + 1);

    setFeedback({
      correct: isCorrect,
      message: isCorrect
        ? getEncouragingMessage()
        : 'Not quite right. Try to think about what you learned.',
    });

    // Save progress
    try {
      await fetch('/api/journey/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pupilId: session.pupilId,
          lessonNumber: currentLesson,
          activityNumber: currentActivity.activityNumber,
          activityType: currentActivity.activityType,
          wLevel: currentActivity.wLevel,
          score: isCorrect ? 1 : 0,
          totalPossible: 1,
          timeSpentSeconds: timeSpent,
          responses: userAnswer,
        }),
      });
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  }

  function getEncouragingMessage(): string {
    const messages = [
      'Brilliant! Well done!',
      'Fantastic work!',
      'You got it right!',
      'Super job!',
      'Amazing! Keep going!',
      'Perfect answer!',
      'You are a star writer!',
      'Wonderful!',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  async function handleGetHint() {
    if (!currentActivity || !session) return;
    setHintLoading(true);

    try {
      const response = await fetch('/api/journey/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          yearGroup: session.yearGroup,
          question: currentActivity.content.question || currentActivity.title,
          activityType: currentActivity.activityType,
          options: currentActivity.content.options,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setHintText(data.hint);
        setShowHint(true);
      } else {
        // Fallback to static hints
        const hints = currentActivity.hints || [];
        setHintText(hints[0] || 'Think carefully about each word class.');
        setShowHint(true);
      }
    } catch {
      const hints = currentActivity.hints || [];
      setHintText(hints[0] || 'Think carefully about each word class.');
      setShowHint(true);
    } finally {
      setHintLoading(false);
    }
  }

  function handleNext() {
    if (currentIndex < activities.length - 1) {
      setCurrentIndex((i) => i + 1);
      resetActivityState();
    } else {
      setIsComplete(true);
    }
  }

  function handlePrevious() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      resetActivityState();
    }
  }

  // Completion Screen
  if (isComplete) {
    const percentage = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;
    const mastery = percentage >= 80;

    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border-2 border-green-200">
          <div className="text-6xl mb-4">{mastery ? '🎉' : '💪'}</div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "'Comic Sans MS', cursive", color: mastery ? '#27AE60' : '#E67E22' }}
          >
            {mastery ? 'Amazing Work!' : 'Good Try!'}
          </h1>
          <p className="text-gray-600 mb-4">
            You completed Lesson {currentLesson} activities!
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="text-4xl font-bold" style={{ color: mastery ? '#27AE60' : '#E67E22' }}>
              {score}/{totalAnswered}
            </div>
            <p className="text-sm text-gray-500">
              {percentage}% correct
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
              <div
                className={`h-3 rounded-full ${mastery ? 'bg-green-500' : 'bg-yellow-500'}`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm font-semibold" style={{ color: mastery ? '#27AE60' : '#E67E22' }}>
              {mastery ? 'Mastery achieved! ✓' : 'Keep practising - you can do it!'}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {currentLesson >= 10 && (
              <Link href="/journey/story">
                <button className="w-full bg-amber-500 text-white py-3 rounded-full font-bold hover:bg-amber-600 transition text-lg">
                  Write Your Story
                </button>
              </Link>
            )}
            <Link href="/journey">
              <button className="w-full bg-green-500 text-white py-3 rounded-full font-bold hover:bg-green-600 transition text-lg">
                Back Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600" style={{ fontFamily: "'Comic Sans MS', cursive" }}>
            Loading activities...
          </p>
        </div>
      </div>
    );
  }

  if (!currentActivity) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: "'Comic Sans MS', cursive" }}>
            No Activities Yet
          </h2>
          <p className="text-gray-600 mb-4">
            Your teacher will add activities for your lesson soon.
          </p>
          <Link href="/journey">
            <button className="bg-green-500 text-white px-6 py-3 rounded-full font-bold hover:bg-green-600 transition">
              Go Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const wLevelColors: Record<string, string> = {
    W1: 'bg-blue-100 text-blue-700 border-blue-300',
    W2: 'bg-green-100 text-green-700 border-green-300',
    W3: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    W4: 'bg-orange-100 text-orange-700 border-orange-300',
    W5: 'bg-red-100 text-red-700 border-red-300',
    W6: 'bg-purple-100 text-purple-700 border-purple-300',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/journey" className="text-gray-500 hover:text-gray-700 text-sm font-semibold">
            ← Back
          </Link>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                wLevelColors[currentActivity.wLevel] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {currentActivity.wLevel}
            </span>
            <span className="text-sm text-gray-500">
              Activity {currentIndex + 1} of {activities.length}
            </span>
          </div>
          <div className="text-sm font-semibold text-green-600">
            {score}/{totalAnswered}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white px-4 pb-2">
        <div className="max-w-3xl mx-auto">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / activities.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Activity Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <h2
            className="text-xl font-bold text-gray-800 mb-2"
            style={{ fontFamily: "'Comic Sans MS', cursive" }}
          >
            {currentActivity.title}
          </h2>
          <p className="text-gray-600 mb-6 text-lg">
            {currentActivity.instructions}
          </p>

          {/* Multiple Choice */}
          {currentActivity.activityType === 'multiple_choice' && (
            <div className="space-y-3">
              {(currentActivity.content.options || []).map((option, i) => (
                <button
                  key={i}
                  onClick={() => !feedback && setAnswer(option)}
                  disabled={!!feedback}
                  className={`w-full text-left p-4 rounded-xl border-2 transition text-lg ${
                    answer === option
                      ? feedback
                        ? feedback.correct
                          ? 'border-green-500 bg-green-50'
                          : option === (Array.isArray(currentActivity.correctAnswers) ? currentActivity.correctAnswers[0] : '')
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-blue-500 bg-blue-50'
                      : feedback && option === (Array.isArray(currentActivity.correctAnswers) ? currentActivity.correctAnswers[0] : '')
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                  style={{ minHeight: '56px' }}
                >
                  <span className="font-semibold">{String.fromCharCode(65 + i)}.</span>{' '}
                  {option}
                </button>
              ))}
            </div>
          )}

          {/* Fill in the Blank */}
          {currentActivity.activityType === 'fill_blank' && (
            <div className="space-y-4">
              {currentActivity.content.sentence && (
                <div className="bg-gray-50 rounded-xl p-4 text-lg">
                  {currentActivity.content.sentence}
                </div>
              )}
              {currentActivity.content.wordBank && currentActivity.content.wordBank.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-sm text-gray-500 w-full mb-1">Word Bank:</span>
                  {currentActivity.content.wordBank.map((word, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (!feedback) {
                          const blanks = currentActivity.content.blanks || [];
                          const current = Array.isArray(answer) ? [...answer] : new Array(blanks.length).fill('');
                          const emptyIdx = current.findIndex(a => a === '');
                          if (emptyIdx !== -1) {
                            current[emptyIdx] = word;
                            setAnswer(current);
                          }
                        }
                      }}
                      className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-semibold border-2 border-yellow-300 hover:bg-yellow-200 transition text-lg"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              )}
              <div className="space-y-3">
                {(currentActivity.content.blanks || ['']).map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    value={Array.isArray(answer) ? answer[i] || '' : i === 0 ? (answer as string) : ''}
                    onChange={(e) => {
                      if (!feedback) {
                        const blanks = currentActivity.content.blanks || [''];
                        const current = Array.isArray(answer) ? [...answer] : new Array(blanks.length).fill('');
                        current[i] = e.target.value;
                        setAnswer(current);
                      }
                    }}
                    disabled={!!feedback}
                    placeholder={`Type answer ${i + 1} here...`}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sorting */}
          {currentActivity.activityType === 'sorting' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-sm text-gray-500 w-full mb-1">Sort these items:</span>
                {(currentActivity.content.items || []).map((item, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-semibold border-2 border-blue-300 text-lg"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {(currentActivity.content.categories || []).map((cat) => (
                  <div key={cat} className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                    <h4 className="font-bold text-gray-700 mb-2 text-center">{cat}</h4>
                    <div className="space-y-2 min-h-[60px]">
                      {Object.entries(dropZones)
                        .filter(([, v]) => v === cat)
                        .map(([item]) => (
                          <div
                            key={item}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-semibold text-center cursor-pointer"
                            onClick={() => {
                              if (!feedback) {
                                const next = { ...dropZones };
                                delete next[item];
                                setDropZones(next);
                              }
                            }}
                          >
                            {item}
                          </div>
                        ))}
                    </div>
                    <div className="mt-2">
                      <select
                        className="w-full px-2 py-1 border rounded text-sm"
                        value=""
                        onChange={(e) => {
                          if (e.target.value && !feedback) {
                            setDropZones({ ...dropZones, [e.target.value]: cat });
                          }
                        }}
                        disabled={!!feedback}
                      >
                        <option value="">Add item...</option>
                        {(currentActivity.content.items || [])
                          .filter((item) => !dropZones[item])
                          .map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matching */}
          {currentActivity.activityType === 'matching' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Click a word on the left, then its match on the right.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  {(currentActivity.content.pairs || []).map((pair) => (
                    <button
                      key={pair.left}
                      onClick={() => !feedback && setSelectedLeft(pair.left)}
                      className={`w-full p-3 rounded-xl border-2 text-left font-semibold transition ${
                        selectedLeft === pair.left
                          ? 'border-blue-500 bg-blue-50'
                          : matchPairs[pair.left]
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      disabled={!!feedback}
                    >
                      {pair.left}
                      {matchPairs[pair.left] && (
                        <span className="text-xs text-green-600 block">
                          → {matchPairs[pair.left]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  {(currentActivity.content.pairs || [])
                    .map((p) => p.right)
                    .sort()
                    .map((right) => (
                      <button
                        key={right}
                        onClick={() => {
                          if (selectedLeft && !feedback) {
                            setMatchPairs({ ...matchPairs, [selectedLeft]: right });
                            setSelectedLeft(null);
                          }
                        }}
                        className={`w-full p-3 rounded-xl border-2 text-left font-semibold transition ${
                          Object.values(matchPairs).includes(right)
                            ? 'border-green-300 bg-green-50'
                            : selectedLeft
                            ? 'border-blue-300 hover:bg-blue-50 cursor-pointer'
                            : 'border-gray-200'
                        }`}
                        disabled={!!feedback || !selectedLeft}
                      >
                        {right}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Hint */}
          {showHint && hintText && (
            <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
              <p className="text-yellow-800 font-semibold text-sm">
                💡 Hint: {hintText}
              </p>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div
              className={`mt-4 p-4 rounded-xl border-2 ${
                feedback.correct
                  ? 'bg-green-50 border-green-300 text-green-800'
                  : 'bg-red-50 border-red-300 text-red-800'
              }`}
            >
              <p className="font-bold text-lg">
                {feedback.correct ? '✓ ' : '✗ '}
                {feedback.message}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {!feedback ? (
              <>
                <button
                  onClick={handleGetHint}
                  disabled={showHint || hintLoading}
                  className="flex-1 px-6 py-3 rounded-full border-2 border-yellow-400 text-yellow-700 font-bold hover:bg-yellow-50 transition disabled:opacity-50 text-lg"
                >
                  {hintLoading ? 'Thinking...' : '💡 Need Help?'}
                </button>
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!answer || (Array.isArray(answer) && answer.every(a => !a))}
                  className="flex-1 px-6 py-3 rounded-full bg-blue-500 text-white font-bold hover:bg-blue-600 transition disabled:opacity-50 text-lg"
                >
                  Check Answer
                </button>
              </>
            ) : (
              <div className="flex gap-3 w-full">
                {currentIndex > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="flex-1 px-6 py-3 rounded-full border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition text-lg"
                  >
                    ← Previous
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="flex-1 px-6 py-3 rounded-full bg-green-500 text-white font-bold hover:bg-green-600 transition text-lg"
                >
                  {currentIndex < activities.length - 1 ? 'Next →' : 'Finish!'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Save and Exit */}
        <div className="mt-4 text-center">
          <Link href="/journey">
            <button className="text-gray-500 hover:text-gray-700 text-sm font-semibold">
              Save and Exit
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
