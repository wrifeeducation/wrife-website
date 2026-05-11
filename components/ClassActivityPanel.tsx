'use client';

import { useState, useEffect } from 'react';

/* ── Types ─────────────────────────────────────────── */

export interface PupilActivity {
  pupil_id: string;
  first_name: string;
  last_name: string | null;
  // PWP
  pwp_formulas_completed: number;
  pwp_highest_level: number;
  pwp_chain_sessions: number;
  pwp_last_active: string | null;
  // IP
  ip_lessons_completed: number;
  ip_total_xp: number;
  ip_last_active: string | null;
}

interface RecentEvent {
  id: string;
  pupil_id: string;
  pupil_name: string;
  app: string;
  event_type: string;
  event_data: Record<string, unknown>;
  created_at: string;
}

interface Props {
  classId: string;
  /** Optional: pass the pupil list from the parent so rows stay in sync */
  pupilIds?: string[];
}

/* ── Helpers ────────────────────────────────────────── */

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60)  return mins <= 1 ? 'Just now' : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)   return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function eventLabel(event: RecentEvent): string {
  const name = event.pupil_name.trim() || 'A pupil';
  switch (event.event_type) {
    case 'formula_completed': {
      const lvl   = event.event_data.level as number | undefined;
      const score = event.event_data.score as number | undefined;
      return `${name} completed PWP L${lvl ?? '?'}${score != null ? ` (${score}%)` : ''}`;
    }
    case 'chain_session_completed': {
      const sents = event.event_data.sentences_built as number | undefined;
      return `${name} completed a chain session${sents != null ? ` — ${sents} sentences` : ''}`;
    }
    case 'lesson_completed': {
      const stars = event.event_data.stars as number | undefined;
      const xp    = event.event_data.xp_earned as number | undefined;
      return `${name} completed an IP lesson${stars != null ? ` ⭐`.repeat(stars) : ''}${xp != null ? ` (+${xp} XP)` : ''}`;
    }
    case 'world_completed':
      return `${name} completed a world 🎉`;
    case 'badge_earned':
      return `${name} earned a badge 🏅`;
    case 'streak_milestone': {
      const days = event.event_data.streak_days as number | undefined;
      return `${name} hit a ${days ?? '?'}-day streak 🔥`;
    }
    case 'pwp_level_advanced': {
      const to = event.event_data.to_level as number | undefined;
      return `${name} advanced to PWP L${to ?? '?'}`;
    }
    case 'challenge_completed':
      return `${name} completed a challenge`;
    default:
      return `${name} — ${event.event_type.replace(/_/g, ' ')}`;
  }
}

function appIcon(app: string): string {
  switch (app) {
    case 'pwp':       return '✏️';
    case 'ip':        return '🎮';
    case 'dwp':       return '✍️';
    case 'resources': return '📚';
    default:          return '📡';
  }
}

function LevelBadge({ level }: { level: number }) {
  if (!level) return <span className="text-[var(--wrife-text-muted)]">—</span>;
  const cls =
    level >= 50 ? 'bg-yellow-100 text-yellow-700'
    : level >= 25 ? 'bg-purple-100 text-purple-700'
    : 'bg-[var(--wrife-blue-soft)] text-[var(--wrife-blue)]';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
      L{level}
    </span>
  );
}

/* ── Component ──────────────────────────────────────── */

export function ClassActivityPanel({ classId }: Props) {
  const [pupils, setPupils]       = useState<PupilActivity[]>([]);
  const [feed, setFeed]           = useState<RecentEvent[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [showFeed, setShowFeed]   = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res  = await fetch(`/api/teacher/class-activity?classId=${classId}`);
        const data = await res.json();
        if (!res.ok) { setError(data.error || 'Failed to load activity'); return; }
        setPupils(data.pupilActivity || []);
        setFeed(data.recentEvents   || []);
      } catch {
        setError('Failed to load activity data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [classId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📡</span>
          <h3 className="text-base font-bold text-[var(--wrife-text-main)]">Sub-App Activity</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="h-5 w-5 animate-spin rounded-full border-4 border-[var(--wrife-blue)] border-r-transparent" />
          <span className="ml-3 text-sm text-[var(--wrife-text-muted)]">Loading activity…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">📡</span>
          <h3 className="text-base font-bold text-[var(--wrife-text-main)]">Sub-App Activity</h3>
        </div>
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      </div>
    );
  }

  const anyPwp = pupils.some(p => p.pwp_formulas_completed > 0);
  const anyIp  = pupils.some(p => p.ip_lessons_completed  > 0);
  const anyActivity = anyPwp || anyIp;

  // Class totals for header stats
  const totalFormulas = pupils.reduce((s, p) => s + p.pwp_formulas_completed, 0);
  const totalLessons  = pupils.reduce((s, p) => s + p.ip_lessons_completed,   0);
  const totalXp       = pupils.reduce((s, p) => s + p.ip_total_xp,            0);

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">📡</span>
          <div>
            <h3 className="text-base font-bold text-[var(--wrife-text-main)]">Sub-App Activity</h3>
            <p className="text-xs text-[var(--wrife-text-muted)]">
              Live from PWP Studio &amp; Interactive Practice
            </p>
          </div>
        </div>
        {feed.length > 0 && (
          <button
            onClick={() => setShowFeed(f => !f)}
            className="text-xs font-semibold text-[var(--wrife-blue)] hover:underline"
          >
            {showFeed ? 'Hide feed' : `Recent events (${feed.length})`}
          </button>
        )}
      </div>

      {/* Class totals */}
      {anyActivity && (
        <div className="flex gap-3 flex-wrap mb-5">
          {anyPwp && (
            <div className="rounded-xl bg-[var(--wrife-blue-soft)] px-4 py-2.5 text-center min-w-[90px]">
              <p className="text-lg font-bold text-[var(--wrife-blue)]">{totalFormulas}</p>
              <p className="text-xs text-[var(--wrife-text-muted)]">✏️ Formulas done</p>
            </div>
          )}
          {anyIp && (
            <>
              <div className="rounded-xl bg-[var(--wrife-green-soft)] px-4 py-2.5 text-center min-w-[90px]">
                <p className="text-lg font-bold text-green-700">{totalLessons}</p>
                <p className="text-xs text-[var(--wrife-text-muted)]">🎮 IP lessons</p>
              </div>
              <div className="rounded-xl bg-[var(--wrife-yellow-soft)] px-4 py-2.5 text-center min-w-[90px]">
                <p className="text-lg font-bold text-[var(--wrife-text-main)]">{totalXp.toLocaleString()}</p>
                <p className="text-xs text-[var(--wrife-text-muted)]">⭐ Total XP</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Recent activity feed (collapsed by default) */}
      {showFeed && feed.length > 0 && (
        <div className="mb-5 rounded-xl bg-[var(--wrife-bg)] border border-[var(--wrife-border)] divide-y divide-[var(--wrife-border)] max-h-52 overflow-y-auto">
          {feed.map(ev => (
            <div key={ev.id} className="flex items-start gap-2.5 px-3 py-2.5">
              <span className="text-base shrink-0 mt-0.5">{appIcon(ev.app)}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[var(--wrife-text-main)] leading-snug">{eventLabel(ev)}</p>
              </div>
              <span className="text-xs text-[var(--wrife-text-muted)] shrink-0 whitespace-nowrap">
                {timeAgo(ev.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Per-pupil table */}
      {pupils.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-3xl block mb-2">📡</span>
          <p className="text-sm text-[var(--wrife-text-muted)]">No sub-app activity recorded yet</p>
          <p className="text-xs text-[var(--wrife-text-muted)] mt-1">
            Pupils will appear here once they complete activities in PWP Studio or Interactive Practice
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--wrife-border)]">
                <th className="text-left py-2.5 px-2 font-semibold text-[var(--wrife-text-main)]">Pupil</th>
                <th className="text-center py-2.5 px-3 font-semibold text-[var(--wrife-text-main)]">
                  ✏️ PWP Level
                </th>
                <th className="text-right py-2.5 px-3 font-semibold text-[var(--wrife-text-main)]">
                  Formulas
                </th>
                <th className="text-right py-2.5 px-3 font-semibold text-[var(--wrife-text-main)]">
                  🎮 IP Lessons
                </th>
                <th className="text-right py-2.5 px-3 font-semibold text-[var(--wrife-text-main)]">
                  XP
                </th>
                <th className="text-right py-2.5 px-3 font-semibold text-[var(--wrife-text-muted)]">
                  Last Active
                </th>
              </tr>
            </thead>
            <tbody>
              {pupils.map(p => {
                const lastActive = [p.pwp_last_active, p.ip_last_active]
                  .filter(Boolean)
                  .sort()
                  .at(-1) ?? null;

                return (
                  <tr
                    key={p.pupil_id}
                    className="border-b border-[var(--wrife-border)] hover:bg-[var(--wrife-bg)] transition"
                  >
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-[var(--wrife-blue-soft)] flex items-center justify-center text-xs font-bold text-[var(--wrife-blue)] uppercase shrink-0">
                          {p.first_name.charAt(0)}{p.last_name?.charAt(0) || ''}
                        </div>
                        <span className="font-medium text-[var(--wrife-text-main)]">
                          {p.first_name} {p.last_name || ''}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <LevelBadge level={p.pwp_highest_level} />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {p.pwp_formulas_completed > 0 ? (
                        <span className="font-semibold text-[var(--wrife-text-main)]">
                          {p.pwp_formulas_completed}
                        </span>
                      ) : (
                        <span className="text-[var(--wrife-text-muted)]">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {p.ip_lessons_completed > 0 ? (
                        <span className="inline-flex items-center justify-center rounded-full bg-[var(--wrife-green-soft)] px-2 py-0.5 text-xs font-semibold text-green-700">
                          {p.ip_lessons_completed} / 61
                        </span>
                      ) : (
                        <span className="text-[var(--wrife-text-muted)]">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {p.ip_total_xp > 0 ? (
                        <span className="text-xs font-semibold text-[var(--wrife-text-main)]">
                          ⭐ {p.ip_total_xp.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-[var(--wrife-text-muted)]">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[var(--wrife-text-muted)] text-xs">
                      {timeAgo(lastActive)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-xs text-[var(--wrife-text-muted)]">
        Data sourced from shared learning_events log · Updates as pupils complete activities
      </p>
    </div>
  );
}
