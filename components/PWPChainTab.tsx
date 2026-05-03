'use client';

/**
 * PWP Daily Chain Practice — Teacher Tab (Phase C)
 *
 * Shows on the class page under "PWP Chain" tab.
 * Content:
 *   - Weekly theme setter (teacher sets a subject hint for SubjectPicker)
 *   - Today's completion grid (who finished, subject used, new formula attempts)
 *   - Mastery signals (🏆 badge) + Advance button to move pupil to next level
 */

import { useEffect, useState } from 'react';

interface PupilRow {
  pupil_id: string;
  first_name: string;
  last_name: string | null;
  current_level: number;
  completed_today: boolean;
  subject_noun: string | null;
  new_formula_attempts: number | null;
  mastery_signal: boolean;
}

interface ThemeData {
  theme: string | null;
  suggestions: string[];
}

interface Props {
  classId: string;
}

function AttemptsLabel({ attempts }: { attempts: number | null }) {
  if (attempts === null) return <span className="text-[var(--wrife-text-muted)]">—</span>;
  const colour =
    attempts === 1
      ? 'text-green-600 font-semibold'
      : attempts === 2
      ? 'text-orange-500'
      : 'text-red-500';
  return (
    <span className={colour}>
      {attempts === 1 ? '1st attempt ✓' : `${attempts} attempts`}
    </span>
  );
}

export function PWPChainTab({ classId }: Props) {
  const [pupils, setPupils] = useState<PupilRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Advance state
  const [advancingId, setAdvancingId] = useState<string | null>(null);
  const [advanceError, setAdvanceError] = useState<string | null>(null);
  // Theme state
  const [theme, setTheme] = useState<ThemeData>({ theme: null, suggestions: [] });
  const [themeEditing, setThemeEditing] = useState(false);
  const [themeInput, setThemeInput] = useState('');
  const [suggestionsInput, setSuggestionsInput] = useState('');
  const [themeSaving, setThemeSaving] = useState(false);
  const [themeError, setThemeError] = useState<string | null>(null);

  const fetchSummary = () => {
    setLoading(true);
    setError(null);
    fetch(`/api/teacher/pwp/class-summary?classId=${classId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setPupils(d.pupils ?? []);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  const fetchTheme = () => {
    fetch(`/api/teacher/pwp/set-theme?classId=${classId}`)
      .then((r) => r.json())
      .then((d: ThemeData & { error?: string }) => {
        if (!d.error) setTheme({ theme: d.theme, suggestions: d.suggestions ?? [] });
      })
      .catch(() => { /* non-critical — theme is optional */ });
  };

  useEffect(() => {
    fetchSummary();
    fetchTheme();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const handleEditTheme = () => {
    setThemeInput(theme.theme ?? '');
    setSuggestionsInput(theme.suggestions.join(', '));
    setThemeError(null);
    setThemeEditing(true);
  };

  const handleCancelTheme = () => {
    setThemeEditing(false);
    setThemeError(null);
  };

  const handleSaveTheme = async () => {
    if (!themeInput.trim()) {
      setThemeError('Theme cannot be empty');
      return;
    }
    setThemeSaving(true);
    setThemeError(null);
    try {
      const suggestions = suggestionsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetch('/api/teacher/pwp/set-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId, theme: themeInput.trim(), suggestions }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Save failed');
      setTheme({ theme: themeInput.trim(), suggestions });
      setThemeEditing(false);
    } catch (e: unknown) {
      setThemeError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setThemeSaving(false);
    }
  };

  const handleAdvance = async (pupilId: string, currentLevel: number, firstName: string) => {
    if (!confirm(`Advance ${firstName} from L${currentLevel} to L${currentLevel + 1}?`)) return;

    setAdvancingId(pupilId);
    setAdvanceError(null);

    try {
      const res = await fetch('/api/teacher/pwp/advance-level', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pupilId, classId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Advance failed');
      // Refresh grid so the new level shows immediately
      fetchSummary();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Advance failed';
      setAdvanceError(msg);
    } finally {
      setAdvancingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-[var(--wrife-text-muted)]">
        Loading daily chain summary…
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-sm text-red-500">
        Could not load PWP chain data: {error}
      </div>
    );
  }

  const completedCount = pupils.filter((p) => p.completed_today).length;
  const masteryCount = pupils.filter((p) => p.mastery_signal).length;
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="space-y-6">

      {/* Weekly theme setter */}
      <div className="bg-white rounded-xl border border-[var(--wrife-border)] overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--wrife-border)] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--wrife-text-main)]">
            🎨 Weekly subject theme
          </h3>
          {!themeEditing && (
            <button
              onClick={handleEditTheme}
              className="text-xs text-[var(--wrife-blue)] hover:underline"
            >
              {theme.theme ? 'Edit' : 'Set theme'}
            </button>
          )}
        </div>

        <div className="px-5 py-4">
          {themeEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--wrife-text-muted)] mb-1">
                  Theme word or phrase
                </label>
                <input
                  type="text"
                  value={themeInput}
                  onChange={(e) => setThemeInput(e.target.value)}
                  placeholder="e.g. space exploration"
                  className="w-full rounded-lg border border-[var(--wrife-border)] px-3 py-2 text-sm text-[var(--wrife-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                  maxLength={60}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--wrife-text-muted)] mb-1">
                  Suggestions <span className="font-normal">(comma-separated, optional)</span>
                </label>
                <input
                  type="text"
                  value={suggestionsInput}
                  onChange={(e) => setSuggestionsInput(e.target.value)}
                  placeholder="e.g. rocket, astronaut, satellite"
                  className="w-full rounded-lg border border-[var(--wrife-border)] px-3 py-2 text-sm text-[var(--wrife-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                />
              </div>
              {themeError && (
                <p className="text-xs text-red-600">{themeError}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleSaveTheme}
                  disabled={themeSaving}
                  className="rounded-lg bg-[var(--wrife-blue)] hover:opacity-90 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 transition"
                >
                  {themeSaving ? 'Saving…' : 'Save theme'}
                </button>
                <button
                  onClick={handleCancelTheme}
                  disabled={themeSaving}
                  className="rounded-lg border border-[var(--wrife-border)] text-[var(--wrife-text-muted)] text-xs font-semibold px-4 py-2 hover:opacity-70 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : theme.theme ? (
            <div>
              <p className="text-sm text-[var(--wrife-text-main)]">
                This week:{' '}
                <span className="font-semibold text-[var(--wrife-blue)]">{theme.theme}</span>
              </p>
              {theme.suggestions.length > 0 && (
                <p className="text-xs text-[var(--wrife-text-muted)] mt-1">
                  Suggestions: {theme.suggestions.join(', ')}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-[var(--wrife-text-muted)]">
              No theme set for this week. Pupils will choose any subject noun.
            </p>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="flex flex-wrap gap-4">
        <div className="bg-white rounded-xl border border-[var(--wrife-border)] px-5 py-4 text-center min-w-[120px]">
          <p className="text-2xl font-bold text-[var(--wrife-blue)]">{completedCount}</p>
          <p className="text-xs text-[var(--wrife-text-muted)] mt-1">Completed today</p>
        </div>
        <div className="bg-white rounded-xl border border-[var(--wrife-border)] px-5 py-4 text-center min-w-[120px]">
          <p className="text-2xl font-bold text-[var(--wrife-text-main)]">{pupils.length - completedCount}</p>
          <p className="text-xs text-[var(--wrife-text-muted)] mt-1">Not yet today</p>
        </div>
        {masteryCount > 0 && (
          <div className="bg-yellow-50 rounded-xl border border-yellow-200 px-5 py-4 text-center min-w-[120px]">
            <p className="text-2xl font-bold text-yellow-600">🏆 {masteryCount}</p>
            <p className="text-xs text-yellow-700 mt-1">Ready to advance</p>
          </div>
        )}
      </div>

      {/* Advance error banner */}
      {advanceError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {advanceError}
        </div>
      )}

      {/* Completion grid */}
      <div className="bg-white rounded-xl border border-[var(--wrife-border)] overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--wrife-border)] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--wrife-text-main)]">
            Today&apos;s chain practice — {today}
          </h3>
          <button
            onClick={fetchSummary}
            className="text-xs text-[var(--wrife-blue)] hover:underline"
          >
            Refresh
          </button>
        </div>

        {pupils.length === 0 ? (
          <p className="px-5 py-8 text-sm text-center text-[var(--wrife-text-muted)]">
            No pupils found in this class.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--wrife-border)] bg-[var(--wrife-bg)]">
                <th className="text-left px-5 py-2 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase tracking-wide w-48">
                  Pupil
                </th>
                <th className="text-center px-3 py-2 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase tracking-wide w-16">
                  Level
                </th>
                <th className="text-center px-3 py-2 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase tracking-wide w-24">
                  Today
                </th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase tracking-wide">
                  Subject used
                </th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase tracking-wide">
                  New formula
                </th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase tracking-wide w-28">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--wrife-border)]">
              {pupils.map((pupil) => (
                <tr
                  key={pupil.pupil_id}
                  className={`hover:bg-[var(--wrife-bg)] transition ${
                    pupil.mastery_signal ? 'bg-yellow-50/40' : ''
                  }`}
                >
                  <td className="px-5 py-3 font-medium text-[var(--wrife-text-main)]">
                    {pupil.first_name} {pupil.last_name ?? ''}
                    {pupil.mastery_signal && (
                      <span className="ml-2 text-yellow-500" title="Ready to advance to the next level">
                        🏆
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="inline-flex items-center justify-center rounded-full bg-[var(--wrife-blue-soft)] text-[var(--wrife-blue)] text-xs font-semibold px-2 py-0.5">
                      L{pupil.current_level}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {pupil.completed_today ? (
                      <span className="text-green-600 font-bold">✓</span>
                    ) : (
                      <span className="text-[var(--wrife-text-muted)]">✗</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-[var(--wrife-text-main)]">
                    {pupil.subject_noun ? (
                      <span className="italic">{pupil.subject_noun}</span>
                    ) : (
                      <span className="text-[var(--wrife-text-muted)]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <AttemptsLabel attempts={pupil.new_formula_attempts} />
                  </td>
                  <td className="px-3 py-3">
                    {pupil.mastery_signal && pupil.current_level < 30 ? (
                      <button
                        onClick={() =>
                          handleAdvance(pupil.pupil_id, pupil.current_level, pupil.first_name)
                        }
                        disabled={advancingId === pupil.pupil_id}
                        title={`Advance ${pupil.first_name} to L${pupil.current_level + 1}`}
                        className="inline-flex items-center gap-1 rounded-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-white text-xs font-bold px-3 py-1 transition"
                      >
                        {advancingId === pupil.pupil_id ? '…' : `→ L${pupil.current_level + 1}`}
                      </button>
                    ) : (
                      <span className="text-[var(--wrife-text-muted)]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Level distribution chart — client-side from pupils array */}
      {pupils.length > 0 && (() => {
        // Build a map: level → count
        const counts: Record<number, number> = {};
        for (const p of pupils) {
          counts[p.current_level] = (counts[p.current_level] ?? 0) + 1;
        }
        const levels = Object.keys(counts).map(Number).sort((a, b) => a - b);
        const max = Math.max(...Object.values(counts));

        return (
          <div className="bg-white rounded-xl border border-[var(--wrife-border)] overflow-hidden">
            <div className="px-5 py-3 border-b border-[var(--wrife-border)]">
              <h3 className="text-sm font-semibold text-[var(--wrife-text-main)]">
                Level distribution
              </h3>
              <p className="text-xs text-[var(--wrife-text-muted)] mt-0.5">
                {pupils.length} pupil{pupils.length !== 1 ? 's' : ''} · {levels.length} level{levels.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="px-5 py-4 space-y-2">
              {levels.map((level) => {
                const count = counts[level];
                const pct = Math.round((count / max) * 100);
                const masteryAtLevel = pupils.filter(
                  (p) => p.current_level === level && p.mastery_signal,
                ).length;
                return (
                  <div key={level} className="flex items-center gap-3">
                    {/* Level label */}
                    <span className="w-8 shrink-0 text-xs font-bold text-[var(--wrife-blue)] text-right">
                      L{level}
                    </span>
                    {/* Bar */}
                    <div className="flex-1 h-5 rounded-full bg-[var(--wrife-bg)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          minWidth: '8px',
                          background: masteryAtLevel > 0
                            ? 'linear-gradient(90deg, #3B82F6, #F59E0B)'
                            : 'var(--wrife-blue)',
                          opacity: 0.85,
                        }}
                      />
                    </div>
                    {/* Count + mastery indicator */}
                    <div className="flex items-center gap-1 w-12 shrink-0">
                      <span className="text-xs font-semibold text-[var(--wrife-text-main)]">
                        {count}
                      </span>
                      {masteryAtLevel > 0 && (
                        <span
                          title={`${masteryAtLevel} ready to advance`}
                          className="text-xs text-yellow-500"
                        >
                          🏆
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
