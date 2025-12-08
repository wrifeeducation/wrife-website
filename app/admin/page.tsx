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
  teacherCount: number;
  pupilCount: number;
}

function getQuotaColor(used: number, limit: number): string {
  const percentage = (used / limit) * 100;
  if (percentage >= 95) return 'bg-red-500';
  if (percentage >= 80) return 'bg-yellow-500';
  return 'bg-green-500';
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

function SchoolCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="h-6 w-32 bg-gray-200 rounded"></div>
        <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
      </div>
      <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
      <div className="space-y-3 mb-4">
        <div className="h-4 w-full bg-gray-200 rounded"></div>
        <div className="h-2 w-full bg-gray-200 rounded"></div>
        <div className="h-4 w-full bg-gray-200 rounded"></div>
        <div className="h-2 w-full bg-gray-200 rounded"></div>
      </div>
      <div className="h-10 w-full bg-gray-200 rounded-full"></div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

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
      fetchSchools();
    }
  }, [user, authLoading, router]);

  async function fetchSchools() {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');

      if (error) throw error;
      
      const schools = data || [];
      
      const schoolsWithCounts = await Promise.all(
        (schools || []).map(async (school) => {
          console.log('Counting for school:', school.id, school.name);
          
          try {
            const { data: teachers, error: teacherError } = await supabase
              .from('profiles')
              .select('id')
              .eq('school_id', school.id)
              .eq('role', 'teacher');
            
            console.log('Teacher query result:', { teachers, teacherError });
            
            const { data: pupils, error: pupilError } = await supabase
              .from('profiles')
              .select('id')
              .eq('school_id', school.id)
              .eq('role', 'pupil');
            
            console.log('Pupil query result:', { pupils, pupilError });
            
            const teacherCount = teachers?.length || 0;
            const pupilCount = pupils?.length || 0;
            
            console.log('Final counts:', { teacherCount, pupilCount });
            
            return {
              ...school,
              teacherCount,
              pupilCount,
            };
          } catch (err) {
            console.error('Error counting:', err);
            return {
              ...school,
              teacherCount: 0,
              pupilCount: 0,
            };
          }
        })
      );

      console.log('All schools with counts:', schoolsWithCounts);
      setSchools(schoolsWithCounts);
    } catch (err) {
      console.error('Error fetching schools:', err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleSchoolActive(schoolId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('schools')
        .update({ is_active: !currentStatus })
        .eq('id', schoolId);

      if (error) throw error;
      fetchSchools();
    } catch (err) {
      console.error('Error toggling school status:', err);
    }
  }

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[var(--wrife-bg)] py-8">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-200 rounded mt-2 animate-pulse"></div>
              </div>
              <div className="h-12 w-32 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <SchoolCardSkeleton />
              <SchoolCardSkeleton />
              <SchoolCardSkeleton />
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
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-[var(--wrife-text-main)]">Super Admin Dashboard</h1>
              <p className="text-sm text-[var(--wrife-text-muted)] mt-1">
                Manage all schools and subscriptions
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/users">
                <button className="rounded-full border border-[var(--wrife-blue)] px-6 py-3 text-sm font-semibold text-[var(--wrife-blue)] hover:bg-[var(--wrife-blue-soft)] transition">
                  Manage Users
                </button>
              </Link>
              <Link href="/admin/schools/new">
                <button className="rounded-full bg-[var(--wrife-blue)] px-6 py-3 text-sm font-semibold text-white shadow-soft hover:opacity-90 transition">
                  + New School
                </button>
              </Link>
            </div>
          </div>

          {schools.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-12 text-center">
              <div className="mb-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--wrife-blue-soft)] mb-4">
                  <span className="text-3xl">🏫</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">No schools yet</h3>
              <p className="text-sm text-[var(--wrife-text-muted)] mb-6">
                Create your first school to start managing subscriptions
              </p>
              <Link href="/admin/schools/new">
                <button className="rounded-full bg-[var(--wrife-blue)] px-6 py-3 text-sm font-semibold text-white shadow-soft hover:opacity-90 transition">
                  Create Your First School
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {schools.map((school) => (
                <div
                  key={school.id}
                  className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6 hover:shadow-strong transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSchoolActive(school.id, school.is_active)}
                        className={`h-3 w-3 rounded-full transition ${
                          school.is_active ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        title={school.is_active ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
                      />
                      <h3 className="text-lg font-bold text-[var(--wrife-text-main)]">{school.name}</h3>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getTierBadgeStyle(school.subscription_tier)}`}>
                      {school.subscription_tier}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--wrife-text-muted)] mb-4">{school.domain}</p>

                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--wrife-text-muted)]">Teachers</span>
                        <span className="font-semibold text-[var(--wrife-text-main)]">
                          {school.teacherCount}/{school.teacher_limit}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getQuotaColor(school.teacherCount, school.teacher_limit)} transition-all`}
                          style={{ width: `${Math.min((school.teacherCount / school.teacher_limit) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--wrife-text-muted)]">Pupils</span>
                        <span className="font-semibold text-[var(--wrife-text-main)]">
                          {school.pupilCount}/{school.pupil_limit}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getQuotaColor(school.pupilCount, school.pupil_limit)} transition-all`}
                          style={{ width: `${Math.min((school.pupilCount / school.pupil_limit) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <Link href={`/admin/schools/${school.id}`}>
                    <button className="w-full rounded-full border border-[var(--wrife-blue)] px-4 py-2 text-sm font-semibold text-[var(--wrife-blue)] hover:bg-[var(--wrife-blue-soft)] transition">
                      View Details
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
