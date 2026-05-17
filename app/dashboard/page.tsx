"use client";

import { Suspense, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import dynamicImport from 'next/dynamic';
import { getEntitlements } from '@/lib/entitlements';
import UpgradeModal from '@/components/UpgradeModal';
import { AddPupilModal } from '@/components/AddPupilModal';
import DashboardShell from '@/components/dashboard/DashboardShell';

const LessonLibrary = dynamicImport(() => import('@/components/LessonLibrary'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center py-12">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent" />
    </div>
  ),
});

interface ClassData {
  id: string;
  name: string;
  year_group: number;
  class_code: string;
  pupil_count?: number;
}

interface PupilData {
  id: string;
  first_name: string;
  last_name: string | null;
  year_group: number;
  class_id: string;
  class_name: string;
}

interface PendingReview {
  id: number;
  assignment_id: number;
  assignment_title: string;
  pupil_name: string;
  submitted_at: string;
}

interface ActiveAssignment {
  id: number;
  title: string;
  class_name: string;
  due_date: string | null;
  total_pupils: number;
  submitted_count: number;
  reviewed_count: number;
}

interface DashboardStats {
  totalPupils: number;
  totalClasses: number;
  pendingReviews: number;
  completedAssignments: number;
}

// ── Colour palette cycling for class cards ──────────────────────────────────
const CLASS_PALETTE = [
  { border: 'var(--wrife-blue)',    bg: 'var(--wrife-blue-soft)',    text: 'var(--wrife-blue)',    bar: 'var(--wrife-blue)' },
  { border: 'var(--wrife-teal)',    bg: 'var(--wrife-teal-soft)',    text: 'var(--wrife-teal)',    bar: 'var(--wrife-teal)' },
  { border: '#7C3AED',              bg: '#EDE9FE',                   text: '#7C3AED',              bar: '#7C3AED' },
  { border: 'var(--wrife-orange)',  bg: 'var(--wrife-orange-soft)',  text: 'var(--wrife-orange)',  bar: 'var(--wrife-orange)' },
];

function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent" />
    </div>
  );
}

// ── Overview ─────────────────────────────────────────────────────────────────
interface OverviewProps {
  user: { display_name?: string };
  stats: DashboardStats;
  classes: ClassData[];
  pupils: PupilData[];
  activeAssignments: ActiveAssignment[];
  pendingReviews: PendingReview[];
  handleCreateClassClick: () => void;
  handleAddPupilClick: (cls?: ClassData) => void;
  handleTabChange: (tab: string) => void;
  entitlements: { tier: string };
}

function OverviewTab({
  user, stats, classes, pupils, activeAssignments, pendingReviews,
  handleCreateClassClick, handleAddPupilClick, handleTabChange, entitlements,
}: OverviewProps) {

  const firstName = user.display_name?.split(' ')[0] || 'there';

  const statCards = [
    { value: stats.totalClasses,         label: 'Active Classes',    color: 'var(--wrife-blue)',   bg: 'var(--wrife-blue-soft)'  },
    { value: stats.totalPupils,          label: 'Total Pupils',      color: 'var(--wrife-orange)', bg: 'var(--wrife-orange-soft)'},
    { value: stats.pendingReviews,       label: 'Pending Reviews',   color: 'var(--wrife-teal)',   bg: 'var(--wrife-teal-soft)'  },
    { value: stats.completedAssignments, label: 'Reviewed',          color: 'var(--wrife-yellow)', bg: 'var(--wrife-yellow-soft)'},
  ];

  // Per-class completion %  (avg submitted/total across that class's assignments)
  function classCompletion(cls: ClassData): number {
    const classAssignments = activeAssignments.filter(a => a.class_name === cls.name);
    if (!classAssignments.length) return 0;
    const total = classAssignments.reduce((sum, a) => sum + (a.total_pupils || 0), 0);
    const submitted = classAssignments.reduce((sum, a) => sum + (a.submitted_count || 0), 0);
    return total > 0 ? Math.round((submitted / total) * 100) : 0;
  }

  // Derive a simple activity feed from existing data
  const activityFeed = [
    ...pendingReviews.slice(0, 3).map((r) => ({
      key: `review-${r.id}`,
      icon: '📝',
      color: 'var(--wrife-orange)',
      text: `${r.pupil_name} submitted "${r.assignment_title}"`,
    })),
    ...activeAssignments
      .filter(a => a.submitted_count > 0 && a.submitted_count === a.total_pupils)
      .slice(0, 2)
      .map(a => ({
        key: `complete-${a.id}`,
        icon: '✅',
        color: 'var(--wrife-green)',
        text: `${a.class_name} completed "${a.title}" — ${a.submitted_count}/${a.total_pupils} pupils`,
      })),
  ].slice(0, 5);

  return (
    <div className="p-6 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-extrabold"
            style={{ fontFamily: "var(--font-display)", color: "var(--wrife-text-main)" }}
          >
            Good morning, {firstName}! 🌅
          </h1>
          <p className="text-base mt-1" style={{ color: "var(--wrife-text-muted)" }}>
            Here&apos;s your class overview for today.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCreateClassClick}
            className="rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: "var(--wrife-blue)" }}
          >
            + New Class
          </button>
          <button
            onClick={() => handleAddPupilClick()}
            className="rounded-full px-4 py-2 text-sm font-bold transition hover:opacity-90"
            style={{ backgroundColor: "var(--wrife-orange)", color: "white" }}
          >
            + Add Pupil
          </button>
        </div>
      </div>

      {/* Membership banner */}
      {entitlements.tier === 'free' && (
        <div
          className="rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ background: "linear-gradient(to right, var(--wrife-yellow-soft), var(--wrife-orange-soft))", border: "1px solid var(--wrife-yellow)" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">✨</span>
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--wrife-text-main)" }}>You&apos;re on the Free Plan</p>
              <p className="text-xs" style={{ color: "var(--wrife-text-muted)" }}>Upgrade to unlock all lessons, class management and AI assessment</p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="shrink-0 px-5 py-2 text-sm font-semibold text-white rounded-full hover:opacity-90 transition"
            style={{ backgroundColor: "var(--wrife-blue)" }}
          >
            View Plans
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="rounded-2xl p-6 border"
            style={{ backgroundColor: card.bg, borderColor: card.bg, boxShadow: "var(--shadow-card)" }}
          >
            <div
              className="w-11 h-11 rounded-full mb-4"
              style={{ backgroundColor: card.color }}
            />
            <p
              className="text-4xl font-extrabold leading-none"
              style={{ color: card.color, letterSpacing: "-0.03em" }}
            >
              {card.value}
            </p>
            <p className="text-base mt-2 font-semibold" style={{ color: "var(--wrife-text-main)" }}>
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* WriFe Apps */}
      <div>
        <h2
          className="text-xl font-extrabold mb-4"
          style={{ fontFamily: "var(--font-display)", color: "var(--wrife-text-main)" }}
        >
          WriFe Apps
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Interactive Practice */}
          <a
            href="https://practice.wrife.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-2xl p-5 border-2 transition hover:shadow-md hover:-translate-y-0.5"
            style={{ backgroundColor: "var(--wrife-electric-soft)", borderColor: "var(--wrife-electric)" }}
          >
            <span className="text-3xl shrink-0">🎮</span>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-base leading-tight" style={{ color: "var(--wrife-text-main)" }}>Interactive Practice</p>
              <p className="text-sm mt-1" style={{ color: "var(--wrife-text-muted)" }}>Gamified lesson activities</p>
            </div>
            <span className="text-sm font-bold shrink-0" style={{ color: "var(--wrife-electric)" }}>Open →</span>
          </a>

          {/* AI Writing Tools — coming soon badge */}
          <div
            className="flex items-center gap-4 rounded-2xl p-5 border-2 opacity-60 cursor-not-allowed"
            style={{ backgroundColor: "var(--wrife-green-soft)", borderColor: "var(--wrife-green)" }}
            title="Coming soon"
          >
            <span className="text-3xl shrink-0">🤖</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-extrabold text-base leading-tight" style={{ color: "var(--wrife-text-main)" }}>AI Writing Tools</p>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--wrife-yellow)", color: "#78350f" }}>Soon</span>
              </div>
              <p className="text-sm mt-1" style={{ color: "var(--wrife-text-muted)" }}>AI-powered writing feedback</p>
            </div>
          </div>

          {/* PWP Studio */}
          <a
            href="https://pwp-studio.wrife.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-2xl p-5 border-2 transition hover:shadow-md hover:-translate-y-0.5"
            style={{ backgroundColor: "var(--wrife-teal-soft)", borderColor: "var(--wrife-teal)" }}
          >
            <span className="text-3xl shrink-0">📝</span>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-base leading-tight" style={{ color: "var(--wrife-text-main)" }}>PWP Studio</p>
              <p className="text-sm mt-1" style={{ color: "var(--wrife-text-muted)" }}>Formula writing practice</p>
            </div>
            <span className="text-sm font-bold shrink-0" style={{ color: "var(--wrife-teal)" }}>Open →</span>
          </a>
        </div>
      </div>

      {/* My Classes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xl font-extrabold"
            style={{ fontFamily: "var(--font-display)", color: "var(--wrife-text-main)" }}
          >
            My Classes
          </h2>
          <button
            onClick={handleCreateClassClick}
            className="px-4 py-1.5 text-sm font-semibold text-white rounded-full transition hover:opacity-90"
            style={{ backgroundColor: "var(--wrife-orange)" }}
          >
            + New class
          </button>
        </div>

        {classes.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center border"
            style={{ backgroundColor: "white", borderColor: "var(--wrife-border)" }}
          >
            <span className="text-5xl mb-4 block">🏫</span>
            <p className="font-semibold mb-3" style={{ color: "var(--wrife-text-muted)" }}>No classes yet. Create your first class to get started.</p>
            <button
              onClick={handleCreateClassClick}
              className="px-6 py-2.5 text-sm font-semibold text-white rounded-full hover:opacity-90 transition"
              style={{ backgroundColor: "var(--wrife-blue)" }}
            >
              Create a Class
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls, idx) => {
              const palette = CLASS_PALETTE[idx % CLASS_PALETTE.length];
              const classPupils = pupils.filter(p => p.class_id === cls.id).length;
              const completion = classCompletion(cls);
              const activeLesson = activeAssignments.find(a => a.class_name === cls.name);

              return (
                <div
                  key={cls.id}
                  className="bg-white rounded-2xl overflow-hidden border"
                  style={{ borderColor: "var(--wrife-border)", boxShadow: "var(--shadow-card)" }}
                >
                  {/* Coloured header strip */}
                  <div
                    className="px-5 py-5"
                    style={{ backgroundColor: palette.bg, borderBottom: `3px solid ${palette.border}` }}
                  >
                    <p
                      className="font-extrabold text-xl leading-tight"
                      style={{ fontFamily: "var(--font-display)", color: palette.text }}
                    >
                      {cls.name}
                    </p>
                    <p className="text-sm mt-1 font-medium" style={{ color: "var(--wrife-text-muted)" }}>
                      {classPupils} pupil{classPupils !== 1 ? 's' : ''} · Year {cls.year_group}
                    </p>
                  </div>

                  {/* Body */}
                  <div className="px-5 py-5">
                    {/* Current lesson */}
                    {activeLesson ? (
                      <div className="mb-4">
                        <span
                          className="inline-block text-sm font-semibold px-3 py-1.5 rounded-full"
                          style={{ backgroundColor: palette.bg, color: palette.text }}
                        >
                          {activeLesson.title}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm mb-4" style={{ color: "var(--wrife-text-muted)" }}>No active lesson</p>
                    )}

                    {/* Completion bar */}
                    <div className="mb-5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold" style={{ color: "var(--wrife-text-muted)" }}>Completion</span>
                        <span className="text-sm font-extrabold" style={{ color: palette.text }}>{completion}%</span>
                      </div>
                      <div className="w-full rounded-full h-3" style={{ backgroundColor: "var(--wrife-border)" }}>
                        <div
                          className="h-3 rounded-full transition-all"
                          style={{ width: `${completion}%`, backgroundColor: palette.bar }}
                        />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Link
                        href={`/classes/${cls.id}`}
                        className="flex-1 text-center py-2.5 text-sm font-semibold rounded-xl border-2 transition hover:opacity-80"
                        style={{ borderColor: palette.border, color: palette.text }}
                      >
                        View class
                      </Link>
                      <Link
                        href={`/classes/${cls.id}?tab=pwp`}
                        className="flex-1 text-center py-2.5 text-sm font-bold rounded-xl text-white transition hover:opacity-90"
                        style={{ backgroundColor: palette.border }}
                      >
                        PWP grid
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom row: Pending reviews + Recent activity */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Pending reviews */}
        <div
          className="bg-white rounded-2xl p-6 border"
          style={{ borderColor: "var(--wrife-border)", boxShadow: "var(--shadow-card)" }}
        >
          <h3 className="font-extrabold text-lg mb-4" style={{ color: "var(--wrife-text-main)" }}>
            Pending Reviews ({pendingReviews.length})
          </h3>
          {pendingReviews.length === 0 ? (
            <p className="text-base text-center py-6" style={{ color: "var(--wrife-text-muted)" }}>
              No submissions waiting for review ✓
            </p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {pendingReviews.slice(0, 8).map((review) => (
                <Link
                  key={review.id}
                  href={`/assignments/${review.assignment_id}/review`}
                  className="flex items-center justify-between p-4 rounded-xl transition"
                  style={{ backgroundColor: "var(--wrife-yellow-soft)", border: "1px solid var(--wrife-yellow)" }}
                >
                  <div>
                    <p className="font-semibold text-base" style={{ color: "var(--wrife-text-main)" }}>{review.pupil_name}</p>
                    <p className="text-sm mt-0.5" style={{ color: "var(--wrife-text-muted)" }}>{review.assignment_title}</p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: "#B45309" }}>Review →</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div
          className="bg-white rounded-2xl p-6 border"
          style={{ borderColor: "var(--wrife-border)", boxShadow: "var(--shadow-card)" }}
        >
          <h3 className="font-extrabold text-lg mb-4" style={{ color: "var(--wrife-text-main)" }}>
            Recent Activity
          </h3>
          {activityFeed.length === 0 ? (
            <p className="text-base text-center py-6" style={{ color: "var(--wrife-text-muted)" }}>
              No recent activity yet
            </p>
          ) : (
            <div className="space-y-4">
              {activityFeed.map((item) => (
                <div key={item.key} className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-lg"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base leading-snug" style={{ color: "var(--wrife-text-main)" }}>{item.text}</p>
                    <p className="text-sm mt-0.5" style={{ color: "var(--wrife-text-muted)" }}>Now</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Main DashboardContent ────────────────────────────────────────────────────
function DashboardContent() {
  const { user, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authChecked, setAuthChecked] = useState(false);

  const tabParam = searchParams?.get('tab') ?? null;
  const validTabs = ['overview', 'lessons', 'pwp', 'dwp', 'pupils', 'assignments', 'classes'] as const;
  type TabType = typeof validTabs[number];
  const initialTab: TabType = tabParam && (validTabs as readonly string[]).includes(tabParam)
    ? tabParam as TabType
    : 'overview';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  function handleTabChange(tab: string) {
    setActiveTab(tab as TabType);
    const params = new URLSearchParams(window.location.search);
    if (tab === 'overview') { params.delete('tab'); } else { params.set('tab', tab); }
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }

  useEffect(() => {
    if (tabParam && (validTabs as readonly string[]).includes(tabParam)) {
      setActiveTab(tabParam as TabType);
    }
  }, [tabParam]);

  const [classes, setClasses] = useState<ClassData[]>([]);
  const [pupils, setPupils] = useState<PupilData[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [activeAssignments, setActiveAssignments] = useState<ActiveAssignment[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalPupils: 0, totalClasses: 0, pendingReviews: 0, completedAssignments: 0 });
  const [dataLoading, setDataLoading] = useState(true);

  const [showAddPupilModal, setShowAddPupilModal] = useState(false);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [showClassSelectorModal, setShowClassSelectorModal] = useState(false);
  const [selectedClassForPupil, setSelectedClassForPupil] = useState<ClassData | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [newClassYearGroup, setNewClassYearGroup] = useState(4);
  const [classModalError, setClassModalError] = useState('');
  const [globalSuccess, setGlobalSuccess] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  const [upgradeDescription, setUpgradeDescription] = useState('');
  const [hasRefreshedProfile, setHasRefreshedProfile] = useState(false);

  const entitlements = useMemo(() => getEntitlements(user?.membership_tier, user?.school_tier), [user?.membership_tier, user?.school_tier]);

  function handleCreateClassClick() {
    if (entitlements.canManageClasses) { setShowCreateClassModal(true); }
    else { setUpgradeFeature('Create Class'); setUpgradeDescription('Organize your pupils into classes and track their progress together.'); setShowUpgradeModal(true); }
  }

  function handleAddPupilClick(preselectedClass?: ClassData) {
    if (!entitlements.canManageClasses) { setUpgradeFeature('Add Pupil'); setUpgradeDescription('Add pupils to your classes and assign them writing activities.'); setShowUpgradeModal(true); return; }
    if (preselectedClass) { setSelectedClassForPupil(preselectedClass); setShowAddPupilModal(true); }
    else if (classes.length === 1) { setSelectedClassForPupil(classes[0]); setShowAddPupilModal(true); }
    else if (classes.length > 1) { setShowClassSelectorModal(true); }
    else { setUpgradeFeature('Add Pupil'); setUpgradeDescription('Create a class first before adding pupils.'); setShowUpgradeModal(true); }
  }

  useEffect(() => {
    if (!loading && !authChecked) {
      setAuthChecked(true);
      if (!user) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session) router.push('/login?redirectTo=/dashboard');
        });
      } else if (user.role === 'pupil') {
        router.push('/pupil/dashboard');
      }
    }
  }, [user, loading, router, authChecked]);

  useEffect(() => {
    if (user && !hasRefreshedProfile) { setHasRefreshedProfile(true); refreshProfile(); }
  }, [user, hasRefreshedProfile, refreshProfile]);

  useEffect(() => { if (user) fetchAllData(); }, [user?.id]);

  async function fetchAllData() {
    if (!user) return;
    setDataLoading(true);
    try {
      const classesRes = await fetch('/api/classes');
      if (!classesRes.ok) { setClasses([]); setDataLoading(false); return; }
      const fetchedClasses: ClassData[] = (await classesRes.json()).classes || [];
      setClasses(fetchedClasses);

      let allPupils: PupilData[] = [];
      for (const cls of fetchedClasses) {
        const res = await fetch(`/api/classes/${cls.id}/pupils`);
        if (res.ok) {
          const json = await res.json();
          allPupils = [...allPupils, ...(json.pupils || []).map((p: any) => ({ id: p.id, first_name: p.first_name, last_name: p.last_name, year_group: p.year_group, class_id: cls.id, class_name: cls.name }))];
        }
      }
      setPupils(allPupils);

      let pending: PendingReview[] = [];
      let active: ActiveAssignment[] = [];
      let reviewedCount = 0;
      const assignmentsRes = await fetch('/api/teacher/assignments');
      if (assignmentsRes.ok) {
        for (const assignment of (await assignmentsRes.json()).assignments || []) {
          reviewedCount += Number(assignment.reviewed_count || 0);
          active.push({ id: assignment.id, title: assignment.title, class_name: assignment.class_name || 'Unknown', due_date: assignment.due_date, total_pupils: Number(assignment.total_pupils || 0), submitted_count: Number(assignment.submitted_count || 0), reviewed_count: Number(assignment.reviewed_count || 0) });
          for (const sub of (Array.isArray(assignment.pending_submissions) ? assignment.pending_submissions : [])) {
            pending.push({ id: sub.id, assignment_id: assignment.id, assignment_title: assignment.title, pupil_name: (sub.pupil_name || 'Unknown').trim(), submitted_at: sub.submitted_at || '' });
          }
        }
      }
      setPendingReviews(pending);
      setActiveAssignments(active);
      setStats({ totalPupils: allPupils.length, totalClasses: fetchedClasses.length, pendingReviews: pending.length, completedAssignments: reviewedCount });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setDataLoading(false);
    }
  }

  async function handleCreateClass(e: React.FormEvent) {
    e.preventDefault();
    if (!newClassName.trim()) return;
    setClassModalError('');
    try {
      const res = await fetch('/api/classes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newClassName.trim(), yearGroup: newClassYearGroup }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create class');
      setGlobalSuccess(`Class "${newClassName}" created with code: ${data.class?.class_code}`);
      setNewClassName(''); setNewClassYearGroup(4); setShowCreateClassModal(false);
      fetchAllData();
    } catch (err: any) { setClassModalError(err.message || 'Failed to create class'); }
  }

  async function handleRemovePupil(pupilId: string, classId: string) {
    if (!confirm('Are you sure you want to remove this pupil from the class?')) return;
    if (!classes.some(c => c.id === classId)) { alert('You do not have permission to modify this class'); return; }
    try {
      const res = await fetch(`/api/classes/${classId}/pupils/${pupilId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to remove pupil');
      fetchAllData();
    } catch (err) { alert('Failed to remove pupil'); }
  }

  async function handleDeleteClass(classId: string) {
    if (!user) return;
    const cls = classes.find(c => c.id === classId);
    if (!cls || !confirm(`Delete "${cls.name}"? This will remove all pupils and assignments.`)) return;
    try {
      const res = await fetch(`/api/classes/${classId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete class');
      fetchAllData();
    } catch (err: any) { alert('Failed to delete class: ' + err?.message); }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--wrife-bg)" }}>
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent" />
          <p className="mt-4 text-sm" style={{ color: "var(--wrife-text-muted)" }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardShell>

      {/* Global success banner */}
      {globalSuccess && (
        <div className="mx-6 mt-4 p-3 rounded-xl text-sm flex items-center justify-between" style={{ backgroundColor: "var(--wrife-green-soft)", color: "var(--wrife-green)", border: "1px solid var(--wrife-green)" }}>
          {globalSuccess}
          <button onClick={() => setGlobalSuccess('')} className="font-bold ml-4 hover:opacity-70">✕</button>
        </div>
      )}

      {dataLoading ? (
        <div className="p-6"><Spinner /></div>
      ) : (
        <>
          {/* ── Overview ── */}
          {activeTab === 'overview' && (
            <OverviewTab
              user={user}
              stats={stats}
              classes={classes}
              pupils={pupils}
              activeAssignments={activeAssignments}
              pendingReviews={pendingReviews}
              handleCreateClassClick={handleCreateClassClick}
              handleAddPupilClick={handleAddPupilClick}
              handleTabChange={handleTabChange}
              entitlements={entitlements}
            />
          )}

          {/* ── Lessons ── */}
          {activeTab === 'lessons' && (
            <div className="p-6">
              <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "var(--wrife-border)", boxShadow: "var(--shadow-card)" }}>
                <div className="p-6 border-b" style={{ borderColor: "var(--wrife-border)" }}>
                  <h2 className="text-lg font-bold" style={{ color: "var(--wrife-text-main)" }}>Lesson Library</h2>
                  <p className="text-sm" style={{ color: "var(--wrife-text-muted)" }}>Browse lessons and click any lesson to assign to your class</p>
                </div>
                <LessonLibrary />
              </div>
            </div>
          )}

          {/* ── PWP ── */}
          {activeTab === 'pwp' && (
            <div className="p-6 space-y-6">
              <div className="rounded-2xl p-6 border-2" style={{ background: "linear-gradient(to right, var(--wrife-teal-soft), #CCFBF1)", borderColor: "var(--wrife-teal)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: "var(--wrife-text-main)" }}>Progressive Writing Practice (PWP)</h2>
                    <p className="text-sm" style={{ color: "var(--wrife-text-muted)" }}>Formula-based sentence building with AI feedback</p>
                  </div>
                  <span className="text-4xl">📝</span>
                </div>
                <Link href="/dashboard/writing-practice" className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition mt-3" style={{ backgroundColor: "var(--wrife-teal)" }}>
                  Browse Full PWP Catalogue →
                </Link>
              </div>
              <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: "var(--wrife-border)", boxShadow: "var(--shadow-card)" }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: "var(--wrife-text-main)" }}>Quick Assign — Select a Class</h3>
                {classes.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classes.map((cls) => (
                      <Link key={cls.id} href={`/classes/${cls.id}?tab=pwp`}>
                        <div className="p-5 rounded-xl border-2 hover:shadow-md transition cursor-pointer" style={{ backgroundColor: "var(--wrife-teal-soft)", borderColor: "var(--wrife-teal)" }}>
                          <p className="font-bold text-lg" style={{ color: "var(--wrife-text-main)" }}>{cls.name}</p>
                          <p className="text-sm" style={{ color: "var(--wrife-text-muted)" }}>Year {cls.year_group}</p>
                          <p className="text-sm font-semibold mt-2" style={{ color: "var(--wrife-teal)" }}>Manage PWP →</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <span className="text-5xl mb-4 block">📚</span>
                    <p className="mb-4" style={{ color: "var(--wrife-text-muted)" }}>Create a class to start assigning PWP lessons</p>
                    <button onClick={handleCreateClassClick} className="rounded-full px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition" style={{ backgroundColor: "var(--wrife-teal)" }}>+ Create Class</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── DWP ── */}
          {activeTab === 'dwp' && (
            <div className="p-6 space-y-6">
              <div className="rounded-2xl p-6 border-2" style={{ background: "linear-gradient(to right, #EDE9FE, #DBEAFE)", borderColor: "#7C3AED" }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: "var(--wrife-text-main)" }}>Daily Writing Practice (DWP)</h2>
                    <p className="text-sm" style={{ color: "var(--wrife-text-muted)" }}>40-level progressive writing programme with AI assessment</p>
                  </div>
                  <span className="text-4xl">✍️</span>
                </div>
                <Link href="/dashboard/writing-practice" className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition mt-3" style={{ backgroundColor: "#7C3AED" }}>
                  Browse Full DWP Catalogue →
                </Link>
              </div>
              <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: "var(--wrife-border)", boxShadow: "var(--shadow-card)" }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: "var(--wrife-text-main)" }}>Quick Assign — Select a Class</h3>
                {classes.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classes.map((cls) => (
                      <Link key={cls.id} href={`/classes/${cls.id}?tab=dwp`}>
                        <div className="p-5 rounded-xl border-2 hover:shadow-md transition cursor-pointer" style={{ backgroundColor: "#EDE9FE", borderColor: "#7C3AED" }}>
                          <p className="font-bold text-lg" style={{ color: "var(--wrife-text-main)" }}>{cls.name}</p>
                          <p className="text-sm" style={{ color: "var(--wrife-text-muted)" }}>Year {cls.year_group}</p>
                          <p className="text-sm font-semibold mt-2" style={{ color: "#7C3AED" }}>Manage DWP →</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <span className="text-5xl mb-4 block">📚</span>
                    <p className="mb-4" style={{ color: "var(--wrife-text-muted)" }}>Create a class to start assigning DWP levels</p>
                    <button onClick={handleCreateClassClick} className="rounded-full px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition" style={{ backgroundColor: "#7C3AED" }}>+ Create Class</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Pupils ── */}
          {activeTab === 'pupils' && (
            <div className="p-6">
              <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: "var(--wrife-border)", boxShadow: "var(--shadow-card)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold" style={{ color: "var(--wrife-text-main)" }}>All Pupils</h2>
                  <button onClick={() => handleAddPupilClick()} className="rounded-full px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition" style={{ backgroundColor: "var(--wrife-blue)" }}>+ Add Pupil</button>
                </div>
                {pupils.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-5xl mb-4 block">👥</span>
                    <p style={{ color: "var(--wrife-text-muted)" }}>No pupils yet. Add pupils to your classes to get started.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--wrife-border)" }}>
                          {['Name', 'Class', 'Year', 'Actions'].map((h, i) => (
                            <th key={h} className={`py-3 px-2 text-sm font-semibold ${i === 3 ? 'text-right' : 'text-left'}`} style={{ color: "var(--wrife-text-muted)" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pupils.map((pupil) => (
                          <tr key={`${pupil.id}-${pupil.class_id}`} style={{ borderBottom: "1px solid var(--wrife-border)" }} className="hover:bg-[var(--wrife-bg)]">
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "var(--wrife-blue-soft)", color: "var(--wrife-blue)" }}>
                                  {pupil.first_name.charAt(0)}{pupil.last_name?.charAt(0) || ''}
                                </div>
                                <span className="font-semibold text-sm" style={{ color: "var(--wrife-text-main)" }}>{pupil.first_name} {pupil.last_name || ''}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-sm" style={{ color: "var(--wrife-text-muted)" }}>{pupil.class_name}</td>
                            <td className="py-3 px-2 text-sm" style={{ color: "var(--wrife-text-muted)" }}>Year {pupil.year_group}</td>
                            <td className="py-3 px-2 text-right">
                              <button onClick={() => handleRemovePupil(pupil.id, pupil.class_id)} className="text-sm hover:underline" style={{ color: "var(--wrife-danger)" }}>Remove</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Assignments ── */}
          {activeTab === 'assignments' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold" style={{ color: "var(--wrife-text-main)" }}>Active Assignments</h2>
                <button onClick={() => handleTabChange('lessons')} className="rounded-full px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition" style={{ backgroundColor: "var(--wrife-blue)" }}>+ Assign Lesson</button>
              </div>
              {activeAssignments.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border text-center" style={{ borderColor: "var(--wrife-border)", boxShadow: "var(--shadow-card)" }}>
                  <span className="text-5xl mb-4 block">📝</span>
                  <p className="mb-3" style={{ color: "var(--wrife-text-muted)" }}>No assignments yet.</p>
                  <button onClick={() => handleTabChange('lessons')} className="rounded-full px-6 py-2 text-sm font-semibold text-white hover:opacity-90 transition" style={{ backgroundColor: "var(--wrife-blue)" }}>Assign your first lesson</button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {activeAssignments.map((assignment) => {
                    const toReview = assignment.submitted_count - assignment.reviewed_count;
                    const pct = assignment.total_pupils > 0 ? Math.round((assignment.submitted_count / assignment.total_pupils) * 100) : 0;
                    const dueDate = assignment.due_date ? new Date(assignment.due_date) : null;
                    const isOverdue = dueDate && dueDate < new Date();
                    return (
                      <div key={assignment.id} className="bg-white rounded-2xl border p-5 flex flex-col" style={{ borderColor: "var(--wrife-border)", boxShadow: "var(--shadow-card)" }}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0 mr-3">
                            <h3 className="font-bold" style={{ color: "var(--wrife-text-main)" }}>{assignment.title}</h3>
                            <p className="text-xs mt-0.5" style={{ color: "var(--wrife-text-muted)" }}>{assignment.class_name}</p>
                          </div>
                          {dueDate && (
                            <span className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-lg ${isOverdue ? 'bg-red-100 text-red-600' : 'text-[var(--wrife-text-muted)]'}`} style={!isOverdue ? { backgroundColor: "var(--wrife-bg)" } : {}}>
                              {isOverdue ? 'Overdue ' : 'Due '}{dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1" style={{ color: "var(--wrife-text-muted)" }}>
                            <span>{assignment.submitted_count} of {assignment.total_pupils} submitted</span>
                            <span>{assignment.reviewed_count} reviewed</span>
                          </div>
                          <div className="w-full rounded-full h-2" style={{ backgroundColor: "var(--wrife-border)" }}>
                            <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: "var(--wrife-blue)" }} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                          {toReview > 0 ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: "var(--wrife-yellow-soft)", color: "#B45309" }}>{toReview} to review</span>
                          ) : assignment.reviewed_count > 0 ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: "var(--wrife-green-soft)", color: "var(--wrife-green)" }}>All reviewed ✓</span>
                          ) : (
                            <span className="text-xs" style={{ color: "var(--wrife-text-muted)" }}>Awaiting submissions</span>
                          )}
                          <Link href={`/assignments/${assignment.id}/review`} className="rounded-full px-4 py-2 text-xs font-bold text-white hover:opacity-90 transition" style={{ backgroundColor: "var(--wrife-blue)" }}>
                            Review →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Classes ── */}
          {activeTab === 'classes' && (
            <div className="p-6">
              <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: "var(--wrife-border)", boxShadow: "var(--shadow-card)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold" style={{ color: "var(--wrife-text-main)" }}>My Classes</h2>
                  <button onClick={handleCreateClassClick} className="rounded-full px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition" style={{ backgroundColor: "var(--wrife-blue)" }}>+ Create Class</button>
                </div>
                {classes.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-5xl mb-4 block">📚</span>
                    <p style={{ color: "var(--wrife-text-muted)" }}>No classes yet. Create your first class to get started.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classes.map((cls, idx) => {
                      const palette = CLASS_PALETTE[idx % CLASS_PALETTE.length];
                      const classPupils = pupils.filter(p => p.class_id === cls.id);
                      return (
                        <div key={cls.id} className="p-4 rounded-xl border hover:shadow-md transition" style={{ borderColor: "var(--wrife-border)" }}>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-bold" style={{ color: "var(--wrife-text-main)" }}>{cls.name}</h3>
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: palette.bg, color: palette.text }}>Year {cls.year_group}</span>
                            </div>
                            <button onClick={() => handleDeleteClass(cls.id)} className="text-xs font-semibold px-2 py-1 rounded hover:bg-red-50 transition" style={{ color: "var(--wrife-danger)" }}>Delete</button>
                          </div>
                          <p className="text-xs mb-1" style={{ color: "var(--wrife-text-muted)" }}>Class Code</p>
                          <p className="font-mono font-bold mb-3" style={{ color: "var(--wrife-blue)" }}>{cls.class_code}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: "var(--wrife-text-muted)" }}>{classPupils.length} pupils</span>
                            <Link href={`/classes/${cls.id}`} className="text-sm font-semibold hover:underline" style={{ color: "var(--wrife-blue)" }}>Manage</Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Modals ── */}
      {showCreateClassModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4" style={{ color: "var(--wrife-text-main)" }}>Create New Class</h2>
            <form onSubmit={handleCreateClass}>
              {classModalError && <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: "var(--wrife-coral-soft)", color: "var(--wrife-danger)", border: "1px solid var(--wrife-coral)" }}>{classModalError}</div>}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1" style={{ color: "var(--wrife-text-main)" }}>Class Name</label>
                <input type="text" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="e.g., Year 4 Maple" className="w-full px-4 py-2 rounded-lg focus:outline-none" style={{ border: "1px solid var(--wrife-border)" }} required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1" style={{ color: "var(--wrife-text-main)" }}>Year Group</label>
                <select value={newClassYearGroup} onChange={(e) => setNewClassYearGroup(parseInt(e.target.value))} className="w-full px-4 py-2 rounded-lg focus:outline-none" style={{ border: "1px solid var(--wrife-border)" }}>
                  {[2, 3, 4, 5, 6].map((year) => <option key={year} value={year}>Year {year}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowCreateClassModal(false); setClassModalError(''); }} className="flex-1 px-4 py-2 rounded-full font-semibold border hover:bg-gray-50" style={{ borderColor: "var(--wrife-border)", color: "var(--wrife-text-muted)" }}>Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-full font-semibold text-white hover:opacity-90" style={{ backgroundColor: "var(--wrife-blue)" }}>Create Class</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showClassSelectorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--wrife-text-main)" }}>Select a Class</h2>
            <p className="text-sm mb-4" style={{ color: "var(--wrife-text-muted)" }}>Choose which class to add a pupil to:</p>
            <div className="space-y-2">
              {classes.map((cls) => (
                <button key={cls.id} onClick={() => { setSelectedClassForPupil(cls); setShowClassSelectorModal(false); setShowAddPupilModal(true); }} className="w-full text-left px-4 py-3 rounded-xl border hover:border-[var(--wrife-blue)] hover:bg-[var(--wrife-blue-soft)] transition" style={{ borderColor: "var(--wrife-border)" }}>
                  <p className="font-semibold" style={{ color: "var(--wrife-text-main)" }}>{cls.name}</p>
                  <p className="text-xs" style={{ color: "var(--wrife-text-muted)" }}>Year {cls.year_group} · Code: {cls.class_code}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setShowClassSelectorModal(false)} className="mt-4 w-full px-4 py-2 rounded-full border font-semibold hover:bg-gray-50" style={{ borderColor: "var(--wrife-border)", color: "var(--wrife-text-muted)" }}>Cancel</button>
          </div>
        </div>
      )}

      {showAddPupilModal && selectedClassForPupil && (
        <AddPupilModal
          classId={String(selectedClassForPupil.id)}
          classCode={selectedClassForPupil.class_code}
          className={selectedClassForPupil.name}
          onClose={() => { setShowAddPupilModal(false); setSelectedClassForPupil(null); }}
          onSuccess={() => { fetchAllData(); setGlobalSuccess(`Pupil added to ${selectedClassForPupil.name}`); }}
        />
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={upgradeFeature}
        description={upgradeDescription}
      />

    </DashboardShell>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--wrife-bg)" }}>
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent" />
          <p className="mt-4 text-sm" style={{ color: "var(--wrife-text-muted)" }}>Loading dashboard…</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
