'use client';

import { useState, useEffect } from 'react';

// ── Types ─────────────────────────────────────────────────────

interface PWPPupilStats {
  id: string;
  first_name: string;
  last_name: string | null;
  has_studio_account: boolean;
  highest_level: number;
  sessions_last_30d: number;
  writing_pieces: number;
  last_active: string | null;
  ready_to_advance: boolean;
}

type PWPCategory = 'level' | 'sessions' | 'pieces';

interface CategoryMeta {
  label: string;
  icon: string;
  getValue: (p: PWPPupilStats) => number;
  unit: string;
  colour: string;
  description: string;
}

// ── Config ────────────────────────────────────────────────────

const CATEGORIES: Record<PWPCategory, CategoryMeta> = {
  level:    { label: 'Level',    icon: '📚', getValue: (p) => p.highest_level,      unit: '',       colour: '#6C5CE7', description: 'Highest formula level reached' },
  sessions: { label: 'Sessions', icon: '📝', getValue: (p) => p.sessions_last_30d,  unit: 'this month', colour: '#00B894', description: 'Practice sessions in the last 30 days' },
  pieces:   { label: 'Pieces',   icon: '✍️', getValue: (p) => p.writing_pieces,     unit: 'pieces', colour: '#F5A623', description: 'Writing pieces completed' },
};

const ALL_CATS = Object.keys(CATEGORIES) as PWPCategory[];

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

function LevelBadge({ level }: { level: number }) {
  if (level === 0) return null;
  const bg =
    level >= 50 ? 'bg-yellow-100 text-yellow-700'
    : level >= 25 ? 'bg-purple-100 text-purple-700'
    : 'bg-blue-100 text-blue-700';
  return (
    <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold ${bg}`}>
      L{level}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────

interface Props {
  classId: string;
}

export function PWPLeaderboardTab({ classId }: Props) {
  const [pupils, setPupils] = useState<PWPPupilStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<PWPCategory>('level');

  useEffect(() => {
    fetchLeaderboard();
  }, [classId]);

  async function fetchLeaderboard() {
    try {
      setLoading(true);
      setError(null);
      // Reuse the existing pwp-studio endpoint — it already has all the metrics we need
      const res = await fetch(`/api/teacher/pwp-studio?classId=${classId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setPupils(data.pupils ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }

  // Sorted by active category desc, then name asc
  const sorted = [...pupils].sort((a, b) => {
    const diff = CATEGORIES[activeCategory].getValue(b) - CATEGORIES[activeCategory].getValue(a);
    if (diff !== 0) return diff;
    return a.first_name.localeCompare(b.first_name);
  });

  const hasAnyActivity = pupils.some((p) => p.sessions_last_30d > 0 || p.writing_pieces > 0 || p.highest_level > 0);
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
        <span className="text-5xl">✏️</span>
        <h3 className="mt-4 text-lg font-bold text-[var(--wrife-text-main)]">No pupils yet</h3>
        <p className="mt-2 text-sm text-[var(--wrife-text-muted)]">Add pupils to this class to see the PWP Studio leaderboard.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] overflow-hidden">

      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-[var(--wrife-border)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">✏️ PWP Studio Leaderboard</h2>
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
            No PWP Studio activity yet — pupils need to log in to pwp-studio.wrife.co.uk to start.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--wrife-border)]">
          {sorted.map((pupil, idx) => {
            const rank = idx + 1;
            const medal = getRankMedal(rank);
            const score = activeMeta.getValue(pupil);
            const hasActivity = pupil.sessions_last_30d > 0 || pupil.writing_pieces > 0 || pupil.highest_level > 0;

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

                {/* Name + status */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[var(--wrife-text-main)] truncate">
                      {pupil.first_name} {pupil.last_name || ''}
                    </p>
                    {pupil.ready_to_advance && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold shrink-0">
                        Ready ↑
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {pupil.highest_level > 0 && <LevelBadge level={pupil.highest_level} />}
                    {pupil.last_active ? (
                      <p className="text-xs text-[var(--wrife-text-muted)]">
                        Active {formatDate(pupil.last_active)}
                      </p>
                    ) : (
                      <p className="text-xs text-[var(--wrife-text-muted)]">Not started</p>
                    )}
                  </div>
                </div>

                {/* Score pill */}
                <div className="shrink-0 text-right">
                  {hasActivity ? (
                    <span
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold text-white"
                      style={{ background: activeMeta.colour }}
                    >
                      {score}{activeMeta.unit ? ` ${activeMeta.unit}` : ''}
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
                    {activeCategory !== 'sessions' && (
                      <div className="text-center min-w-[60px]">
                        <p className="text-xs text-[var(--wrife-text-muted)]">Sessions</p>
                        <p className="text-sm font-semibold text-[var(--wrife-text-main)]">{pupil.sessions_last_30d}</p>
                      </div>
                    )}
                    {activeCategory !== 'pieces' && (
                      <div className="text-center min-w-[50px]">
                        <p className="text-xs text-[var(--wrife-text-muted)]">Pieces</p>
                        <p className="text-sm font-semibold text-[var(--wrife-text-main)]">{pupil.writing_pieces}</p>
                      </div>
                    )}
                    {activeCategory !== 'level' && (
                      <div className="text-center min-w-[50px]">
                        <p className="text-xs text-[var(--wrife-text-muted)]">Level</p>
                        <p className="text-sm font-semibold text-[var(--wrife-text-main)]">L{pupil.highest_level}</p>
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
          📚 Level = highest formula level &nbsp;·&nbsp; 📝 Sessions = last 30 days &nbsp;·&nbsp; ✍️ Pieces = writing pieces completed &nbsp;·&nbsp; <span className="text-green-600 font-medium">Ready ↑</span> = last 3 scores &gt; 95%
        </p>
      </div>
    </div>
  );
}
