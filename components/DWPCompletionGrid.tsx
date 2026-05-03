'use client';

import { useState, useEffect } from 'react';

interface PupilRow {
  pupil_id: string;
  name: string;
  attempt_id: string | null;
  attempt_status: string | null;
  percentage: number | null;
  performance_band: string | null;
  passed: boolean | null;
  intervention_flagged: boolean | null;
  time_submitted: string | null;
}

interface Props {
  assignmentId: number;
}

const BAND_CONFIG: Record<string, { label: string; className: string }> = {
  mastery:    { label: 'Mastery',    className: 'bg-purple-100 text-purple-700' },
  secure:     { label: 'Secure',     className: 'bg-green-100 text-green-700' },
  developing: { label: 'Developing', className: 'bg-yellow-100 text-yellow-700' },
  emerging:   { label: 'Emerging',   className: 'bg-orange-100 text-orange-700' },
};

function StatusBadge({ row }: { row: PupilRow }) {
  if (!row.attempt_id) {
    return <span className="text-xs text-[var(--wrife-text-muted)]">Not started</span>;
  }
  if (row.attempt_status === 'draft') {
    return <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">In progress</span>;
  }
  if (row.attempt_status === 'assessed' || row.attempt_status === 'submitted') {
    const bandCfg = row.performance_band ? BAND_CONFIG[row.performance_band] : null;
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {row.percentage !== null && (
          <span className="text-xs font-bold text-[var(--wrife-text-main)]">{row.percentage}%</span>
        )}
        {bandCfg && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bandCfg.className}`}>
            {bandCfg.label}
          </span>
        )}
        {row.passed && (
          <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">✓ Passed</span>
        )}
      </div>
    );
  }
  return <span className="text-xs text-[var(--wrife-text-muted)]">{row.attempt_status}</span>;
}

export function DWPCompletionGrid({ assignmentId }: Props) {
  const [pupils, setPupils] = useState<PupilRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(
          `/api/teacher/dwp-completions?assignmentId=${assignmentId}`,
          { credentials: 'include' },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load');
        setPupils(data.pupils || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Could not load completions');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [assignmentId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3 text-sm text-[var(--wrife-text-muted)]">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-[var(--wrife-blue)] border-r-transparent" />
        Loading pupil progress…
      </div>
    );
  }

  if (error) {
    return <p className="text-xs text-red-500 py-2">{error}</p>;
  }

  if (pupils.length === 0) {
    return <p className="text-xs text-[var(--wrife-text-muted)] py-2">No pupils in this class yet.</p>;
  }

  const assessed = pupils.filter(p => p.attempt_status === 'assessed' || p.attempt_status === 'submitted').length;
  const passed   = pupils.filter(p => p.passed).length;
  const flagged  = pupils.filter(p => p.intervention_flagged).length;

  return (
    <div className="mt-3 space-y-2">
      {/* Summary row */}
      <div className="flex items-center gap-4 text-xs text-[var(--wrife-text-muted)]">
        <span>{assessed}/{pupils.length} assessed</span>
        {passed > 0 && <span className="text-green-600 font-semibold">{passed} passed</span>}
        {flagged > 0 && (
          <span className="text-red-500 font-semibold flex items-center gap-1">
            ⚠ {flagged} need support
          </span>
        )}
      </div>

      {/* Pupil rows */}
      <div className="divide-y divide-[var(--wrife-border)] border border-[var(--wrife-border)] rounded-xl overflow-hidden">
        {pupils.map((p) => (
          <div key={p.pupil_id} className="flex items-center justify-between px-3 py-2 bg-white hover:bg-[var(--wrife-bg)] transition">
            <div className="flex items-center gap-2 min-w-0">
              {p.intervention_flagged && (
                <span title="Needs support" className="text-red-400 text-xs shrink-0">⚠</span>
              )}
              <span className="text-sm font-medium text-[var(--wrife-text-main)] truncate">{p.name}</span>
            </div>
            <div className="shrink-0 ml-3">
              <StatusBadge row={p} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
