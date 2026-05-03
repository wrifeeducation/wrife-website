'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Submission {
  id: string;          // UUID
  content: string | null;
  status: string;
  submitted_at: string | null;
}

interface RawAIResponse {
  strengths: string[];
  improvements: string[];
  improved_example: string;
  mechanical_edits: string[];
  teacher_rationale: string;
}

interface AIAssessment {
  id: string;
  piece_id: string;
  overall_band: number;
  composition_score: number;
  vocabulary_score: number;
  grammar_score: number;
  punctuation_score: number;
  spelling_score: number;
  purpose_audience_effect_score: number;
  raw_ai_response: RawAIResponse;
  model_used: string;
  assessed_at: string;
}

interface Props {
  submission: Submission;
  pupilName: string;
  assignmentTitle: string;
  onClose: () => void;
  onAssessmentComplete: () => void;
}

const BAND_LABELS: Record<number, string> = {
  1: 'Emerging', 2: 'Developing', 3: 'Secure', 4: 'Greater Depth',
};

const BAND_COLORS: Record<number, string> = {
  1: 'bg-orange-100 text-orange-700 border-orange-200',
  2: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  3: 'bg-green-100 text-green-700 border-green-200',
  4: 'bg-purple-100 text-purple-700 border-purple-200',
};

const CRITERIA: Array<{ key: keyof AIAssessment; label: string }> = [
  { key: 'composition_score', label: 'Composition' },
  { key: 'vocabulary_score', label: 'Vocabulary' },
  { key: 'grammar_score', label: 'Grammar' },
  { key: 'punctuation_score', label: 'Punctuation' },
  { key: 'spelling_score', label: 'Spelling' },
  { key: 'purpose_audience_effect_score', label: 'Purpose & Effect' },
];

export function SubmissionReviewModal({ submission, pupilName, assignmentTitle, onClose, onAssessmentComplete }: Props) {
  const [assessment, setAssessment] = useState<AIAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [assessing, setAssessing] = useState(false);
  const [approving, setApproving] = useState(false);
  const [teacherNote, setTeacherNote] = useState('');
  const [error, setError] = useState('');
  const [approved, setApproved] = useState(submission.status === 'reviewed');

  useEffect(() => {
    fetchAssessment();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission.id]);

  async function fetchAssessment() {
    try {
      const { data, error: fetchErr } = await supabase
        .from('ai_assessments')
        .select('*')
        .eq('piece_id', submission.id)
        .maybeSingle();

      if (fetchErr) throw fetchErr;
      setAssessment(data);
    } catch (err) {
      console.error('Error fetching assessment:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRunAssessment() {
    setAssessing(true);
    setError('');
    try {
      const response = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ submission_id: submission.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to run assessment');
      setAssessment(data.assessment);
      onAssessmentComplete();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Assessment failed');
    } finally {
      setAssessing(false);
    }
  }

  async function handleApprove() {
    setApproving(true);
    setError('');
    try {
      const response = await fetch('/api/teacher/submissions/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ submissionId: submission.id, teacherNote }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not approve submission');
      setApproved(true);
      onAssessmentComplete();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Approval failed');
    } finally {
      setApproving(false);
    }
  }

  const raw = assessment?.raw_ai_response;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">

        {/* ── Header ── */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--wrife-border)] bg-[var(--wrife-bg)]">
          <div>
            <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">{pupilName}&apos;s Submission</h2>
            <p className="text-sm text-[var(--wrife-text-muted)]">{assignmentTitle}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white border border-[var(--wrife-border)] flex items-center justify-center hover:bg-gray-50 transition">
            <svg className="w-5 h-5 text-[var(--wrife-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Pupil's writing */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--wrife-text-main)] mb-2">Pupil&apos;s Writing</h3>
            <div className="bg-[var(--wrife-bg)] rounded-xl p-4 border border-[var(--wrife-border)]">
              <p className="text-sm text-[var(--wrife-text-main)] whitespace-pre-wrap">{submission.content || 'No content submitted'}</p>
            </div>
            {submission.submitted_at && (
              <p className="text-xs text-[var(--wrife-text-muted)] mt-1">
                Submitted: {new Date(submission.submitted_at).toLocaleString('en-GB')}
              </p>
            )}
          </div>

          {/* Assessment */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent" />
              <p className="mt-2 text-sm text-[var(--wrife-text-muted)]">Loading assessment…</p>
            </div>
          ) : assessment && raw ? (
            <div className="space-y-4">

              {/* Overall band */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--wrife-text-main)]">AI Assessment</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${BAND_COLORS[assessment.overall_band] ?? 'bg-gray-100 text-gray-700'}`}>
                  Band {assessment.overall_band} — {BAND_LABELS[assessment.overall_band] ?? 'Unknown'}
                </span>
              </div>

              {/* 6-criterion grid */}
              <div className="grid grid-cols-3 gap-2">
                {CRITERIA.map(({ key, label }) => {
                  const score = assessment[key] as number;
                  return (
                    <div key={key} className="bg-[var(--wrife-bg)] rounded-lg p-2 border border-[var(--wrife-border)] text-center">
                      <p className="text-xs text-[var(--wrife-text-muted)] mb-0.5">{label}</p>
                      <p className="text-lg font-bold text-[var(--wrife-text-main)]">{score}/4</p>
                      <p className="text-xs text-[var(--wrife-text-muted)]">{BAND_LABELS[score] ?? ''}</p>
                    </div>
                  );
                })}
              </div>

              {/* Strengths */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-700 mb-2">✨ Strengths</h4>
                <ul className="list-disc list-inside space-y-1">
                  {raw.strengths.map((s, i) => <li key={i} className="text-sm text-green-700">{s}</li>)}
                </ul>
              </div>

              {/* Improvements */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-yellow-700 mb-2">💡 Areas for Improvement</h4>
                <ul className="list-disc list-inside space-y-1">
                  {raw.improvements.map((s, i) => <li key={i} className="text-sm text-yellow-700">{s}</li>)}
                </ul>
              </div>

              {/* Mechanical edits */}
              {raw.mechanical_edits.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-red-700 mb-2">✏️ Spelling & Punctuation</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {raw.mechanical_edits.map((s, i) => <li key={i} className="text-sm text-red-700">{s}</li>)}
                  </ul>
                </div>
              )}

              {/* Improved example */}
              {raw.improved_example && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-700 mb-2">📝 Improved Example</h4>
                  <p className="text-sm text-blue-700 italic">&ldquo;{raw.improved_example}&rdquo;</p>
                </div>
              )}

              {/* Teacher rationale */}
              {raw.teacher_rationale && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-600 mb-1">📋 AI Rationale (for your records)</h4>
                  <p className="text-sm text-gray-600">{raw.teacher_rationale}</p>
                </div>
              )}

              <p className="text-xs text-[var(--wrife-text-muted)]">
                Assessed: {new Date(assessment.assessed_at).toLocaleString('en-GB')} · {assessment.model_used}
              </p>

              {/* Approval section */}
              {!approved ? (
                <div className="border-t border-[var(--wrife-border)] pt-4 space-y-3">
                  <h3 className="text-sm font-semibold text-[var(--wrife-text-main)]">Send Feedback to Pupil</h3>
                  <p className="text-xs text-[var(--wrife-text-muted)]">
                    Once you approve, the pupil will see the AI feedback on their assignment page. Add a personal note below (optional).
                  </p>
                  <textarea
                    value={teacherNote}
                    onChange={(e) => setTeacherNote(e.target.value)}
                    placeholder="Add a personal note to this pupil (optional)…"
                    className="w-full h-24 p-3 text-sm rounded-lg border border-[var(--wrife-border)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] resize-none"
                  />
                </div>
              ) : (
                <div className="border-t border-[var(--wrife-border)] pt-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-sm font-semibold text-green-700">Feedback approved and sent to pupil</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 bg-[var(--wrife-bg)] rounded-xl border border-[var(--wrife-border)]">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--wrife-blue-soft)] mb-4">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold text-[var(--wrife-text-main)] mb-2">No Assessment Yet</h3>
              <p className="text-sm text-[var(--wrife-text-muted)]">Run AI assessment to get feedback on this submission</p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="p-4 border-t border-[var(--wrife-border)] bg-[var(--wrife-bg)] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-full text-sm font-semibold border border-[var(--wrife-border)] text-[var(--wrife-text-main)] hover:bg-white transition">
            Close
          </button>
          {!approved && (
            <button
              onClick={handleRunAssessment}
              disabled={assessing || !submission.content}
              className="px-5 py-2 rounded-full text-sm font-semibold bg-[var(--wrife-blue)] text-white hover:opacity-90 transition disabled:opacity-50"
            >
              {assessing ? 'Assessing…' : assessment ? 'Re-run Assessment' : 'Run AI Assessment'}
            </button>
          )}
          {assessment && !approved && (
            <button
              onClick={handleApprove}
              disabled={approving}
              className="px-5 py-2 rounded-full text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
            >
              {approving ? 'Sending…' : 'Approve & Send to Pupil'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
