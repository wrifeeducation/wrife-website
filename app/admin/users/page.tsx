'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Profile {
  id: string;
  email: string;
  display_name: string;
  role: string;
  school_id: string | null;
  created_at: string;
}

interface School {
  id: string;
  name: string;
}

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unassigned' | 'teacher' | 'pupil'>('all');
  const [saving, setSaving] = useState<string | null>(null);

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
      fetchData();
    }
  }, [user, authLoading, router]);

  async function fetchData() {
    try {
      const [profilesRes, schoolsRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('schools').select('id, name').order('name'),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (schoolsRes.error) throw schoolsRes.error;

      setProfiles(profilesRes.data || []);
      setSchools(schoolsRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function updateUserSchool(userId: string, schoolId: string | null) {
    setSaving(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ school_id: schoolId, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      setProfiles(prev =>
        prev.map(p => (p.id === userId ? { ...p, school_id: schoolId } : p))
      );
    } catch (err) {
      console.error('Error updating user school:', err);
    } finally {
      setSaving(null);
    }
  }

  async function updateUserRole(userId: string, role: string) {
    setSaving(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      setProfiles(prev =>
        prev.map(p => (p.id === userId ? { ...p, role } : p))
      );
    } catch (err) {
      console.error('Error updating user role:', err);
    } finally {
      setSaving(null);
    }
  }

  const filteredProfiles = profiles.filter(p => {
    if (filter === 'unassigned') return !p.school_id;
    if (filter === 'teacher') return p.role === 'teacher';
    if (filter === 'pupil') return p.role === 'pupil';
    return true;
  });

  const getSchoolName = (schoolId: string | null) => {
    if (!schoolId) return 'Unassigned';
    const school = schools.find(s => s.id === schoolId);
    return school?.name || 'Unknown';
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'school_admin':
        return 'bg-purple-100 text-purple-700';
      case 'teacher':
        return 'bg-blue-100 text-blue-700';
      case 'pupil':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[var(--wrife-bg)] py-8">
          <div className="mx-auto max-w-6xl px-4">
            <div className="animate-pulse">
              <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
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
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Link href="/admin" className="text-[var(--wrife-blue)] hover:underline text-sm">
                  ← Back to Dashboard
                </Link>
              </div>
              <h1 className="text-2xl font-extrabold text-[var(--wrife-text-main)]">User Management</h1>
              <p className="text-sm text-[var(--wrife-text-muted)] mt-1">
                Assign users to schools and manage roles
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              {(['all', 'unassigned', 'teacher', 'pupil'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    filter === f
                      ? 'bg-[var(--wrife-blue)] text-white'
                      : 'bg-white border border-[var(--wrife-border)] text-[var(--wrife-text-main)] hover:bg-gray-50'
                  }`}
                >
                  {f === 'all' ? 'All Users' : f === 'unassigned' ? 'Unassigned' : f.charAt(0).toUpperCase() + f.slice(1) + 's'}
                </button>
              ))}
            </div>
          </div>

          {filteredProfiles.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-12 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--wrife-blue-soft)] mb-4">
                <span className="text-3xl">👥</span>
              </div>
              <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">No users found</h3>
              <p className="text-sm text-[var(--wrife-text-muted)]">
                {filter === 'unassigned'
                  ? 'All users have been assigned to schools'
                  : 'No users match the current filter'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--wrife-border)] bg-gray-50">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase tracking-wide">
                        User
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase tracking-wide">
                        Role
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase tracking-wide">
                        School
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--wrife-text-muted)] uppercase tracking-wide">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProfiles.map(profile => (
                      <tr
                        key={profile.id}
                        className="border-b border-[var(--wrife-border)] last:border-0 hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-[var(--wrife-text-main)]">
                              {profile.display_name || 'No name'}
                            </p>
                            <p className="text-sm text-[var(--wrife-text-muted)]">{profile.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={profile.role}
                            onChange={e => updateUserRole(profile.id, e.target.value)}
                            disabled={saving === profile.id || profile.role === 'admin'}
                            className={`rounded-full px-3 py-1 text-xs font-semibold border-0 cursor-pointer ${getRoleBadgeStyle(
                              profile.role
                            )} ${profile.role === 'admin' ? 'cursor-not-allowed opacity-70' : ''}`}
                          >
                            <option value="teacher">Teacher</option>
                            <option value="pupil">Pupil</option>
                            <option value="school_admin">School Admin</option>
                            {profile.role === 'admin' && <option value="admin">Admin</option>}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={profile.school_id || ''}
                            onChange={e => updateUserSchool(profile.id, e.target.value || null)}
                            disabled={saving === profile.id}
                            className="rounded-lg border border-[var(--wrife-border)] px-3 py-2 text-sm text-[var(--wrife-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent min-w-[180px]"
                          >
                            <option value="">-- Unassigned --</option>
                            {schools.map(school => (
                              <option key={school.id} value={school.id}>
                                {school.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--wrife-text-muted)]">
                          {new Date(profile.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-4 text-sm text-[var(--wrife-text-muted)]">
            Showing {filteredProfiles.length} of {profiles.length} users
          </div>
        </div>
      </div>
    </>
  );
}
