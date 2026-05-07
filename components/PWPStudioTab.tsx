'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { AssignPWPModal } from '@/components/AssignPWPModal';
import { buildTeacherSSOUrl } from '@/lib/teacher-sso';

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

interface PWPAssignment {
  id: string;
  level_from: number;
  level_to: number;
  instructions: string | null;
  due_date: string | null;
  created_at: string;
  status: string;
}

interface Props {
  classId: string;
  className?: string;
  yearGroup?: number;
}

function formatLastActive(dateStr: string | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function LevelBadge({ level }: { level: number }) {
  if (level === 0) return <span className="text-[var(--wrife-text-muted)]">—</span>;
  const bg =
    level >= 50 ? 'bg-yellow-100 text-yellow-700'
    : level >= 25 ? 'bg-purple-100 text-purple-700'
    : 'bg-[var(--wrife-blue-soft)] text-[var(--wrife-blue)]';
  return (
    <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${bg}`}>
      L{level}
    </span>
  );
}

export function PWPStudioTab({ classId, className = 'this class', yearGroup = 5 }: Props) {
  const { user } = useAuth();
  const [rows, setRows] = useState<StudioRow[]>([]);
  const [assignments, setAssignments] = useState<PWPAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [ssoLoading, setSsoLoading] = useState(false);

  const handleOpenInApp = useCallback(async () => {
    setSsoLoading(true);
    try {
      const url = await buildTeacherSSOUrl('https://pwp-studio.wrife.co.uk', '/teacher');
      window.open(url, '_blank', 'noopener,noreferrer');
    } finally {
      setSsoLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [classId]);

  async function fetchData() {
    setLoading(true);
    try {
      const [studentsRes, assignmentsRes] = await Promise.all([
        fetch(`/api/teacher/pwp-studio?classId=${classId}`),
        fetch(`/api/teacher/pwp-assignments?classId=${classId}`),
      ]);
      const studentsData = await studentsRes.json();
      if (!studentsRes.ok) {
        setError(studentsData.error || 'Failed to load PWP Studio data');
        return;
      }
      setRows(studentsData.pupils || []);

      if (assignmentsRes.ok) {
        const assignmentsData = await assignmentsRes.json();
        setAssignments(assignmentsData.assignments || []);
      }
    } catch (err) {
      console.error('Error fetching PWP Studio data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAssignment(assignmentId: string) {
    if (!confirm('Remove this PWP assignment?')) return;
    setDeletingId(assignmentId);
    try {
      const res = await fetch(`/api/teacher/pwp-assignments?id=${assignmentId}`, { method: 'DELETE' });
      if (res.ok) {
        setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      }
    } catch (err) {
      console.error('Error deleting PWP assignment:', err);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">✏️</span>
          <div>
            <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">PWP Studio</h2>
            <p className="text-sm text-[var(--wrife-text-muted)]">Formula-based sentence building — 67 levels, writing pieces</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent"></div>
          <span className="ml-3 text-sm text-[var(--wrife-text-muted)]">Loading progress…</span>
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
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
      </div>
    );
  }

  const activePupils = rows.filter(r => r.last_active !== null).length;
  const linkedPupils = rows.filter(r => r.has_studio_account).length;
  const totalWritingPieces = rows.reduce((s, r) => s + r.writing_pieces, 0);

  return (
    <div className="space-y-4">
      {/* ── PWP Assignments ─────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">PWP Assignments</h2>
            <p className="text-sm text-[var(--wrife-text-muted)]">Set level targets for pupils to complete on PWP Studio</p>
          </div>
          <button
            onClick={() => setShowAssignModal(true)}
            className="rounded-full bg-[var(--wrife-blue)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
          >
            + Assign PWP
          </button>
        </div>

        {assignments.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-[var(--wrife-text-muted)]">
              No active PWP assignments. Assign level targets so pupils know what to work on.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {assignments.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[var(--wrife-bg)] border border-[var(--wrife-border)]"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--wrife-blue-soft)] text-[var(--wrife-blue)] text-xs font-bold">
                    L{a.level_from} → L{a.level_to}
                  </span>
                  {a.instructions && (
                    <span className="text-sm text-[var(--wrife-text-muted)] truncate max-w-xs">{a.instructions}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {a.due_date && (
                    <span className="text-xs text-[var(--wrife-text-muted)]">
                      Due {new Date(a.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteAssignment(a.id)}
                    disabled={deletingId === a.id}
                    className="text-red-400 hover:text-red-600 text-xs font-semibold transition disabled:opacity-50"
                    title="Remove assignment"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Pupil Progress ───────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✏️</span>
            <div>
              <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">PWP Studio Progress</h2>
              <p className="text-sm text-[var(--wrife-text-muted)]">Formula-based sentence building — 67 levels, writing pieces</p>
            </div>
          </div>
          <button
            onClick={handleOpenInApp}
            disabled={ssoLoading}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[var(--wrife-blue)] px-4 py-2 text-sm font-semibold text-white shadow-soft hover:opacity-90 transition disabled:opacity-60"
          >
            {ssoLoading ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-r-transparent" />
                Opening…
              </>
            ) : (
              <>Open in app ↗</>
            )}
          </button>
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
                  <th className="text-left py-3 px-2 font-semibold text-[var(--wrife-text-main)]">Pupil</th>
                  <th className="text-center py-3 px-3 font-semibold text-[var(--wrife-text-main)]">Highest Level</th>
                  <th className="text-right py-3 px-3 font-semibold text-[var(--wrife-text-main)]">Sessions (30d)</th>
                  <th className="text-right py-3 px-3 font-semibold text-[var(--wrife-text-main)]">Writing Pieces</th>
                  <th className="text-right py-3 px-3 font-semibold text-[var(--wrife-text-muted)]">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((pupil) => (
                  <tr key={pupil.id} className="border-b border-[var(--wrife-border)] hover:bg-[var(--wrife-bg)] transition">
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
                        <span className="font-semibold text-[var(--wrife-text-main)]">{pupil.sessions_last_30d}</span>
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
          Data from pwp-studio.wrife.co.uk · Sessions shown for last 30 days
        </p>
      </div>

      {showAssignModal && user && (
        <AssignPWPModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          classId={classId}
          className={className}
          yearGroup={yearGroup}
          teacherId={user.id}
          onAssigned={() => fetchData()}
        />
      )}
    </div>
  );
}
