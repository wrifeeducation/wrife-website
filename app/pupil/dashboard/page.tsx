"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import OwlMascot from '@/components/mascots/OwlMascot';
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
  created_at: string;
  lesson_id: number;
}

interface Submission {
  id: number;
  assignment_id: number;
  status: string;
  submitted_at: string | null;
}

interface ProgressRecord {
  id: number;
  lesson_id: number;
  status: string;
  completed_at: string | null;
}

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= count ? 'text-[var(--wrife-yellow)]' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function PupilDashboardPage() {
  const [session, setSession] = useState<PupilSession | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);
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
      fetchAssignments(parsed.classId, parsed.pupilId);
    } catch (err) {
      console.error('Invalid session:', err);
      localStorage.removeItem('pupilSession');
      router.push('/pupil/login');
    }
  }, [router]);

  async function fetchAssignments(classId: string, pupilId: string) {
    try {
      const response = await fetch('/api/pupil/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId, pupilId })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Failed to fetch assignments:', data.error);
        return;
      }

      setAssignments(data.assignments || []);
      setSubmissions(data.submissions || []);
      setProgressRecords(data.progressRecords || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('pupilSession');
    router.push('/pupil/login');
  }

  function getSubmissionStatus(assignmentId: number): string {
    const submission = submissions.find(s => s.assignment_id === assignmentId);
    if (!submission) return 'not_started';
    return submission.status;
  }

  function isPracticeComplete(lessonId: number): boolean {
    return progressRecords.some(p => p.lesson_id === lessonId && p.status === 'completed');
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'submitted':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--wrife-green-soft)] text-[var(--wrife-green)]">
            Submitted
          </span>
        );
      case 'draft':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--wrife-yellow-soft)] text-[var(--wrife-yellow)]">
            In Progress
          </span>
        );
      case 'reviewed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--wrife-blue-soft)] text-[var(--wrife-blue)]">
            Reviewed
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
            Not Started
          </span>
        );
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

  if (!session) {
    return null;
  }

  const completedCount = submissions.filter(s => s.status === 'submitted' || s.status === 'reviewed').length;
  const inProgressCount = submissions.filter(s => s.status === 'draft').length;
  const totalProgress = assignments.length > 0 ? Math.round((completedCount / assignments.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[var(--wrife-bg)]">
      <Navbar />
      
      <div className="bg-[var(--wrife-blue)] text-white py-6">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <OwlMascot size="lg" className="drop-shadow-lg" />
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                Hello, {session.pupilName}!
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                {session.className} • Year {session.yearGroup}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-full text-sm font-semibold bg-white/20 hover:bg-white/30 transition"
          >
            Log out
          </button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div
            className="rounded-2xl p-5"
            style={{
              backgroundColor: 'var(--wrife-yellow-soft)',
              border: '1px solid var(--wrife-yellow)',
            }}
          >
            <h3 className="font-bold text-[var(--wrife-text-main)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              Overview
            </h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--wrife-text-muted)]">Progress</span>
              <span className="font-bold text-[var(--wrife-text-main)]">{totalProgress}%</span>
            </div>
            <div className="w-full bg-white rounded-full h-3 mb-3">
              <div
                className="bg-[var(--wrife-yellow)] h-3 rounded-full transition-all"
                style={{ width: `${totalProgress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-[var(--wrife-text-muted)]">
              <span>{completedCount} completed</span>
              <span>{assignments.length - completedCount} remaining</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-5 text-center">
            <p className="text-4xl font-bold text-[var(--wrife-blue)]">{assignments.length}</p>
            <p className="text-sm text-[var(--wrife-text-muted)] mt-1">Total Assignments</p>
          </div>

          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--wrife-orange-soft)] flex items-center justify-center">
                <span className="text-xl">⏱️</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--wrife-text-main)]">7-min Writing</p>
                <p className="text-xs text-[var(--wrife-text-muted)]">Quick practice</p>
              </div>
            </div>
            <Link href="/">
              <button className="w-full py-2.5 rounded-full font-bold text-white bg-[var(--wrife-orange)] hover:opacity-90 transition text-sm">
                Start Writing
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-5">
              <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Your Assignments
              </h2>

              {assignments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--wrife-bg)] mb-4">
                    <span className="text-3xl">📚</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--wrife-text-main)] mb-2">
                    No assignments yet
                  </h3>
                  <p className="text-sm text-[var(--wrife-text-muted)]">
                    Your teacher will assign lessons soon!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.map((assignment) => {
                    const status = getSubmissionStatus(assignment.id);
                    const practiceComplete = isPracticeComplete(assignment.lesson_id);
                    return (
                      <Link 
                        key={assignment.id} 
                        href={`/pupil/assignment/${assignment.id}`}
                      >
                        <div className="p-4 rounded-xl bg-[var(--wrife-bg)] border border-[var(--wrife-border)] hover:shadow-soft transition cursor-pointer">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-[var(--wrife-text-main)]">
                              {assignment.title}
                            </h3>
                            {getStatusBadge(status)}
                          </div>
                          {assignment.instructions && (
                            <p className="text-sm text-[var(--wrife-text-muted)] mb-2 line-clamp-1">
                              {assignment.instructions}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-[var(--wrife-text-muted)]">
                            <div className="flex items-center gap-3">
                              <span>
                                {assignment.due_date
                                  ? `Due: ${new Date(assignment.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                                  : 'No due date'}
                              </span>
                              {practiceComplete && (
                                <span className="flex items-center gap-1 text-green-600">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Practice done
                                </span>
                              )}
                            </div>
                            {status === 'reviewed' && <StarRating count={4} />}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div
            className="rounded-2xl p-5"
            style={{
              backgroundColor: 'var(--wrife-green-soft)',
              border: '1px solid var(--wrife-green)',
            }}
          >
            <h3 className="font-bold text-[var(--wrife-text-main)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Lessons
            </h3>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3 border border-[var(--wrife-border)]">
                <p className="font-semibold text-sm text-[var(--wrife-text-main)]">Sentences</p>
                <p className="text-xs text-[var(--wrife-text-muted)]">Build better sentences</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-[var(--wrife-border)]">
                <p className="font-semibold text-sm text-[var(--wrife-text-main)]">Paragraphs</p>
                <p className="text-xs text-[var(--wrife-text-muted)]">Organise your writing</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-[var(--wrife-border)]">
                <p className="font-semibold text-sm text-[var(--wrife-text-main)]">Stories</p>
                <p className="text-xs text-[var(--wrife-text-muted)]">Create amazing stories</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
