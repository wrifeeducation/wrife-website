'use client';

import { useState } from 'react';

interface AssignPWPModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className: string;
  yearGroup: number;
  teacherId: string;
  onAssigned: () => void;
}

const LEVELS = Array.from({ length: 67 }, (_, i) => i + 1);

export function AssignPWPModal({
  isOpen,
  onClose,
  classId,
  className,
  onAssigned,
}: AssignPWPModalProps) {
  const [levelFrom, setLevelFrom] = useState(1);
  const [levelTo, setLevelTo] = useState(5);
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function handleAssign() {
    if (levelFrom > levelTo) {
      setError('Start level must be less than or equal to end level');
      return;
    }
    setAssigning(true);
    setError('');

    try {
      const response = await fetch('/api/teacher/pwp-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_id: classId,
          level_from: levelFrom,
          level_to: levelTo,
          instructions: instructions.trim() || null,
          due_date: dueDate || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to assign');

      setSuccessMessage(`PWP Levels ${levelFrom}–${levelTo} assigned to ${className}!`);
      setTimeout(() => {
        setSuccessMessage('');
        setLevelFrom(1);
        setLevelTo(5);
        setInstructions('');
        setDueDate('');
        onAssigned();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to assign');
    } finally {
      setAssigning(false);
    }
  }

  if (!isOpen) return null;

  const levelCount = levelTo - levelFrom + 1;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-[var(--wrife-text-main)]">Assign PWP Levels</h2>
              <p className="text-sm text-[var(--wrife-text-muted)]">to {className}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">{successMessage}</div>
          )}

          {/* Level range */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-3">
              Level Range
            </label>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs text-[var(--wrife-text-muted)] mb-1">From level</label>
                <select
                  value={levelFrom}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    setLevelFrom(v);
                    if (v > levelTo) setLevelTo(v);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                >
                  {LEVELS.map(l => <option key={l} value={l}>Level {l}</option>)}
                </select>
              </div>
              <span className="text-[var(--wrife-text-muted)] font-bold pb-2">→</span>
              <div className="flex-1">
                <label className="block text-xs text-[var(--wrife-text-muted)] mb-1">To level</label>
                <select
                  value={levelTo}
                  onChange={(e) => setLevelTo(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                >
                  {LEVELS.filter(l => l >= levelFrom).map(l => <option key={l} value={l}>Level {l}</option>)}
                </select>
              </div>
            </div>
            <p className="text-xs text-[var(--wrife-text-muted)] mt-2">
              Pupils complete PWP Levels {levelFrom} to {levelTo} ({levelCount} level{levelCount !== 1 ? 's' : ''}) on PWP Studio
            </p>
          </div>

          {/* Instructions */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
              Instructions <span className="font-normal text-[var(--wrife-text-muted)]">(optional)</span>
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
              rows={2}
              placeholder="Any extra instructions for pupils..."
            />
          </div>

          {/* Due date */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
              Due Date <span className="font-normal text-[var(--wrife-text-muted)]">(optional)</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-[var(--wrife-border)] px-6 py-3 text-sm font-semibold text-[var(--wrife-text-muted)] hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={assigning}
              className="flex-1 rounded-full bg-[var(--wrife-blue)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
            >
              {assigning ? 'Assigning…' : `Assign Levels ${levelFrom}–${levelTo}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
