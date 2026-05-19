'use client';

import { useState, useEffect } from 'react';

// ── Types ─────────────────────────────────────────────────────

interface IPPupilStats {
  id: string;
  first_name: string;
  last_name: string | null;
  total_xp: number;
  lessons_completed: number;
  current_streak: number;
  last_active: string | null;
}

type IPCategory = 'xp' | 'lessons' | 'streak';

interface CategoryMeta {
  label: string;
  icon: string;
  getValue: (p: IPPupilStats) => number;
  unit: string;
  colour: string;
  description: string;
}

// ── Config ────────────────────────────────────────────────────

const CATEGORIES: Record<IPCategory, CategoryMeta> = {
  xp:      { label: 'XP',      icon: '⭐', getValue: (p) => p.total_xp,           unit: 'XP',      colour: '#6C5CE7', description: 'Total XP earned across all lessons' },
  lessons: { label: 'Lessons', icon: '📖', getValue: (p) => p.lessons_completed,  unit: '/ 61',    colour: '#00B894', description: 'Lessons completed out of 61' },
  streak:  { label: 'Streak',  icon: '🔥', getValue: (p) => p.current_streak,     unit: 'days',    colour: '#FF6B35', description: 'Current daily practice streak' },
};

const ALL_CATS = Object.keys(CATEGORIES) as IPCategory[];

// ── Helpers ───────────────────────────────────────────────────

function initials(first: string, last: string | null) {
  return `${first.charAt(0)}${last?.charAt(0) ?? ''}`.toUpperCase();
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff}d ago`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function getRankMedal(rank: number) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
}

// ── Component ─────────────────────────────────────────────────

interface Props {
  classId: string;
}

export function IPLeaderboardTab({ classId }: Props) {
  const [pupils, setPupils] = useState<IPPupilStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<IPCategory>('xp');

  useEffect(() => {
    fetchLeaderboard();
  }, [classId]);

  async function fetchLeaderboard() {
    try {
      setLoading(true);
      setError(null);
      // Reuse the existing interactive-practice endpoint
      const res = await fetch(`/api/teacher/interactive-practice?classId=${classId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setPupils(data.pupils ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }

  const sorted = [...pupils].sort((a, b) => {
    const diff = CATEGORIES[activeCategory].getValue(b) - CATEGORIES[activeCategory].getValue(a);
    if (diff !== 0) return diff;
    return a.first_name.localeCompare(b.first_name);
  });

  const hasAnyActivity = pupils.some((p) => p.total_xp > 0 || p.lessons_completed > 0);
  const activeMeta = CATEGORIES[activeCategory];

  // ── Render ─────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent"></div>
        <p className="mt-3 text-sm text-[var(--wrife-text-muted)]">Loading leaderboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-8 text-center">
        <p className="text-red-500 text-sm">{error}</p>
        <button onClick={fetchLeaderboard} className="mt-3 text-sm text-[var(--wrife-blue)] underline">
          Try again
        </button>
      </div>
    );
  }

  if (pupils.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-12 text-center">
        <span className="text-5xl">🎮</span>
        <h3 className="mt-4 text-lg font-bold text-[var(--wrife-text-main)]">No pupils yet</h3>
        <p className="mt-2 text-sm text-[var(--wrife-text-muted)]">Add pupils to this class to see the Interactive Practice leaderboard.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] overflow-hidden">

      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-[var(--wrife-border)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">🎮 Interactive Practice Leaderboard</h2>
            <p className="text-xs text-[var(--wrife-text-muted)] mt-0.5">
              {activeMeta.description}
            </p>
          </div>
          <button
            onClick={fetchLeaderboard}
            className="text-xs text-[var(--wrife-text-muted)] hover:text-[var(--wrife-blue)] transition px-2 py-1 rounded"
            title="Refresh"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2">
          {ALL_CATS.map((cat) => {
            const meta = CATEGORIES[cat];
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-1.5 rounded-full text-sm font-semibold transition"
                style={{
                  background: isActive ? meta.colour : 'transparent',
                  color: isActive ? '#fff' : 'var(--wrife-text-muted)',
                  border: `1.5px solid ${isActive ? meta.colour : 'var(--wrife-border)'}`,
                }}
              >
                {meta.icon} {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rows */}
      {!hasAnyActivity ? (
        <div className="px-6 py-12 text-center">
          <span className="text-4xl">📭</span>
          <p className="mt-3 text-sm text-[var(--wrife-text-muted)]">
            No activity yet — pupils need to log in to practice.wrife.co.uk to start earning XP.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--wrife-border)]">
          {sorted.map((pupil, idx) => {
            const rank = idx + 1;
            const medal = getRankMedal(rank);
            const score = activeMeta.getValue(pupil);
            const hasActivity = pupil.total_xp > 0 || pupil.lessons_completed > 0;

            return (
              <div
                key={pupil.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--wrife-bg)] transition"
                style={rank <= 3 && hasActivity ? {
                  background: `color-mix(in srgb, ${activeMeta.colour} 6%, white)`,
                } : undefined}
              >
                {/* Rank */}
                <div className="w-8 text-center shrink-0">
                  {medal && hasActivity ? (
                    <span className="text-xl">{medal}</span>
                  ) : (
                    <span className="text-sm font-bold text-[var(--wrife-text-muted)]">{rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: hasActivity ? activeMeta.colour : '#CBD5E1' }}
                >
                  {initials(pupil.first_name, pupil.last_name)}
                </div>

                {/* Name + last active */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--wrife-text-main)] truncate">
                    {pupil.first_name} {pupil.last_name || ''}
                  </p>
                  {pupil.last_active ? (
                    <p className="text-xs text-[var(--wrife-text-muted)]">
                      Active {formatDate(pupil.last_active)}
                    </p>
                  ) : (
                    <p className="text-xs text-[var(--wrife-text-muted)]">Not started yet</p>
                  )}
                </div>

                {/* Score pill */}
                <div className="shrink-0 text-right">
                  {hasActivity ? (
                    <span
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold text-white"
                      style={{ background: activeMeta.colour }}
                    >
                      {activeCategory === 'xp' ? score.toLocaleString() : score} {activeMeta.unit}
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--wrife-text-muted)] px-3 py-1 rounded-full bg-gray-100">
                      —
                    </span>
                  )}
                </div>

                {/* Secondary stats (desktop only) */}
                {hasActivity && (
                  <div className="hidden md:flex gap-3 shrink-0">
                    {activeCategory !== 'xp' && (
                      <div className="text-center min-w-[60px]">
                        <p className="text-xs text-[var(--wrife-text-muted)]">XP</p>
                        <p className="text-sm font-semibold text-[var(--wrife-text-main)]">⭐ {pupil.total_xp.toLocaleString()}</p>
                      </div>
                    )}
                    {activeCategory !== 'lessons' && (
                      <div className="text-center min-w-[60px]">
                        <p className="text-xs text-[var(--wrife-text-muted)]">Lessons</p>
                        <p className="text-sm font-semibold text-[var(--wrife-text-main)]">{pupil.lessons_completed} / 61</p>
                      </div>
                    )}
                    {activeCategory !== 'streak' && pupil.current_streak > 0 && (
                      <div className="text-center min-w-[50px]">
                        <p className="text-xs text-[var(--wrife-text-muted)]">Streak</p>
                        <p className="text-sm font-semibold text-[var(--wrife-text-main)]">🔥 {pupil.current_streak}d</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 border-t border-[var(--wrife-border)] bg-[var(--wrife-bg)]">
        <p className="text-xs text-[var(--wrife-text-muted)]">
          ⭐ XP = total points earned &nbsp;·&nbsp; 📖 Lessons = completed out of 61 &nbsp;·&nbsp; 🔥 Streak = current daily streak &nbsp;·&nbsp; Data from practice.wrife.co.uk
        </p>
      </div>
    </div>
  );
}
