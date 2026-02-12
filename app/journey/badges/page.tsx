'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ALL_BADGES = [
  { id: 'first_sentence', name: 'First Words', emoji: '✏️', description: 'Write your very first sentence' },
  { id: 'ten_sentences', name: 'Story Starter', emoji: '📖', description: 'Write 10 sentences for your story' },
  { id: 'quarter_century', name: 'Silver Quill', emoji: '🪶', description: 'Write 25 sentences' },
  { id: 'half_century', name: 'Golden Quill', emoji: '✨', description: 'Write 50 sentences' },
  { id: 'streak_5', name: 'Five Alive', emoji: '🔥', description: 'Log in 5 days in a row' },
  { id: 'streak_10', name: 'Perfect Ten', emoji: '⭐', description: 'Log in 10 days in a row' },
  { id: 'streak_20', name: 'Superstar', emoji: '🌟', description: 'Log in 20 days in a row' },
  { id: 'mastery_first', name: 'First Mastery', emoji: '🏆', description: 'Master your first lesson' },
  { id: 'mastery_10', name: 'Master Writer', emoji: '👑', description: 'Master 10 lessons' },
  { id: 'all_parts', name: 'Full Story', emoji: '📚', description: 'Write beginning, middle and end' },
  { id: 'word_collector', name: 'Word Collector', emoji: '💎', description: 'Add 20 words to your word bank' },
  { id: 'perfect_week', name: 'Perfect Week', emoji: '🌈', description: 'Get 100% on weekly assessment' },
];

export default function BadgesPage() {
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('pupilSession');
    if (!stored) {
      router.push('/pupil/login');
      return;
    }

    const session = JSON.parse(stored);
    fetchBadges(session.pupilId);
  }, [router]);

  async function fetchBadges(pupilId: string) {
    try {
      const response = await fetch('/api/journey/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pupilId }),
      });

      if (response.ok) {
        const data = await response.json();
        setEarnedBadges(data.profile?.badgesEarned || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white flex items-center justify-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-yellow-500 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/journey" className="text-gray-500 hover:text-gray-700 text-sm font-semibold">
            ← Back
          </Link>
          <h1 className="text-lg font-bold text-yellow-700" style={{ fontFamily: "'Comic Sans MS', cursive" }}>
            My Badges
          </h1>
          <div></div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <p className="text-2xl font-bold text-yellow-600" style={{ fontFamily: "'Comic Sans MS', cursive" }}>
            {earnedBadges.length} / {ALL_BADGES.length}
          </p>
          <p className="text-sm text-gray-500">badges earned</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {ALL_BADGES.map(badge => {
            const earned = earnedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`rounded-2xl p-5 text-center border-2 transition ${
                  earned
                    ? 'bg-white border-yellow-300 shadow-md'
                    : 'bg-gray-50 border-gray-200 opacity-50'
                }`}
              >
                <div className={`text-4xl mb-2 ${earned ? '' : 'grayscale'}`}>
                  {badge.emoji}
                </div>
                <h3 className="font-bold text-sm text-gray-800" style={{ fontFamily: "'Comic Sans MS', cursive" }}>
                  {badge.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {badge.description}
                </p>
                {earned && (
                  <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                    Earned!
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
