'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
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
  created_at: string;
}

interface ClassData {
  id: string;
  name: string;
  year_group: number;
  class_code: string;
  created_at: string;
  teacher: {
    display_name: string;
    email: string;
  } | null;
  class_members: { count: number }[];
}

interface Profile {
  id: string;
  email: string;
  display_name: string;
  role: string;
}

export default function SchoolDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const schoolId = params.id as string;

  const [school, setSchool] = useState<School | null>(null);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [pupils, setPupils] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'classes' | 'teachers' | 'pupils'>('overview');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      fetchSchoolData();
    }
  }, [user, authLoading, router, schoolId]);

  async function fetchSchoolData() {
    try {
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .single();

      if (schoolError) throw schoolError;
      setSchool(schoolData);

      const { data: classesData } = await supabase
        .from('classes')
        .select(`
          *,
          teacher:profiles!teacher_id(display_name, email),
          class_members(count)
        `)
        .eq('school_id', schoolId);

      console.log('Classes query result:', classesData);
      setClasses(classesData || []);

      const { data: teachersData } = await supabase
        .from('profiles')
        .select('id, email, display_name, role')
        .eq('school_id', schoolId)
        .eq('role', 'teacher');

      setTeachers(teachersData || []);

      const { data: pupilsData } = await supabase
        .from('profiles')
        .select('id, email, display_name, role')
        .eq('school_id', schoolId)
        .eq('role', 'pupil');

      setPupils(pupilsData || []);

    } catch (err) {
      console.error('Error fetching school data:', err);
    } finally {
      setLoading(false);
    }
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

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[var(--wrife-bg)] py-8">
          <div className="mx-auto max-w-6xl px-4">
            <div className="animate-pulse">
              <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 w-32 bg-gray-200 rounded mb-8"></div>
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
          <div className="mx-auto max-w-6xl px-4 text-center">
            <h1 className="text-2xl font-bold text-[var(--wrife-text-main)]">School not found</h1>
            <Link href="/admin" className="text-[var(--wrife-blue)] hover:underline mt-4 inline-block">
              ← Back to Dashboard
            </Link>
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
          <div className="mb-6">
            <Link href="/admin" className="text-[var(--wrife-blue)] hover:underline text-sm">
              ← Back to Dashboard
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`h-4 w-4 rounded-full ${school.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <h1 className="text-2xl font-extrabold text-[var(--wrife-text-main)]">{school.name}</h1>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getTierBadgeStyle(school.subscription_tier)}`}>
                  {school.subscription_tier}
                </span>
              </div>
            </div>
            <p className="text-sm text-[var(--wrife-text-muted)]">{school.domain}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-soft border border-[var(--wrife-border)] p-4">
              <p className="text-xs text-[var(--wrife-text-muted)] mb-1">Teachers</p>
              <p className="text-2xl font-bold text-[var(--wrife-text-main)]">
                {teachers.length} <span className="text-sm font-normal text-[var(--wrife-text-muted)]">/ {school.teacher_limit}</span>
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-soft border border-[var(--wrife-border)] p-4">
              <p className="text-xs text-[var(--wrife-text-muted)] mb-1">Pupils</p>
              <p className="text-2xl font-bold text-[var(--wrife-text-main)]">
                {pupils.length} <span className="text-sm font-normal text-[var(--wrife-text-muted)]">/ {school.pupil_limit}</span>
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-soft border border-[var(--wrife-border)] p-4">
              <p className="text-xs text-[var(--wrife-text-muted)] mb-1">Classes</p>
              <p className="text-2xl font-bold text-[var(--wrife-text-main)]">{classes.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-soft border border-[var(--wrife-border)] p-4">
              <p className="text-xs text-[var(--wrife-text-muted)] mb-1">Status</p>
              <p className="text-lg font-bold text-[var(--wrife-text-main)]">
                {school.is_active ? '✓ Active' : '✗ Inactive'}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            {(['overview', 'classes', 'teachers', 'pupils'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  activeTab === tab
                    ? 'bg-[var(--wrife-blue)] text-white'
                    : 'bg-white border border-[var(--wrife-border)] text-[var(--wrife-text-main)] hover:bg-gray-50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
              <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-4">School Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[var(--wrife-text-muted)]">Domain</p>
                  <p className="font-medium text-[var(--wrife-text-main)]">{school.domain}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--wrife-text-muted)]">Subscription</p>
                  <p className="font-medium text-[var(--wrife-text-main)] capitalize">{school.subscription_tier}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--wrife-text-muted)]">Created</p>
                  <p className="font-medium text-[var(--wrife-text-main)]">{new Date(school.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--wrife-text-muted)]">Teacher Limit</p>
                  <p className="font-medium text-[var(--wrife-text-main)]">{school.teacher_limit}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--wrife-text-muted)]">Pupil Limit</p>
                  <p className="font-medium text-[var(--wrife-text-main)]">{school.pupil_limit}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'classes' && (
            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] overflow-hidden">
              {classes.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-[var(--wrife-text-muted)]">No classes yet</p>
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
                        <td className="px-6 py-4 text-[var(--wrife-text-muted)]">{cls.class_members?.[0]?.count || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'teachers' && (
            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] overflow-hidden">
              {teachers.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-[var(--wrife-text-muted)]">No teachers assigned to this school</p>
                  <Link href="/admin/users" className="text-[var(--wrife-blue)] hover:underline text-sm mt-2 inline-block">
                    Go to User Management →
                  </Link>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--wrife-border)] bg-gray-50">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase">Name</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map(teacher => (
                      <tr key={teacher.id} className="border-b border-[var(--wrife-border)] last:border-0 hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-[var(--wrife-text-main)]">{teacher.display_name || 'No name'}</td>
                        <td className="px-6 py-4 text-[var(--wrife-text-muted)]">{teacher.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'pupils' && (
            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] overflow-hidden">
              {pupils.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-[var(--wrife-text-muted)]">No pupils assigned to this school</p>
                  <Link href="/admin/users" className="text-[var(--wrife-blue)] hover:underline text-sm mt-2 inline-block">
                    Go to User Management →
                  </Link>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--wrife-border)] bg-gray-50">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase">Name</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pupils.map(pupil => (
                      <tr key={pupil.id} className="border-b border-[var(--wrife-border)] last:border-0 hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-[var(--wrife-text-main)]">{pupil.display_name || 'No name'}</td>
                        <td className="px-6 py-4 text-[var(--wrife-text-muted)]">{pupil.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
