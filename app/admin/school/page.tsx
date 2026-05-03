'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface School {
  id: string;
  name: string;
  domain: string;
  subscription_tier: 'trial' | 'basic' | 'pro' | 'enterprise';
  teacher_limit: number;
  pupil_limit: number;
  is_active: boolean;
}

interface Profile {
  id: string;
  email: string;
  display_name: string;
  role: string;
  created_at: string;
}

interface ClassData {
  id: string;
  name: string;
  year_group: number;
  class_code: string;
  teacher: {
    display_name: string;
    email: string;
  } | null;
  pupil_count: number;
}

interface TeacherInvite {
  id: string;
  email: string;
  invite_code: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  created_at: string;
  expires_at: string;
}

// ── Analytics types ──────────────────────────────────────────────────────────
interface AnalyticsSummary {
  total_dwp_assessed: number;
  total_dwp_passed: number;
  pass_rate: number;
  avg_word_count: number;
  intervention_count: number;
  active_pupils_7d: number;
  total_submissions: number;
}

interface BandDistribution {
  band: string;
  count: number;
}

interface ClassBreakdown {
  class_id: string;
  class_name: string;
  year_group: number;
  teacher_name: string;
  pupil_count: number;
  dwp_assessed: number;
  dwp_passed: number;
  pass_rate: number;
  avg_percentage: number;
  submissions: number;
}

interface RecentActivity {
  pupil_name: string;
  class_name: string;
  level_id: string;
  performance_band: string;
  passed: boolean;
  percentage: number;
  word_count: number;
  time_submitted: string;
}

function getTierBadgeStyle(tier: string): string {
  switch (tier) {
    case 'trial':
      return 'bg-yellow-100 text-yellow-700';
    case 'basic':
      return 'bg-blue-100 text-blue-700';
    case 'pro':
      return 'bg-purple-100 text-purple-700';
    case 'enterprise':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function getQuotaColor(used: number, limit: number): string {
  const percentage = (used / limit) * 100;
  if (percentage >= 95) return 'bg-red-500';
  if (percentage >= 80) return 'bg-yellow-500';
  return 'bg-green-500';
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function SchoolAdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [school, setSchool] = useState<School | null>(null);
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [pupils, setPupils] = useState<Profile[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [pendingInvites, setPendingInvites] = useState<TeacherInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'teachers' | 'pupils' | 'classes' | 'invites' | 'analytics'>('overview');

  // Analytics state
  const [analytics, setAnalytics] = useState<{
    summary: AnalyticsSummary;
    band_distribution: BandDistribution[];
    class_breakdown: ClassBreakdown[];
    recent_activity: RecentActivity[];
  } | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.role !== 'school_admin') {
        router.push('/dashboard');
        return;
      }
      if (user.school_id) {
        fetchSchoolData(user.school_id);
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading, router]);

  async function fetchSchoolData(schoolId: string) {
    try {
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .single();

      if (schoolError) throw schoolError;
      setSchool(schoolData);

      const { data: teachersData } = await supabase
        .from('profiles')
        .select('id, email, display_name, role, created_at')
        .eq('school_id', schoolId)
        .eq('role', 'teacher')
        .order('display_name');

      setTeachers(teachersData || []);

      const { data: pupilsData } = await supabase
        .from('profiles')
        .select('id, email, display_name, role, created_at')
        .eq('school_id', schoolId)
        .eq('role', 'pupil')
        .order('display_name');

      setPupils(pupilsData || []);

      const { data: invitesData } = await supabase
        .from('teacher_invites')
        .select('*')
        .eq('school_id', schoolId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      setPendingInvites(invitesData || []);

      const { data: classesData } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          year_group,
          class_code,
          teacher:profiles!teacher_id(display_name, email)
        `)
        .eq('school_id', schoolId)
        .order('name');

      const classesWithCounts = await Promise.all(
        (classesData || []).map(async (cls: any) => {
          const { count } = await supabase
            .from('class_members')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', cls.id);
          
          return {
            ...cls,
            pupil_count: count || 0,
          };
        })
      );

      setClasses(classesWithCounts);

    } catch (err) {
      console.error('Error fetching school data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleInviteTeacher(e: React.FormEvent) {
    e.preventDefault();
    setInviteError('');
    setInviteSuccess('');

    if (!inviteEmail.trim()) {
      setInviteError('Please enter an email address');
      return;
    }

    if (!school || !user) return;

    if (teachers.length + pendingInvites.length >= school.teacher_limit) {
      setInviteError(`Teacher limit reached (${school.teacher_limit}). Please upgrade your subscription.`);
      return;
    }

    try {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id, school_id, role')
        .eq('email', inviteEmail.trim())
        .single();

      if (existingUser) {
        if (existingUser.school_id === school.id) {
          setInviteError('This teacher is already in your school');
          return;
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ school_id: school.id })
          .eq('id', existingUser.id);

        if (updateError) throw updateError;

        setInviteSuccess(`${inviteEmail} has been added to your school!`);
        setInviteEmail('');
        setShowAddTeacher(false);
        fetchSchoolData(school.id);
      } else {
        const { data: existingInvite } = await supabase
          .from('teacher_invites')
          .select('id')
          .eq('email', inviteEmail.trim())
          .eq('school_id', school.id)
          .eq('status', 'pending')
          .single();

        if (existingInvite) {
          setInviteError('An invitation has already been sent to this email');
          return;
        }

        const inviteCode = generateInviteCode();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        
        const { error: inviteError } = await supabase
          .from('teacher_invites')
          .insert({
            email: inviteEmail.trim(),
            school_id: school.id,
            invite_code: inviteCode,
            invited_by: user.id,
            status: 'pending',
            expires_at: expiresAt.toISOString(),
          });

        if (inviteError) throw inviteError;

        setInviteSuccess(`Invitation created for ${inviteEmail}. Share the invite code with them to join.`);
        setInviteEmail('');
        setShowAddTeacher(false);
        fetchSchoolData(school.id);
      }
    } catch (err) {
      console.error('Error inviting teacher:', err);
      setInviteError('Failed to invite teacher. Please try again.');
    }
  }

  async function handleCancelInvite(inviteId: string) {
    if (!confirm('Are you sure you want to cancel this invitation?')) return;

    try {
      const { error } = await supabase
        .from('teacher_invites')
        .update({ status: 'cancelled' })
        .eq('id', inviteId);

      if (error) throw error;
      
      if (school) fetchSchoolData(school.id);
    } catch (err) {
      console.error('Error cancelling invite:', err);
      alert('Failed to cancel invitation');
    }
  }

  async function handleRemoveTeacher(teacherId: string) {
    if (!confirm('Are you sure you want to remove this teacher from your school?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ school_id: null })
        .eq('id', teacherId);

      if (error) throw error;
      
      if (school) fetchSchoolData(school.id);
    } catch (err) {
      console.error('Error removing teacher:', err);
      alert('Failed to remove teacher');
    }
  }

  function copyToClipboard(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  async function fetchAnalytics() {
    setAnalyticsLoading(true);
    setAnalyticsError('');
    try {
      const res = await fetch('/api/school-admin/analytics', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load analytics');
      setAnalytics(data);
    } catch (err: unknown) {
      setAnalyticsError(err instanceof Error ? err.message : 'Could not load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  }

  function handleTabChange(tab: typeof activeTab) {
    setActiveTab(tab);
    if (tab === 'analytics' && !analytics && !analyticsLoading) {
      fetchAnalytics();
    }
  }

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[var(--wrife-bg)] py-8">
          <div className="mx-auto max-w-6xl px-4">
            <div className="animate-pulse">
              <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 w-48 bg-gray-200 rounded mb-8"></div>
              <div className="grid grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!school) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[var(--wrife-bg)] py-8">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-12">
              <div className="mb-4">
                <span className="text-5xl">🏫</span>
              </div>
              <h1 className="text-2xl font-bold text-[var(--wrife-text-main)] mb-2">No School Assigned</h1>
              <p className="text-[var(--wrife-text-muted)] mb-6">
                Your account hasn't been assigned to a school yet. Please contact your administrator.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[var(--wrife-bg)] py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-extrabold text-[var(--wrife-text-main)]">{school.name}</h1>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getTierBadgeStyle(school.subscription_tier)}`}>
                  {school.subscription_tier}
                </span>
              </div>
              <p className="text-sm text-[var(--wrife-text-muted)]">School Admin Dashboard</p>
            </div>
            <Link href="/admin/school/help">
              <button className="rounded-full border border-[var(--wrife-border)] px-4 py-3 text-sm font-semibold text-[var(--wrife-text-muted)] hover:bg-gray-50 transition">
                ? Help
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-soft border border-[var(--wrife-border)] p-4">
              <p className="text-xs text-[var(--wrife-text-muted)] mb-1">Teachers</p>
              <p className="text-2xl font-bold text-[var(--wrife-text-main)]">
                {teachers.length}
                <span className="text-sm font-normal text-[var(--wrife-text-muted)]"> / {school.teacher_limit}</span>
              </p>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getQuotaColor(teachers.length, school.teacher_limit)} transition-all`}
                  style={{ width: `${Math.min((teachers.length / school.teacher_limit) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-soft border border-[var(--wrife-border)] p-4">
              <p className="text-xs text-[var(--wrife-text-muted)] mb-1">Pupils</p>
              <p className="text-2xl font-bold text-[var(--wrife-text-main)]">
                {pupils.length}
                <span className="text-sm font-normal text-[var(--wrife-text-muted)]"> / {school.pupil_limit}</span>
              </p>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getQuotaColor(pupils.length, school.pupil_limit)} transition-all`}
                  style={{ width: `${Math.min((pupils.length / school.pupil_limit) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-soft border border-[var(--wrife-border)] p-4">
              <p className="text-xs text-[var(--wrife-text-muted)] mb-1">Classes</p>
              <p className="text-2xl font-bold text-[var(--wrife-text-main)]">{classes.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-soft border border-[var(--wrife-border)] p-4">
              <p className="text-xs text-[var(--wrife-text-muted)] mb-1">Pending Invites</p>
              <p className="text-2xl font-bold text-orange-500">{pendingInvites.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-soft border border-[var(--wrife-border)] p-4">
              <p className="text-xs text-[var(--wrife-text-muted)] mb-1">Status</p>
              <p className={`text-lg font-bold ${school.is_active ? 'text-green-600' : 'text-red-500'}`}>
                {school.is_active ? '✓ Active' : '✗ Inactive'}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {(['overview', 'teachers', 'invites', 'pupils', 'classes', 'analytics'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-[var(--wrife-blue)] text-white'
                    : 'bg-white border border-[var(--wrife-border)] text-[var(--wrife-text-main)] hover:bg-gray-50'
                }`}
              >
                {tab === 'invites' ? `Invites (${pendingInvites.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
                <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-4">Recent Teachers</h2>
                {teachers.length === 0 ? (
                  <p className="text-sm text-[var(--wrife-text-muted)]">No teachers yet</p>
                ) : (
                  <div className="space-y-3">
                    {teachers.slice(0, 5).map(teacher => (
                      <div key={teacher.id} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[var(--wrife-blue-soft)] flex items-center justify-center text-xs font-bold text-[var(--wrife-blue)]">
                          {teacher.display_name?.charAt(0) || teacher.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--wrife-text-main)] truncate">
                            {teacher.display_name || 'No name'}
                          </p>
                          <p className="text-xs text-[var(--wrife-text-muted)] truncate">{teacher.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {teachers.length > 5 && (
                  <button
                    onClick={() => handleTabChange('teachers')}
                    className="mt-4 text-sm text-[var(--wrife-blue)] hover:underline"
                  >
                    View all {teachers.length} teachers →
                  </button>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
                <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-4">Pending Invites</h2>
                {pendingInvites.length === 0 ? (
                  <p className="text-sm text-[var(--wrife-text-muted)]">No pending invitations</p>
                ) : (
                  <div className="space-y-3">
                    {pendingInvites.slice(0, 5).map(invite => (
                      <div key={invite.id} className="flex items-center justify-between py-2 border-b border-[var(--wrife-border)] last:border-0">
                        <div>
                          <p className="text-sm font-medium text-[var(--wrife-text-main)]">{invite.email}</p>
                          <p className="text-xs text-[var(--wrife-text-muted)]">
                            Code: <code className="bg-gray-100 px-1 rounded">{invite.invite_code}</code>
                          </p>
                        </div>
                        <span className="text-xs text-orange-500 font-medium">Pending</span>
                      </div>
                    ))}
                  </div>
                )}
                {pendingInvites.length > 5 && (
                  <button
                    onClick={() => handleTabChange('invites')}
                    className="mt-4 text-sm text-[var(--wrife-blue)] hover:underline"
                  >
                    View all {pendingInvites.length} invites →
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'teachers' && (
            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] overflow-hidden">
              <div className="p-6 border-b border-[var(--wrife-border)] flex items-center justify-between">
                <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">Teachers ({teachers.length})</h2>
                <button
                  onClick={() => setShowAddTeacher(!showAddTeacher)}
                  className="rounded-full bg-[var(--wrife-blue)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
                >
                  + Invite Teacher
                </button>
              </div>

              {showAddTeacher && (
                <div className="p-6 bg-[var(--wrife-bg)] border-b border-[var(--wrife-border)]">
                  <form onSubmit={handleInviteTeacher} className="flex gap-3">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Teacher's email address"
                      className="flex-1 px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-[var(--wrife-blue)] text-white text-sm font-semibold hover:opacity-90 transition"
                    >
                      Send Invite
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddTeacher(false);
                        setInviteEmail('');
                        setInviteError('');
                        setInviteSuccess('');
                      }}
                      className="px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm font-semibold text-[var(--wrife-text-muted)] hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </form>
                  {inviteError && (
                    <p className="mt-2 text-sm text-red-500">{inviteError}</p>
                  )}
                  {inviteSuccess && (
                    <p className="mt-2 text-sm text-green-600">{inviteSuccess}</p>
                  )}
                </div>
              )}

              {teachers.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="mb-4">
                    <span className="text-5xl">👩‍🏫</span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">No teachers yet</h3>
                  <p className="text-sm text-[var(--wrife-text-muted)]">
                    Invite teachers to your school to get started
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--wrife-border)] bg-gray-50">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase">Name</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase">Email</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase">Joined</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map(teacher => (
                      <tr key={teacher.id} className="border-b border-[var(--wrife-border)] last:border-0 hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-[var(--wrife-blue-soft)] flex items-center justify-center text-xs font-bold text-[var(--wrife-blue)]">
                              {teacher.display_name?.charAt(0) || teacher.email.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-[var(--wrife-text-main)]">
                              {teacher.display_name || 'No name'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[var(--wrife-text-muted)]">{teacher.email}</td>
                        <td className="px-6 py-4 text-[var(--wrife-text-muted)] text-sm">
                          {new Date(teacher.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleRemoveTeacher(teacher.id)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'invites' && (
            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] overflow-hidden">
              <div className="p-6 border-b border-[var(--wrife-border)] flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">Pending Invitations ({pendingInvites.length})</h2>
                  <p className="text-sm text-[var(--wrife-text-muted)] mt-1">
                    Share invite codes with teachers to join your school
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('teachers');
                    setShowAddTeacher(true);
                  }}
                  className="rounded-full bg-[var(--wrife-blue)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
                >
                  + New Invite
                </button>
              </div>

              {pendingInvites.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="mb-4">
                    <span className="text-5xl">📧</span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">No pending invitations</h3>
                  <p className="text-sm text-[var(--wrife-text-muted)]">
                    Invite teachers from the Teachers tab
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--wrife-border)] bg-gray-50">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase">Email</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase">Invite Code</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase">Sent</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase">Expires</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingInvites.map(invite => (
                      <tr key={invite.id} className="border-b border-[var(--wrife-border)] last:border-0 hover:bg-gray-50">
                        <td className="px-6 py-4 text-[var(--wrife-text-main)]">{invite.email}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{invite.invite_code}</code>
                            <button
                              onClick={() => copyToClipboard(invite.invite_code)}
                              className="text-xs text-[var(--wrife-blue)] hover:underline"
                            >
                              {copiedCode === invite.invite_code ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[var(--wrife-text-muted)] text-sm">
                          {new Date(invite.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-[var(--wrife-text-muted)] text-sm">
                          {new Date(invite.expires_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleCancelInvite(invite.id)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'pupils' && (
            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] overflow-hidden">
              <div className="p-6 border-b border-[var(--wrife-border)]">
                <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">Pupils ({pupils.length})</h2>
                <p className="text-sm text-[var(--wrife-text-muted)] mt-1">
                  Pupils are added by teachers when they create accounts for their classes
                </p>
              </div>

              {pupils.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="mb-4">
                    <span className="text-5xl">👧</span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">No pupils yet</h3>
                  <p className="text-sm text-[var(--wrife-text-muted)]">
                    Teachers will add pupils to their classes
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--wrife-border)] bg-gray-50">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase">Name</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase">Email</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pupils.map(pupil => (
                      <tr key={pupil.id} className="border-b border-[var(--wrife-border)] last:border-0 hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-[var(--wrife-yellow)] flex items-center justify-center text-xs font-bold text-[var(--wrife-text-main)]">
                              {pupil.display_name?.charAt(0) || pupil.email?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <span className="font-medium text-[var(--wrife-text-main)]">
                              {pupil.display_name || 'No name'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[var(--wrife-text-muted)]">{pupil.email || '-'}</td>
                        <td className="px-6 py-4 text-[var(--wrife-text-muted)] text-sm">
                          {new Date(pupil.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'classes' && (
            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] overflow-hidden">
              <div className="p-6 border-b border-[var(--wrife-border)]">
                <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">Classes ({classes.length})</h2>
                <p className="text-sm text-[var(--wrife-text-muted)] mt-1">
                  Classes are created and managed by teachers
                </p>
              </div>

              {classes.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="mb-4">
                    <span className="text-5xl">📚</span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">No classes yet</h3>
                  <p className="text-sm text-[var(--wrife-text-muted)]">
                    Teachers will create classes for their pupils
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--wrife-border)] bg-gray-50">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase">Class</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase">Year</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase">Teacher</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase">Code</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase">Pupils</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map(cls => (
                      <tr key={cls.id} className="border-b border-[var(--wrife-border)] last:border-0 hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-[var(--wrife-text-main)]">{cls.name}</td>
                        <td className="px-6 py-4 text-[var(--wrife-text-muted)]">Year {cls.year_group}</td>
                        <td className="px-6 py-4 text-[var(--wrife-text-muted)]">{cls.teacher?.display_name || 'Unassigned'}</td>
                        <td className="px-6 py-4">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">{cls.class_code}</code>
                        </td>
                        <td className="px-6 py-4 text-[var(--wrife-text-muted)]">{cls.pupil_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── Analytics tab ─────────────────────────────────────────────── */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {analyticsLoading && (
                <div className="flex items-center justify-center py-16 gap-3 text-[var(--wrife-text-muted)]">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-solid border-[var(--wrife-blue)] border-r-transparent" />
                  Loading analytics…
                </div>
              )}

              {analyticsError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
                  <span>{analyticsError}</span>
                  <button onClick={fetchAnalytics} className="ml-4 text-[var(--wrife-blue)] hover:underline text-xs font-semibold">Retry</button>
                </div>
              )}

              {analytics && (
                <>
                  {/* Summary cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'DWP Assessed (30d)', value: analytics.summary.total_dwp_assessed, color: 'text-[var(--wrife-blue)]', bg: 'bg-blue-50' },
                      { label: 'Pass Rate (30d)',     value: `${analytics.summary.pass_rate}%`,     color: analytics.summary.pass_rate >= 60 ? 'text-green-600' : 'text-amber-600', bg: 'bg-green-50' },
                      { label: 'Active Pupils (7d)', value: analytics.summary.active_pupils_7d,    color: 'text-purple-600', bg: 'bg-purple-50' },
                      { label: 'Avg Word Count (30d)', value: analytics.summary.avg_word_count,   color: 'text-[var(--wrife-text-main)]', bg: 'bg-gray-50' },
                    ].map(card => (
                      <div key={card.label} className={`${card.bg} rounded-xl p-4 border border-[var(--wrife-border)]`}>
                        <p className="text-xs text-[var(--wrife-text-muted)] mb-1">{card.label}</p>
                        <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Second row */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-[var(--wrife-border)]">
                      <p className="text-xs text-[var(--wrife-text-muted)] mb-1">Lesson Submissions (30d)</p>
                      <p className="text-2xl font-bold text-[var(--wrife-blue)]">{analytics.summary.total_submissions}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-[var(--wrife-border)]">
                      <p className="text-xs text-[var(--wrife-text-muted)] mb-1">Pupils Passed (30d)</p>
                      <p className="text-2xl font-bold text-green-600">{analytics.summary.total_dwp_passed}</p>
                    </div>
                    {analytics.summary.intervention_count > 0 && (
                      <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                        <p className="text-xs text-red-600 mb-1">Flagged for Support</p>
                        <p className="text-2xl font-bold text-red-600 flex items-center gap-1">⚠ {analytics.summary.intervention_count}</p>
                      </div>
                    )}
                  </div>

                  {/* Band distribution + recent activity */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Band distribution */}
                    <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
                      <h3 className="text-base font-bold text-[var(--wrife-text-main)] mb-4">Performance Band Distribution</h3>
                      {analytics.band_distribution.length === 0 ? (
                        <p className="text-sm text-[var(--wrife-text-muted)]">No assessed attempts yet</p>
                      ) : (() => {
                        const total = analytics.band_distribution.reduce((s, b) => s + b.count, 0);
                        const BAND_STYLES: Record<string, string> = {
                          mastery:    'bg-purple-500',
                          secure:     'bg-green-500',
                          developing: 'bg-yellow-400',
                          emerging:   'bg-orange-400',
                        };
                        const BAND_TEXT: Record<string, string> = {
                          mastery:    'text-purple-700 bg-purple-100',
                          secure:     'text-green-700 bg-green-100',
                          developing: 'text-yellow-700 bg-yellow-100',
                          emerging:   'text-orange-700 bg-orange-100',
                        };
                        return (
                          <div className="space-y-3">
                            {analytics.band_distribution.map(b => {
                              const pct = Math.round((b.count / total) * 100);
                              return (
                                <div key={b.band}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${BAND_TEXT[b.band] ?? 'text-gray-700 bg-gray-100'}`}>
                                      {b.band}
                                    </span>
                                    <span className="text-xs text-[var(--wrife-text-muted)]">{b.count} ({pct}%)</span>
                                  </div>
                                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${BAND_STYLES[b.band] ?? 'bg-gray-400'}`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Recent activity */}
                    <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-[var(--wrife-text-main)]">Recent DWP Activity</h3>
                        <button onClick={fetchAnalytics} className="text-xs text-[var(--wrife-blue)] hover:underline">Refresh</button>
                      </div>
                      {analytics.recent_activity.length === 0 ? (
                        <p className="text-sm text-[var(--wrife-text-muted)]">No activity yet</p>
                      ) : (
                        <div className="divide-y divide-[var(--wrife-border)]">
                          {analytics.recent_activity.map((a, i) => (
                            <div key={i} className="py-2 flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-[var(--wrife-text-main)] truncate">{a.pupil_name}</p>
                                <p className="text-xs text-[var(--wrife-text-muted)] truncate">{a.class_name} · {a.level_id}</p>
                              </div>
                              <div className="shrink-0 flex items-center gap-2">
                                <span className="text-xs font-bold text-[var(--wrife-text-main)]">{a.percentage}%</span>
                                {a.passed
                                  ? <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">✓</span>
                                  : <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-semibold">✗</span>
                                }
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Per-class breakdown table */}
                  <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] overflow-hidden">
                    <div className="p-6 border-b border-[var(--wrife-border)]">
                      <h3 className="text-base font-bold text-[var(--wrife-text-main)]">Class-by-Class Breakdown</h3>
                      <p className="text-xs text-[var(--wrife-text-muted)] mt-1">DWP writing performance across all classes (all time)</p>
                    </div>
                    {analytics.class_breakdown.length === 0 ? (
                      <div className="p-8 text-center text-sm text-[var(--wrife-text-muted)]">No class data yet</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-[var(--wrife-border)] bg-gray-50">
                              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase">Class</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase">Teacher</th>
                              <th className="text-center px-4 py-3 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase">Pupils</th>
                              <th className="text-center px-4 py-3 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase">DWP Assessed</th>
                              <th className="text-center px-4 py-3 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase">Pass Rate</th>
                              <th className="text-center px-4 py-3 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase">Avg %</th>
                              <th className="text-center px-4 py-3 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase">Submissions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analytics.class_breakdown.map(cls => (
                              <tr key={cls.class_id} className="border-b border-[var(--wrife-border)] last:border-0 hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-[var(--wrife-text-main)]">
                                  {cls.class_name}
                                  <span className="ml-1 text-xs text-[var(--wrife-text-muted)]">Yr {cls.year_group}</span>
                                </td>
                                <td className="px-4 py-3 text-[var(--wrife-text-muted)]">{cls.teacher_name}</td>
                                <td className="px-4 py-3 text-center text-[var(--wrife-text-main)]">{cls.pupil_count}</td>
                                <td className="px-4 py-3 text-center text-[var(--wrife-text-main)]">{cls.dwp_assessed}</td>
                                <td className="px-4 py-3 text-center">
                                  {cls.dwp_assessed > 0 ? (
                                    <span className={`font-semibold ${cls.pass_rate >= 60 ? 'text-green-600' : 'text-amber-600'}`}>
                                      {cls.pass_rate}%
                                    </span>
                                  ) : (
                                    <span className="text-[var(--wrife-text-muted)]">—</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {cls.dwp_assessed > 0 ? (
                                    <span className="text-[var(--wrife-text-main)]">{cls.avg_percentage}%</span>
                                  ) : (
                                    <span className="text-[var(--wrife-text-muted)]">—</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-center text-[var(--wrife-text-muted)]">{cls.submissions}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
