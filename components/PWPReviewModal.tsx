'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
  score: number;
  feedback: string;
  created_at: string;
}

interface Props {
  submission: PWPSubmission;
  pupilName: string;
  activityName: string;
  onClose: () => void;
  onStatusUpdate?: () => void;
}

export function PWPReviewModal({ submission, pupilName, activityName, onClose, onStatusUpdate }: Props) {
  const [assessment, setAssessment] = useState<PWPAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    fetchAssessment();
  }, [submission.id]);

  async function fetchAssessment() {
    try {
      const { data, error } = await supabase
        .from('pwp_assessments')
        .select('*')
        .eq('pwp_submission_id', submission.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error) {
        setAssessment(data);
      }
    } catch (err) {
      console.error('Error fetching PWP assessment:', err);
    } finally {
      setLoading(false);
    }
  }

  async function markAsReviewed() {
    setMarking(true);
    try {
      const { error } = await supabase
        .from('pwp_submissions')
        .update({ status: 'reviewed' })
        .eq('id', submission.id);

      if (!error) {
        onStatusUpdate?.();
        onClose();
      }
    } catch (err) {
      console.error('Error marking as reviewed:', err);
    } finally {
      setMarking(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[var(--wrife-border)] bg-purple-50">
          <div>
            <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">
              {pupilName}&apos;s PWP Submission
            </h2>
            <p className="text-sm text-[var(--wrife-text-muted)]">{activityName}</p>
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
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              submission.status === 'reviewed' 
                ? 'bg-blue-100 text-blue-700'
                : submission.status === 'submitted'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {submission.status === 'reviewed' ? 'Reviewed' : 
               submission.status === 'submitted' ? 'Submitted' : 'In Progress'}
            </span>
            {submission.submitted_at && (
              <span className="text-xs text-[var(--wrife-text-muted)]">
                Submitted: {new Date(submission.submitted_at).toLocaleString('en-GB')}
              </span>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[var(--wrife-text-main)] mb-2">Pupil&apos;s Writing</h3>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <p className="text-sm text-[var(--wrife-text-main)] whitespace-pre-wrap leading-relaxed">
                {submission.content || 'No content submitted yet'}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
            </div>
          ) : assessment ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-blue-700">AI Feedback</h3>
                <span className="text-xs font-bold text-blue-600">Score: {assessment.score}/10</span>
              </div>
              <p className="text-sm text-blue-700">{assessment.feedback}</p>
            </div>
          ) : (
            <div className="text-center py-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-[var(--wrife-text-muted)]">No AI assessment available</p>
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
          {submission.status === 'submitted' && (
            <button
              onClick={markAsReviewed}
              disabled={marking}
              className="px-6 py-2 rounded-full text-sm font-semibold bg-purple-600 text-white hover:opacity-90 transition disabled:opacity-50"
            >
              {marking ? 'Marking...' : 'Mark as Reviewed'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
