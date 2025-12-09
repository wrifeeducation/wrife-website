"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface PupilSession {
  memberId: number;
  pupilName: string;
  classId: number;
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

export default function PupilDashboardPage() {
  const [session, setSession] = useState<PupilSession | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
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
      fetchAssignments(parsed.classId, parsed.memberId);
    } catch (err) {
      console.error('Invalid session:', err);
      localStorage.removeItem('pupilSession');
      router.push('/pupil/login');
    }
  }, [router]);

  async function fetchAssignments(classId: number, memberId: number) {
    try {
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;
      setAssignments(assignmentsData || []);

      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select('*')
        .eq('pupil_id', memberId);

      if (submissionsError) throw submissionsError;
      setSubmissions(submissionsData || []);
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

  function getStatusBadge(status: string) {
    switch (status) {
      case 'submitted':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            Submitted
          </span>
        );
      case 'draft':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
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

  return (
    <div className="min-h-screen bg-[var(--wrife-bg)]">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-6">
        <header className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--wrife-text-main)]">
              Hello, {session.pupilName}! 👋
            </h1>
            <p className="text-sm text-[var(--wrife-text-muted)] mt-1">
              {session.className} • Year {session.yearGroup}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-full text-sm font-semibold border border-[var(--wrife-border)] text-[var(--wrife-text-muted)] hover:bg-gray-50 transition"
          >
            Log out
          </button>
        </header>

        <section className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-4 text-center">
            <p className="text-3xl font-bold text-[var(--wrife-blue)]">{assignments.length}</p>
            <p className="text-xs text-[var(--wrife-text-muted)] mt-1">Assignments</p>
          </div>
          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{completedCount}</p>
            <p className="text-xs text-[var(--wrife-text-muted)] mt-1">Completed</p>
          </div>
          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">{inProgressCount}</p>
            <p className="text-xs text-[var(--wrife-text-muted)] mt-1">In Progress</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-4">
            Your Assignments
          </h2>

          {assignments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--wrife-bg)] mb-4">
                <span className="text-3xl">📚</span>
              </div>
              <h3 className="text-lg font-semibold text-[var(--wrife-text-main)] mb-2">
                No assignments yet
              </h3>
              <p className="text-sm text-[var(--wrife-text-muted)]">
                Your teacher will assign lessons soon. Check back later!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => {
                const status = getSubmissionStatus(assignment.id);
                return (
                  <Link 
                    key={assignment.id} 
                    href={`/pupil/assignment/${assignment.id}`}
                  >
                    <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-5 hover:shadow-strong transition cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-[var(--wrife-text-main)]">
                          {assignment.title}
                        </h3>
                        {getStatusBadge(status)}
                      </div>
                      {assignment.instructions && (
                        <p className="text-sm text-[var(--wrife-text-muted)] mb-3 line-clamp-2">
                          {assignment.instructions}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-[var(--wrife-text-muted)]">
                        {assignment.due_date && (
                          <span>
                            Due: {new Date(assignment.due_date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </span>
                        )}
                        <span>
                          Assigned: {new Date(assignment.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
