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

interface Assessment {
  grammar_accuracy: number | null;
  structure_correctness: number | null;
  feedback: string | null;
  corrections: string[] | null;
  improved_example: string | null;
  teacher_note: string | null;
}

const BAND_LABELS: Record<number, { label: string; emoji: string; colour: string }> = {
  1: { label: 'Working Towards', emoji: '🌱', colour: 'bg-red-100 text-red-700' },
  2: { label: 'Expected',        emoji: '⭐',  colour: 'bg-yellow-100 text-yellow-700' },
  3: { label: 'Greater Depth',   emoji: '🌟',  colour: 'bg-blue-100 text-blue-700' },
  4: { label: 'Mastery',         emoji: '🏆',  colour: 'bg-green-100 text-green-700' },
};

export default function PWPAssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params?.lesson as string;

  const [pupilId, setPupilId] = useState<string | null>(null);
  const [pupilName, setPupilName] = useState('');
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [writing, setWriting] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Derived state
  const isReviewed = submission?.status === 'reviewed';
  const isSubmitted = submission?.status === 'submitted';

  useEffect(() => {
    const stored = localStorage.getItem('pupilSession');
    if (!stored) { router.push('/pupil/login'); return; }
    try {
      const session = JSON.parse(stored);
      if (!session.pupilId) { router.push('/pupil/login'); return; }
      setPupilId(session.pupilId);
      setPupilName(session.pupilName || '');
      loadAll(session.pupilId);
    } catch {
      router.push('/pupil/login');
    }
  }, [assignmentId]);

  async function loadAll(pid: string) {
    setLoading(true);
    try {
      // Fetch assignment + activity + existing submission
      const res = await fetch(`/api/pupil/pwp-assignment?id=${assignmentId}&pupilId=${encodeURIComponent(pid)}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Could not load activity'); return; }

      setAssignment(data.assignment);
      setActivity(data.activity);

      const sub = data.existingSubmission;
      if (sub) {
        setSubmission(sub);
        setWriting(sub.pupil_writing || '');

        // If reviewed, fetch feedback
        if (sub.status === 'reviewed') {
          const fbRes = await fetch(`/api/pupil/pwp-feedback?assignmentId=${assignmentId}&pupilId=${encodeURIComponent(pid)}`);
          const fbData = await fbRes.json();
          if (fbRes.ok && fbData.assessment) {
            setAssessment(fbData.assessment);
          }
        }
      }
    } catch {
      setError('Could not load activity');
    } finally {
      setLoading(false);
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
      setSubmission(data.submission);
    } catch (err: any) {
      setError(err.message || 'Could not submit');
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent" />
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

  // ─── Reviewed: show full feedback ──────────────────────────────────────────
  if (isReviewed) {
    const g = assessment?.grammar_accuracy;
    const s = assessment?.structure_correctness;
    return (
      <div className="min-h-screen bg-[var(--wrife-bg)]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link href="/pupil/dashboard" className="text-sm text-[var(--wrife-text-muted)] hover:text-[var(--wrife-blue)] flex items-center gap-1 mb-4">
            ← Back to Dashboard
          </Link>

          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-6 text-white mb-5 text-center">
            <div className="text-5xl mb-3">✅</div>
            <h1 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
              Teacher Feedback Ready!
            </h1>
            <p className="text-purple-200 text-sm">
              Level {activity?.level}: {activity?.level_name}
            </p>
          </div>

          {/* Score bands */}
          {assessment && (g || s) && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {g && (
                <div className="bg-white rounded-2xl border border-[var(--wrife-border)] p-4 text-center shadow-soft">
                  <p className="text-xs text-[var(--wrife-text-muted)] mb-2">Grammar</p>
                  <div className="text-2xl mb-1">{BAND_LABELS[g]?.emoji}</div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${BAND_LABELS[g]?.colour}`}>
                    {BAND_LABELS[g]?.label}
                  </span>
                </div>
              )}
              {s && (
                <div className="bg-white rounded-2xl border border-[var(--wrife-border)] p-4 text-center shadow-soft">
                  <p className="text-xs text-[var(--wrife-text-muted)] mb-2">Sentence Structure</p>
                  <div className="text-2xl mb-1">{BAND_LABELS[s]?.emoji}</div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${BAND_LABELS[s]?.colour}`}>
                    {BAND_LABELS[s]?.label}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Feedback */}
          {assessment?.feedback && (
            <div className="bg-white rounded-2xl border border-[var(--wrife-border)] shadow-soft p-5 mb-4">
              <h3 className="font-bold text-[var(--wrife-text-main)] mb-2">⭐ Feedback</h3>
              <p className="text-sm text-[var(--wrife-text-main)] leading-relaxed">{assessment.feedback}</p>
            </div>
          )}

          {/* Corrections */}
          {assessment?.corrections && assessment.corrections.length > 0 && (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 mb-4">
              <h3 className="font-bold text-amber-800 mb-2">📝 Things to improve</h3>
              <ul className="space-y-2">
                {assessment.corrections.map((c, i) => (
                  <li key={i} className="flex gap-2 text-sm text-amber-700">
                    <span className="shrink-0">•</span><span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improved example */}
          {assessment?.improved_example && (
            <div className="bg-green-50 rounded-2xl border border-green-200 p-5 mb-4">
              <h3 className="font-bold text-green-800 mb-2">✨ How it could look</h3>
              <p className="text-sm text-green-800 italic leading-relaxed">{assessment.improved_example}</p>
            </div>
          )}

          {/* Teacher note */}
          {assessment?.teacher_note && (
            <div className="bg-blue-50 rounded-2xl border border-blue-200 p-5 mb-4">
              <h3 className="font-bold text-blue-800 mb-2">👩‍🏫 From your teacher</h3>
              <p className="text-sm text-blue-800 leading-relaxed">{assessment.teacher_note}</p>
            </div>
          )}

          {/* Your original writing */}
          <div className="bg-white rounded-2xl border border-[var(--wrife-border)] shadow-soft p-5 mb-6">
            <h3 className="font-bold text-[var(--wrife-text-main)] mb-2">✏️ Your Writing</h3>
            <p className="text-sm text-[var(--wrife-text-muted)] whitespace-pre-wrap leading-relaxed">
              {submission?.pupil_writing || writing}
            </p>
          </div>

          <Link
            href="/pupil/dashboard"
            className="block w-full text-center rounded-full bg-purple-600 text-white px-8 py-3 font-semibold hover:opacity-90 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ─── Submitted: awaiting review ────────────────────────────────────────────
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[var(--wrife-bg)]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Link href="/pupil/dashboard" className="text-sm text-[var(--wrife-text-muted)] hover:text-[var(--wrife-blue)] flex items-center gap-1 mb-6">
            ← Back to Dashboard
          </Link>
          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-[var(--wrife-text-main)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Great work, {pupilName}!
            </h2>
            <p className="text-[var(--wrife-text-muted)] mb-2">
              Level {activity?.level}: {activity?.level_name}
            </p>
            <p className="text-sm text-[var(--wrife-text-muted)] mb-6">
              Your sentences have been submitted. Come back here once your teacher has reviewed them to see your feedback!
            </p>
            <div className="bg-purple-50 rounded-xl p-4 mb-6 text-left">
              <p className="text-xs font-semibold text-purple-700 mb-2">Your Writing:</p>
              <p className="text-sm text-purple-800 whitespace-pre-wrap leading-relaxed">{writing}</p>
            </div>
            <Link
              href="/pupil/dashboard"
              className="inline-block rounded-full bg-purple-600 text-white px-8 py-3 font-semibold hover:opacity-90 transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Writing view (not started / draft) ────────────────────────────────────
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
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
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
