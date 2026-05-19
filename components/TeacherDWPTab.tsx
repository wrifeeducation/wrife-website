'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { AssignDWPModal } from '@/components/AssignDWPModal';
import { DWPCompletionGrid } from '@/components/DWPCompletionGrid';

/* ── Types ─────────────────────────────────────────────── */

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
  if (!dueDate) return null;
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

export function TeacherDWPTab({ classId, className, yearGroup }: Props) {
  const { user } = useAuth();
  const [dwpAssignments, setDwpAssignments] = useState<DWPAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchDWP();
  }, [classId]);

  async function fetchDWP() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dwp_assignments')
        .select('id, level_id, instructions, due_date, created_at, writing_levels(level_number, tier_number, activity_name)')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });
      if (!error) setDwpAssignments((data as unknown as DWPAssignment[]) || []);
    } catch (err) {
      console.error('Error fetching DWP assignments:', err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteAssignment(id: number) {
    if (!confirm('Remove this DWP assignment?')) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from('dwp_assignments').delete().eq('id', id);
      if (!error) setDwpAssignments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error deleting DWP assignment:', err);
    } finally {
      setDeletingId(null);
    }
  }

  // Pass already-assigned level IDs to the modal so it can mark them
  const assignedLevelIds = dwpAssignments.map(a => a.level_id);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
        <div className="flex items-center justify-center py-12">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent" />
          <span className="ml-3 text-sm text-[var(--wrife-text-muted)]">Loading DWP assignments…</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">✍️ Daily Writing Practice</h2>
            <p className="text-sm text-[var(--wrife-text-muted)]">
              40-level progressive writing programme with AI assessment
              {dwpAssignments.length > 0 && (
                <span className="ml-2 font-semibold text-[var(--wrife-blue)]">
                  · {dwpAssignments.length} level{dwpAssignments.length !== 1 ? 's' : ''} assigned
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-full bg-[var(--wrife-blue)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
          >
            + Assign Level
          </button>
        </div>

        {/* Empty state */}
        {dwpAssignments.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-5xl block mb-3">✍️</span>
            <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">No levels assigned yet</h3>
            <p className="text-sm text-[var(--wrife-text-muted)]">
              Assign a writing level to start Daily Writing Practice for your class.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {dwpAssignments.map((a) => {
              const isExpanded = expandedId === a.id;
              const levelNum = a.writing_levels?.level_number;
              const tierNum  = a.writing_levels?.tier_number;
              const name     = a.writing_levels?.activity_name ?? 'DWP Level';

              return (
                <div key={a.id} className="rounded-xl border border-[var(--wrife-border)] overflow-hidden">
                  {/* Row header */}
                  <div
                    className="flex items-center justify-between p-3 bg-[var(--wrife-bg)] cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => setExpandedId(isExpanded ? null : a.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--wrife-blue)] text-white text-sm font-bold">
                        {levelNum ?? '?'}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[var(--wrife-text-main)] truncate">{name}</p>
                        <div className="flex items-center gap-3 flex-wrap mt-0.5">
                          {tierNum && (
                            <span className="text-xs text-[var(--wrife-text-muted)]">Tier {tierNum}</span>
                          )}
                          <DueBadge dueDate={a.due_date} />
                          {a.instructions && (
                            <span className="text-xs text-[var(--wrife-text-muted)] truncate max-w-xs">{a.instructions}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <svg
                        className={`w-4 h-4 text-[var(--wrife-text-muted)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteAssignment(a.id); }}
                        disabled={deletingId === a.id}
                        className="text-red-400 hover:text-red-600 text-xs transition disabled:opacity-50 px-1"
                        title="Remove assignment"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Expanded: pupil completion grid */}
                  {isExpanded && (
                    <div className="px-4 pb-4 bg-white border-t border-[var(--wrife-border)]">
                      <DWPCompletionGrid assignmentId={a.id} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assign modal */}
      {showModal && user && (
        <AssignDWPModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          classId={classId}
          className={className}
          yearGroup={yearGroup}
          teacherId={user.id}
          onAssigned={fetchDWP}
          assignedLevelIds={assignedLevelIds}
        />
      )}
    </>
  );
}
