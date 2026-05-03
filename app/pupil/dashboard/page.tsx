"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { buildSSOUrl } from '@/lib/pupil-sso';

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

function getBadgeIcon(badgeType: string) {
  switch (badgeType) {
    case 'streak':      return { emoji: '🔥', bg: 'bg-orange-100', border: 'border-orange-300' };
    case 'writing':     return { emoji: '✍️', bg: 'bg-blue-100',   border: 'border-blue-300' };
    case 'mastery':     return { emoji: '⭐', bg: 'bg-yellow-100', border: 'border-yellow-300' };
    case 'vocabulary':  return { emoji: '📚', bg: 'bg-green-100',  border: 'border-green-300' };
    case 'completion':  return { emoji: '🏆', bg: 'bg-purple-100', border: 'border-purple-300' };
    case 'consistency': return { emoji: '💪', bg: 'bg-pink-100',   border: 'border-pink-300' };
    default:            return { emoji: '🎖️', bg: 'bg-gray-100',  border: 'border-gray-300' };
  }
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
        ✓ Passed ({attempt.percentage}%)
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

export default function PupilDashboardPage() {
  const [session, setSession] = useState<PupilSession | null>(null);
  const sessionRef = useRef<PupilSession | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [dwpAssignments, setDwpAssignments] = useState<DWPAssignment[]>([]);
  const [writingAttempts, setWritingAttempts] = useState<WritingAttempt[]>([]);
  const [stats, setStats] = useState<PupilStats | null>(null);
  const [loading, setLoading] = useState(true);
  // SSO URLs — computed on mount using the Supabase session
  const [practiceUrl, setPracticeUrl] = useState('https://practice.wrife.co.uk');
  const [studioUrl, setStudioUrl] = useState('https://pwp-studio.wrife.co.uk/dashboard');
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

      // Build SSO URLs in the background — falls back to plain URL if no session
      buildSSOUrl('https://practice.wrife.co.uk').then(setPracticeUrl).catch(() => {});
      buildSSOUrl('https://pwp-studio.wrife.co.uk/dashboard').then(setStudioUrl).catch(() => {});

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
    if (submission) return submission.status;
    if (isPracticeComplete(lessonId)) return 'practice_complete';
    if (isPracticeInProgress(lessonId)) return 'practice_in_progress';
    return 'not_started';
  }

  function getDWPAttempt(dwpAssignmentId: number): WritingAttempt | undefined {
    return writingAttempts.find(a => a.dwp_assignment_id === dwpAssignmentId);
  }

  function getAssignmentCTA(assignmentId: number, lessonId: number) {
    const subStatus = getSubmissionStatus(assignmentId);
    const overallStatus = getOverallStatus(assignmentId, lessonId);
    if (subStatus === 'reviewed')
      return { label: 'See Feedback', className: 'bg-green-500 hover:bg-green-600 text-white' };
    if (subStatus === 'submitted')
      return { label: 'Awaiting Review', className: 'bg-gray-200 text-gray-500 cursor-default pointer-events-none' };
    if (subStatus === 'draft' || overallStatus === 'practice_complete')
      return { label: 'Continue', className: 'bg-amber-400 hover:bg-amber-500 text-white' };
    return { label: 'Start', className: 'bg-[var(--wrife-blue)] hover:opacity-90 text-white' };
  }

  function getAssignmentCardBorder(assignmentId: number) {
    const subStatus = getSubmissionStatus(assignmentId);
    if (subStatus === 'reviewed')  return 'border-green-300 bg-green-50';
    if (subStatus === 'submitted') return 'border-blue-200 bg-blue-50';
    if (subStatus === 'draft')     return 'border-amber-200 bg-amber-50';
    return 'border-[var(--wrife-border)] bg-white';
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

  if (!session) return null;

  /* ── Derived data ─────────────────────────────────────────── */

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeAssignments = assignments.filter((a) => {
    const status = getSubmissionStatus(a.id);
    if (['submitted', 'reviewed', 'draft'].includes(status)) return true;
    if (!a.due_date) return true;
    const due = new Date(a.due_date);
    due.setHours(0, 0, 0, 0);
    return due >= today;
  });

  const pendingAssignments = activeAssignments.filter(
    (a) => !['submitted', 'reviewed'].includes(getSubmissionStatus(a.id))
  );

  const completedAssignments = activeAssignments.filter(
    (a) => ['submitted', 'reviewed'].includes(getSubmissionStatus(a.id))
  );

  // DWP: separate into attempted and unstarted
  const attemptedDwp = dwpAssignments
    .filter((d) => !!getDWPAttempt(d.id))
    .sort((a, b) => (a.writing_levels?.level_number ?? 0) - (b.writing_levels?.level_number ?? 0));

  const unstartedDwp = dwpAssignments
    .filter((d) => {
      if (getDWPAttempt(d.id)) return false;
      if (!d.due_date) return true;
      const due = new Date(d.due_date);
      due.setHours(0, 0, 0, 0);
      return due >= today;
    })
    .sort((a, b) => (a.writing_levels?.level_number ?? 0) - (b.writing_levels?.level_number ?? 0));

  const activeDwpAssignments = [...attemptedDwp, ...unstartedDwp.slice(0, 3)];
  const hiddenDwpCount = dwpAssignments.length - activeDwpAssignments.length;
  const nextDwp = unstartedDwp[0];

  const streakCurrent = stats?.streak?.current ?? 0;
  const totalSentences = stats?.writingStats?.totalSentences ?? 0;
  const allBadges = stats?.badges ?? [];
  const latestBadges = allBadges.slice(0, 3);

  const hasPendingWork = pendingAssignments.length > 0 || unstartedDwp.length > 0;

  return (
    <div className="min-h-screen bg-[var(--wrife-bg)]">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div
        className="text-white py-6"
        style={{ background: 'linear-gradient(135deg, var(--wrife-blue) 0%, #7c3aed 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                Hello, {session.pupilName}!
              </h1>
              <p className="text-blue-100 text-sm mt-0.5">
                {session.className} · Year {session.yearGroup}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full text-sm font-semibold bg-white/20 hover:bg-white/30 transition"
            >
              Log out
            </button>
          </div>

          {/* Cross-app progress strip */}
          <div className="flex items-center gap-4 flex-wrap text-sm">
            {streakCurrent > 0 && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold bg-white/20 ${
                  streakCurrent >= 7 ? 'animate-pulse shadow-[0_0_12px_rgba(251,191,36,0.6)]' : ''
                }`}
              >
                🔥 {streakCurrent} day streak!
              </span>
            )}
            {totalSentences > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold bg-white/20">
                ✏️ {totalSentences} sentences written
              </span>
            )}
            {pendingAssignments.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold bg-white/20">
                📝 {pendingAssignments.length} task{pendingAssignments.length !== 1 ? 's' : ''} to do
              </span>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* ── App entry cards ───────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Interactive Practice — uses SSO URL so pupil is auto-authenticated */}
          <a
            href={practiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div
              className="rounded-2xl p-4 text-white h-full flex flex-col justify-between hover:shadow-lg transition cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #6C5CE7 0%, #4834d4 100%)' }}
            >
              <div>
                <span className="text-2xl block mb-2">🎮</span>
                <p className="font-bold text-sm leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  Interactive Practice
                </p>
                <p className="text-purple-200 text-xs mt-1">61 lessons · earn XP</p>
              </div>
              <span className="mt-3 inline-block w-full text-center py-1.5 rounded-full font-bold text-purple-700 bg-white hover:bg-purple-50 transition text-xs">
                Play →
              </span>
            </div>
          </a>

          {/* PWP Studio — uses SSO URL so pupil is auto-authenticated */}
          <a
            href={studioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div
              className="rounded-2xl p-4 text-white h-full flex flex-col justify-between hover:shadow-lg transition cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #F5A623 0%, #e67e22 100%)' }}
            >
              <div>
                <span className="text-2xl block mb-2">✏️</span>
                <p className="font-bold text-sm leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  PWP Studio
                </p>
                <p className="text-orange-100 text-xs mt-1">67 levels · build sentences</p>
              </div>
              <span className="mt-3 inline-block w-full text-center py-1.5 rounded-full font-bold text-orange-700 bg-white hover:bg-orange-50 transition text-xs">
                Write →
              </span>
            </div>
          </a>

          {/* Assignments summary */}
          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: 'var(--wrife-yellow-soft)', border: '1px solid var(--wrife-yellow)' }}
          >
            <span className="text-2xl block mb-2">📝</span>
            <p className="font-bold text-sm text-[var(--wrife-text-main)]" style={{ fontFamily: 'var(--font-display)' }}>
              Assignments
            </p>
            <p className="text-xs text-[var(--wrife-text-muted)] mt-1">
              {pendingAssignments.length > 0
                ? `${pendingAssignments.length} to do`
                : completedAssignments.length > 0
                ? `${completedAssignments.length} done`
                : 'None yet'}
            </p>
            {activeAssignments.length > 0 && (
              <div className="mt-2 w-full bg-white rounded-full h-2">
                <div
                  className="bg-[var(--wrife-yellow)] h-2 rounded-full transition-all"
                  style={{
                    width: `${activeAssignments.length > 0 ? Math.round((completedAssignments.length / activeAssignments.length) * 100) : 0}%`
                  }}
                />
              </div>
            )}
          </div>

          {/* Streak / badges */}
          <div
            className="rounded-2xl p-4"
            style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)', border: '1px solid #fbbf24' }}
          >
            <span className={`text-2xl block mb-2 ${streakCurrent >= 7 ? 'animate-pulse' : ''}`}>🔥</span>
            <p className="font-bold text-sm text-[var(--wrife-text-main)]" style={{ fontFamily: 'var(--font-display)' }}>
              {streakCurrent > 0 ? `${streakCurrent} Day Streak` : 'Start a Streak!'}
            </p>
            {latestBadges.length > 0 && (
              <div className="flex gap-1 mt-2">
                {latestBadges.map((badge, i) => {
                  const icon = getBadgeIcon(badge.badgeType);
                  return (
                    <span
                      key={i}
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${icon.bg} border ${icon.border} text-xs`}
                      title={badge.badgeName}
                    >
                      {icon.emoji}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Daily Writing Practice (anchor / daily habit) ─── */}
        {activeDwpAssignments.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-5 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--wrife-text-main)]" style={{ fontFamily: 'var(--font-display)' }}>
                Daily Writing Practice
              </h2>
              {nextDwp && (
                <Link href={`/pupil/dwp/${nextDwp.id}`}>
                  <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-purple-600 text-white hover:bg-purple-700 transition">
                    Start Today's Task →
                  </span>
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeDwpAssignments.map((dwp) => {
                const attempt = getDWPAttempt(dwp.id);
                return (
                  <Link key={dwp.id} href={`/pupil/dwp/${dwp.id}`}>
                    <div className="bg-white rounded-xl p-4 border border-purple-200 hover:border-purple-400 hover:shadow-md transition cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
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
              <p className="mt-3 text-center text-sm text-[var(--wrife-text-muted)]">
                +{hiddenDwpCount} more task{hiddenDwpCount !== 1 ? 's' : ''} — complete these first to unlock them!
              </p>
            )}
          </div>
        )}

        {/* ── Writing Assignments ───────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-5">
          <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Your Assignments
          </h2>

          {activeAssignments.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--wrife-bg)] mb-4">
                <span className="text-3xl">📚</span>
              </div>
              <h3 className="text-lg font-semibold text-[var(--wrife-text-main)] mb-2">No active assignments</h3>
              <p className="text-sm text-[var(--wrife-text-muted)]">Your teacher will assign lessons soon!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeAssignments.map((assignment) => {
                const subStatus = getSubmissionStatus(assignment.id);
                const overallStatus = getOverallStatus(assignment.id, assignment.lesson_id);
                const submission = submissions.find(s => s.assignment_id === assignment.id);
                const hasTeacherFeedback = submission?.teacher_feedback;
                const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date()
                  && !['submitted', 'reviewed'].includes(subStatus);
                const cta = getAssignmentCTA(assignment.id, assignment.lesson_id);

                return (
                  <Link key={assignment.id} href={`/pupil/assignment/${assignment.id}`}>
                    <div className={`p-4 rounded-xl border hover:shadow-soft transition cursor-pointer ${getAssignmentCardBorder(assignment.id)}`}>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-bold text-[var(--wrife-text-main)] leading-tight">
                              {assignment.title}
                            </h3>
                            {subStatus === 'reviewed' && hasTeacherFeedback && (
                              <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-white">
                                New Feedback!
                              </span>
                            )}
                          </div>
                          {assignment.instructions && (
                            <p className="text-xs text-[var(--wrife-text-muted)] line-clamp-1">{assignment.instructions}</p>
                          )}
                        </div>
                        <span className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition ${cta.className}`}>
                          {cta.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[var(--wrife-text-muted)]">
                        <span className={isOverdue ? 'text-red-500 font-semibold' : ''}>
                          {assignment.due_date
                            ? `${isOverdue ? 'Overdue: ' : 'Due: '}${new Date(assignment.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                            : 'No due date'}
                        </span>
                        <span className="capitalize text-[var(--wrife-text-muted)]">
                          {overallStatus === 'practice_complete' ? 'Practice done · ready to write' :
                           overallStatus === 'practice_in_progress' ? 'Practice started' :
                           subStatus === 'not_started' ? 'Not started' :
                           subStatus}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Tools row ────────────────────────────────────── */}
        {!hasPendingWork && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/pupil/writing-coach" className="block">
              <div
                className="rounded-2xl p-5 text-white flex items-center gap-4 hover:shadow-lg transition cursor-pointer"
                style={{ background: 'linear-gradient(135deg, var(--wrife-blue) 0%, #7c3aed 100%)' }}
              >
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <span className="text-xl">✍️</span>
                </div>
                <div>
                  <p className="font-bold" style={{ fontFamily: 'var(--font-display)' }}>AI Writing Coach</p>
                  <p className="text-blue-100 text-sm">Write sentences with AI feedback</p>
                </div>
              </div>
            </Link>

            <Link href="/pupil/word-bank" className="block">
              <div
                className="rounded-2xl p-5 text-white flex items-center gap-4 hover:shadow-lg transition cursor-pointer"
                style={{ background: 'linear-gradient(135deg, var(--wrife-green) 0%, #059669 100%)' }}
              >
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <span className="text-xl">📖</span>
                </div>
                <div>
                  <p className="font-bold" style={{ fontFamily: 'var(--font-display)' }}>My Word Bank</p>
                  <p className="text-green-100 text-sm">Build your vocabulary</p>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Always-visible tools when there IS pending work */}
        {hasPendingWork && (
          <div className="flex gap-3 flex-wrap">
            <Link href="/pupil/writing-coach">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white border border-[var(--wrife-border)] hover:shadow-soft transition text-[var(--wrife-text-main)]">
                ✍️ AI Writing Coach
              </span>
            </Link>
            <Link href="/pupil/word-bank">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white border border-[var(--wrife-border)] hover:shadow-soft transition text-[var(--wrife-text-main)]">
                📖 My Word Bank
              </span>
            </Link>
          </div>
        )}

        {/* ── Achievements ─────────────────────────────────── */}
        {allBadges.length > 0 && (
          <div id="achievements" className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
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

      </main>
    </div>
  );
}
