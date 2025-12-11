'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface PupilSession {
  pupilId: string;
  pupilName: string;
  classId: string;
  className: string;
  classCode: string;
  yearGroup: number;
  loggedInAt: string;
}

interface PWPActivity {
  id: number;
  level: number;
  level_name: string;
  grammar_focus: string;
  sentence_structure: string;
  instructions: string;
  examples: string[];
  practice_prompts: string[];
}

interface PWPAssignment {
  id: number;
  activity_id: number;
  instructions: string | null;
  due_date: string | null;
  progressive_activities: PWPActivity;
}

export default function PupilPWPPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [session, setSession] = useState<PupilSession | null>(null);
  const [assignment, setAssignment] = useState<PWPAssignment | null>(null);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('pupilSession');
    if (!stored) {
      router.push('/pupil/login');
      return;
    }

    try {
      const parsed = JSON.parse(stored) as PupilSession;
      setSession(parsed);
      fetchAssignment(parsed.classId, parsed.pupilId);
    } catch (err) {
      console.error('Invalid session:', err);
      router.push('/pupil/login');
    }
  }, [router, resolvedParams.id]);

  async function fetchAssignment(classId: string, pupilId: string) {
    try {
      const response = await fetch('/api/pupil/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId, pupilId })
      });

      const data = await response.json();

      if (!response.ok) {
        setError('Failed to fetch assignment');
        return;
      }

      const pwpAssignment = data.pwpAssignments?.find(
        (a: PWPAssignment) => a.id === parseInt(resolvedParams.id)
      );

      if (!pwpAssignment) {
        setError('Assignment not found');
        return;
      }

      setAssignment(pwpAssignment);

      const existingSub = data.pwpSubmissions?.find(
        (s: any) => s.pwp_assignment_id === parseInt(resolvedParams.id)
      );
      if (existingSub) {
        setExistingSubmission(existingSub);
        setContent(existingSub.content || '');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load assignment');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(status: 'draft' | 'submitted') {
    if (!session || !assignment) return;
    
    if (status === 'submitted' && !content.trim()) {
      setError('Please write something before submitting');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/pupil/pwp-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          pwpAssignmentId: assignment.id,
          pupilId: session.pupilId,
          content: content.trim(),
          status
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to save');
        return;
      }

      setExistingSubmission(data.submission);
      setSuccess(status === 'submitted' ? 'Submitted successfully!' : 'Saved as draft');
      
      if (status === 'submitted') {
        setTimeout(() => router.push('/pupil/dashboard'), 1500);
      }
    } catch (err) {
      setError('Failed to save');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-4 text-sm text-[var(--wrife-text-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Link href="/pupil/dashboard" className="text-purple-600 hover:underline">
              ← Back to dashboard
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (!assignment) return null;

  const activity = assignment.progressive_activities;
  const isSubmitted = existingSubmission?.status === 'submitted' || existingSubmission?.status === 'reviewed';

  return (
    <div className="min-h-screen bg-[var(--wrife-bg)]">
      <Navbar />
      
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-6">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/pupil/dashboard" className="text-purple-200 hover:text-white text-sm mb-2 inline-block">
            ← Back to dashboard
          </Link>
          <div className="flex items-center gap-4">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold">
              L{activity.level}
            </span>
            <div>
              <h1 className="text-2xl font-bold">{activity.level_name}</h1>
              <p className="text-purple-200 text-sm">{activity.grammar_focus}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6 mb-6">
              <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-3">Instructions</h2>
              <p className="text-[var(--wrife-text-muted)] mb-4">{activity.instructions}</p>
              
              {assignment.instructions && (
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-sm font-semibold text-purple-700 mb-1">Teacher's Note:</p>
                  <p className="text-sm text-purple-600">{assignment.instructions}</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
              <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-3">
                Your Writing
                {isSubmitted && (
                  <span className="ml-2 text-sm font-normal px-3 py-1 rounded-full bg-green-100 text-green-700">
                    Submitted
                  </span>
                )}
              </h2>
              
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSubmitted}
                className={`w-full h-64 px-4 py-3 rounded-lg border text-base focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                  isSubmitted 
                    ? 'bg-gray-50 border-gray-200 text-gray-600' 
                    : 'border-[var(--wrife-border)]'
                }`}
                placeholder="Write your sentences here..."
              />

              {!isSubmitted && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleSave('draft')}
                    disabled={submitting}
                    className="flex-1 rounded-full border border-purple-300 px-6 py-3 text-sm font-semibold text-purple-600 hover:bg-purple-50 transition disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Draft'}
                  </button>
                  <button
                    onClick={() => handleSave('submitted')}
                    disabled={submitting || !content.trim()}
                    className="flex-1 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
              <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-3">Sentence Structure</h3>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <code className="text-sm text-purple-700 font-mono">{activity.sentence_structure}</code>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
              <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-3">Examples</h3>
              <ul className="space-y-2">
                {(activity.examples || []).slice(0, 5).map((example, index) => (
                  <li key={index} className="text-sm text-[var(--wrife-text-muted)] flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">•</span>
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
              <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-3">Practice Prompts</h3>
              <ul className="space-y-2">
                {(activity.practice_prompts || []).slice(0, 5).map((prompt, index) => (
                  <li key={index} className="text-sm text-[var(--wrife-text-muted)] flex items-start gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-purple-600 text-xs font-bold shrink-0">
                      {index + 1}
                    </span>
                    <span className="font-mono bg-gray-50 px-2 py-1 rounded">{prompt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
