'use client';

import { useState, useEffect } from 'react';

// ── Types ─────────────────────────────────────────────────────

interface DWPPupilStats {
  pupil_id: string;
  name: string;
  first_name: string;
  last_name: string | null;
  levels_passed: number;
  current_streak: number;
  longest_streak: number;
  mastery_count: number;
  average_score: number | null;
  total_attempts: number;
  last_activity_date: string | null;
}

type DWPCategory = 'levels' | 'streak' | 'mastery';

interface CategoryMeta {
  label: string;
  icon: string;
  getValue: (p: DWPPupilStats) => number;
  unit: string;
  colour: string;
}

// ── Config ────────────────────────────────────────────────────

const CATEGORIES: Record<DWPCategory, CategoryMeta> = {
  levels:  { label: 'Levels',  icon: '📚', getValue: (p) => p.levels_passed,  unit: 'levels',  colour: '#6C5CE7' },
  streak:  { label: 'Streak',  icon: '🔥', getValue: (p) => p.current_streak, unit: 'days',    colour: '#FF6B35' },
  mastery: { label: 'Mastery', icon: '✨', getValue: (p) => p.mastery_count,   unit: 'mastered', colour: '#F5C500' },
};

const ALL_CATS = Object.keys(CATEGORIES) as DWPCategory[];

// ── Helpers ───────────────────────────────────────────────────

function initials(first: string, last: string | null) {
  return `${first.charAt(0)}${last?.charAt(0) ?? ''}`.toUpperCase();
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
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

export function DWPLeaderboardTab({ classId }: Props) {
  const [pupils, setPupils] = useState<DWPPupilStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<DWPCategory>('levels');

  useEffect(() => {
    fetchLeaderboard();
  }, [classId]);

  async function fetchLeaderboard() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/teacher/dwp-leaderboard?classId=${classId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setPupils(data.pupils ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }

  // Sorted by active category, then name
  const sorted = [...pupils].sort((a, b) => {
    const diff = CATEGORIES[activeCategory].getValue(b) - CATEGORIES[activeCategory].getValue(a);
    if (diff !== 0) return diff;
    return a.first_name.localeCompare(b.first_name);
  });

  const hasDWPData = pupils.some((p) => p.total_attempts > 0);

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
        <button
          onClick={fetchLeaderboard}
          className="mt-3 text-sm text-[var(--wrife-blue)] underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (pupils.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-12 text-center">
        <span className="text-5xl">📚</span>
        <h3 className="mt-4 text-lg font-bold text-[var(--wrife-text-main)]">No pupils yet</h3>
        <p className="mt-2 text-sm text-[var(--wrife-text-muted)]">Add pupils to this class to see the Daily Writing leaderboard.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] overflow-hidden">

      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-[var(--wrife-border)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">✍️ Daily Writing Leaderboard</h2>
            <p className="text-xs text-[var(--wrife-text-muted)] mt-0.5">
              {hasDWPData
                ? `${pupils.filter(p => p.total_attempts > 0).length} of ${pupils.length} pupils have started Daily Writing`
                : 'No pupils have started Daily Writing yet'}
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
                  background: isActive ? CATEGORIES[cat].colour : 'transparent',
                  color: isActive ? '#fff' : 'var(--wrife-text-muted)',
                  border: `1.5px solid ${isActive ? CATEGORIES[cat].colour : 'var(--wrife-border)'}`,
                }}
              >
                {meta.icon} {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Leaderboard rows */}
      {!hasDWPData ? (
        <div className="px-6 py-12 text-center">
          <span className="text-4xl">📭</span>
          <p className="mt-3 text-sm text-[var(--wrife-text-muted)]">No writing attempts yet — assign some DWP levels to get started.</p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--wrife-border)]">
          {sorted.map((pupil, idx) => {
            const rank = idx + 1;
            const medal = getRankMedal(rank);
            const score = CATEGORIES[activeCategory].getValue(pupil);
            const meta = CATEGORIES[activeCategory];
            const hasStarted = pupil.total_attempts > 0;

            return (
              <div
                key={pupil.pupil_id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--wrife-bg)] transition"
                style={rank <= 3 && hasStarted ? {
                  background: `color-mix(in srgb, ${meta.colour} 6%, white)`,
                } : undefined}
              >
                {/* Rank */}
                <div className="w-8 text-center shrink-0">
                  {medal && hasStarted ? (
                    <span className="text-xl">{medal}</span>
                  ) : (
                    <span className="text-sm font-bold text-[var(--wrife-text-muted)]">
                      {rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: hasStarted ? meta.colour : '#CBD5E1' }}
                >
                  {initials(pupil.first_name, pupil.last_name)}
                </div>

                {/* Name + last active */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--wrife-text-main)] truncate">
                    {pupil.name}
                  </p>
                  {pupil.last_activity_date ? (
                    <p className="text-xs text-[var(--wrife-text-muted)]">
                      Last active {formatDate(pupil.last_activity_date)}
                    </p>
                  ) : (
                    <p className="text-xs text-[var(--wrife-text-muted)]">Not started yet</p>
                  )}
                </div>

                {/* Score pill */}
                <div className="shrink-0 text-right">
                  {hasStarted ? (
                    <span
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold text-white"
                      style={{ background: meta.colour }}
                    >
                      {score} {meta.unit}
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--wrife-text-muted)] px-3 py-1 rounded-full bg-gray-100">
                      —
                    </span>
                  )}
                </div>

                {/* Secondary stats */}
                {hasStarted && (
                  <div className="hidden md:flex gap-3 shrink-0 text-right">
                    {activeCategory !== 'levels' && (
                      <div className="text-center min-w-[50px]">
                        <p className="text-xs text-[var(--wrife-text-muted)]">Levels</p>
                        <p className="text-sm font-semibold text-[var(--wrife-text-main)]">{pupil.levels_passed}</p>
                      </div>
                    )}
                    {activeCategory !== 'streak' && (
                      <div className="text-center min-w-[50px]">
                        <p className="text-xs text-[var(--wrife-text-muted)]">Streak</p>
                        <p className="text-sm font-semibold text-[var(--wrife-text-main)]">🔥 {pupil.current_streak}</p>
                      </div>
                    )}
                    {pupil.average_score !== null && activeCategory !== 'mastery' && (
                      <div className="text-center min-w-[50px]">
                        <p className="text-xs text-[var(--wrife-text-muted)]">Avg</p>
                        <p className="text-sm font-semibold text-[var(--wrife-text-main)]">{Math.round(pupil.average_score)}%</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer note */}
      <div className="px-6 py-3 border-t border-[var(--wrife-border)] bg-[var(--wrife-bg)]">
        <p className="text-xs text-[var(--wrife-text-muted)]">
          📚 Levels = DWP levels passed &nbsp;·&nbsp; 🔥 Streak = current daily streak &nbsp;·&nbsp; ✨ Mastery = levels passed at mastery band
        </p>
      </div>
    </div>
  );
}
