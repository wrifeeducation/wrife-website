'use client';

import { useState, useEffect } from 'react';

/* ── Types ─────────────────────────────────────────────────── */

interface PushResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    id: number;
    file_name: string;
    file_type: string;
    file_url: string;
  };
  lessonId: number;
  lessonTitle: string;
}

interface ClassOption {
  id: number;
  name: string;
  year_group: number;
}

/* ── Helpers ────────────────────────────────────────────────── */

const fileTypeLabel: Record<string, string> = {
  worksheet:          'Worksheet',
  worksheet_core:     'Core Worksheet',
  worksheet_support:  'Support Worksheet',
  worksheet_challenge:'Challenge Worksheet',
  resource:           'Resource',
};

/* ── Component ──────────────────────────────────────────────── */

export function PushResourceModal({
  isOpen,
  onClose,
  file,
  lessonId,
  lessonTitle,
}: PushResourceModalProps) {
  const [classes, setClasses]         = useState<ClassOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [message, setMessage]         = useState('');
  const [dueDate, setDueDate]         = useState('');
  const [fetchingClasses, setFetchingClasses] = useState(true);
  const [classesError, setClassesError] = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchClasses();
      setMessage('');
      setDueDate('');
      setSelectedClassId('');
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  async function fetchClasses() {
    setFetchingClasses(true);
    setClassesError('');
    try {
      const res = await fetch('/api/classes');
      if (!res.ok) throw new Error('Failed to load classes');
      const data = await res.json();
      setClasses(data.classes || []);
    } catch {
      setClassesError('Unable to load classes. Please refresh the page.');
      setClasses([]);
    } finally {
      setFetchingClasses(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedClassId) {
      setError('Please select a class');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/teacher/resource-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonFileId: file.id,
          lessonId,
          classId: Number(selectedClassId),
          title: file.file_name,
          fileType: file.file_type,
          fileUrl: file.file_url,
          message: message.trim() || null,
          dueDate: dueDate || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to push resource');

      const cls = classes.find(c => String(c.id) === selectedClassId);
      setSuccess(`Pushed to ${cls?.name || 'class'}! Pupils will see it on their dashboard.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to push resource');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-strong max-w-lg w-full p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📤</span>
            <h3 className="text-lg font-bold text-[var(--wrife-text-main)]">Push Resource to Class</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--wrife-text-muted)] hover:text-[var(--wrife-text-main)] transition text-xl"
          >
            ✕
          </button>
        </div>

        {/* File info */}
        <div className="mb-4 p-3 rounded-xl bg-[var(--wrife-bg)] border border-[var(--wrife-border)]">
          <p className="text-xs font-semibold text-[var(--wrife-text-muted)] uppercase tracking-wide mb-0.5">
            {fileTypeLabel[file.file_type] ?? file.file_type}
          </p>
          <p className="text-sm font-semibold text-[var(--wrife-text-main)]">{file.file_name}</p>
          <p className="text-xs text-[var(--wrife-text-muted)] mt-0.5">{lessonTitle}</p>
        </div>

        {success ? (
          <div className="text-center py-4 space-y-3">
            <p className="text-2xl">✅</p>
            <p className="text-sm font-semibold text-green-700 bg-green-50 rounded-xl px-4 py-3">
              {success}
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2 bg-[var(--wrife-blue)] text-white rounded-full text-sm font-semibold hover:opacity-90 transition"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Class selector */}
            <div>
              <label htmlFor="classSelect" className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
                Class <span className="text-red-500">*</span>
              </label>
              {classesError ? (
                <p className="text-sm text-red-600">{classesError}</p>
              ) : fetchingClasses ? (
                <p className="text-sm text-[var(--wrife-text-muted)]">Loading classes…</p>
              ) : classes.length === 0 ? (
                <p className="text-sm text-[var(--wrife-text-muted)]">
                  No classes found.{' '}
                  <a href="/classes/new" className="text-[var(--wrife-blue)] underline">Create one first.</a>
                </p>
              ) : (
                <select
                  id="classSelect"
                  value={selectedClassId}
                  onChange={e => setSelectedClassId(e.target.value)}
                  className="w-full rounded-xl border border-[var(--wrife-border)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                  required
                >
                  <option value="">— Select a class —</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} (Year {cls.year_group})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Optional message */}
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
                Message to pupils <span className="text-[var(--wrife-text-muted)] font-normal">(optional)</span>
              </label>
              <textarea
                id="message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={2}
                placeholder="e.g. Complete before Friday's lesson"
                className="w-full rounded-xl border border-[var(--wrife-border)] px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                maxLength={300}
              />
            </div>

            {/* Optional due date */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
                Due date <span className="text-[var(--wrife-text-muted)] font-normal">(optional)</span>
              </label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                min={today}
                onChange={e => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-[var(--wrife-border)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border border-[var(--wrife-border)] py-2.5 text-sm font-semibold text-[var(--wrife-text-main)] hover:bg-[var(--wrife-bg)] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || fetchingClasses || !selectedClassId}
                className="flex-1 rounded-full bg-[var(--wrife-blue)] py-2.5 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-r-transparent" />
                    Pushing…
                  </>
                ) : (
                  <>📤 Push to Class</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
