"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Activity {
  level: number;
  level_name: string;
  grammar_focus: string;
  sentence_structure: string;
  instructions: string;
  examples: string[];
  practice_prompts: string[];
}

interface Assignment {
  id: number;
  instructions: string | null;
  due_date: string | null;
}

interface Submission {
  id: number;
  pupil_writing: string;
  status: string;
  submitted_at: string | null;
}

export default function PWPAssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params?.lesson as string;

  const [pupilId, setPupilId] = useState<string | null>(null);
  const [pupilName, setPupilName] = useState('');
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [existingSubmission, setExistingSubmission] = useState<Submission | null>(null);
  const [writing, setWriting] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('pupilSession');
    if (!stored) { router.push('/pupil/login'); return; }
    try {
      const session = JSON.parse(stored);
      if (!session.pupilId) { router.push('/pupil/login'); return; }
      setPupilId(session.pupilId);
      setPupilName(session.pupilName || '');
      fetchAssignment(session.pupilId);
    } catch {
      router.push('/pupil/login');
    }
  }, [assignmentId]);

  async function fetchAssignment(pid: string) {
    try {
      const res = await fetch(`/api/pupil/pwp-assignment?id=${assignmentId}&pupilId=${encodeURIComponent(pid)}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Could not load activity'); setLoading(false); return; }
      setAssignment(data.assignment);
      setActivity(data.activity);
      if (data.existingSubmission) {
        setExistingSubmission(data.existingSubmission);
        setWriting(data.existingSubmission.pupil_writing || '');
        if (data.existingSubmission.status === 'submitted') setSubmitted(true);
      }
    } catch (err) {
      setError('Could not load activity');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!pupilId || !writing.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/pupil/pwp-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pwpAssignmentId: parseInt(assignmentId, 10),
          pupilId,
          content: writing.trim(),
          status: 'submitted',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Could not submit');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveDraft() {
    if (!pupilId || !writing.trim()) return;
    try {
      await fetch('/api/pupil/pwp-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pwpAssignmentId: parseInt(assignmentId, 10),
          pupilId,
          content: writing.trim(),
          status: 'draft',
        }),
      });
    } catch {}
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent" />
      </div>
    );
  }

  if (error && !activity) {
    return (
      <div className="min-h-screen bg-[var(--wrife-bg)]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/pupil/dashboard" className="text-[var(--wrife-blue)] underline">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--wrife-bg)]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-[var(--wrife-text-main)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Great work, {pupilName}!
            </h2>
            <p className="text-[var(--wrife-text-muted)] mb-2">
              You have completed Level {activity?.level}: {activity?.level_name}
            </p>
            <p className="text-sm text-[var(--wrife-text-muted)] mb-6">
              Your teacher will review your sentences soon.
            </p>
            <Link
              href="/pupil/dashboard"
              className="inline-block rounded-full bg-[var(--wrife-blue)] text-white px-8 py-3 font-semibold hover:opacity-90 transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--wrife-bg)]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link href="/pupil/dashboard" className="text-sm text-[var(--wrife-text-muted)] hover:text-[var(--wrife-blue)] flex items-center gap-1 mb-4">
          ← Back to Dashboard
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-6 text-white mb-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xl font-bold">
              L{activity?.level}
            </span>
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                {activity?.level_name}
              </h1>
              <p className="text-purple-200 text-sm">{activity?.grammar_focus}</p>
            </div>
          </div>
          {assignment?.instructions && (
            <p className="text-purple-100 text-sm mt-3 bg-white/10 rounded-lg p-3">
              📌 {assignment.instructions}
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-5 mb-4">
          <h2 className="font-bold text-[var(--wrife-text-main)] mb-2">What to do</h2>
          <p className="text-[var(--wrife-text-muted)] text-sm mb-3">{activity?.instructions}</p>
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-purple-700 mb-1">Sentence structure:</p>
            <p className="text-sm font-mono text-purple-800">{activity?.sentence_structure}</p>
          </div>
        </div>

        {/* Examples */}
        {activity?.examples && activity.examples.length > 0 && (
          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-5 mb-4">
            <h2 className="font-bold text-[var(--wrife-text-main)] mb-3">Examples</h2>
            <div className="space-y-2">
              {activity.examples.map((ex, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-purple-400 font-bold shrink-0">→</span>
                  <span className="text-[var(--wrife-text-muted)] italic">{ex}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Practice prompts */}
        {activity?.practice_prompts && activity.practice_prompts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-5 mb-4">
            <h2 className="font-bold text-[var(--wrife-text-main)] mb-3">Your prompts</h2>
            <div className="space-y-2">
              {activity.practice_prompts.map((prompt, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-purple-700 text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-[var(--wrife-text-muted)]">{prompt}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Writing area */}
        <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-5 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-[var(--wrife-text-main)]">Your Writing</h2>
            <span className="text-xs text-[var(--wrife-text-muted)]">
              {writing.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <textarea
            value={writing}
            onChange={(e) => setWriting(e.target.value)}
            onBlur={handleSaveDraft}
            className="w-full min-h-[160px] px-4 py-3 rounded-xl border border-[var(--wrife-border)] text-sm text-[var(--wrife-text-main)] focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            placeholder="Write your sentences here. Try to use the sentence structure shown above..."
          />
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSaveDraft}
            className="flex-1 rounded-full border border-[var(--wrife-border)] px-6 py-3 text-sm font-semibold text-[var(--wrife-text-muted)] hover:bg-gray-50 transition"
          >
            Save Draft
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !writing.trim()}
            className="flex-1 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit for Feedback'}
          </button>
        </div>
      </div>
    </div>
  );
}
