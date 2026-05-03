'use client';

import { useState, useEffect } from 'react';

interface PracticeRow {
  id: string;
  first_name: string;
  last_name: string | null;
  total_xp: number;
  lessons_completed: number;
  current_streak: number;
  last_active: string | null;
}

interface Props {
  classId: string;
}

function formatLastActive(dateStr: string | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function InteractivePracticeTab({ classId }: Props) {
  const [rows, setRows] = useState<PracticeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/teacher/interactive-practice?classId=${classId}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to load Interactive Practice data');
          return;
        }
        setRows(data.pupils || []);
      } catch (err) {
        console.error('Error fetching Interactive Practice data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [classId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🎮</span>
          <div>
            <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">Interactive Practice</h2>
            <p className="text-sm text-[var(--wrife-text-muted)]">
              Gamified writing & grammar lessons — 61 lessons across 6 worlds
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent"></div>
          <span className="ml-3 text-sm text-[var(--wrife-text-muted)]">Loading progress...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🎮</span>
          <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">Interactive Practice</h2>
        </div>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  const totalXp = rows.reduce((sum, r) => sum + r.total_xp, 0);
  const activePupils = rows.filter(r => r.last_active !== null).length;

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">🎮</span>
        <div>
          <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">Interactive Practice</h2>
          <p className="text-sm text-[var(--wrife-text-muted)]">
            Gamified writing & grammar lessons — 61 lessons across 6 worlds
          </p>
        </div>
      </div>

      {/* Class summary stats */}
      <div className="mt-4 mb-6 flex gap-4 flex-wrap">
        <div className="rounded-xl bg-[var(--wrife-blue-soft)] px-4 py-3 text-center min-w-[100px]">
          <p className="text-xl font-bold text-[var(--wrife-blue)]">{activePupils}</p>
          <p className="text-xs text-[var(--wrife-text-muted)]">Pupils active</p>
        </div>
        <div className="rounded-xl bg-[var(--wrife-yellow-soft)] px-4 py-3 text-center min-w-[100px]">
          <p className="text-xl font-bold text-[var(--wrife-text-main)]">{totalXp.toLocaleString()}</p>
          <p className="text-xs text-[var(--wrife-text-muted)]">Total XP earned</p>
        </div>
        <div className="rounded-xl bg-[var(--wrife-green-soft)] px-4 py-3 text-center min-w-[100px]">
          <p className="text-xl font-bold text-[var(--wrife-text-main)]">
            {rows.length > 0
              ? Math.round(rows.reduce((s, r) => s + r.lessons_completed, 0) / rows.length)
              : 0}
          </p>
          <p className="text-xs text-[var(--wrife-text-muted)]">Avg lessons done</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-10">
          <span className="text-4xl block mb-3">🗺️</span>
          <p className="text-sm font-semibold text-[var(--wrife-text-main)]">No progress yet</p>
          <p className="text-xs text-[var(--wrife-text-muted)] mt-1">
            Pupils need to log in to practice.wrife.co.uk to start earning XP
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--wrife-border)]">
                <th className="text-left py-3 px-2 font-semibold text-[var(--wrife-text-main)]">
                  Pupil
                </th>
                <th className="text-right py-3 px-3 font-semibold text-[var(--wrife-text-main)]">
                  Total XP
                </th>
                <th className="text-right py-3 px-3 font-semibold text-[var(--wrife-text-main)]">
                  Streak
                </th>
                <th className="text-right py-3 px-3 font-semibold text-[var(--wrife-text-main)]">
                  Lessons
                </th>
                <th className="text-right py-3 px-3 font-semibold text-[var(--wrife-text-muted)]">
                  Last Active
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((pupil) => (
                <tr
                  key={pupil.id}
                  className="border-b border-[var(--wrife-border)] hover:bg-[var(--wrife-bg)] transition"
                >
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-[var(--wrife-blue-soft)] flex items-center justify-center text-xs font-bold text-[var(--wrife-blue)] uppercase">
                        {pupil.first_name.charAt(0)}{pupil.last_name?.charAt(0) || ''}
                      </div>
                      <span className="font-medium text-[var(--wrife-text-main)]">
                        {pupil.first_name} {pupil.last_name || ''}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {pupil.total_xp > 0 ? (
                      <span className="font-semibold text-[var(--wrife-text-main)]">
                        ⭐ {pupil.total_xp.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-[var(--wrife-text-muted)]">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {pupil.current_streak > 0 ? (
                      <span className="font-semibold text-[var(--wrife-orange)]">
                        🔥 {pupil.current_streak}d
                      </span>
                    ) : (
                      <span className="text-[var(--wrife-text-muted)]">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {pupil.lessons_completed > 0 ? (
                      <span className="inline-flex items-center justify-center rounded-full bg-[var(--wrife-green-soft)] px-2 py-0.5 text-xs font-semibold text-green-700">
                        {pupil.lessons_completed} / 61
                      </span>
                    ) : (
                      <span className="text-[var(--wrife-text-muted)]">0 / 61</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right text-[var(--wrife-text-muted)]">
                    {formatLastActive(pupil.last_active)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-[var(--wrife-text-muted)]">
        Data from{' '}
        <a
          href="https://practice.wrife.co.uk"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--wrife-blue)] hover:underline"
        >
          practice.wrife.co.uk
        </a>
      </p>
    </div>
  );
}
