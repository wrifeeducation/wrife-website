'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Submission {
  id: number;
  content: string | null;
  status: string;
  submitted_at: string | null;
}

interface AIAssessment {
  id: number;
  strengths: string[];
  improvements: string[];
  improved_example: string;
  mechanical_edits: string[];
  banding_score: number;
  created_at: string;
}

interface Props {
  submission: Submission;
  pupilName: string;
  assignmentTitle: string;
  onClose: () => void;
  onAssessmentComplete: () => void;
}

function getBandingLabel(score: number): string {
  switch (score) {
    case 1: return 'Working towards';
    case 2: return 'Expected';
    case 3: return 'Greater depth';
    case 4: return 'Mastery';
    default: return 'Not assessed';
  }
}

function getBandingColor(score: number): string {
  switch (score) {
    case 1: return 'bg-orange-100 text-orange-700 border-orange-200';
    case 2: return 'bg-green-100 text-green-700 border-green-200';
    case 3: return 'bg-blue-100 text-blue-700 border-blue-200';
    case 4: return 'bg-purple-100 text-purple-700 border-purple-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export function SubmissionReviewModal({ submission, pupilName, assignmentTitle, onClose, onAssessmentComplete }: Props) {
  const [assessment, setAssessment] = useState<AIAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [assessing, setAssessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssessment();
  }, [submission.id]);

  async function fetchAssessment() {
    try {
      const { data, error } = await supabase
        .from('ai_assessments')
        .select('*')
        .eq('submission_id', submission.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
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
        body: JSON.stringify({ submission_id: submission.id })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to run assessment');
      }

      setAssessment(data.assessment);
      onAssessmentComplete();
    } catch (err: any) {
      console.error('Assessment error:', err);
      setError(err.message || 'Failed to run assessment');
    } finally {
      setAssessing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[var(--wrife-border)] bg-[var(--wrife-bg)]">
          <div>
            <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">
              {pupilName}&apos;s Submission
            </h2>
            <p className="text-sm text-[var(--wrife-text-muted)]">{assignmentTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white border border-[var(--wrife-border)] flex items-center justify-center hover:bg-gray-50 transition"
          >
            <svg className="w-5 h-5 text-[var(--wrife-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[var(--wrife-text-main)] mb-2">Pupil&apos;s Writing</h3>
            <div className="bg-[var(--wrife-bg)] rounded-xl p-4 border border-[var(--wrife-border)]">
              <p className="text-sm text-[var(--wrife-text-main)] whitespace-pre-wrap">
                {submission.content || 'No content submitted'}
              </p>
            </div>
            {submission.submitted_at && (
              <p className="text-xs text-[var(--wrife-text-muted)] mt-2">
                Submitted: {new Date(submission.submitted_at).toLocaleString('en-GB')}
              </p>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent"></div>
              <p className="mt-2 text-sm text-[var(--wrife-text-muted)]">Loading assessment...</p>
            </div>
          ) : assessment ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--wrife-text-main)]">AI Assessment</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBandingColor(assessment.banding_score)}`}>
                  {getBandingLabel(assessment.banding_score)}
                </span>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <span>✨</span> Strengths
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {assessment.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-green-700">{s}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-yellow-700 mb-2 flex items-center gap-2">
                  <span>💡</span> Areas for Improvement
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {assessment.improvements.map((s, i) => (
                    <li key={i} className="text-sm text-yellow-700">{s}</li>
                  ))}
                </ul>
              </div>

              {assessment.mechanical_edits.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                    <span>✏️</span> Spelling & Grammar
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {assessment.mechanical_edits.map((s, i) => (
                      <li key={i} className="text-sm text-red-700">{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
                  <span>📝</span> Improved Example
                </h4>
                <p className="text-sm text-blue-700 italic">
                  &quot;{assessment.improved_example}&quot;
                </p>
              </div>

              <p className="text-xs text-[var(--wrife-text-muted)]">
                Assessment generated: {new Date(assessment.created_at).toLocaleString('en-GB')}
              </p>
            </div>
          ) : (
            <div className="text-center py-8 bg-[var(--wrife-bg)] rounded-xl border border-[var(--wrife-border)]">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--wrife-blue-soft)] mb-4">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold text-[var(--wrife-text-main)] mb-2">
                No Assessment Yet
              </h3>
              <p className="text-sm text-[var(--wrife-text-muted)] mb-4">
                Run AI assessment to get feedback on this submission
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[var(--wrife-border)] bg-[var(--wrife-bg)] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-sm font-semibold border border-[var(--wrife-border)] text-[var(--wrife-text-main)] hover:bg-white transition"
          >
            Close
          </button>
          <button
            onClick={handleRunAssessment}
            disabled={assessing || !submission.content}
            className="px-6 py-2 rounded-full text-sm font-semibold bg-[var(--wrife-blue)] text-white hover:opacity-90 transition disabled:opacity-50"
          >
            {assessing ? 'Assessing...' : assessment ? 'Re-run Assessment' : 'Run AI Assessment'}
          </button>
        </div>
      </div>
    </div>
  );
}
