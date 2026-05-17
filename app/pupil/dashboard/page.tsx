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
  // SSO URLs — computed on mount using the Supabase session
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

      // Build SSO URLs in the background — falls back to plain URL if no session
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

      // Fetch teacher-pushed resources for this class (non-blocking)
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

  // XP / level — 100 sentences per level
  const xpLevel = Math.floor(totalSentences / 100) + 1;
  const xpIntoLevel = totalSentences % 100;
  const xpBarPct = xpIntoLevel; // out of 100

  // Current PWP level — highest level_to seen across assignments
  const currentPwpLevel = pwpAssignments.length > 0
    ? Math.max(...pwpAssignments.map(a => a.level_to))
    : null;

  // Active PWP assignments (not yet assessed)
  const activePwpAssignments = pwpAssignments.filter((a) => {
    const sub = getPWPSubmission(a.id);
    if (sub?.has_assessment) return false; // completed
    if (!a.due_date) return true;
    const due = new Date(a.due_date);
    due.setHours(0, 0, 0, 0);
    return due >= today;
  });

  const hasPendingWork = pendingAssignments.length > 0 || unstartedDwp.length > 0 || activePwpAssignments.length > 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--wrife-bg)" }}>

      {/* ── Slim pupil nav ─────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6"
        style={{ backgroundColor: "var(--wrife-blue)", height: "52px" }}
      >
        <Link href="/">
          <span className="font-extrabold text-xl text-white" style={{ fontFamily: "var(--font-display)" }}>
            WriFe
          </span>
        </Link>

        {/* Right: streak + sentences pills */}
        <div className="flex items-center gap-3">
          {streakCurrent > 0 && (
            <span className="text-sm font-bold text-white flex items-center gap-1">
              🔥 {streakCurrent}
            </span>
          )}
          <span className="text-sm font-bold text-white flex items-center gap-1">
            ✏️ {totalSentences}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm font-semibold ml-2 transition"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            Log out
          </button>
        </div>
      </header>

      {/* ── Hero: greeting + XP bar ────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-2">
        <h1
          className="text-3xl sm:text-4xl font-extrabold mb-1"
          style={{ fontFamily: "var(--font-display)", color: "var(--wrife-text-main)" }}
        >
          Hi {session.pupilName.split(' ')[0]}! 🌅
        </h1>

        {/* XP bar — sentences written as proxy for XP */}
        <div className="flex items-center justify-between text-xs font-semibold mb-2 mt-3"
          style={{ color: "var(--wrife-text-muted)" }}>
          <span>Sentences written: {totalSentences}</span>
          <span style={{ color: "var(--wrife-blue)" }}>
            LEVEL {xpLevel} → {xpLevel + 1}
          </span>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: "#e5e7eb" }}>
          <div
            className="h-3 rounded-full transition-all"
            style={{
              width: `${xpBarPct}%`,
              background: "linear-gradient(90deg, var(--wrife-blue) 0%, #7c3aed 100%)",
            }}
          />
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-5 space-y-7">

        {/* ── 4 stat cards ─────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              value: streakCurrent > 0 ? `${streakCurrent}-day` : '—',
              label: 'Streak',
              color: 'var(--wrife-orange)',
              pulse: streakCurrent >= 7,
            },
            {
              value: `${pendingAssignments.length + unstartedDwp.length + activePwpAssignments.length}`,
              label: 'Tasks to Do',
              color: pendingAssignments.length + unstartedDwp.length + activePwpAssignments.length > 0
                ? '#ef4444'
                : '#22c55e',
              pulse: false,
            },
            {
              value: `${totalSentences}`,
              label: 'Sentences Written',
              color: 'var(--wrife-blue)',
              pulse: false,
            },
            {
              value: currentPwpLevel ? `L${currentPwpLevel}` : allBadges.length > 0 ? `${allBadges.length}` : '—',
              label: currentPwpLevel ? 'PWP Level' : 'Badges Earned',
              color: '#7c3aed',
              pulse: false,
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl p-4"
              style={{
                backgroundColor: "var(--wrife-surface)",
                border: "1.5px solid var(--wrife-border)",
              }}
            >
              <p
                className={`text-2xl font-extrabold leading-none ${card.pulse ? 'animate-pulse' : ''}`}
                style={{ color: card.color, fontFamily: "var(--font-display)" }}
              >
                {card.value}
              </p>
              <p className="text-xs mt-1.5 font-medium" style={{ color: "var(--wrife-text-muted)" }}>
                {card.label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Your Apps (6-card grid, like "Your Worlds") ───── */}
        <div>
          <h2
            className="text-xl font-extrabold mb-3"
            style={{ fontFamily: "var(--font-display)", color: "var(--wrife-text-main)" }}
          >
            Your Apps
          </h2>
          <div className="grid grid-cols-3 gap-3">

            {/* Interactive Practice */}
            <a href={practiceUrl} className="block group">
              <div
                className="rounded-2xl p-4 text-white h-full flex flex-col justify-between transition-all group-hover:-translate-y-0.5 group-hover:shadow-lg"
                style={{ background: "linear-gradient(135deg, #6C5CE7 0%, #4834d4 100%)" }}
              >
                <div>
                  <span className="text-xl">🎮</span>
                  <p className="font-bold text-sm mt-2 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                    Interactive Practice
                  </p>
                  <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
                    {progressRecords.length > 0
                      ? `In progress · L${progressRecords[progressRecords.length - 1]?.lesson_id ?? '?'}`
                      : '61 lessons'}
                  </p>
                </div>
                <span className="mt-3 block text-center py-1.5 rounded-full text-xs font-bold bg-white transition group-hover:bg-purple-50"
                  style={{ color: "#4834d4" }}>
                  Play →
                </span>
              </div>
            </a>

            {/* PWP Studio */}
            <a href={studioUrl} className="block group">
              <div
                className="rounded-2xl p-4 text-white h-full flex flex-col justify-between transition-all group-hover:-translate-y-0.5 group-hover:shadow-lg"
                style={{ background: "linear-gradient(135deg, #F5A623 0%, #e07b10 100%)" }}
              >
                <div>
                  <span className="text-xl">✏️</span>
                  <p className="font-bold text-sm mt-2 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                    PWP Studio
                  </p>
                  <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.75)" }}>
                    {currentPwpLevel ? `Level ${currentPwpLevel} · keep going!` : '67 levels · build sentences'}
                  </p>
                </div>
                <span className="mt-3 block text-center py-1.5 rounded-full text-xs font-bold bg-white transition group-hover:bg-orange-50"
                  style={{ color: "#e07b10" }}>
                  Write →
                </span>
              </div>
            </a>

            {/* Daily Writing Practice — SSO tile, same pattern as IP and PWP */}
            <a href={dwpUrl} className="block group">
              <div
                className="rounded-2xl p-4 h-full flex flex-col justify-between transition-all group-hover:-translate-y-0.5 group-hover:shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
                  border: "1.5px solid #c4b5fd",
                }}
              >
                <div>
                  <span className="text-xl">📖</span>
                  <p className="font-bold text-sm mt-2 leading-tight" style={{ fontFamily: "var(--font-display)", color: "#5b21b6" }}>
                    Daily Writing
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#7c3aed" }}>
                    {activeDwpAssignments.length > 0
                      ? `${activeDwpAssignments.length} task${activeDwpAssignments.length !== 1 ? 's' : ''} assigned`
                      : '40 levels · write every day'}
                  </p>
                </div>
                <span className="mt-3 block text-center py-1.5 rounded-full text-xs font-bold transition group-hover:opacity-90"
                  style={{ backgroundColor: "#7c3aed", color: "white" }}>
                  Write →
                </span>
              </div>
            </a>

            {/* Writing Assignments */}
            {pendingAssignments.length > 0 ? (
              <div className="rounded-2xl p-4 h-full flex flex-col justify-between"
                style={{
                  background: "linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)",
                  border: "1.5px solid #fde047",
                }}>
                <div>
                  <span className="text-xl">📝</span>
                  <p className="font-bold text-sm mt-2 leading-tight" style={{ fontFamily: "var(--font-display)", color: "#854d0e" }}>
                    Assignments
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#a16207" }}>
                    {pendingAssignments.length} to do
                    {activeAssignments.length > 0 && ` · ${completedAssignments.length}/${activeAssignments.length} done`}
                  </p>
                </div>
                {activeAssignments.length > 0 && (
                  <div className="mt-3 w-full rounded-full h-1.5" style={{ backgroundColor: "#fef08a" }}>
                    <div className="h-1.5 rounded-full" style={{
                      width: `${Math.round((completedAssignments.length / activeAssignments.length) * 100)}%`,
                      backgroundColor: "#eab308",
                    }} />
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl p-4 h-full flex flex-col"
                style={{ backgroundColor: "#f0fdf4", border: "1.5px solid #86efac" }}>
                <span className="text-xl">📝</span>
                <p className="font-bold text-sm mt-2" style={{ fontFamily: "var(--font-display)", color: "#166534" }}>
                  Assignments
                </p>
                <p className="text-xs mt-1" style={{ color: "#16a34a" }}>All done! ✓</p>
              </div>
            )}

            {/* AI Writing Coach */}
            <Link href="/pupil/writing-coach" className="block group">
              <div
                className="rounded-2xl p-4 h-full flex flex-col justify-between transition-all group-hover:-translate-y-0.5 group-hover:shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
                  border: "1.5px solid #6ee7b7",
                }}
              >
                <div>
                  <span className="text-xl">✍️</span>
                  <p className="font-bold text-sm mt-2 leading-tight" style={{ fontFamily: "var(--font-display)", color: "#065f46" }}>
                    Writing Coach
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#059669" }}>AI-powered feedback</p>
                </div>
                <span className="mt-3 block text-center py-1.5 rounded-full text-xs font-bold transition group-hover:opacity-90"
                  style={{ backgroundColor: "#10b981", color: "white" }}>
                  Open →
                </span>
              </div>
            </Link>

            {/* Skills Toolkit — resources.wrife.co.uk SSO tile */}
            <a href={toolkitUrl} className="block group">
              <div
                className="rounded-2xl p-4 h-full flex flex-col justify-between transition-all group-hover:-translate-y-0.5 group-hover:shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                  border: "1.5px solid #86efac",
                }}
              >
                <div>
                  <span className="text-xl">🛠️</span>
                  <p className="font-bold text-sm mt-2 leading-tight" style={{ fontFamily: "var(--font-display)", color: "#166534" }}>
                    Skills Toolkit
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#16a34a" }}>
                    AI writing tools &amp; resources
                  </p>
                </div>
                <span className="mt-3 block text-center py-1.5 rounded-full text-xs font-bold transition group-hover:opacity-90"
                  style={{ backgroundColor: "#22c55e", color: "white" }}>
                  Open →
                </span>
              </div>
            </a>

            {/* Achievements — spans full row so the 7-tile grid ends cleanly */}
            <Link href="#achievements" className="block group col-span-3">
              <div
                className="rounded-2xl p-4 flex flex-row items-center justify-between transition-all group-hover:-translate-y-0.5 group-hover:shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)",
                  border: "1.5px solid #fbbf24",
                }}
              >
                <div>
                  <span className="text-xl">🏆</span>
                  <p className="font-bold text-sm mt-2 leading-tight" style={{ fontFamily: "var(--font-display)", color: "#92400e" }}>
                    Achievements
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#b45309" }}>
                    {allBadges.length > 0 ? `${allBadges.length} badge${allBadges.length !== 1 ? 's' : ''} earned` : 'Earn your first badge!'}
                  </p>
                </div>
                {latestBadges.length > 0 && (
                  <div className="mt-2 flex gap-1">
                    {latestBadges.map((b, i) => (
                      <span key={i} className="text-base" title={b.badgeName}>{b.badgeIcon || '🎖️'}</span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          </div>
        </div>

        {/* ── Today's Tasks ─────────────────────────────────── */}
        {(nextDwp || pendingAssignments.length > 0 || activePwpAssignments.length > 0) && (
          <div>
            <h2
              className="text-xl font-extrabold mb-3"
              style={{ fontFamily: "var(--font-display)", color: "var(--wrife-text-main)" }}
            >
              Today's Tasks
            </h2>

            <div className="space-y-3">

              {/* Primary: next DWP — SSO redirect to dailywrite.wrife.co.uk (Route A) */}
              {nextDwp && (
                <a href={dwpUrl}>
                  <div
                    className="rounded-2xl p-5 cursor-pointer transition hover:opacity-95 hover:shadow-lg"
                    style={{ background: "linear-gradient(135deg, #F5A623 0%, #e07b10 100%)" }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-white opacity-80">📖 Daily Writing Practice</span>
                    </div>
                    <p className="text-white font-extrabold text-base" style={{ fontFamily: "var(--font-display)" }}>
                      {nextDwp.writing_levels?.activity_name || `Writing Level ${nextDwp.writing_levels?.level_number}`}
                    </p>
                    <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.8)" }}>
                      Tier {nextDwp.writing_levels?.tier_number} · {nextDwp.writing_levels?.learning_objective?.slice(0, 60)}…
                    </p>
                    <div className="mt-4 flex gap-3">
                      <span className="px-5 py-2 rounded-full text-sm font-bold bg-white transition hover:bg-orange-50"
                        style={{ color: "#e07b10" }}>
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
                        backgroundColor: "var(--wrife-surface)",
                        border: "1.5px solid var(--wrife-border)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                          style={{ backgroundColor: "var(--wrife-blue-soft)" }}>
                          ✏️
                        </div>
                        <div>
                          <p className="font-bold text-sm" style={{ color: "var(--wrife-text-main)" }}>
                            PWP Studio · L{pwp.level_from}–{pwp.level_to}
                          </p>
                          <p className="text-xs" style={{ color: isOverdue ? "var(--wrife-danger)" : "var(--wrife-text-muted)" }}>
                            {pwp.due_date
                              ? `${isOverdue ? 'Overdue: ' : 'Due: '}${new Date(pwp.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                              : 'No due date'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getPWPStatusBadge(pwp.id)}
                        <span className="text-xs font-bold shrink-0" style={{ color: "var(--wrife-blue)" }}>Open →</span>
                      </div>
                    </div>
                  </a>
                );
              })}

              {/* IP assignments */}
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
                        border: subStatus === 'reviewed' ? "1.5px solid #86efac"
                          : subStatus === 'submitted' ? "1.5px solid #93c5fd"
                          : subStatus === 'draft' ? "1.5px solid #fcd34d"
                          : "1.5px solid var(--wrife-border)",
                        backgroundColor: subStatus === 'reviewed' ? "#f0fdf4"
                          : subStatus === 'submitted' ? "#eff6ff"
                          : subStatus === 'draft' ? "#fffbeb"
                          : "var(--wrife-surface)",
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                          style={{ backgroundColor: "var(--wrife-bg)" }}>
                          📝
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-sm truncate" style={{ color: "var(--wrife-text-main)" }}>
                              {assignment.title}
                            </p>
                            {subStatus === 'reviewed' && hasTeacherFeedback && (
                              <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-bold text-white"
                                style={{ backgroundColor: "var(--wrife-orange)" }}>
                                New Feedback!
                              </span>
                            )}
                          </div>
                          <p className="text-xs" style={{ color: isOverdue ? "var(--wrife-danger)" : "var(--wrife-text-muted)" }}>
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
                        border: subStatus === 'reviewed' ? "1.5px solid #86efac" : "1.5px solid #93c5fd",
                        backgroundColor: subStatus === 'reviewed' ? "#f0fdf4" : "#eff6ff",
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                          style={{ backgroundColor: subStatus === 'reviewed' ? "#dcfce7" : "#dbeafe" }}>
                          {subStatus === 'reviewed' ? '✅' : '⏳'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate" style={{ color: "var(--wrife-text-main)" }}>
                            {assignment.title}
                          </p>
                          <p className="text-xs" style={{ color: "var(--wrife-text-muted)" }}>
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
          </div>
        )}

        {/* ── Resources from your teacher ──────────────────── */}
        {resourceAssignments.length > 0 && (
          <div>
            <h2
              className="text-xl font-extrabold mb-3"
              style={{ fontFamily: "var(--font-display)", color: "var(--wrife-text-main)" }}
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
                  <a
                    key={r.id}
                    href={r.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div
                      className="rounded-2xl p-4 flex items-center justify-between gap-3 transition hover:shadow-md cursor-pointer"
                      style={{
                        backgroundColor: "var(--wrife-surface)",
                        border: "1.5px solid var(--wrife-border)",
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                          style={{ backgroundColor: "var(--wrife-green-soft,#e8f5e9)" }}
                        >
                          {fileIcon}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate" style={{ color: "var(--wrife-text-main)" }}>
                            {r.title}
                          </p>
                          {r.message && (
                            <p className="text-xs truncate italic" style={{ color: "var(--wrife-text-muted)" }}>
                              &ldquo;{r.message}&rdquo;
                            </p>
                          )}
                          <p className="text-xs mt-0.5" style={{ color: isOverdue ? "var(--wrife-danger)" : "var(--wrife-text-muted)" }}>
                            {lessonLabel && `${lessonLabel} · `}
                            {r.due_date
                              ? `${isOverdue ? 'Overdue: ' : 'Due: '}${new Date(r.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                              : 'No due date'}
                          </p>
                        </div>
                      </div>
                      <span
                        className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition"
                        style={{ backgroundColor: "var(--wrife-green-soft,#e8f5e9)", color: "var(--wrife-green,#27ae60)" }}
                      >
                        Open →
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Achievements ─────────────────────────────────── */}
        {allBadges.length > 0 && (
          <div id="achievements">
            <h2
              className="text-xl font-extrabold mb-3"
              style={{ fontFamily: "var(--font-display)", color: "var(--wrife-text-main)" }}
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
                      <p className="font-bold text-sm" style={{ color: "var(--wrife-text-main)" }}>{badge.badgeName}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--wrife-text-muted)" }}>{badge.badgeDescription}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state when nothing to do */}
        {!nextDwp && pendingAssignments.length === 0 && activePwpAssignments.length === 0 && (
          <div className="text-center py-12">
            <WrifeMascot pose="celebrating" size="lg" decorative className="mx-auto mb-4 drop-shadow mascot-float-a" />
            <p className="text-xl font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--wrife-text-main)" }}>
              All caught up! 🎉
            </p>
            <p className="text-sm mt-2" style={{ color: "var(--wrife-text-muted)" }}>
              No tasks right now. Why not practise in Interactive Practice or PWP Studio?
            </p>
          </div>
        )}

        <div className="h-8" />
      </main>
    </div>
  );
}
