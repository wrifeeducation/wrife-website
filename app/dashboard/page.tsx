"use client";

import { Suspense, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from "../../components/Navbar";
import { supabase } from '@/lib/supabase';
import dynamicImport from 'next/dynamic';
import { getEntitlements } from '@/lib/entitlements';
import UpgradeModal from '@/components/UpgradeModal';

const LessonLibrary = dynamicImport(() => import('@/components/LessonLibrary'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center py-12">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent"></div>
    </div>
  ),
});

interface ClassData {
  id: string;
  name: string;
  year_group: number;
  class_code: string;
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

function BandBadge({ score }: { score: number }) {
  const bands = [
    { label: 'Emerging', bg: 'bg-red-100', text: 'text-red-700' },
    { label: 'Developing', bg: 'bg-yellow-100', text: 'text-yellow-700' },
    { label: 'Secure', bg: 'bg-green-100', text: 'text-green-700' },
    { label: 'Greater Depth', bg: 'bg-blue-100', text: 'text-blue-700' },
  ];
  const band = bands[Math.min(score - 1, 3)] || bands[0];
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${band.bg} ${band.text}`}>
      {band.label}
    </span>
  );
}

function DashboardContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authChecked, setAuthChecked] = useState(false);
  
  const tabParam = searchParams?.get('tab') ?? null;
  const initialTab = tabParam && ['overview', 'lessons', 'pwp', 'dwp', 'pupils', 'assignments', 'classes'].includes(tabParam) 
    ? tabParam as 'overview' | 'lessons' | 'pwp' | 'dwp' | 'pupils' | 'assignments' | 'classes'
    : 'overview';
  const [activeTab, setActiveTab] = useState<'overview' | 'lessons' | 'pwp' | 'dwp' | 'pupils' | 'assignments' | 'classes'>(initialTab);
  
  function handleTabChange(tab: typeof activeTab) {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    if (tab === 'overview') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }
  
  useEffect(() => {
    if (tabParam && ['overview', 'lessons', 'pwp', 'dwp', 'pupils', 'assignments', 'classes'].includes(tabParam)) {
      setActiveTab(tabParam as typeof activeTab);
    }
  }, [tabParam]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [pupils, setPupils] = useState<PupilData[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [activeAssignments, setActiveAssignments] = useState<ActiveAssignment[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalPupils: 0,
    totalClasses: 0,
    pendingReviews: 0,
    completedAssignments: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);
  
  const [showAddPupilModal, setShowAddPupilModal] = useState(false);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [selectedClassForPupil, setSelectedClassForPupil] = useState<string | null>(null);
  
  const [newPupilFirstName, setNewPupilFirstName] = useState('');
  const [newPupilLastName, setNewPupilLastName] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [newClassYearGroup, setNewClassYearGroup] = useState(4);
  
  const [classModalError, setClassModalError] = useState('');
  const [pupilModalError, setPupilModalError] = useState('');
  const [globalSuccess, setGlobalSuccess] = useState('');
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  const [upgradeDescription, setUpgradeDescription] = useState('');

  const entitlements = useMemo(() => {
    return getEntitlements(user?.membership_tier, user?.school_tier);
  }, [user?.membership_tier, user?.school_tier]);

  function handleCreateClassClick() {
    if (entitlements.canManageClasses) {
      setShowCreateClassModal(true);
    } else {
      setUpgradeFeature('Create Class');
      setUpgradeDescription('Organize your pupils into classes and track their progress together.');
      setShowUpgradeModal(true);
    }
  }

  function handleAddPupilClick() {
    if (entitlements.canManageClasses) {
      setShowAddPupilModal(true);
    } else {
      setUpgradeFeature('Add Pupil');
      setUpgradeDescription('Add pupils to your classes and assign them writing activities.');
      setShowUpgradeModal(true);
    }
  }

  useEffect(() => {
    console.log('[Dashboard] Auth state:', { loading, user: user?.id, authChecked });
    
    if (!loading && !authChecked) {
      setAuthChecked(true);
      
      if (!user) {
        console.log('[Dashboard] No user after auth loaded, checking session directly...');
        supabase.auth.getSession().then(({ data: { session } }) => {
          console.log('[Dashboard] Direct session check:', session ? `User: ${session.user.id}` : 'No session');
          if (!session) {
            console.log('[Dashboard] Confirmed no session, redirecting to login');
            router.push('/login?redirectTo=/dashboard');
          }
        });
      } else if (user.role === 'pupil') {
        console.log('[Dashboard] User is pupil, redirecting to pupil dashboard');
        router.push('/pupil/dashboard');
      } else {
        console.log('[Dashboard] User authenticated:', user.role);
      }
    }
  }, [user, loading, router, authChecked]);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  async function fetchAllData() {
    if (!user) return;
    setDataLoading(true);

    try {
      console.log('Fetching classes for user:', user.id);
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user.id)
        .order('name');

      console.log('Classes query result:', { classesData, classesError });
      if (classesError) {
        console.error('Error fetching classes:', classesError);
      }

      setClasses(classesData || []);
      const classIds = classesData?.map(c => c.id) || [];

      let allPupils: PupilData[] = [];
      if (classIds.length > 0) {
        const { data: membersData, error: membersError } = await supabase
          .from('class_members')
          .select('class_id, pupil_id, pupils(id, first_name, last_name, year_group)')
          .in('class_id', classIds);
        
        console.log('Members query result:', { membersData, membersError });

        if (membersData) {
          const classMap = new Map(classesData?.map(c => [c.id, c.name]) || []);
          allPupils = membersData.map((m: any) => {
            const pupilData = Array.isArray(m.pupils) ? m.pupils[0] : m.pupils;
            return {
              id: pupilData?.id || m.pupil_id,
              first_name: pupilData?.first_name || 'Unknown',
              last_name: pupilData?.last_name || null,
              year_group: pupilData?.year_group || 4,
              class_id: m.class_id,
              class_name: classMap.get(m.class_id) || 'Unknown Class',
            };
          });
        }
      }
      setPupils(allPupils);

      let pending: PendingReview[] = [];
      let active: ActiveAssignment[] = [];
      let reviewedCount = 0;

      if (classIds.length > 0) {
        const { data: assignments } = await supabase
          .from('assignments')
          .select('id, title, class_id, due_date')
          .in('class_id', classIds)
          .order('due_date', { ascending: true });

        if (assignments && assignments.length > 0) {
          const classMap = new Map(classesData?.map(c => [c.id, { name: c.name, pupils: 0 }]) || []);
          
          const { data: memberCounts } = await supabase
            .from('class_members')
            .select('class_id')
            .in('class_id', classIds);
          
          if (memberCounts) {
            memberCounts.forEach((m: any) => {
              const classInfo = classMap.get(m.class_id);
              if (classInfo) classInfo.pupils++;
            });
          }

          for (const assignment of assignments) {
            const { data: submissions } = await supabase
              .from('submissions')
              .select('id, pupil_id, status, submitted_at')
              .eq('assignment_id', assignment.id);

            const classInfo = classMap.get(assignment.class_id);
            const submittedSubs = submissions?.filter(s => s.status === 'submitted') || [];
            const reviewedSubs = submissions?.filter(s => s.status === 'reviewed') || [];
            reviewedCount += reviewedSubs.length;

            active.push({
              id: assignment.id,
              title: assignment.title,
              class_name: classInfo?.name || 'Unknown',
              due_date: assignment.due_date,
              total_pupils: classInfo?.pupils || 0,
              submitted_count: submittedSubs.length + reviewedSubs.length,
              reviewed_count: reviewedSubs.length,
            });

            for (const sub of submittedSubs) {
              const { data: pupil } = await supabase
                .from('pupils')
                .select('first_name, last_name')
                .eq('id', sub.pupil_id)
                .single();

              const pupilName = pupil
                ? `${pupil.first_name} ${pupil.last_name || ''}`.trim()
                : 'Unknown';

              pending.push({
                id: sub.id,
                assignment_id: assignment.id,
                assignment_title: assignment.title,
                pupil_name: pupilName,
                submitted_at: sub.submitted_at || '',
              });
            }
          }
        }
      }

      setPendingReviews(pending);
      setActiveAssignments(active);
      setStats({
        totalPupils: allPupils.length,
        totalClasses: classIds.length,
        pendingReviews: pending.length,
        completedAssignments: reviewedCount,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setDataLoading(false);
    }
  }

  async function handleCreateClass(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newClassName.trim()) return;
    setClassModalError('');

    try {
      const classCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { error } = await supabase
        .from('classes')
        .insert({
          teacher_id: user.id,
          name: newClassName.trim(),
          year_group: newClassYearGroup,
          class_code: classCode,
        });

      if (error) throw error;

      setGlobalSuccess(`Class "${newClassName}" created with code: ${classCode}`);
      setNewClassName('');
      setNewClassYearGroup(4);
      setShowCreateClassModal(false);
      fetchAllData();
    } catch (err: any) {
      setClassModalError(err.message || 'Failed to create class');
    }
  }

  async function handleAddPupil(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newPupilFirstName.trim() || !selectedClassForPupil) return;
    setPupilModalError('');

    const selectedClass = classes.find(c => c.id === selectedClassForPupil);
    if (!selectedClass) {
      setPupilModalError('Invalid class selected');
      return;
    }

    try {
      const firstName = newPupilFirstName.trim();
      const lastName = newPupilLastName.trim();
      const randomId = Math.random().toString(36).substring(2, 8);
      const pupilId = crypto.randomUUID();

      const { error: pupilError } = await supabase
        .from('pupils')
        .insert({
          id: pupilId,
          first_name: firstName,
          last_name: lastName || null,
          display_name: `${firstName} ${lastName}`.trim(),
          year_group: selectedClass.year_group,
        });

      if (pupilError) throw pupilError;

      const { error: memberError } = await supabase
        .from('class_members')
        .insert({
          class_id: selectedClassForPupil,
          pupil_id: pupilId,
        });

      if (memberError) throw memberError;

      setGlobalSuccess(`${newPupilFirstName} added to ${selectedClass.name}`);
      setNewPupilFirstName('');
      setNewPupilLastName('');
      setShowAddPupilModal(false);
      setSelectedClassForPupil(null);
      fetchAllData();
    } catch (err: any) {
      setPupilModalError(err.message || 'Failed to add pupil');
    }
  }

  async function handleRemovePupil(pupilId: string, classId: string) {
    if (!user) return;
    if (!confirm('Are you sure you want to remove this pupil from the class?')) return;

    const ownsClass = classes.some(c => c.id === classId);
    if (!ownsClass) {
      alert('You do not have permission to modify this class');
      return;
    }

    try {
      const { error } = await supabase
        .from('class_members')
        .delete()
        .eq('class_id', classId)
        .eq('pupil_id', pupilId);

      if (error) throw error;
      fetchAllData();
    } catch (err) {
      console.error('Error removing pupil:', err);
      alert('Failed to remove pupil');
    }
  }

  async function handleDeleteClass(classId: string) {
    if (!user) return;
    const classToDelete = classes.find(c => c.id === classId);
    if (!classToDelete) {
      alert('Class not found or you do not have permission');
      return;
    }
    if (!confirm(`Are you sure you want to delete "${classToDelete.name}"? This will remove all pupils and assignments.`)) return;

    try {
      console.log('Attempting to delete class:', classId);
      const { error, data } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId)
        .eq('teacher_id', user.id)
        .select();

      console.log('Delete result:', { error, data });
      if (error) throw error;
      fetchAllData();
    } catch (err) {
      console.error('Error deleting class:', err);
      alert('Failed to delete class: ' + (err as any)?.message);
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--wrife-bg)]">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--wrife-text-main)]">
              Welcome, {user.display_name || 'Teacher'}
            </h1>
            <p className="text-sm text-[var(--wrife-text-muted)]">
              Manage your classes, pupils, and assignments
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreateClassClick}
              className="rounded-full bg-[var(--wrife-blue)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
            >
              + New Class
            </button>
            <button
              onClick={handleAddPupilClick}
              className="rounded-full bg-[var(--wrife-yellow)] px-4 py-2 text-sm font-bold text-[var(--wrife-text-main)] hover:opacity-90 transition"
            >
              + Add Pupil
            </button>
          </div>
        </header>

        {globalSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
            {globalSuccess}
            <button onClick={() => setGlobalSuccess('')} className="float-right font-bold">x</button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-[var(--wrife-border)] shadow-sm">
            <p className="text-2xl font-bold text-[var(--wrife-blue)]">{stats.totalClasses}</p>
            <p className="text-xs text-[var(--wrife-text-muted)]">Classes</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-[var(--wrife-border)] shadow-sm">
            <p className="text-2xl font-bold text-[var(--wrife-text-main)]">{stats.totalPupils}</p>
            <p className="text-xs text-[var(--wrife-text-muted)]">Pupils</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-[var(--wrife-border)] shadow-sm">
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingReviews}</p>
            <p className="text-xs text-[var(--wrife-text-muted)]">Pending Reviews</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-[var(--wrife-border)] shadow-sm">
            <p className="text-2xl font-bold text-green-600">{stats.completedAssignments}</p>
            <p className="text-xs text-[var(--wrife-text-muted)]">Reviewed</p>
          </div>
        </div>

        <nav className="flex gap-1 mb-6 border-b border-[var(--wrife-border)] overflow-x-auto bg-[var(--wrife-bg)]">
          {(['overview', 'lessons', 'pwp', 'dwp', 'pupils', 'assignments', 'classes'] as const).map((tab) => (
            <Link
              key={tab}
              href={tab === 'overview' ? '/dashboard' : `/dashboard?tab=${tab}`}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 -mb-px ${
                activeTab === tab
                  ? tab === 'pwp' ? 'border-green-500 text-green-600 bg-green-50'
                  : tab === 'dwp' ? 'border-purple-500 text-purple-600 bg-purple-50'
                  : 'border-[var(--wrife-blue)] text-[var(--wrife-blue)] bg-white'
                  : 'border-transparent text-[var(--wrife-text-muted)] hover:text-[var(--wrife-text-main)] hover:bg-white/50'
              }`}
            >
              {tab === 'overview' && 'Overview'}
              {tab === 'lessons' && 'Lessons'}
              {tab === 'pwp' && '📝 PWP'}
              {tab === 'dwp' && '✍️ DWP'}
              {tab === 'pupils' && `My Pupils (${stats.totalPupils})`}
              {tab === 'assignments' && `Assignments (${activeAssignments.length})`}
              {tab === 'classes' && `Classes (${stats.totalClasses})`}
            </Link>
          ))}
        </nav>

        {/* Membership Status Banner */}
        {user && entitlements.tier === 'free' && (
          <div className="mb-6 bg-gradient-to-r from-[var(--wrife-yellow)]/20 to-[var(--wrife-orange)]/20 border border-[var(--wrife-yellow)] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✨</span>
              <div>
                <p className="font-bold text-[var(--wrife-text-main)]">
                  You&apos;re on the Free Plan
                </p>
                <p className="text-sm text-[var(--wrife-text-muted)]">
                  Upgrade to access all lesson materials, class management, and AI-powered assessment
                </p>
              </div>
            </div>
            <Link
              href="/pricing"
              className="shrink-0 px-6 py-2 bg-[var(--wrife-blue)] text-white font-semibold rounded-full hover:opacity-90 transition"
            >
              View Plans
            </Link>
          </div>
        )}

        {user && (entitlements.tier === 'standard' || entitlements.tier === 'full' || entitlements.tier === 'school') && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{entitlements.tier === 'full' || entitlements.tier === 'school' ? '🌟' : '⭐'}</span>
              <div>
                <p className="font-bold text-[var(--wrife-text-main)]">
                  {entitlements.tier === 'school' ? 'School License' : entitlements.tier === 'full' ? 'Full Teacher' : 'Standard Teacher'} Plan
                </p>
                <p className="text-sm text-[var(--wrife-text-muted)]">
                  {entitlements.tier === 'full' || entitlements.tier === 'school'
                    ? 'You have full access to all features' 
                    : 'You have access to all lesson materials'}
                </p>
              </div>
            </div>
            <Link
              href="/pricing"
              className="shrink-0 px-6 py-2 border border-[var(--wrife-border)] text-[var(--wrife-text-muted)] font-semibold rounded-full hover:bg-white transition"
            >
              Manage Plan
            </Link>
          </div>
        )}

        {dataLoading ? (
          <div className="flex justify-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent"></div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-[var(--wrife-border)] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">
                      Pending Reviews ({pendingReviews.length})
                    </h2>
                  </div>
                  {pendingReviews.length === 0 ? (
                    <p className="text-sm text-[var(--wrife-text-muted)] py-4 text-center">
                      No submissions waiting for review
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {pendingReviews.slice(0, 10).map((review) => (
                        <Link
                          key={review.id}
                          href={`/assignments/${review.assignment_id}/review`}
                          className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 transition"
                        >
                          <div>
                            <p className="font-semibold text-sm text-[var(--wrife-text-main)]">{review.pupil_name}</p>
                            <p className="text-xs text-[var(--wrife-text-muted)]">{review.assignment_title}</p>
                          </div>
                          <span className="text-xs text-yellow-600 font-semibold">Review</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl p-6 border border-[var(--wrife-border)] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">Upcoming Due Dates</h2>
                  </div>
                  {activeAssignments.filter(a => a.due_date).length === 0 ? (
                    <p className="text-sm text-[var(--wrife-text-muted)] py-4 text-center">
                      No upcoming deadlines
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {activeAssignments
                        .filter(a => a.due_date)
                        .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
                        .slice(0, 5)
                        .map((assignment) => {
                          const dueDate = new Date(assignment.due_date!);
                          const isOverdue = dueDate < new Date();
                          const isDueSoon = !isOverdue && dueDate.getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;
                          return (
                            <div
                              key={assignment.id}
                              className={`p-3 rounded-lg border ${
                                isOverdue ? 'bg-red-50 border-red-200' :
                                isDueSoon ? 'bg-yellow-50 border-yellow-200' :
                                'bg-[var(--wrife-bg)] border-[var(--wrife-border)]'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-semibold text-sm text-[var(--wrife-text-main)]">{assignment.title}</p>
                                  <p className="text-xs text-[var(--wrife-text-muted)]">{assignment.class_name}</p>
                                </div>
                                <span className={`text-xs font-semibold ${isOverdue ? 'text-red-600' : isDueSoon ? 'text-yellow-600' : 'text-[var(--wrife-text-muted)]'}`}>
                                  {dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6 border-2 border-green-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">Progressive Writing Practice (PWP)</h2>
                      <p className="text-sm text-[var(--wrife-text-muted)]">Formula-based sentence building with AI feedback</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {classes.length > 0 ? (
                      classes.map((cls) => (
                        <Link key={cls.id} href={`/classes/${cls.id}?tab=pwp`}>
                          <div className="p-4 rounded-xl bg-white border border-green-200 hover:border-green-400 hover:shadow-md transition cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-[var(--wrife-text-main)]">{cls.name}</p>
                                <p className="text-xs text-[var(--wrife-text-muted)]">Year {cls.year_group}</p>
                              </div>
                              <span className="text-2xl">📝</span>
                            </div>
                            <p className="mt-2 text-xs text-green-600 font-medium">Assign PWP Lessons →</p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="sm:col-span-2 text-center py-6">
                        <p className="text-[var(--wrife-text-muted)] text-sm">Create a class first to assign PWP lessons</p>
                        <button onClick={handleCreateClassClick} className="mt-2 text-green-600 font-semibold text-sm hover:underline">
                          + Create Class
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">Daily Writing Practice (DWP)</h2>
                      <p className="text-sm text-[var(--wrife-text-muted)]">40-level progressive writing programme with AI assessment</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {classes.length > 0 ? (
                      classes.map((cls) => (
                        <Link key={cls.id} href={`/classes/${cls.id}?tab=dwp`}>
                          <div className="p-4 rounded-xl bg-white border border-purple-200 hover:border-purple-400 hover:shadow-md transition cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-[var(--wrife-text-main)]">{cls.name}</p>
                                <p className="text-xs text-[var(--wrife-text-muted)]">Year {cls.year_group}</p>
                              </div>
                              <span className="text-2xl">✍️</span>
                            </div>
                            <p className="mt-2 text-xs text-purple-600 font-medium">Assign DWP Levels →</p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="sm:col-span-2 text-center py-6">
                        <p className="text-[var(--wrife-text-muted)] text-sm">Create a class first to assign DWP levels</p>
                        <button onClick={handleCreateClassClick} className="mt-2 text-purple-600 font-semibold text-sm hover:underline">
                          + Create Class
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[var(--wrife-border)] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">Quick Actions</h2>
                  </div>
                  <div className="grid sm:grid-cols-4 gap-3">
                    <button onClick={() => handleTabChange('lessons')} className="p-4 rounded-xl border-2 border-[var(--wrife-blue)] bg-[var(--wrife-blue-soft)] hover:opacity-90 transition text-center">
                      <span className="text-2xl mb-2 block">📝</span>
                      <p className="font-semibold text-sm text-[var(--wrife-blue)]">Assign a Lesson</p>
                    </button>
                    <button onClick={handleCreateClassClick} className="p-4 rounded-xl border border-[var(--wrife-border)] hover:bg-gray-50 transition text-center">
                      <span className="text-2xl mb-2 block">➕</span>
                      <p className="font-semibold text-sm text-[var(--wrife-text-main)]">Create Class</p>
                    </button>
                    <button onClick={handleAddPupilClick} className="p-4 rounded-xl border border-[var(--wrife-border)] hover:bg-gray-50 transition text-center">
                      <span className="text-2xl mb-2 block">👤</span>
                      <p className="font-semibold text-sm text-[var(--wrife-text-main)]">Add Pupil</p>
                    </button>
                    <Link href="/dashboard/help">
                      <div className="p-4 rounded-xl border border-[var(--wrife-border)] hover:bg-gray-50 transition text-center">
                        <span className="text-2xl mb-2 block">❓</span>
                        <p className="font-semibold text-sm text-[var(--wrife-text-main)]">Help Guide</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'lessons' && (
              <div className="bg-white rounded-2xl border border-[var(--wrife-border)] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[var(--wrife-border)]">
                  <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">Lesson Library</h2>
                  <p className="text-sm text-[var(--wrife-text-muted)]">Browse lessons and click on any lesson to view details and assign to your class</p>
                </div>
                <LessonLibrary />
              </div>
            )}

            {activeTab === 'pwp' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6 border-2 border-green-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-xl font-bold text-[var(--wrife-text-main)]">Progressive Writing Practice (PWP)</h2>
                      <p className="text-sm text-[var(--wrife-text-muted)]">Formula-based sentence building with AI feedback</p>
                    </div>
                    <span className="text-4xl">📝</span>
                  </div>
                  <p className="text-sm text-green-700 mb-4">
                    PWP helps pupils build sentences using word formulas. Each lesson focuses on different parts of speech.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-[var(--wrife-border)] shadow-sm">
                  <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-4">Select a Class to Assign PWP</h3>
                  {classes.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {classes.map((cls) => (
                        <Link key={cls.id} href={`/classes/${cls.id}?tab=pwp`}>
                          <div className="p-5 rounded-xl bg-green-50 border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-bold text-lg text-[var(--wrife-text-main)]">{cls.name}</p>
                                <p className="text-sm text-[var(--wrife-text-muted)]">Year {cls.year_group}</p>
                              </div>
                              <span className="text-3xl">📝</span>
                            </div>
                            <p className="text-sm text-green-600 font-semibold">Assign PWP Lessons →</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <span className="text-5xl mb-4 block">📚</span>
                      <p className="text-[var(--wrife-text-muted)] mb-4">Create a class first to assign PWP lessons</p>
                      <button onClick={handleCreateClassClick} className="rounded-full bg-green-500 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition">
                        + Create Class
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'dwp' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-xl font-bold text-[var(--wrife-text-main)]">Daily Writing Practice (DWP)</h2>
                      <p className="text-sm text-[var(--wrife-text-muted)]">40-level progressive writing programme with AI assessment</p>
                    </div>
                    <span className="text-4xl">✍️</span>
                  </div>
                  <p className="text-sm text-purple-700 mb-4">
                    DWP guides pupils through 40 carefully structured levels, from word sorting to extended writing with AI-powered feedback.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-[var(--wrife-border)] shadow-sm">
                  <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-4">Select a Class to Assign DWP Levels</h3>
                  {classes.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {classes.map((cls) => (
                        <Link key={cls.id} href={`/classes/${cls.id}?tab=dwp`}>
                          <div className="p-5 rounded-xl bg-purple-50 border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-bold text-lg text-[var(--wrife-text-main)]">{cls.name}</p>
                                <p className="text-sm text-[var(--wrife-text-muted)]">Year {cls.year_group}</p>
                              </div>
                              <span className="text-3xl">✍️</span>
                            </div>
                            <p className="text-sm text-purple-600 font-semibold">Assign DWP Levels →</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <span className="text-5xl mb-4 block">📚</span>
                      <p className="text-[var(--wrife-text-muted)] mb-4">Create a class first to assign DWP levels</p>
                      <button onClick={handleCreateClassClick} className="rounded-full bg-purple-500 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition">
                        + Create Class
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'pupils' && (
              <div className="bg-white rounded-2xl p-6 border border-[var(--wrife-border)] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">All Pupils</h2>
                  <button
                    onClick={handleAddPupilClick}
                    className="rounded-full bg-[var(--wrife-blue)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
                  >
                    + Add Pupil
                  </button>
                </div>
                {pupils.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-5xl mb-4 block">👥</span>
                    <p className="text-[var(--wrife-text-muted)]">No pupils yet. Add pupils to your classes to get started.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[var(--wrife-border)]">
                          <th className="text-left py-3 px-2 text-sm font-semibold text-[var(--wrife-text-muted)]">Name</th>
                          <th className="text-left py-3 px-2 text-sm font-semibold text-[var(--wrife-text-muted)]">Class</th>
                          <th className="text-left py-3 px-2 text-sm font-semibold text-[var(--wrife-text-muted)]">Year</th>
                          <th className="text-right py-3 px-2 text-sm font-semibold text-[var(--wrife-text-muted)]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pupils.map((pupil) => (
                          <tr key={`${pupil.id}-${pupil.class_id}`} className="border-b border-[var(--wrife-border)] hover:bg-[var(--wrife-bg)]">
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-[var(--wrife-blue-soft)] flex items-center justify-center text-xs font-bold text-[var(--wrife-blue)]">
                                  {pupil.first_name.charAt(0)}{pupil.last_name?.charAt(0) || ''}
                                </div>
                                <span className="font-semibold text-sm text-[var(--wrife-text-main)]">
                                  {pupil.first_name} {pupil.last_name || ''}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-sm text-[var(--wrife-text-muted)]">{pupil.class_name}</td>
                            <td className="py-3 px-2 text-sm text-[var(--wrife-text-muted)]">Year {pupil.year_group}</td>
                            <td className="py-3 px-2 text-right">
                              <button
                                onClick={() => handleRemovePupil(pupil.id, pupil.class_id)}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="bg-white rounded-2xl p-6 border border-[var(--wrife-border)] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">Active Assignments</h2>
                  <button onClick={() => handleTabChange('lessons')} className="text-sm text-[var(--wrife-blue)] font-semibold hover:underline">
                    Assign New Lesson
                  </button>
                </div>
                {activeAssignments.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-5xl mb-4 block">📝</span>
                    <p className="text-[var(--wrife-text-muted)]">No assignments yet. Assign lessons from the library.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeAssignments.map((assignment) => (
                      <Link
                        key={assignment.id}
                        href={`/assignments/${assignment.id}/review`}
                        className="block p-4 rounded-xl border border-[var(--wrife-border)] hover:bg-[var(--wrife-bg)] transition"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-[var(--wrife-text-main)]">{assignment.title}</h3>
                            <p className="text-xs text-[var(--wrife-text-muted)]">{assignment.class_name}</p>
                          </div>
                          {assignment.due_date && (
                            <span className="text-xs text-[var(--wrife-text-muted)]">
                              Due: {new Date(assignment.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-[var(--wrife-blue)] h-2 rounded-full transition-all"
                              style={{ width: `${assignment.total_pupils > 0 ? (assignment.submitted_count / assignment.total_pupils) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-[var(--wrife-text-muted)]">
                            {assignment.submitted_count}/{assignment.total_pupils} submitted
                          </span>
                          {assignment.submitted_count - assignment.reviewed_count > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                              {assignment.submitted_count - assignment.reviewed_count} to review
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'classes' && (
              <div className="bg-white rounded-2xl p-6 border border-[var(--wrife-border)] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">My Classes</h2>
                  <button
                    onClick={handleCreateClassClick}
                    className="rounded-full bg-[var(--wrife-blue)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
                  >
                    + Create Class
                  </button>
                </div>
                {classes.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-5xl mb-4 block">📚</span>
                    <p className="text-[var(--wrife-text-muted)]">No classes yet. Create your first class to get started.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classes.map((cls) => {
                      const classPupils = pupils.filter(p => p.class_id === cls.id);
                      return (
                        <div
                          key={cls.id}
                          className="p-4 rounded-xl border border-[var(--wrife-border)] hover:shadow-md transition"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-bold text-[var(--wrife-text-main)]">{cls.name}</h3>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--wrife-blue-soft)] text-[var(--wrife-blue)]">
                                Year {cls.year_group}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteClass(cls.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded text-xs font-semibold transition"
                              title="Delete class"
                            >
                              Delete
                            </button>
                          </div>
                          <div className="mb-3">
                            <p className="text-xs text-[var(--wrife-text-muted)]">Class Code</p>
                            <p className="font-mono font-bold text-[var(--wrife-blue)]">{cls.class_code}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--wrife-text-muted)]">
                              {classPupils.length} pupils
                            </span>
                            <Link
                              href={`/classes/${cls.id}`}
                              className="text-sm text-[var(--wrife-blue)] font-semibold hover:underline"
                            >
                              Manage
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {showCreateClassModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-[var(--wrife-text-main)] mb-4">Create New Class</h2>
            <form onSubmit={handleCreateClass}>
              {classModalError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {classModalError}
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                  Class Name
                </label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g., Year 4 Maple"
                  className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                  Year Group
                </label>
                <select
                  value={newClassYearGroup}
                  onChange={(e) => setNewClassYearGroup(parseInt(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                >
                  {[2, 3, 4, 5, 6].map((year) => (
                    <option key={year} value={year}>Year {year}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowCreateClassModal(false); setClassModalError(''); }}
                  className="flex-1 px-4 py-2 rounded-full border border-[var(--wrife-border)] text-[var(--wrife-text-muted)] font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-full bg-[var(--wrife-blue)] text-white font-semibold hover:opacity-90"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddPupilModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-[var(--wrife-text-main)] mb-4">Add New Pupil</h2>
            <form onSubmit={handleAddPupil}>
              {pupilModalError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {pupilModalError}
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                  Select Class
                </label>
                <select
                  value={selectedClassForPupil || ''}
                  onChange={(e) => setSelectedClassForPupil(e.target.value || null)}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                  required
                >
                  <option value="">Choose a class...</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name} (Year {cls.year_group})</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={newPupilFirstName}
                  onChange={(e) => setNewPupilFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                  Last Name (Optional)
                </label>
                <input
                  type="text"
                  value={newPupilLastName}
                  onChange={(e) => setNewPupilLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowAddPupilModal(false); setPupilModalError(''); setSelectedClassForPupil(null); }}
                  className="flex-1 px-4 py-2 rounded-full border border-[var(--wrife-border)] text-[var(--wrife-text-muted)] font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-full bg-[var(--wrife-blue)] text-white font-semibold hover:opacity-90"
                >
                  Add Pupil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={upgradeFeature}
        description={upgradeDescription}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent"></div>
          <p className="mt-4 text-sm text-[var(--wrife-text-muted)]">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
