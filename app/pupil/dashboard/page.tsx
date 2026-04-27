"use client";

import { useEffect, useState, useRef } from 'react';
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
  teacher_feedback: string | null;
}

interface ProgressRecord {
  id: number;
  lesson_id: number;
  status: string;
  completed_at: string | null;
}

interface PWPActivity {
  id: number;
  level: number;
  level_name: string;
  grammar_focus: string;
}

interface PWPAssignment {
  id: number;
  activity_id: number;
  instructions: string | null;
  due_date: string | null;
  created_at: string;
  progressive_activities: PWPActivity;
}

interface PWPSubmission {
  id: number;
  pwp_assignment_id: number;
  status: string;
  submitted_at: string | null;
}

interface WritingLevel {
  level_number: number;
  tier_number: number;
  activity_name: string;
  prompt_title: string;
  prompt_instructions: string;
  learning_objective: string;
}

interface DWPAssignment {
  id: number;
  level_id: string;
  instructions: string | null;
  due_date: string | null;
  created_at: string;
  writing_levels: WritingLevel;
}

interface WritingAttempt {
  id: string;
  dwp_assignment_id: number;
  status: string;
  passed: boolean | null;
  percentage: number | null;
  performance_band: string | null;
}

interface PupilStats {
  streak: { current: number; longest: number; totalLogins: number };
  badges: Array<{ badgeType: string; badgeName: string; badgeDescription: string; earnedAt: string }>;
  writingStats: { totalSentences: number; masteryCount: number; averageScore: number };
  activityStats: { totalCompleted: number; masteryRate: number };
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

function getBadgeIcon(badgeType: string) {
  switch (badgeType) {
    case 'streak':
      return { emoji: '🔥', bg: 'bg-orange-100', border: 'border-orange-300' };
    case 'writing':
      return { emoji: '✍️', bg: 'bg-blue-100', border: 'border-blue-300' };
    case 'mastery':
      return { emoji: '⭐', bg: 'bg-yellow-100', border: 'border-yellow-300' };
    case 'vocabulary':
      return { emoji: '📚', bg: 'bg-green-100', border: 'border-green-300' };
    case 'completion':
      return { emoji: '🏆', bg: 'bg-purple-100', border: 'border-purple-300' };
    case 'consistency':
      return { emoji: '💪', bg: 'bg-pink-100', border: 'border-pink-300' };
    default:
      return { emoji: '🎖️', bg: 'bg-gray-100', border: 'border-gray-300' };
  }
}

export default function PupilDashboardPage() {
  const [session, setSession] = useState<PupilSession | null>(null);
  const sessionRef = useRef<PupilSession | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [pwpAssignments, setPwpAssignments] = useState<PWPAssignment[]>([]);
  const [pwpSubmissions, setPwpSubmissions] = useState<PWPSubmission[]>([]);
  const [dwpAssignments, setDwpAssignments] = useState<DWPAssignment[]>([]);
  const [writingAttempts, setWritingAttempts] = useState<WritingAttempt[]>([]);
  const [stats, setStats] = useState<PupilStats | null>(null);
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
      sessionRef.current = parsed;
      fetchAssignments(parsed.classId, parsed.pupilId);
      fetch(`/api/pupil/stats?pupilId=${parsed.pupilId}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data) setStats(data); })
        .catch(() => {});
    } catch (err) {
      console.error('Invalid session:', err);
      localStorage.removeItem('pupilSession');
      router.push('/pupil/login');
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible' && sessionRef.current) {
        const s = sessionRef.current;
        fetchAssignments(s.classId, s.pupilId);
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
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
      setPwpAssignments(data.pwpAssignments || []);
      setPwpSubmissions(data.pwpSubmissions || []);
      setDwpAssignments(data.dwpAssignments || []);
      setWritingAttempts(data.writingAttempts || []);
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

  function isPracticeInProgress(lessonId: number): boolean {
    return progressRecords.some(p => p.lesson_id === lessonId && p.status === 'in_progress');
  }

  function getOverallStatus(assignmentId: number, lessonId: number): string {
    const submission = submissions.find(s => s.assignment_id === assignmentId);
    if (submission) {
      return submission.status;
    }
    if (isPracticeComplete(lessonId)) {
      return 'practice_complete';
    }
    if (isPracticeInProgress(lessonId)) {
      return 'practice_in_progress';
    }
    return 'not_started';
  }

  function getPWPSubmissionStatus(pwpAssignmentId: number): string {
    const submission = pwpSubmissions.find(s => s.pwp_assignment_id === pwpAssignmentId);
    if (!submission) return 'not_started';
    return submission.status;
  }

  function getDWPAttempt(dwpAssignmentId: number): WritingAttempt | undefined {
    return writingAttempts.find(a => a.dwp_assignment_id === dwpAssignmentId);
  }

  function getDWPStatusBadge(attempt: WritingAttempt | undefined) {
    if (!attempt) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
          Not Started
        </span>
      );
    }
    if (attempt.status === 'assessed' && attempt.passed) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          Passed ({attempt.percentage}%)
        </span>
      );
    }
    if (attempt.status === 'assessed' && !attempt.passed) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
          Try Again ({attempt.percentage}%)
        </span>
      );
    }
    if (attempt.status === 'submitted') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
          Submitted
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
        In Progress
      </span>
    );
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
      case 'practice_complete':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
            Practice Done
          </span>
        );
      case 'practice_in_progress':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-600">
            Practice Started
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const activeAssignments = assignments.filter((assignment) => {
    const status = getSubmissionStatus(assignment.id);
    if (status === 'submitted' || status === 'reviewed' || status === 'draft') {
      return true;
    }
    if (!assignment.due_date) {
      return true;
    }
    const dueDate = new Date(assignment.due_date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate >= today;
  });

  const activePwpAssignments = pwpAssignments.filter((pwp) => {
    const status = getPWPSubmissionStatus(pwp.id);
    if (status === 'submitted' || status === 'reviewed' || status === 'draft') {
      return true;
    }
    if (!pwp.due_date) {
      return true;
    }
    const dueDate = new Date(pwp.due_date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate >= today;
  });

  // Separate DWP assignments into attempted and unstarted
  const attemptedDwp = dwpAssignments
    .filter((dwp) => !!getDWPAttempt(dwp.id))
    .sort((a, b) => (a.writing_levels?.level_number ?? 0) - (b.writing_levels?.level_number ?? 0));

  const unstartedDwp = dwpAssignments
    .filter((dwp) => {
      if (getDWPAttempt(dwp.id)) return false;
      if (!dwp.due_date) return true;
      const dueDate = new Date(dwp.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= today;
    })
    .sort((a, b) => (a.writing_levels?.level_number ?? 0) - (b.writing_levels?.level_number ?? 0));

  // Show all attempted + up to 3 next unstarted
  const activeDwpAssignments = [...attemptedDwp, ...unstartedDwp.slice(0, 3)];
  const totalDwpAssigned = dwpAssignments.length;
  const hiddenDwpCount = totalDwpAssigned - activeDwpAssignments.length;

  const streakCurrent = stats?.streak?.current ?? 0;
  const totalSentences = stats?.writingStats?.totalSentences ?? 0;
  const latestBadges = (stats?.badges ?? []).slice(0, 3);
  const allBadges = stats?.badges ?? [];

  return (
    <div className="min-h-screen bg-[var(--wrife-bg)]">
      <Navbar />
      
      <div
        className="text-white py-6"
        style={{
          background: 'linear-gradient(135deg, var(--wrife-blue) 0%, #7c3aed 100%)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <OwlMascot size="lg" className="drop-shadow-lg" />
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                Hello, {session.pupilName}!
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                {session.className} • Year {session.yearGroup}
              </p>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                {streakCurrent > 0 && (
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-white/20 ${streakCurrent >= 7 ? 'animate-pulse shadow-[0_0_12px_rgba(251,191,36,0.6)]' : ''}`}
                  >
                    🔥 {streakCurrent} day streak!
                  </span>
                )}
                {totalSentences > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-white/20">
                    ✏️ {totalSentences} sentences written
                  </span>
                )}
              </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Link href="/pupil/writing-coach" className="block">
            <div
              className="rounded-2xl p-5 text-white h-full flex flex-col justify-between hover:shadow-lg transition cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, var(--wrife-blue) 0%, #7c3aed 100%)',
              }}
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-3">
                  <span className="text-xl">✍️</span>
                </div>
                <h3 className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                  AI Writing Coach
                </h3>
                <p className="text-blue-100 text-sm mt-1">Write sentences with AI feedback</p>
              </div>
              <div className="mt-3">
                {totalSentences > 0 && (
                  <p className="text-xs text-blue-200 mb-2">{totalSentences} sentences written</p>
                )}
                <span className="inline-block w-full text-center py-2.5 rounded-full font-bold text-[var(--wrife-blue)] bg-white hover:bg-blue-50 transition text-sm">
                  Start Writing
                </span>
              </div>
            </div>
          </Link>

          <Link href="/pupil/word-bank" className="block">
            <div
              className="rounded-2xl p-5 text-white h-full flex flex-col justify-between hover:shadow-lg transition cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, var(--wrife-green) 0%, #059669 100%)',
              }}
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-3">
                  <span className="text-xl">📖</span>
                </div>
                <h3 className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                  My Word Bank
                </h3>
                <p className="text-green-100 text-sm mt-1">Build your vocabulary</p>
              </div>
              <div className="mt-3">
                <span className="inline-block w-full text-center py-2.5 rounded-full font-bold text-[var(--wrife-green)] bg-white hover:bg-green-50 transition text-sm">
                  Manage Words
                </span>
              </div>
            </div>
          </Link>

          <div
            className="rounded-2xl p-5"
            style={{
              backgroundColor: 'var(--wrife-yellow-soft)',
              border: '1px solid var(--wrife-yellow)',
            }}
          >
            <h3 className="font-bold text-[var(--wrife-text-main)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              Assignments
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
              <span>{completedCount} done</span>
              <span>{inProgressCount} active</span>
              <span>{assignments.length} total</span>
            </div>
          </div>

          <div
            className="rounded-2xl p-5"
            style={{
              background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)',
              border: '1px solid #fbbf24',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-3xl ${streakCurrent >= 7 ? 'animate-pulse' : ''}`}>🔥</span>
              <div>
                <p className="text-2xl font-bold text-[var(--wrife-text-main)]">{streakCurrent}</p>
                <p className="text-xs text-[var(--wrife-text-muted)]">Day Streak</p>
              </div>
            </div>
            {latestBadges.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-[var(--wrife-text-muted)] mb-1">Recent Badges</p>
                <div className="flex gap-1">
                  {latestBadges.map((badge, i) => {
                    const icon = getBadgeIcon(badge.badgeType);
                    return (
                      <span
                        key={i}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${icon.bg} border ${icon.border} text-sm`}
                        title={badge.badgeName}
                      >
                        {icon.emoji}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            {allBadges.length > 0 && (
              <a href="#achievements" className="text-xs font-semibold text-[var(--wrife-blue)] hover:underline">
                View All →
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-5">
              <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Your Assignments
              </h2>

              {activeAssignments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--wrife-bg)] mb-4">
                    <span className="text-3xl">📚</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--wrife-text-main)] mb-2">
                    No active assignments
                  </h3>
                  <p className="text-sm text-[var(--wrife-text-muted)]">
                    Your teacher will assign lessons soon!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeAssignments.map((assignment) => {
                    const subStatus = getSubmissionStatus(assignment.id);
                    const overallStatus = getOverallStatus(assignment.id, assignment.lesson_id);
                    const submission = submissions.find(s => s.assignment_id === assignment.id);
                    const hasTeacherFeedback = submission?.teacher_feedback;
                    const isReviewed = subStatus === 'reviewed';
                    const isSubmitted = subStatus === 'submitted';
                    const isDraft = subStatus === 'draft';
                    const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date();

                    const ctaConfig = isReviewed
                      ? { label: 'See Feedback', className: 'bg-green-500 hover:bg-green-600 text-white' }
                      : isSubmitted
                      ? { label: 'Awaiting Review', className: 'bg-gray-200 text-gray-500 cursor-default' }
                      : isDraft || overallStatus === 'practice_complete'
                      ? { label: 'Continue', className: 'bg-amber-400 hover:bg-amber-500 text-white' }
                      : { label: 'Start', className: 'bg-[var(--wrife-blue)] hover:opacity-90 text-white' };

                    const cardBorder = isReviewed
                      ? 'border-green-300 bg-green-50'
                      : isSubmitted
                      ? 'border-blue-200 bg-blue-50'
                      : isDraft
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-[var(--wrife-border)] bg-[var(--wrife-bg)]';

                    return (
                      <Link key={assignment.id} href={`/pupil/assignment/${assignment.id}`}>
                        <div className={`p-4 rounded-xl border hover:shadow-soft transition cursor-pointer ${cardBorder}`}>
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="font-bold text-[var(--wrife-text-main)] leading-tight">
                                  {assignment.title}
                                </h3>
                                {isReviewed && hasTeacherFeedback && (
                                  <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-white">
                                    New Feedback!
                                  </span>
                                )}
                              </div>
                              {assignment.instructions && (
                                <p className="text-xs text-[var(--wrife-text-muted)] line-clamp-1">{assignment.instructions}</p>
                              )}
                            </div>
                            <span className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition ${ctaConfig.className} ${isSubmitted ? '' : ''}`}>
                              {ctaConfig.label}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs text-[var(--wrife-text-muted)]">
                            <span className={isOverdue && !isSubmitted && !isReviewed ? 'text-red-500 font-semibold' : ''}>
                              {assignment.due_date
                                ? `${isOverdue && !isSubmitted && !isReviewed ? 'Overdue: ' : 'Due: '}${new Date(assignment.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                                : 'No due date'}
                            </span>
                            {isReviewed && <StarRating count={4} />}
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
              backgroundColor: '#f3e8ff',
              border: '1px solid #c084fc',
            }}
          >
            <h3 className="font-bold text-[var(--wrife-text-main)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Sentence Practice
            </h3>
            {activePwpAssignments.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-[var(--wrife-text-muted)]">No practice activities yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activePwpAssignments.map((pwp) => {
                  const status = getPWPSubmissionStatus(pwp.id);
                  return (
                    <Link key={pwp.id} href={`/pupil/pwp/${pwp.id}`}>
                      <div className="bg-white rounded-lg p-3 border border-[var(--wrife-border)] hover:shadow-soft transition cursor-pointer">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-600 text-xs font-bold">
                              L{pwp.progressive_activities.level}
                            </span>
                            <p className="font-semibold text-sm text-[var(--wrife-text-main)]">
                              {pwp.progressive_activities.level_name}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-[var(--wrife-text-muted)] mb-2">
                          {pwp.progressive_activities.grammar_focus}
                        </p>
                        <div className="flex items-center justify-between">
                          {status === 'submitted' || status === 'reviewed' ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                              Done
                            </span>
                          ) : status === 'draft' ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                              In Progress
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                              Start
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {allBadges.length > 0 && (
          <div id="achievements" className="mt-6 bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
            <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              🏆 Your Achievements
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allBadges.map((badge, i) => {
                const icon = getBadgeIcon(badge.badgeType);
                return (
                  <div
                    key={i}
                    className={`rounded-xl p-4 border ${icon.border} ${icon.bg} flex items-start gap-3`}
                  >
                    <span className="text-2xl flex-shrink-0">{icon.emoji}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[var(--wrife-text-main)]">{badge.badgeName}</p>
                      <p className="text-xs text-[var(--wrife-text-muted)] mt-0.5">{badge.badgeDescription}</p>
                      <p className="text-xs text-[var(--wrife-text-muted)] mt-1">
                        {new Date(badge.earnedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeDwpAssignments.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200">
            <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Daily Writing Practice
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeDwpAssignments.map((dwp) => {
                const attempt = getDWPAttempt(dwp.id);
                return (
                  <Link key={dwp.id} href={`/pupil/dwp/${dwp.id}`}>
                    <div className="bg-white rounded-xl p-4 border border-purple-200 hover:border-purple-400 hover:shadow-md transition cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 text-sm font-bold">
                            {dwp.writing_levels?.level_number || '?'}
                          </span>
                          <div>
                            <p className="font-semibold text-sm text-[var(--wrife-text-main)]">
                              {dwp.writing_levels?.activity_name || 'Writing Level'}
                            </p>
                            <p className="text-xs text-[var(--wrife-text-muted)]">
                              Tier {dwp.writing_levels?.tier_number || '?'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--wrife-text-muted)] mb-3 line-clamp-2">
                        {dwp.writing_levels?.learning_objective || 'Complete this writing activity'}
                      </p>
                      <div className="flex items-center justify-between">
                        {getDWPStatusBadge(attempt)}
                        {dwp.due_date && (
                          <span className="text-xs text-[var(--wrife-text-muted)]">
                            Due: {new Date(dwp.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            {hiddenDwpCount > 0 && (
              <p className="mt-4 text-center text-sm text-[var(--wrife-text-muted)]">
                +{hiddenDwpCount} more task{hiddenDwpCount !== 1 ? 's' : ''} — complete these first to unlock them!
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
