'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // used for fetchAssessment read

interface PWPSubmission {
  id: number;
  pwp_assignment_id: number;
  pupil_id: string;
  status: string;
  content: string | null;
  submitted_at: string | null;
}

interface PWPAssessment {
  id: number;
  pwp_submission_id: number;
  grammar_accuracy: number | null;
  structure_correctness: number | null;
  feedback: string | null;
  corrections: string[] | null;
  improved_example: string | null;
  teacher_note: string | null;
  created_at: string;
}

interface Props {
  submission: PWPSubmission;
  pupilName: string;
  activityName: string;
  onClose: () => void;
  onStatusUpdate?: () => void;
}

const BAND_LABELS: Record<number, { label: string; colour: string }> = {
  1: { label: 'Working Towards', colour: 'bg-red-100 text-red-700' },
  2: { label: 'Expected',        colour: 'bg-yellow-100 text-yellow-700' },
  3: { label: 'Greater Depth',   colour: 'bg-blue-100 text-blue-700' },
  4: { label: 'Mastery',         colour: 'bg-green-100 text-green-700' },
};

export function PWPReviewModal({ submission, pupilName, activityName, onClose, onStatusUpdate }: Props) {
  const [assessment, setAssessment] = useState<PWPAssessment | null>(null);
  const [teacherNote, setTeacherNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [assessing, setAssessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [currentStatus, setCurrentStatus] = useState(submission.status);

  useEffect(() => {
    fetchAssessment();
  }, [submission.id]);

  async function fetchAssessment() {
    try {
      const { data } = await supabase
        .from('pwp_assessments')
        .select('*')
        .eq('pwp_submission_id', submission.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setAssessment(data);
        setTeacherNote(data.teacher_note || '');
      }
    } catch (err) {
      console.error('Error fetching PWP assessment:', err);
    } finally {
      setLoading(false);
    }
  }

  async function runAIAssessment() {
    setAssessing(true);
    setError('');
    try {
      const res = await fetch('/api/pwp-assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pwp_submission_id: submission.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Assessment failed');
      setAssessment(data.assessment);
      setTeacherNote(data.assessment.teacher_note || '');
      setCurrentStatus('reviewed');
      onStatusUpdate?.();
    } catch (err: any) {
      setError(err.message || 'Could not run AI assessment');
    } finally {
      setAssessing(false);
    }
  }

  async function saveTeacherNote() {
    if (!assessment) return;
    setSaving(true);
    try {
      await supabase
        .from('pwp_assessments')
        .update({ teacher_note: teacherNote })
        .eq('id', assessment.id);
      setAssessment(prev => prev ? { ...prev, teacher_note: teacherNote } : prev);
    } catch (err) {
      console.error('Error saving teacher note:', err);
    } finally {
      setSaving(false);
    }
  }

  async function markReviewed() {
    setSaving(true);
    try {
      const res = await fetch(`/api/teacher/pwp-submissions?id=${submission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'reviewed' }),
      });
      if (!res.ok) throw new Error('Failed to mark as reviewed');
      setCurrentStatus('reviewed');
      onStatusUpdate?.();
    } catch (err) {
      console.error('Error marking reviewed:', err);
    } finally {
      setSaving(false);
    }
  }

  const grammar = assessment?.grammar_accuracy;
  const structure = assessment?.structure_correctness;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--wrife-border)] bg-purple-50">
          <div>
            <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">
              {pupilName}&apos;s PWP Submission
            </h2>
            <p className="text-sm text-[var(--wrife-text-muted)]">{activityName}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white border border-[var(--wrife-border)] flex items-center justify-center hover:bg-gray-50 transition">
            <svg className="w-5 h-5 text-[var(--wrife-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Status + submitted time */}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              currentStatus === 'reviewed' ? 'bg-blue-100 text-blue-700'
              : currentStatus === 'submitted' ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
            }`}>
              {currentStatus === 'reviewed' ? 'Reviewed' : currentStatus === 'submitted' ? 'Submitted' : 'In Progress'}
            </span>
            {submission.submitted_at && (
              <span className="text-xs text-[var(--wrife-text-muted)]">
                Submitted: {new Date(submission.submitted_at).toLocaleString('en-GB')}
              </span>
            )}
          </div>

          {/* Pupil writing */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--wrife-text-main)] mb-2">Pupil&apos;s Writing</h3>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <p className="text-sm text-[var(--wrife-text-main)] whitespace-pre-wrap leading-relaxed">
                {submission.content || 'No content submitted yet'}
              </p>
            </div>
          </div>

          {/* AI Assessment */}
          {loading ? (
            <div className="text-center py-4">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
            </div>
          ) : assessment ? (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[var(--wrife-text-main)]">AI Assessment</h3>

              {/* Score bands */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
                  <p className="text-xs text-[var(--wrife-text-muted)] mb-1">Grammar Accuracy</p>
                  {grammar && (
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${BAND_LABELS[grammar]?.colour}`}>
                      {grammar}/4 — {BAND_LABELS[grammar]?.label}
                    </span>
                  )}
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
                  <p className="text-xs text-[var(--wrife-text-muted)] mb-1">Structure</p>
                  {structure && (
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${BAND_LABELS[structure]?.colour}`}>
                      {structure}/4 — {BAND_LABELS[structure]?.label}
                    </span>
                  )}
                </div>
              </div>

              {/* Feedback */}
              {assessment.feedback && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-xs font-semibold text-blue-700 mb-1">✏️ Feedback</p>
                  <p className="text-sm text-blue-800">{assessment.feedback}</p>
                </div>
              )}

              {/* Corrections */}
              {assessment.corrections && assessment.corrections.length > 0 && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-xs font-semibold text-amber-700 mb-2">📝 Corrections</p>
                  <ul className="space-y-1">
                    {assessment.corrections.map((c, i) => (
                      <li key={i} className="text-sm text-amber-800 flex gap-2">
                        <span>•</span><span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improved example */}
              {assessment.improved_example && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-xs font-semibold text-green-700 mb-1">⭐ Improved Example</p>
                  <p className="text-sm text-green-800 italic">{assessment.improved_example}</p>
                </div>
              )}

              {/* Teacher note */}
              <div>
                <label className="text-xs font-semibold text-[var(--wrife-text-main)] block mb-1">
                  Your Note to Pupil (optional)
                </label>
                <textarea
                  value={teacherNote}
                  onChange={e => setTeacherNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--wrife-border)] focus:outline-none focus:border-purple-400 resize-none"
                  placeholder="Add a personal note that the pupil will see..."
                />
                <button
                  onClick={saveTeacherNote}
                  disabled={saving}
                  className="mt-1 text-xs text-purple-600 hover:underline disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save note'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-[var(--wrife-text-muted)] mb-4">No AI assessment yet — run one to generate feedback the pupil can see.</p>
              {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
              <button
                onClick={runAIAssessment}
                disabled={assessing}
                className="px-6 py-2 rounded-full text-sm font-semibold bg-purple-600 text-white hover:opacity-90 transition disabled:opacity-50"
              >
                {assessing ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                    Assessing…
                  </span>
                ) : '✨ Run AI Assessment'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--wrife-border)] bg-[var(--wrife-bg)] flex justify-between items-center gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-full text-sm font-semibold border border-[var(--wrife-border)] text-[var(--wrife-text-main)] hover:bg-white transition">
            Close
          </button>
          <div className="flex gap-2">
            {assessment && currentStatus !== 'reviewed' && (
              <button
                onClick={markReviewed}
                disabled={saving}
                className="px-6 py-2 rounded-full text-sm font-semibold bg-purple-600 text-white hover:opacity-90 transition disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Mark as Reviewed'}
              </button>
            )}
            {assessment && currentStatus === 'reviewed' && (
              <button
                onClick={runAIAssessment}
                disabled={assessing}
                className="px-4 py-2 rounded-full text-sm font-semibold border border-purple-300 text-purple-600 hover:bg-purple-50 transition disabled:opacity-50"
              >
                {assessing ? 'Reassessing…' : '↺ Re-assess'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
