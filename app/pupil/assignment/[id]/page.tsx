"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

interface Assignment {
  id: number;
  title: string;
  instructions: string | null;
  due_date: string | null;
  lesson_id: number;
}

interface Submission {
  id: number;
  content: string;
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
}

interface LessonFile {
  id: number;
  file_type: string;
  file_name: string;
  file_url: string;
}

export default function PupilAssignmentPage() {
  const params = useParams();
  const assignmentId = params?.id as string;
  const [session, setSession] = useState<PupilSession | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [assessment, setAssessment] = useState<AIAssessment | null>(null);
  const [lessonFiles, setLessonFiles] = useState<LessonFile[]>([]);
  const [interactiveHtml, setInteractiveHtml] = useState<string | null>(null);
  const [showActivity, setShowActivity] = useState(false);
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      fetchData(parsed.pupilId);
    } catch (err) {
      console.error('Invalid session:', err);
      localStorage.removeItem('pupilSession');
      router.push('/pupil/login');
    }
  }, [router, assignmentId]);

  async function fetchData(pupilId: string) {
    try {
      const response = await fetch('/api/pupil/assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId, pupilId })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Could not load assignment');
        setLoading(false);
        return;
      }

      setAssignment(data.assignment);
      setLessonFiles(data.lessonFiles || []);
      setInteractiveHtml(data.interactiveHtml || null);
      
      if (data.submission) {
        setSubmission(data.submission);
        setContent(data.submission.content || '');
      }
      
      if (data.assessment) {
        setAssessment(data.assessment);
      }

      if (data.assignment?.lesson_id) {
        const progressRes = await fetch(`/api/pupil/practice-complete?pupilId=${pupilId}&lessonId=${data.assignment.lesson_id}`);
        if (progressRes.ok) {
          const progressData = await progressRes.json();
          setPracticeCompleted(progressData.progress?.status === 'completed');
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Could not load assignment');
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkPracticeComplete() {
    if (!session || !assignment) return;
    setMarkingComplete(true);

    try {
      const response = await fetch('/api/pupil/practice-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pupilId: session.pupilId,
          lessonId: assignment.lesson_id,
          classId: session.classId,
        })
      });

      if (!response.ok) {
        throw new Error('Failed to mark complete');
      }

      setPracticeCompleted(true);
      setShowActivity(false);
      setSuccess('Great job! Practice activity marked as complete!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error marking complete:', err);
      setError('Could not save your progress');
    } finally {
      setMarkingComplete(false);
    }
  }

  async function handleSaveDraft() {
    if (!session || !assignment) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/pupil/assignment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: assignment.id,
          pupilId: session.pupilId,
          content,
          status: 'draft'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setSubmission(data.submission);
      setSuccess('Draft saved!');
    } catch (err) {
      console.error('Error saving:', err);
      setError('Could not save your work');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    if (!session || !assignment) return;
    if (!content.trim()) {
      setError('Please write something before submitting');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/pupil/assignment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: assignment.id,
          pupilId: session.pupilId,
          content,
          status: 'submitted'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setSubmission(data.submission);
      setSuccess('Your work has been submitted! Your teacher will review it soon.');
    } catch (err) {
      console.error('Error submitting:', err);
      setError('Could not submit your work');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent"></div>
          <p className="mt-4 text-sm text-[var(--wrife-text-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || !assignment) {
    return (
      <div className="min-h-screen bg-[var(--wrife-bg)]">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-6">
          <Link 
            href="/pupil/dashboard"
            className="inline-flex items-center text-sm text-[var(--wrife-blue)] hover:underline mb-4"
          >
            ← Back to Dashboard
          </Link>
          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </main>
      </div>
    );
  }

  const isSubmitted = submission?.status === 'submitted' || submission?.status === 'reviewed';

  return (
    <div className="min-h-screen bg-[var(--wrife-bg)]">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Link 
          href="/pupil/dashboard"
          className="inline-flex items-center text-sm text-[var(--wrife-blue)] hover:underline mb-4"
        >
          ← Back to Dashboard
        </Link>

        <header className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--wrife-text-main)]">
            {assignment.title}
          </h1>
          {assignment.due_date && (
            <p className="text-sm text-[var(--wrife-text-muted)] mt-1">
              Due: {new Date(assignment.due_date).toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </p>
          )}
        </header>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
              {assignment.instructions && (
                <div className="mb-6 p-4 rounded-lg bg-[var(--wrife-bg)] border border-[var(--wrife-border)]">
                  <h3 className="text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
                    Instructions from your teacher
                  </h3>
                  <p className="text-sm text-[var(--wrife-text-muted)]">
                    {assignment.instructions}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
                  Your Writing
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isSubmitted}
                  placeholder="Start writing here..."
                  className="w-full h-64 p-4 rounded-lg border border-[var(--wrife-border)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] resize-none disabled:bg-gray-50 disabled:text-gray-500"
                />
                <p className="text-xs text-[var(--wrife-text-muted)] mt-2">
                  {content.split(/\s+/).filter(w => w).length} words
                </p>
              </div>

              {!isSubmitted && (
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveDraft}
                    disabled={saving}
                    className="flex-1 py-3 rounded-full font-bold border border-[var(--wrife-border)] text-[var(--wrife-text-muted)] hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Draft'}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !content.trim()}
                    className="flex-1 py-3 rounded-full font-bold text-white bg-[var(--wrife-blue)] hover:opacity-90 transition disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              )}

              {isSubmitted && (
                <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-center">
                  <p className="text-sm font-semibold text-green-700">
                    ✓ Submitted on {new Date(submission.submitted_at!).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}

              {assessment && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[var(--wrife-text-main)]">Your Feedback</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      assessment.banding_score >= 3 ? 'bg-green-100 text-green-700' :
                      assessment.banding_score === 2 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {assessment.banding_score === 4 ? 'Greater Depth' :
                       assessment.banding_score === 3 ? 'Secure' :
                       assessment.banding_score === 2 ? 'Developing' : 'Emerging'}
                    </span>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                      <span>⭐</span> What you did well
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {assessment.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-green-700">{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-yellow-700 mb-2 flex items-center gap-2">
                      <span>💡</span> Things to work on
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
                      <span>✨</span> Example of how to improve
                    </h4>
                    <p className="text-sm text-blue-700 italic">
                      "{assessment.improved_example}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {interactiveHtml && (
            <div className="lg:col-span-1">
              <button
                onClick={() => setShowActivity(true)}
                className={`w-full rounded-2xl shadow-soft border p-5 hover:shadow-md transition cursor-pointer text-left ${
                  practiceCompleted 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white border-[var(--wrife-border)]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    practiceCompleted ? 'bg-green-100' : 'bg-[var(--wrife-green-soft)]'
                  }`}>
                    <span className="text-3xl">{practiceCompleted ? '✓' : '🎮'}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[var(--wrife-text-main)]">
                      Practice Activity
                    </h3>
                    <p className={`text-sm mt-1 ${
                      practiceCompleted ? 'text-green-600' : 'text-[var(--wrife-text-muted)]'
                    }`}>
                      {practiceCompleted ? 'Completed! Click to review' : 'Click to open the interactive lesson'}
                    </p>
                  </div>
                  <div className={practiceCompleted ? 'text-green-600' : 'text-[var(--wrife-blue)]'}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      </main>

      {showActivity && interactiveHtml && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[var(--wrife-border)] bg-[var(--wrife-bg)]">
              <h2 className="text-lg font-bold text-[var(--wrife-text-main)] flex items-center gap-2">
                <span>🎮</span> Practice Activity
              </h2>
              <button
                onClick={() => setShowActivity(false)}
                className="w-10 h-10 rounded-full bg-white border border-[var(--wrife-border)] flex items-center justify-center hover:bg-gray-50 transition"
              >
                <svg className="w-5 h-5 text-[var(--wrife-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={`/api/fetch-html?url=${encodeURIComponent(interactiveHtml)}`}
                className="w-full h-full border-0"
                title="Practice Activity"
                allow="autoplay"
              />
            </div>
            <div className="p-4 border-t border-[var(--wrife-border)] bg-[var(--wrife-bg)] flex items-center justify-between">
              <p className="text-sm text-[var(--wrife-text-muted)]">
                {practiceCompleted 
                  ? 'You have completed this activity!' 
                  : 'When you finish, click the button to mark as complete'}
              </p>
              {practiceCompleted ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Completed
                </div>
              ) : (
                <button
                  onClick={handleMarkPracticeComplete}
                  disabled={markingComplete}
                  className="px-6 py-2 rounded-full bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition disabled:opacity-50"
                >
                  {markingComplete ? 'Saving...' : "I've Finished!"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
