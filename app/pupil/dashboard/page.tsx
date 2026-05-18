"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { buildSSOUrl } from '@/lib/pupil-sso';
import WrifeMascot from '@/components/mascots/WrifeMascot';

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

interface PWPAssignment {
  id: string;
  level_from: number;
  level_to: number;
  instructions: string | null;
  due_date: string | null;
  created_at: string;
  status: string;
}

interface PWPSubmission {
  id: string;
  pwp_assignment_id: string;
  status: string;
  submitted_at: string | null;
  has_assessment: boolean;
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

interface ResourceAssignment {
  id: number;
  title: string;
  file_type: string;
  file_url: string;
  message: string | null;
  due_date: string | null;
  created_at: string;
  lesson_number: number | null;
  lesson_part: string | null;
  lesson_title: string | null;
}

interface PupilStats {
  streak: { current: number; longest: number; totalLogins: number };
  badges: Array<{ badgeId: string; badgeType: string; badgeName: string; badgeIcon: string; badgeDescription: string }>;
  writingStats: { totalSentences: number; masteryCount: number; averageScore: number };
  activityStats: { totalCompleted: number; masteryRate: number };
}

function getBadgeBg(badgeType: string) {
  switch (badgeType) {
    case 'streak':      return { bg: 'bg-orange-100', border: 'border-orange-300' };
    case 'tier':        return { bg: 'bg-purple-100', border: 'border-purple-300' };
    case 'programme':   return { bg: 'bg-yellow-100', border: 'border-yellow-300' };
    case 'special':     return { bg: 'bg-blue-100',   border: 'border-blue-300' };
    default:            return { bg: 'bg-gray-100',   border: 'border-gray-300' };
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
  const [pwpAssignments, setPwpAssignments] = useState<PWPAssignment[]>([]);
  const [pwpSubmissions, setPwpSubmissions] = useState<PWPSubmission[]>([]);
  const [dwpAssignments, setDwpAssignments] = useState<DWPAssignment[]>([]);
  const [writingAttempts, setWritingAttempts] = useState<WritingAttempt[]>([]);
  const [resourceAssignments, setResourceAssignments] = useState<ResourceAssignment[]>([]);
  const [stats, setStats] = useState<PupilStats | null>(null);
  const [loading, setLoading] = useState(true);
  // SSO URLs — built on mount from stored pupilSSOTokens (Route A hash-token injection)
  const [practiceUrl, setPracticeUrl] = useState('https://practice.wrife.co.uk');
  const [studioUrl, setStudioUrl] = useState('https://pwp-studio.wrife.co.uk/dashboard');
  const [dwpUrl, setDwpUrl] = useState('https://dailywrite.wrife.co.uk');
  const [toolkitUrl, setToolkitUrl] = useState('https://resources.wrife.co.uk/auth/hub');
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

      // Build SSO URLs — falls back to plain URL if no tokens / expired
      buildSSOUrl('https://practice.wrife.co.uk').then(setPracticeUrl).catch(() => {});
      buildSSOUrl('https://pwp-studio.wrife.co.uk/dashboard').then(setStudioUrl).catch(() => {});
      buildSSOUrl('https://dailywrite.wrife.co.uk').then(setDwpUrl).catch(() => {});
      buildSSOUrl('https://resources.wrife.co.uk/auth/hub').then(setToolkitUrl).catch(() => {});

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

      fetch('/api/pupil/resource-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId }),
      })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setResourceAssignments(d.resourceAssignments || []); })
        .catch(() => {});
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

  function getPWPSubmission(assignmentId: string): PWPSubmission | undefined {
    return pwpSubmissions.find(s => s.pwp_assignment_id === assignmentId);
  }

  function getPWPStatusBadge(assignmentId: string) {
    const sub = getPWPSubmission(assignmentId);
    if (!sub) {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">Not Started</span>;
    }
    if (sub.has_assessment) {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">✓ Assessed</span>;
    }
    if (sub.status === 'submitted') {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Submitted</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">In Progress</span>;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
  const nextDwp = unstartedDwp[0];

  const streakCurrent = stats?.streak?.current ?? 0;
  const totalSentences = stats?.writingStats?.totalSentences ?? 0;
  const allBadges = stats?.badges ?? [];
  const latestBadges = allBadges.slice(0, 3);

  const xpLevel = Math.floor(totalSentences / 100) + 1;
  const xpIntoLevel = totalSentences % 100;
  const xpBarPct = xpIntoLevel;

  const currentPwpLevel = pwpAssignments.length > 0
    ? Math.max(...pwpAssignments.map(a => a.level_to))
    : null;

  const activePwpAssignments = pwpAssignments.filter((a) => {
    const sub = getPWPSubmission(a.id);
    if (sub?.has_assessment) return false;
    if (!a.due_date) return true;
    const due = new Date(a.due_date);
    due.setHours(0, 0, 0, 0);
    return due >= today;
  });

  const hasPendingWork = pendingAssignments.length > 0 || unstartedDwp.length > 0 || activePwpAssignments.length > 0;
  const pendingCount = pendingAssignments.length + unstartedDwp.length + activePwpAssignments.length;
  const firstName = session.pupilName.split(' ')[0];

  /* ── Shared style helpers ─────────────────────────────────── */
  const bannerChip: React.CSSProperties = {
    background: 'rgba(255,255,255,0.18)',
    borderRadius: '8px',
    padding: '4px 10px',
    color: 'white',
    fontWeight: 700,
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>

      {/* ── Slim sticky nav ─────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 w-full"
        style={{ backgroundColor: 'var(--wrife-blue)', height: '52px' }}
      >
        <div className="max-w-4xl mx-auto px-4 h-full flex items-center justify-between">
          <Link href="/">
            <span className="font-extrabold text-xl text-white" style={{ fontFamily: 'var(--font-display)' }}>
              WriFe
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {streakCurrent > 0 && (
              <span style={bannerChip}>🔥 {streakCurrent}</span>
            )}
            <span style={bannerChip}>✏️ {totalSentences}</span>
            <button
              onClick={handleLogout}
              className="text-sm font-semibold ml-2 transition"
              style={{ color: 'rgba(255,255,255,0.65)' }}
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero banner (Pattern 1 — wrife-design-world) ────────── */}
      <div className="max-w-4xl mx-auto px-4 pt-5">
        <div
          className="rounded-2xl px-6 py-5"
          style={{ background: 'var(--wrife-blue)' }}
        >
          {/* Top row: level pill + stat chips */}
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-xs font-bold uppercase tracking-wide"
              style={{ background: 'rgba(255,255,255,0.18)', borderRadius: '20px', padding: '4px 12px', color: 'white' }}
            >
              Level {xpLevel}
            </span>
            <div className="flex items-center gap-2">
              {streakCurrent >= 3 && (
                <span style={bannerChip}>🔥 {streakCurrent}-day streak</span>
              )}
              {allBadges.length > 0 && (
                <span style={bannerChip}>🏆 {allBadges.length}</span>
              )}
            </div>
          </div>

          {/* Greeting */}
          <h1
            className="font-extrabold text-white"
            style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontFamily: 'var(--font-display)', lineHeight: 1.2 }}
          >
            Hi {firstName}! 🌅
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.72)' }}>
            {hasPendingWork
              ? `You have ${pendingCount} task${pendingCount !== 1 ? 's' : ''} to do`
              : 'All caught up — great work! ✓'}
          </p>

          {/* XP progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
              <span>{xpIntoLevel} sentences this level</span>
              <span>{100 - xpIntoLevel} to Level {xpLevel + 1}</span>
            </div>
            <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.22)' }}>
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${xpBarPct}%`, background: 'var(--wrife-orange)' }}
              />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">

        {/* ── Your Apps (6+1 tile grid) ─────────────────────────── */}
        <section>
          <h2
            className="text-xl font-extrabold mb-4"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--wrife-text-main)' }}
          >
            Your Apps
          </h2>
          <div className="grid grid-cols-3 gap-4">

            {/* Interactive Practice */}
            <a href={practiceUrl} className="block group">
              <div
                className="rounded-2xl p-5 text-white h-full flex flex-col justify-between transition-all group-hover:-translate-y-0.5 group-hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #6C5CE7 0%, #4834d4 100%)' }}
              >
                <div>
                  <span className="text-2xl">🎮</span>
                  <p className="font-bold text-base mt-2 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                    Interactive Practice
                  </p>
                  <p className="text-xs mt-1 font-medium" style={{ color: 'rgba(255,255,255,0.72)' }}>
                    {progressRecords.length > 0
                      ? `In progress · L${progressRecords[progressRecords.length - 1]?.lesson_id ?? '?'}`
                      : '61 lessons'}
                  </p>
                </div>
                {/* Chunky bottom-border CTA — Pattern 2 */}
                <span
                  className="mt-4 block text-center rounded-xl text-sm font-bold transition group-hover:opacity-90"
                  style={{
                    background: 'rgba(255,255,255,0.92)',
                    color: '#4834d4',
                    padding: '9px 0',
                    borderBottom: '3px solid rgba(72,52,212,0.3)',
                  }}
                >
                  Play →
                </span>
              </div>
            </a>

            {/* PWP Studio */}
            <a href={studioUrl} className="block group">
              <div
                className="rounded-2xl p-5 text-white h-full flex flex-col justify-between transition-all group-hover:-translate-y-0.5 group-hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #F5A623 0%, #e07b10 100%)' }}
              >
                <div>
                  <span className="text-2xl">✏️</span>
                  <p className="font-bold text-base mt-2 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                    PWP Studio
                  </p>
                  <p className="text-xs mt-1 font-medium" style={{ color: 'rgba(255,255,255,0.78)' }}>
                    {currentPwpLevel ? `Level ${currentPwpLevel} · keep going!` : '67 levels · build sentences'}
                  </p>
                </div>
                <span
                  className="mt-4 block text-center rounded-xl text-sm font-bold transition group-hover:opacity-90"
                  style={{
                    background: 'rgba(255,255,255,0.92)',
                    color: '#e07b10',
                    padding: '9px 0',
                    borderBottom: '3px solid rgba(224,123,16,0.3)',
                  }}
                >
                  Write →
                </span>
              </div>
            </a>

            {/* Daily Writing Practice */}
            <a href={dwpUrl} className="block group">
              <div
                className="rounded-2xl p-5 h-full flex flex-col justify-between transition-all group-hover:-translate-y-0.5 group-hover:shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
                  border: '1.5px solid #c4b5fd',
                }}
              >
                <div>
                  <span className="text-2xl">📖</span>
                  <p className="font-bold text-base mt-2 leading-tight" style={{ fontFamily: 'var(--font-display)', color: '#5b21b6' }}>
                    Daily Writing
                  </p>
                  <p className="text-xs mt-1 font-medium" style={{ color: '#7c3aed' }}>
                    {activeDwpAssignments.length > 0
                      ? `${activeDwpAssignments.length} task${activeDwpAssignments.length !== 1 ? 's' : ''} assigned`
                      : '40 levels · write every day'}
                  </p>
                </div>
                <span
                  className="mt-4 block text-center rounded-xl text-sm font-bold transition group-hover:opacity-90"
                  style={{
                    backgroundColor: '#7c3aed',
                    color: 'white',
                    padding: '9px 0',
                    borderBottom: '3px solid #5b21b6',
                  }}
                >
                  Write →
                </span>
              </div>
            </a>

            {/* Writing Assignments */}
            {pendingAssignments.length > 0 ? (
              <div
                className="rounded-2xl p-5 h-full flex flex-col justify-between"
                style={{
                  background: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)',
                  border: '1.5px solid #fde047',
                }}
              >
                <div>
                  <span className="text-2xl">📝</span>
                  <p className="font-bold text-base mt-2 leading-tight" style={{ fontFamily: 'var(--font-display)', color: '#854d0e' }}>
                    Assignments
                  </p>
                  <p className="text-xs mt-1 font-medium" style={{ color: '#a16207' }}>
                    {pendingAssignments.length} to do
                    {activeAssignments.length > 0 && ` · ${completedAssignments.length}/${activeAssignments.length} done`}
                  </p>
                </div>
                {activeAssignments.length > 0 && (
                  <div className="mt-3 w-full rounded-full h-1.5" style={{ backgroundColor: '#fef08a' }}>
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${Math.round((completedAssignments.length / activeAssignments.length) * 100)}%`,
                        backgroundColor: '#eab308',
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div
                className="rounded-2xl p-5 h-full flex flex-col"
                style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #86efac' }}
              >
                <span className="text-2xl">📝</span>
                <p className="font-bold text-base mt-2" style={{ fontFamily: 'var(--font-display)', color: '#166534' }}>
                  Assignments
                </p>
                <p className="text-xs mt-1 font-medium" style={{ color: '#16a34a' }}>All done! ✓</p>
              </div>
            )}

            {/* Writing Coach */}
            <Link href="/pupil/writing-coach" className="block group">
              <div
                className="rounded-2xl p-5 h-full flex flex-col justify-between transition-all group-hover:-translate-y-0.5 group-hover:shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                  border: '1.5px solid #6ee7b7',
                }}
              >
                <div>
                  <span className="text-2xl">✍️</span>
                  <p className="font-bold text-base mt-2 leading-tight" style={{ fontFamily: 'var(--font-display)', color: '#065f46' }}>
                    Writing Coach
                  </p>
                  <p className="text-xs mt-1 font-medium" style={{ color: '#059669' }}>AI-powered feedback</p>
                </div>
                <span
                  className="mt-4 block text-center rounded-xl text-sm font-bold transition group-hover:opacity-90"
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '9px 0',
                    borderBottom: '3px solid #059669',
                  }}
                >
                  Open →
                </span>
              </div>
            </Link>

            {/* Skills Toolkit */}
            <a href={toolkitUrl} className="block group">
              <div
                className="rounded-2xl p-5 h-full flex flex-col justify-between transition-all group-hover:-translate-y-0.5 group-hover:shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                  border: '1.5px solid #86efac',
                }}
              >
                <div>
                  <span className="text-2xl">🛠️</span>
                  <p className="font-bold text-base mt-2 leading-tight" style={{ fontFamily: 'var(--font-display)', color: '#166534' }}>
                    Skills Toolkit
                  </p>
                  <p className="text-xs mt-1 font-medium" style={{ color: '#16a34a' }}>
                    AI writing tools &amp; resources
                  </p>
                </div>
                <span
                  className="mt-4 block text-center rounded-xl text-sm font-bold transition group-hover:opacity-90"
                  style={{
                    backgroundColor: '#22c55e',
                    color: 'white',
                    padding: '9px 0',
                    borderBottom: '3px solid #16a34a',
                  }}
                >
                  Open →
                </span>
              </div>
            </a>

            {/* Achievements — spans full row */}
            <Link href="#achievements" className="block group col-span-3">
              <div
                className="rounded-2xl p-4 flex flex-row items-center justify-between transition-all group-hover:-translate-y-0.5 group-hover:shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
                  border: '1.5px solid #fbbf24',
                }}
              >
                <div>
                  <span className="text-xl">🏆</span>
                  <p className="font-bold text-sm mt-1.5 leading-tight" style={{ fontFamily: 'var(--font-display)', color: '#92400e' }}>
                    Achievements
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#b45309' }}>
                    {allBadges.length > 0
                      ? `${allBadges.length} badge${allBadges.length !== 1 ? 's' : ''} earned`
                      : 'Earn your first badge!'}
                  </p>
                </div>
                {latestBadges.length > 0 && (
                  <div className="flex gap-1.5">
                    {latestBadges.map((b, i) => (
                      <span key={i} className="text-xl" title={b.badgeName}>{b.badgeIcon || '🎖️'}</span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          </div>
        </section>

        {/* ── Today's Tasks ─────────────────────────────────────── */}
        {(nextDwp || pendingAssignments.length > 0 || activePwpAssignments.length > 0) && (
          <section>
            <h2
              className="text-xl font-extrabold mb-4"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--wrife-text-main)' }}
            >
              Today&apos;s Tasks
            </h2>

            <div className="space-y-3">

              {/* Primary: next DWP — SSO → dailywrite.wrife.co.uk */}
              {nextDwp && (
                <a href={dwpUrl}>
                  <div
                    className="rounded-2xl p-5 cursor-pointer transition hover:opacity-95 hover:shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #F5A623 0%, #e07b10 100%)' }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-white opacity-80">📖 Daily Writing Practice</span>
                    </div>
                    <p className="text-white font-extrabold text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                      {nextDwp.writing_levels?.activity_name || `Writing Level ${nextDwp.writing_levels?.level_number}`}
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.82)' }}>
                      Tier {nextDwp.writing_levels?.tier_number} · {nextDwp.writing_levels?.learning_objective?.slice(0, 60)}…
                    </p>
                    <div className="mt-4">
                      <span
                        className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold"
                        style={{
                          background: 'white',
                          color: '#e07b10',
                          borderBottom: '3px solid rgba(224,123,16,0.28)',
                        }}
                      >
                        Start Writing →
                      </span>
                    </div>
                  </div>
                </a>
              )}

              {/* PWP assignments */}
              {activePwpAssignments.slice(0, 2).map((pwp) => {
                const isOverdue = pwp.due_date && new Date(pwp.due_date) < new Date();
                return (
                  <a key={pwp.id} href={studioUrl}>
                    <div
                      className="rounded-2xl p-4 flex items-center justify-between gap-3 transition hover:shadow-md cursor-pointer"
                      style={{
                        backgroundColor: 'var(--wrife-surface)',
                        border: '1.5px solid var(--wrife-border)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                          style={{ backgroundColor: 'var(--wrife-blue-soft)' }}
                        >
                          ✏️
                        </div>
                        <div>
                          <p className="font-bold text-sm" style={{ color: 'var(--wrife-text-main)' }}>
                            PWP Studio · L{pwp.level_from}–{pwp.level_to}
                          </p>
                          <p className="text-xs" style={{ color: isOverdue ? 'var(--wrife-danger)' : 'var(--wrife-text-muted)' }}>
                            {pwp.due_date
                              ? `${isOverdue ? 'Overdue: ' : 'Due: '}${new Date(pwp.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                              : 'No due date'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getPWPStatusBadge(pwp.id)}
                        <span className="text-xs font-bold shrink-0" style={{ color: 'var(--wrife-blue)' }}>Open →</span>
                      </div>
                    </div>
                  </a>
                );
              })}

              {/* IP / writing assignments */}
              {pendingAssignments.map((assignment) => {
                const subStatus = getSubmissionStatus(assignment.id);
                const overallStatus = getOverallStatus(assignment.id, assignment.lesson_id);
                const submission = submissions.find(s => s.assignment_id === assignment.id);
                const hasTeacherFeedback = submission?.teacher_feedback;
                const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date()
                  && !['submitted', 'reviewed'].includes(subStatus);
                const cta = getAssignmentCTA(assignment.id, assignment.lesson_id);

                return (
                  <Link key={assignment.id} href={`/pupil/assignment/${assignment.id}`}>
                    <div
                      className="rounded-2xl p-4 flex items-center justify-between gap-3 transition hover:shadow-md cursor-pointer"
                      style={{
                        border: subStatus === 'reviewed' ? '1.5px solid #86efac'
                          : subStatus === 'submitted' ? '1.5px solid #93c5fd'
                          : subStatus === 'draft' ? '1.5px solid #fcd34d'
                          : '1.5px solid var(--wrife-border)',
                        backgroundColor: subStatus === 'reviewed' ? '#f0fdf4'
                          : subStatus === 'submitted' ? '#eff6ff'
                          : subStatus === 'draft' ? '#fffbeb'
                          : 'var(--wrife-surface)',
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                          style={{ backgroundColor: 'var(--wrife-bg)' }}
                        >
                          📝
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-sm truncate" style={{ color: 'var(--wrife-text-main)' }}>
                              {assignment.title}
                            </p>
                            {subStatus === 'reviewed' && hasTeacherFeedback && (
                              <span
                                className="shrink-0 px-2 py-0.5 rounded-full text-xs font-bold text-white"
                                style={{ backgroundColor: 'var(--wrife-orange)' }}
                              >
                                New Feedback!
                              </span>
                            )}
                          </div>
                          <p className="text-xs" style={{ color: isOverdue ? 'var(--wrife-danger)' : 'var(--wrife-text-muted)' }}>
                            {assignment.due_date
                              ? `${isOverdue ? 'Overdue: ' : 'Due: '}${new Date(assignment.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                              : overallStatus === 'practice_complete' ? 'Practice done · ready to submit'
                              : 'No due date'}
                          </p>
                        </div>
                      </div>
                      <span className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition ${cta.className}`}>
                        {cta.label}
                      </span>
                    </div>
                  </Link>
                );
              })}

              {/* Completed assignments */}
              {completedAssignments.map((assignment) => {
                const subStatus = getSubmissionStatus(assignment.id);
                const cta = getAssignmentCTA(assignment.id, assignment.lesson_id);
                return (
                  <Link key={assignment.id} href={`/pupil/assignment/${assignment.id}`}>
                    <div
                      className="rounded-2xl p-4 flex items-center justify-between gap-3 transition hover:shadow-md cursor-pointer"
                      style={{
                        border: subStatus === 'reviewed' ? '1.5px solid #86efac' : '1.5px solid #93c5fd',
                        backgroundColor: subStatus === 'reviewed' ? '#f0fdf4' : '#eff6ff',
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                          style={{ backgroundColor: subStatus === 'reviewed' ? '#dcfce7' : '#dbeafe' }}
                        >
                          {subStatus === 'reviewed' ? '✅' : '⏳'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate" style={{ color: 'var(--wrife-text-main)' }}>
                            {assignment.title}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--wrife-text-muted)' }}>
                            {subStatus === 'reviewed' ? 'Reviewed by teacher' : 'Submitted · awaiting review'}
                          </p>
                        </div>
                      </div>
                      <span className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition ${cta.className}`}>
                        {cta.label}
                      </span>
                    </div>
                  </Link>
                );
              })}

            </div>
          </section>
        )}

        {/* ── Resources from your teacher ──────────────────────── */}
        {resourceAssignments.length > 0 && (
          <section>
            <h2
              className="text-xl font-extrabold mb-4"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--wrife-text-main)' }}
            >
              Resources from Your Teacher
            </h2>
            <div className="space-y-3">
              {resourceAssignments.map(r => {
                const isOverdue = r.due_date && new Date(r.due_date) < new Date();
                const lessonLabel = r.lesson_number != null
                  ? `L${r.lesson_number}${r.lesson_part ?? ''}`
                  : null;
                const fileIcon =
                  r.file_type.includes('worksheet') ? '📋'
                  : r.file_type === 'resource' ? '📄'
                  : '📎';

                return (
                  <a key={r.id} href={r.file_url} target="_blank" rel="noopener noreferrer">
                    <div
                      className="rounded-2xl p-4 flex items-center justify-between gap-3 transition hover:shadow-md cursor-pointer"
                      style={{
                        backgroundColor: 'var(--wrife-surface)',
                        border: '1.5px solid var(--wrife-border)',
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                          style={{ backgroundColor: 'var(--wrife-green-soft,#e8f5e9)' }}
                        >
                          {fileIcon}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate" style={{ color: 'var(--wrife-text-main)' }}>
                            {r.title}
                          </p>
                          {r.message && (
                            <p className="text-xs truncate italic" style={{ color: 'var(--wrife-text-muted)' }}>
                              &ldquo;{r.message}&rdquo;
                            </p>
                          )}
                          <p className="text-xs mt-0.5" style={{ color: isOverdue ? 'var(--wrife-danger)' : 'var(--wrife-text-muted)' }}>
                            {lessonLabel && `${lessonLabel} · `}
                            {r.due_date
                              ? `${isOverdue ? 'Overdue: ' : 'Due: '}${new Date(r.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                              : 'No due date'}
                          </p>
                        </div>
                      </div>
                      <span
                        className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold"
                        style={{ backgroundColor: 'var(--wrife-green-soft,#e8f5e9)', color: 'var(--wrife-green,#27ae60)' }}
                      >
                        Open →
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Achievements ─────────────────────────────────────── */}
        {allBadges.length > 0 && (
          <section id="achievements">
            <h2
              className="text-xl font-extrabold mb-4"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--wrife-text-main)' }}
            >
              Your Achievements
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allBadges.map((badge, i) => {
                const { bg, border } = getBadgeBg(badge.badgeType);
                return (
                  <div key={i} className={`rounded-2xl p-3.5 border ${border} ${bg} flex items-center gap-3`}>
                    <span className="text-2xl shrink-0">{badge.badgeIcon || '🎖️'}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-sm" style={{ color: 'var(--wrife-text-main)' }}>{badge.badgeName}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--wrife-text-muted)' }}>{badge.badgeDescription}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!nextDwp && pendingAssignments.length === 0 && activePwpAssignments.length === 0 && (
          <div className="text-center py-12">
            <WrifeMascot pose="celebrating" size="lg" decorative className="mx-auto mb-4 drop-shadow mascot-float-a" />
            <p className="text-xl font-extrabold" style={{ fontFamily: 'var(--font-display)', color: 'var(--wrife-text-main)' }}>
              All caught up! 🎉
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--wrife-text-muted)' }}>
              No tasks right now. Why not practise in Interactive Practice or PWP Studio?
            </p>
          </div>
        )}

        <div className="h-8" />
      </main>
    </div>
  );
}
