'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { AssignDWPModal } from '@/components/AssignDWPModal';
import { AssignPWPModal } from '@/components/AssignPWPModal';

/* ── Types ─────────────────────────────────────────────── */

interface IPAssignment {
  id: number;
  class_id: string;
  title: string;
  lesson_id: number;
  lesson_number: number | null;
  lesson_title: string | null;
  instructions: string | null;
  due_date: string | null;
  created_at: string;
  status: string;
  total_pupils: string;
  submitted_count: string;
  reviewed_count: string;
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

interface DWPAssignment {
  id: number;
  level_id: string;
  instructions: string | null;
  due_date: string | null;
  created_at: string;
  writing_levels?: {
    level_number: number;
    tier_number: number;
    activity_name: string;
  } | null;
}

interface Props {
  classId: string;
  className: string;
  yearGroup: number;
}

/* ── Helpers ────────────────────────────────────────────── */

function DueBadge({ dueDate }: { dueDate: string | null }) {
  if (!dueDate) return <span className="text-xs text-[var(--wrife-text-muted)]">No due date</span>;
  const due = new Date(dueDate);
  const isOverdue = due < new Date();
  return (
    <span className={`text-xs font-semibold ${isOverdue ? 'text-red-500' : 'text-[var(--wrife-text-muted)]'}`}>
      {isOverdue ? 'Overdue: ' : 'Due: '}
      {due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
    </span>
  );
}

/* ── Component ──────────────────────────────────────────── */

export function TeacherAssignmentsTab({ classId, className, yearGroup }: Props) {
  const { user } = useAuth();

  const [ipAssignments, setIpAssignments] = useState<IPAssignment[]>([]);
  const [pwpAssignments, setPwpAssignments] = useState<PWPAssignment[]>([]);
  const [dwpAssignments, setDwpAssignments] = useState<DWPAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const [showPWPModal, setShowPWPModal] = useState(false);
  const [showDWPModal, setShowDWPModal] = useState(false);

  const [deletingIPId, setDeletingIPId] = useState<number | null>(null);
  const [deletingPWPId, setDeletingPWPId] = useState<string | null>(null);
  const [deletingDWPId, setDeletingDWPId] = useState<number | null>(null);

  useEffect(() => {
    fetchAll();
  }, [classId]);

  async function fetchAll() {
    setLoading(true);
    await Promise.all([fetchIP(), fetchPWP(), fetchDWP()]);
    setLoading(false);
  }

  async function fetchIP() {
    try {
      const res = await fetch('/api/teacher/assignments');
      if (!res.ok) return;
      const data = await res.json();
      // API returns all teacher assignments; filter by this class
      const filtered = (data.assignments || []).filter(
        (a: IPAssignment) => String(a.class_id) === String(classId)
      );
      setIpAssignments(filtered);
    } catch (err) {
      console.error('Error fetching IP assignments:', err);
    }
  }

  async function fetchPWP() {
    try {
      const res = await fetch(`/api/teacher/pwp-assignments?classId=${classId}`);
      if (!res.ok) return;
      const data = await res.json();
      setPwpAssignments(data.assignments || []);
    } catch (err) {
      console.error('Error fetching PWP assignments:', err);
    }
  }

  async function fetchDWP() {
    try {
      const { data, error } = await supabase
        .from('dwp_assignments')
        .select('id, level_id, instructions, due_date, created_at, writing_levels(level_number, tier_number, activity_name)')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });
      if (!error) setDwpAssignments((data as unknown as DWPAssignment[]) || []);
    } catch (err) {
      console.error('Error fetching DWP assignments:', err);
    }
  }

  async function deleteIPAssignment(id: number) {
    if (!confirm('Remove this Interactive Practice assignment?')) return;
    setDeletingIPId(id);
    try {
      const { error } = await supabase
        .from('assignments')
        .update({ status: 'archived' })
        .eq('id', id);
      if (!error) setIpAssignments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error archiving IP assignment:', err);
    } finally {
      setDeletingIPId(null);
    }
  }

  async function deletePWPAssignment(id: string) {
    if (!confirm('Remove this PWP assignment?')) return;
    setDeletingPWPId(id);
    try {
      const res = await fetch(`/api/teacher/pwp-assignments?id=${id}`, { method: 'DELETE' });
      if (res.ok) setPwpAssignments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error deleting PWP assignment:', err);
    } finally {
      setDeletingPWPId(null);
    }
  }

  async function deleteDWPAssignment(id: number) {
    if (!confirm('Remove this DWP assignment?')) return;
    setDeletingDWPId(id);
    try {
      const { error } = await supabase.from('dwp_assignments').delete().eq('id', id);
      if (!error) setDwpAssignments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error deleting DWP assignment:', err);
    } finally {
      setDeletingDWPId(null);
    }
  }

  const totalActive = ipAssignments.length + pwpAssignments.length + dwpAssignments.length;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
        <div className="flex items-center justify-center py-12">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent"></div>
          <span className="ml-3 text-sm text-[var(--wrife-text-muted)]">Loading assignments…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── Summary banner ─────────────────────────────── */}
      {totalActive === 0 ? (
        <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-8 text-center">
          <span className="text-4xl block mb-3">📋</span>
          <p className="font-semibold text-[var(--wrife-text-main)]">No active assignments</p>
          <p className="text-sm text-[var(--wrife-text-muted)] mt-1">
            Browse the lesson library to assign IP lessons, or use the buttons below to set PWP or DWP tasks.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-[var(--wrife-border)] p-4 text-center">
            <p className="text-2xl font-bold text-[var(--wrife-blue)]">{ipAssignments.length}</p>
            <p className="text-xs text-[var(--wrife-text-muted)] mt-1">🎮 Interactive Practice</p>
          </div>
          <div className="bg-white rounded-2xl border border-[var(--wrife-border)] p-4 text-center">
            <p className="text-2xl font-bold text-[var(--wrife-blue)]">{pwpAssignments.length}</p>
            <p className="text-xs text-[var(--wrife-text-muted)] mt-1">✏️ PWP Studio</p>
          </div>
          <div className="bg-white rounded-2xl border border-[var(--wrife-border)] p-4 text-center">
            <p className="text-2xl font-bold text-[var(--wrife-blue)]">{dwpAssignments.length}</p>
            <p className="text-xs text-[var(--wrife-text-muted)] mt-1">✍️ Daily Writing</p>
          </div>
        </div>
      )}

      {/* ── Interactive Practice ────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">🎮 Interactive Practice</h2>
            <p className="text-sm text-[var(--wrife-text-muted)]">Assign from any lesson page in the library</p>
          </div>
        </div>

        {ipAssignments.length === 0 ? (
          <p className="text-sm text-[var(--wrife-text-muted)] text-center py-4">
            No IP assignments yet. Open a lesson and use the Assign button.
          </p>
        ) : (
          <div className="space-y-2">
            {ipAssignments.map((a) => {
              const total = Number(a.total_pupils) || 0;
              const submitted = Number(a.submitted_count) || 0;
              const reviewed = Number(a.reviewed_count) || 0;
              const pct = total > 0 ? Math.round((submitted / total) * 100) : 0;
              return (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--wrife-bg)] border border-[var(--wrife-border)]">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {a.lesson_number && (
                        <span className="shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                          {a.lesson_number}
                        </span>
                      )}
                      <p className="font-semibold text-sm text-[var(--wrife-text-main)] truncate">{a.title}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--wrife-blue)] rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-[var(--wrife-text-muted)]">{submitted}/{total} submitted</span>
                      </div>
                      {reviewed > 0 && (
                        <span className="text-xs text-green-600 font-semibold">{reviewed} reviewed</span>
                      )}
                      <DueBadge dueDate={a.due_date} />
                    </div>
                  </div>
                  <button
                    onClick={() => deleteIPAssignment(a.id)}
                    disabled={deletingIPId === a.id}
                    className="ml-3 text-red-400 hover:text-red-600 text-xs font-semibold transition disabled:opacity-50 shrink-0"
                    title="Archive assignment"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── PWP Studio ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">✏️ PWP Studio</h2>
            <p className="text-sm text-[var(--wrife-text-muted)]">Set level targets on pwp-studio.wrife.co.uk</p>
          </div>
          <button
            onClick={() => setShowPWPModal(true)}
            className="rounded-full bg-[var(--wrife-blue)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
          >
            + Assign PWP
          </button>
        </div>

        {pwpAssignments.length === 0 ? (
          <p className="text-sm text-[var(--wrife-text-muted)] text-center py-4">No PWP assignments yet.</p>
        ) : (
          <div className="space-y-2">
            {pwpAssignments.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--wrife-bg)] border border-[var(--wrife-border)]">
                <div className="flex items-center gap-3 min-w-0 flex-1 flex-wrap">
                  <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--wrife-blue-soft)] text-[var(--wrife-blue)] text-xs font-bold">
                    L{a.level_from} → L{a.level_to}
                  </span>
                  {a.instructions && (
                    <span className="text-xs text-[var(--wrife-text-muted)] truncate max-w-xs">{a.instructions}</span>
                  )}
                  <DueBadge dueDate={a.due_date} />
                </div>
                <button
                  onClick={() => deletePWPAssignment(a.id)}
                  disabled={deletingPWPId === a.id}
                  className="ml-3 text-red-400 hover:text-red-600 text-xs font-semibold transition disabled:opacity-50 shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Daily Writing Practice ───────────────────────── */}
      <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">✍️ Daily Writing Practice</h2>
            <p className="text-sm text-[var(--wrife-text-muted)]">40-level progressive writing programme with AI assessment</p>
          </div>
          <button
            onClick={() => setShowDWPModal(true)}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
          >
            + Assign DWP
          </button>
        </div>

        {dwpAssignments.length === 0 ? (
          <p className="text-sm text-[var(--wrife-text-muted)] text-center py-4">No DWP assignments yet.</p>
        ) : (
          <div className="space-y-2">
            {dwpAssignments.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--wrife-bg)] border border-[var(--wrife-border)]">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {a.writing_levels && (
                    <span className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                      {a.writing_levels.level_number}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--wrife-text-main)] truncate">
                      {a.writing_levels?.activity_name ?? 'Writing Level'}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {a.writing_levels && (
                        <span className="text-xs text-[var(--wrife-text-muted)]">Tier {a.writing_levels.tier_number}</span>
                      )}
                      <DueBadge dueDate={a.due_date} />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteDWPAssignment(a.id)}
                  disabled={deletingDWPId === a.id}
                  className="ml-3 text-red-400 hover:text-red-600 text-xs font-semibold transition disabled:opacity-50 shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────── */}
      {showPWPModal && user && (
        <AssignPWPModal
          isOpen={showPWPModal}
          onClose={() => setShowPWPModal(false)}
          classId={classId}
          className={className}
          yearGroup={yearGroup}
          teacherId={user.id}
          onAssigned={() => fetchPWP()}
        />
      )}

      {showDWPModal && user && (
        <AssignDWPModal
          isOpen={showDWPModal}
          onClose={() => setShowDWPModal(false)}
          classId={classId}
          className={className}
          yearGroup={yearGroup}
          teacherId={user.id}
          onAssigned={() => fetchDWP()}
        />
      )}
    </div>
  );
}
