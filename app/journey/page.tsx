'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PupilSession {
  pupilId: string;
  pupilName: string;
  classId: string;
  className: string;
  classCode: string;
  yearGroup: number;
}

interface PupilProfile {
  currentLesson: number;
  dailyLoginStreak: number;
  longestStreak: number;
  totalWordsWritten: number;
  storyType: string;
  adaptationLevel: string;
  badgesEarned: string[];
  personalWordBank: { people: string[]; places: string[]; things: string[] };
}

interface RecentActivity {
  type: string;
  label: string;
  score: number;
  date: string;
}

export default function WritersJourneyHome() {
  const [session, setSession] = useState<PupilSession | null>(null);
  const [profile, setProfile] = useState<PupilProfile | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [storyWordCount, setStoryWordCount] = useState(0);
  const [todayPracticeComplete, setTodayPracticeComplete] = useState(false);
  const [todayStoryComplete, setTodayStoryComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('pupilSession');
    if (!stored) {
      router.push('/pupil/login');
      return;
    }

    try {
      const parsed = JSON.parse(stored) as PupilSession;
      setSession(parsed);
      fetchProfile(parsed.pupilId);
    } catch {
      localStorage.removeItem('pupilSession');
      router.push('/pupil/login');
    }
  }, [router]);

  async function fetchProfile(pupilId: string) {
    try {
      const response = await fetch('/api/journey/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pupilId }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setRecentActivities(data.recentActivities || []);
        setStoryWordCount(data.storyWordCount || 0);
        setTodayPracticeComplete(data.todayPracticeComplete || false);
        setTodayStoryComplete(data.todayStoryComplete || false);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('pupilSession');
    router.push('/pupil/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
          <p className="mt-4 text-lg text-gray-600" style={{ fontFamily: "'Comic Sans MS', cursive" }}>
            Loading your journey...
          </p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const currentLesson = profile?.currentLesson || 1;
  const streak = profile?.dailyLoginStreak || 0;
  const totalWords = profile?.totalWordsWritten || 0;
  const badges = profile?.badgesEarned || [];
  const progressPercent = Math.round((currentLesson / 67) * 100);

  const today = new Date();
  const dateString = today.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl border-2 border-white/40">
                <span role="img" aria-label="owl">🦉</span>
              </div>
              <div>
                <h1
                  className="text-2xl font-bold"
                  style={{ fontFamily: "'Comic Sans MS', cursive" }}
                >
                  Hello, {session.pupilName}!
                </h1>
                <p className="text-green-100 text-sm">
                  {dateString} &bull; Lesson {currentLesson}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full text-sm font-semibold bg-white/20 hover:bg-white/30 transition"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {/* Streak */}
          <div className="bg-white rounded-2xl p-4 border-2 border-orange-200 shadow-sm text-center">
            <div className="text-3xl mb-1">
              {streak > 0 ? '🔥' : '💤'}
            </div>
            <p
              className="text-2xl font-bold text-orange-500"
              style={{ fontFamily: "'Comic Sans MS', cursive" }}
            >
              {streak}
            </p>
            <p className="text-xs text-gray-500">Day Streak</p>
          </div>

          {/* Lesson Progress */}
          <div className="bg-white rounded-2xl p-4 border-2 border-green-200 shadow-sm text-center">
            <div className="text-3xl mb-1">📖</div>
            <p
              className="text-2xl font-bold text-green-600"
              style={{ fontFamily: "'Comic Sans MS', cursive" }}
            >
              {currentLesson}
            </p>
            <p className="text-xs text-gray-500">Current Lesson</p>
          </div>

          {/* Story Words */}
          <div className="bg-white rounded-2xl p-4 border-2 border-blue-200 shadow-sm text-center">
            <div className="text-3xl mb-1">✍️</div>
            <p
              className="text-2xl font-bold text-blue-600"
              style={{ fontFamily: "'Comic Sans MS', cursive" }}
            >
              {storyWordCount}
            </p>
            <p className="text-xs text-gray-500">Story Words</p>
          </div>

          {/* Badges */}
          <div className="bg-white rounded-2xl p-4 border-2 border-purple-200 shadow-sm text-center">
            <div className="text-3xl mb-1">🏅</div>
            <p
              className="text-2xl font-bold text-purple-600"
              style={{ fontFamily: "'Comic Sans MS', cursive" }}
            >
              {badges.length}
            </p>
            <p className="text-xs text-gray-500">Badges</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Your Writer&apos;s Journey
            </span>
            <span className="text-sm font-bold text-green-600">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all relative"
              style={{ width: `${Math.max(progressPercent, 3)}%` }}
            >
              <span className="absolute right-1 top-0.5 text-xs text-white font-bold">
                {currentLesson}/67
              </span>
            </div>
          </div>
        </div>

        {/* Two Main Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Practice Skills */}
          <Link href="/journey/practice">
            <div
              className={`relative rounded-2xl p-6 border-2 shadow-md hover:shadow-lg transition cursor-pointer ${
                todayPracticeComplete
                  ? 'bg-green-50 border-green-300'
                  : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 hover:border-blue-400'
              }`}
              style={{ minHeight: '180px' }}
            >
              {todayPracticeComplete && (
                <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg">
                  ✓
                </div>
              )}
              <div className="text-5xl mb-3">📝</div>
              <h2
                className="text-xl font-bold text-gray-800 mb-2"
                style={{ fontFamily: "'Comic Sans MS', cursive" }}
              >
                Practice Skills
              </h2>
              <p className="text-sm text-gray-600">
                {todayPracticeComplete
                  ? "Great job! Today's practice is done!"
                  : 'Learn grammar with fun activities'}
              </p>
              <div className="mt-3">
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                    todayPracticeComplete
                      ? 'bg-green-200 text-green-700'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  {todayPracticeComplete ? 'Done for today' : 'Start Activities'}
                </span>
              </div>
            </div>
          </Link>

          {/* My Growing Story */}
          <Link href="/journey/story">
            <div
              className={`relative rounded-2xl p-6 border-2 shadow-md hover:shadow-lg transition cursor-pointer ${
                todayStoryComplete
                  ? 'bg-green-50 border-green-300'
                  : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 hover:border-amber-400'
              }`}
              style={{ minHeight: '180px' }}
            >
              {todayStoryComplete && (
                <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg">
                  ✓
                </div>
              )}
              <div className="text-5xl mb-3">📚</div>
              <h2
                className="text-xl font-bold text-gray-800 mb-2"
                style={{ fontFamily: "'Comic Sans MS', cursive" }}
              >
                My Growing Story
              </h2>
              <p className="text-sm text-gray-600">
                {todayStoryComplete
                  ? 'Your story is growing beautifully!'
                  : currentLesson >= 10
                  ? 'Add to your story today'
                  : 'Unlocks at Lesson 10'}
              </p>
              <div className="mt-3">
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                    todayStoryComplete
                      ? 'bg-green-200 text-green-700'
                      : currentLesson >= 10
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {todayStoryComplete
                    ? 'Done for today'
                    : currentLesson >= 10
                    ? 'Write Today'
                    : `Unlocks in ${10 - currentLesson} lessons`}
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm mb-6">
          <h3
            className="text-lg font-bold text-gray-800 mb-3"
            style={{ fontFamily: "'Comic Sans MS', cursive" }}
          >
            Recent Activity
          </h3>
          {recentActivities.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-2">🌟</div>
              <p className="text-gray-500">
                Start your first activity to see your progress here!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentActivities.slice(0, 5).map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {activity.type === 'practice' ? '📝' : '📚'}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {activity.label}
                      </p>
                      <p className="text-xs text-gray-500">{activity.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        activity.score >= 80
                          ? 'bg-green-100 text-green-700'
                          : activity.score >= 70
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {activity.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/journey/story/history">
            <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition text-center cursor-pointer">
              <div className="text-2xl mb-1">📖</div>
              <p className="text-xs font-semibold text-gray-700">My Story</p>
            </div>
          </Link>
          <Link href="/journey/word-bank">
            <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition text-center cursor-pointer">
              <div className="text-2xl mb-1">💬</div>
              <p className="text-xs font-semibold text-gray-700">Word Bank</p>
            </div>
          </Link>
          <Link href="/journey/badges">
            <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition text-center cursor-pointer">
              <div className="text-2xl mb-1">🏅</div>
              <p className="text-xs font-semibold text-gray-700">Badges</p>
            </div>
          </Link>
          <Link href="/pupil/dashboard">
            <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition text-center cursor-pointer">
              <div className="text-2xl mb-1">📋</div>
              <p className="text-xs font-semibold text-gray-700">Assignments</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
