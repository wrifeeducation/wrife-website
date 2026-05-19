'use client';

import { useState, useEffect } from 'react';

// ── Types ─────────────────────────────────────────────────────

interface LeaderboardEntry {
  rank: number;
  pupilId: string;
  name: string;
  isMe: boolean;
  totalXp: number;
  lessonsCompleted: number;
  currentStreak: number;
}

interface LeaderboardData {
  top5: LeaderboardEntry[];
  myRank: number | null;
  myRankOutside: LeaderboardEntry | null;
  totalPupils: number;
}

// ── Helpers ───────────────────────────────────────────────────

function getRankMedal(rank: number) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
}

function getRankOrdinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ── Component ─────────────────────────────────────────────────

interface Props {
  pupilId: string;
  practiceUrl: string;
}

export function PupilLeaderboardWidget({ pupilId, practiceUrl }: Props) {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pupilId) return;
    fetch(`/api/pupil/class-leaderboard?pupilId=${pupilId}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {/* silent fail — leaderboard is non-critical */})
      .finally(() => setLoading(false));
  }, [pupilId]);

  // Don't render anything if loading failed or no data
  if (!loading && (!data || data.totalPupils < 2)) return null;

  const hasActivity = data && data.top5.some((e) => e.totalXp > 0);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2
          className="text-xl font-extrabold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--wrife-text-main)' }}
        >
          🏆 Class Leaderboard
        </h2>
        {data?.myRank && (
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: '#6C5CE7', color: 'white' }}
          >
            You're {getRankOrdinal(data.myRank)} of {data.totalPupils}
          </span>
        )}
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1.5px solid var(--wrife-border)', background: 'white' }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--wrife-blue)] border-r-transparent" />
          </div>
        ) : !hasActivity ? (
          <div className="py-8 text-center">
            <p className="text-sm font-semibold" style={{ color: 'var(--wrife-text-main)' }}>No XP yet</p>
            <p className="text-xs mt-1" style={{ color: 'var(--wrife-text-muted)' }}>
              Be the first to earn points — play Interactive Practice!
            </p>
          </div>
        ) : (
          <>
            {/* Top 5 rows */}
            <div className="divide-y" style={{ borderColor: 'var(--wrife-border)' }}>
              {data!.top5.map((entry) => {
                const medal = getRankMedal(entry.rank);
                return (
                  <div
                    key={entry.pupilId}
                    className="flex items-center gap-3 px-4 py-3"
                    style={entry.isMe ? {
                      background: 'color-mix(in srgb, #6C5CE7 8%, white)',
                      fontWeight: 600,
                    } : undefined}
                  >
                    {/* Rank / medal */}
                    <div className="w-7 text-center shrink-0">
                      {medal ? (
                        <span className="text-lg">{medal}</span>
                      ) : (
                        <span className="text-sm font-bold" style={{ color: 'var(--wrife-text-muted)' }}>
                          {entry.rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: entry.isMe ? '#6C5CE7' : '#94A3B8' }}
                    >
                      {entry.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ color: 'var(--wrife-text-main)', fontWeight: entry.isMe ? 700 : 500 }}>
                        {entry.name}
                        {entry.isMe && (
                          <span className="ml-1.5 text-xs font-semibold px-1.5 py-0.5 rounded" style={{ background: '#6C5CE7', color: 'white' }}>
                            You
                          </span>
                        )}
                      </p>
                      {entry.currentStreak > 0 && (
                        <p className="text-xs" style={{ color: 'var(--wrife-text-muted)' }}>
                          🔥 {entry.currentStreak}-day streak
                        </p>
                      )}
                    </div>

                    {/* XP */}
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold" style={{ color: entry.isMe ? '#6C5CE7' : 'var(--wrife-text-main)' }}>
                        ⭐ {entry.totalXp.toLocaleString()}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--wrife-text-muted)' }}>
                        {entry.lessonsCompleted} lessons
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* If pupil is outside top 5, show their rank below a divider */}
            {data!.myRankOutside && (
              <>
                <div className="px-4 py-1.5 text-center text-xs" style={{ color: 'var(--wrife-text-muted)', borderTop: '1px dashed var(--wrife-border)' }}>
                  · · ·
                </div>
                <div
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ background: 'color-mix(in srgb, #6C5CE7 8%, white)' }}
                >
                  <div className="w-7 text-center shrink-0">
                    <span className="text-sm font-bold" style={{ color: 'var(--wrife-text-muted)' }}>
                      {data!.myRankOutside.rank}
                    </span>
                  </div>
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: '#6C5CE7' }}
                  >
                    {data!.myRankOutside.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--wrife-text-main)' }}>
                      {data!.myRankOutside.name}
                      <span className="ml-1.5 text-xs font-semibold px-1.5 py-0.5 rounded" style={{ background: '#6C5CE7', color: 'white' }}>
                        You
                      </span>
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold" style={{ color: '#6C5CE7' }}>
                      ⭐ {data!.myRankOutside.totalXp.toLocaleString()}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--wrife-text-muted)' }}>
                      {data!.myRankOutside.lessonsCompleted} lessons
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Footer CTA */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderTop: '1px solid var(--wrife-border)', background: 'var(--wrife-bg)' }}
            >
              <p className="text-xs" style={{ color: 'var(--wrife-text-muted)' }}>
                Based on Interactive Practice XP
              </p>
              <a
                href={practiceUrl}
                className="text-xs font-bold px-3 py-1.5 rounded-full text-white transition hover:opacity-90"
                style={{ background: '#6C5CE7' }}
              >
                Earn more XP →
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
