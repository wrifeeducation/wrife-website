'use client';

import { useState, useEffect } from 'react';

interface StudioRow {
  id: string;
  first_name: string;
  last_name: string | null;
  has_studio_account: boolean;
  highest_level: number;
  sessions_last_30d: number;
  writing_pieces: number;
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

function LevelBadge({ level }: { level: number }) {
  if (level === 0) {
    return <span className="text-[var(--wrife-text-muted)]">—</span>;
  }
  const bg =
    level >= 50
      ? 'bg-yellow-100 text-yellow-700'
      : level >= 25
      ? 'bg-purple-100 text-purple-700'
      : 'bg-[var(--wrife-blue-soft)] text-[var(--wrife-blue)]';

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${bg}`}
    >
      L{level}
    </span>
  );
}

export function PWPStudioTab({ classId }: Props) {
  const [rows, setRows] = useState<StudioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/teacher/pwp-studio?classId=${classId}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to load PWP Studio data');
          return;
        }
        setRows(data.pupils || []);
      } catch (err) {
        console.error('Error fetching PWP Studio data:', err);
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
          <span className="text-2xl">✏️</span>
          <div>
            <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">PWP Studio</h2>
            <p className="text-sm text-[var(--wrife-text-muted)]">
              Formula-based sentence building — 67 levels, writing pieces
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
          <span className="text-2xl">✏️</span>
          <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">PWP Studio</h2>
        </div>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  const activePupils = rows.filter(r => r.last_active !== null).length;
  const linkedPupils = rows.filter(r => r.has_studio_account).length;
  const totalWritingPieces = rows.reduce((s, r) => s + r.writing_pieces, 0);

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">✏️</span>
        <div>
          <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">PWP Studio</h2>
          <p className="text-sm text-[var(--wrife-text-muted)]">
            Formula-based sentence building — 67 levels, writing pieces
          </p>
        </div>
      </div>

      {/* Class summary stats */}
      <div className="mt-4 mb-6 flex gap-4 flex-wrap">
        <div className="rounded-xl bg-[var(--wrife-blue-soft)] px-4 py-3 text-center min-w-[100px]">
          <p className="text-xl font-bold text-[var(--wrife-blue)]">{linkedPupils} / {rows.length}</p>
          <p className="text-xs text-[var(--wrife-text-muted)]">Pupils linked</p>
        </div>
        <div className="rounded-xl bg-[var(--wrife-yellow-soft)] px-4 py-3 text-center min-w-[100px]">
          <p className="text-xl font-bold text-[var(--wrife-text-main)]">{activePupils}</p>
          <p className="text-xs text-[var(--wrife-text-muted)]">Pupils active</p>
        </div>
        <div className="rounded-xl bg-[var(--wrife-green-soft)] px-4 py-3 text-center min-w-[100px]">
          <p className="text-xl font-bold text-[var(--wrife-text-main)]">{totalWritingPieces}</p>
          <p className="text-xs text-[var(--wrife-text-muted)]">Writing pieces</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-10">
          <span className="text-4xl block mb-3">📝</span>
          <p className="text-sm font-semibold text-[var(--wrife-text-main)]">No progress yet</p>
          <p className="text-xs text-[var(--wrife-text-muted)] mt-1">
            Pupils need to log in to pwp-studio.wrife.co.uk to start building sentences
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
                <th className="text-center py-3 px-3 font-semibold text-[var(--wrife-text-main)]">
                  Highest Level
                </th>
                <th className="text-right py-3 px-3 font-semibold text-[var(--wrife-text-main)]">
                  Sessions (30d)
                </th>
                <th className="text-right py-3 px-3 font-semibold text-[var(--wrife-text-main)]">
                  Writing Pieces
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
                      <div>
                        <span className="font-medium text-[var(--wrife-text-main)]">
                          {pupil.first_name} {pupil.last_name || ''}
                        </span>
                        {!pupil.has_studio_account && (
                          <span className="ml-2 text-xs text-[var(--wrife-text-muted)]" title="Pupil has not linked a PWP Studio account">
                            (not linked)
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <LevelBadge level={pupil.highest_level} />
                  </td>
                  <td className="py-3 px-3 text-right">
                    {pupil.sessions_last_30d > 0 ? (
                      <span className="font-semibold text-[var(--wrife-text-main)]">
                        {pupil.sessions_last_30d}
                      </span>
                    ) : (
                      <span className="text-[var(--wrife-text-muted)]">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {pupil.writing_pieces > 0 ? (
                      <span className="inline-flex items-center justify-center rounded-full bg-[var(--wrife-green-soft)] px-2 py-0.5 text-xs font-semibold text-green-700">
                        {pupil.writing_pieces}
                      </span>
                    ) : (
                      <span className="text-[var(--wrife-text-muted)]">—</span>
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
          href="https://pwp-studio.wrife.co.uk"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--wrife-blue)] hover:underline"
        >
          pwp-studio.wrife.co.uk
        </a>
        {' '}· Sessions shown for last 30 days
      </p>
    </div>
  );
}
