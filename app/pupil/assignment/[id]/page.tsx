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
      
      if (data.submission) {
        setSubmission(data.submission);
        setContent(data.submission.content || '');
      }
      
      if (data.assessment) {
        setAssessment(data.assessment);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Could not load assignment');
    } finally {
      setLoading(false);
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

          <div>
            {lessonFiles.length > 0 && (
              <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-5">
                <h3 className="font-semibold text-[var(--wrife-text-main)] mb-4">
                  Lesson Materials
                </h3>
                <div className="space-y-2">
                  {lessonFiles.map((file) => (
                    <a
                      key={file.id}
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-[var(--wrife-border)] hover:bg-gray-50 transition"
                    >
                      <span className="text-lg">
                        {file.file_type === 'worksheet_support' ? '📝' :
                         file.file_type === 'presentation' ? '📊' :
                         file.file_type === 'interactive_practice' ? '🎮' : '📄'}
                      </span>
                      <span className="text-sm font-medium text-[var(--wrife-text-main)] truncate">
                        {file.file_name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
