'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { adminFetch } from '@/lib/admin-fetch';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Profile {
  id: string;
  email: string;
  display_name: string;
  role: string;
  membership_tier: string;
  school_id: string | null;
  created_at: string;
}

interface School {
  id: string;
  name: string;
}

interface ClassInfo {
  id: number;
  name: string;
  year_group: number;
  class_code: string;
  school_name: string;
  created_at: string;
}

interface PupilInfo {
  id: number;
  class_id: number;
  pupil_name: string;
  pupil_email: string;
  pupil_id: string | null;
  class_name: string;
  profile_display_name: string | null;
  membership_tier: string | null;
}

interface UserDetails {
  profile: Profile;
  classes: ClassInfo[];
  pupils: PupilInfo[];
  stats: {
    classCount: number;
    pupilCount: number;
    totalActivities: number;
  };
}

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unassigned' | 'admin' | 'school_admin' | 'teacher' | 'pupil'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

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
      const response = await adminFetch('/api/admin/users');
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setProfiles(data.profiles || []);
      setSchools(data.schools || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserDetails(userId: string) {
    if (expandedUser === userId) {
      setExpandedUser(null);
      setUserDetails(null);
      return;
    }

    setLoadingDetails(true);
    setExpandedUser(userId);

    try {
      const response = await adminFetch(`/api/admin/users/${userId}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setUserDetails(data);
    } catch (err) {
      console.error('Error fetching user details:', err);
      setUserDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  }

  async function updateUserSchool(userId: string, schoolId: string | null) {
    setSaving(userId);
    try {
      const response = await adminFetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates: { school_id: schoolId } }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

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
      const response = await adminFetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates: { role } }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setProfiles(prev =>
        prev.map(p => (p.id === userId ? { ...p, role } : p))
      );
    } catch (err) {
      console.error('Error updating user role:', err);
    } finally {
      setSaving(null);
    }
  }

  async function updateUserTier(userId: string, membership_tier: string) {
    setSaving(userId);
    try {
      const response = await adminFetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates: { membership_tier } }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setProfiles(prev =>
        prev.map(p => (p.id === userId ? { ...p, membership_tier } : p))
      );
    } catch (err) {
      console.error('Error updating user tier:', err);
    } finally {
      setSaving(null);
    }
  }

  const getTierBadgeStyle = (tier: string) => {
    switch (tier) {
      case 'full':
        return 'bg-purple-100 text-purple-700';
      case 'standard':
        return 'bg-blue-100 text-blue-700';
      case 'free':
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredProfiles = profiles.filter(p => {
    const matchesFilter = (() => {
      if (filter === 'unassigned') return !p.school_id;
      if (filter === 'admin') return p.role === 'admin';
      if (filter === 'school_admin') return p.role === 'school_admin';
      if (filter === 'teacher') return p.role === 'teacher';
      if (filter === 'pupil') return p.role === 'pupil';
      return true;
    })();
    
    const matchesSearch = !searchTerm || 
      p.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: profiles.length,
    admins: profiles.filter(p => p.role === 'admin').length,
    schoolAdmins: profiles.filter(p => p.role === 'school_admin').length,
    teachers: profiles.filter(p => p.role === 'teacher').length,
    pupils: profiles.filter(p => p.role === 'pupil').length,
    unassigned: profiles.filter(p => !p.school_id).length,
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

  const canExpand = (profile: Profile) => {
    return profile.role === 'teacher' || profile.role === 'school_admin';
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
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <Link href="/admin" className="text-[var(--wrife-blue)] hover:underline text-sm">
                ← Back to Dashboard
              </Link>
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--wrife-text-main)]">User Management</h1>
            <p className="text-sm text-[var(--wrife-text-muted)] mt-1">
              Assign users to schools, manage roles, and view teacher classes
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <div className="bg-white rounded-xl p-4 border border-[var(--wrife-border)] text-center">
              <p className="text-2xl font-bold text-[var(--wrife-text-main)]">{stats.total}</p>
              <p className="text-xs text-[var(--wrife-text-muted)]">Total Users</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 border border-red-200 text-center">
              <p className="text-2xl font-bold text-red-600">{stats.admins}</p>
              <p className="text-xs text-red-600">Admins</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200 text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.schoolAdmins}</p>
              <p className="text-xs text-purple-600">School Admins</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.teachers}</p>
              <p className="text-xs text-blue-600">Teachers</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.pupils}</p>
              <p className="text-xs text-green-600">Pupils</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.unassigned}</p>
              <p className="text-xs text-yellow-600">Unassigned</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[var(--wrife-border)] mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'admin', 'school_admin', 'teacher', 'pupil', 'unassigned'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-2 rounded-full text-xs font-medium transition ${
                      filter === f
                        ? f === 'admin' ? 'bg-red-500 text-white'
                        : f === 'school_admin' ? 'bg-purple-500 text-white'
                        : f === 'teacher' ? 'bg-blue-500 text-white'
                        : f === 'pupil' ? 'bg-green-500 text-white'
                        : f === 'unassigned' ? 'bg-yellow-500 text-white'
                        : 'bg-[var(--wrife-blue)] text-white'
                        : 'bg-gray-100 text-[var(--wrife-text-main)] hover:bg-gray-200'
                    }`}
                  >
                    {f === 'all' ? 'All' : f === 'school_admin' ? 'School Admins' : f === 'unassigned' ? 'Unassigned' : f.charAt(0).toUpperCase() + f.slice(1) + 's'}
                  </button>
                ))}
              </div>
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
            <div className="space-y-3">
              {filteredProfiles.map(profile => (
                <div key={profile.id} className="bg-white rounded-xl border border-[var(--wrife-border)] overflow-hidden">
                  <div 
                    className={`flex flex-wrap items-center gap-4 px-6 py-4 ${
                      canExpand(profile) ? 'cursor-pointer hover:bg-gray-50' : ''
                    } transition`}
                    onClick={() => canExpand(profile) && fetchUserDetails(profile.id)}
                  >
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[var(--wrife-text-main)]">
                          {profile.display_name || 'No name'}
                        </p>
                        {canExpand(profile) && (
                          <span className={`transform transition-transform ${expandedUser === profile.id ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--wrife-text-muted)]">{profile.email}</p>
                    </div>

                    <div onClick={e => e.stopPropagation()}>
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
                    </div>

                    <div onClick={e => e.stopPropagation()}>
                      {profile.role === 'teacher' || profile.role === 'school_admin' ? (
                        <select
                          value={profile.membership_tier || 'free'}
                          onChange={e => updateUserTier(profile.id, e.target.value)}
                          disabled={saving === profile.id}
                          className={`rounded-full px-3 py-1 text-xs font-semibold border-0 cursor-pointer ${getTierBadgeStyle(
                            profile.membership_tier || 'free'
                          )}`}
                        >
                          <option value="free">Free</option>
                          <option value="standard">Standard</option>
                          <option value="full">Full Teacher</option>
                        </select>
                      ) : (
                        <span className="text-xs text-[var(--wrife-text-muted)]">-</span>
                      )}
                    </div>

                    <div onClick={e => e.stopPropagation()}>
                      <select
                        value={profile.school_id || ''}
                        onChange={e => updateUserSchool(profile.id, e.target.value || null)}
                        disabled={saving === profile.id}
                        className="rounded-lg border border-[var(--wrife-border)] px-3 py-2 text-sm text-[var(--wrife-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent min-w-[160px]"
                      >
                        <option value="">-- Unassigned --</option>
                        {schools.map(school => (
                          <option key={school.id} value={school.id}>
                            {school.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="text-sm text-[var(--wrife-text-muted)] min-w-[100px]">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {expandedUser === profile.id && (
                    <div className="border-t border-[var(--wrife-border)] bg-gray-50 px-6 py-4">
                      {loadingDetails ? (
                        <div className="flex items-center gap-2 text-sm text-[var(--wrife-text-muted)]">
                          <div className="animate-spin h-4 w-4 border-2 border-[var(--wrife-blue)] border-t-transparent rounded-full"></div>
                          Loading details...
                        </div>
                      ) : userDetails ? (
                        <div className="space-y-4">
                          <div className="flex gap-6">
                            <div className="text-center">
                              <p className="text-xl font-bold text-[var(--wrife-blue)]">{userDetails.stats.classCount}</p>
                              <p className="text-xs text-[var(--wrife-text-muted)]">Classes</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xl font-bold text-green-600">{userDetails.stats.pupilCount}</p>
                              <p className="text-xs text-[var(--wrife-text-muted)]">Pupils</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xl font-bold text-purple-600">{userDetails.stats.totalActivities}</p>
                              <p className="text-xs text-[var(--wrife-text-muted)]">Activities</p>
                            </div>
                          </div>

                          {userDetails.classes.length > 0 ? (
                            <div>
                              <h4 className="text-sm font-semibold text-[var(--wrife-text-main)] mb-2">Classes</h4>
                              <div className="grid gap-3 md:grid-cols-2">
                                {userDetails.classes.map(cls => {
                                  const classPupils = userDetails.pupils.filter(p => p.class_id === cls.id);
                                  return (
                                    <div key={cls.id} className="bg-white rounded-lg border border-[var(--wrife-border)] p-3">
                                      <div className="flex items-center justify-between mb-2">
                                        <div>
                                          <p className="font-medium text-[var(--wrife-text-main)]">{cls.name}</p>
                                          <p className="text-xs text-[var(--wrife-text-muted)]">
                                            Year {cls.year_group} • Code: {cls.class_code}
                                          </p>
                                        </div>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                          {classPupils.length} pupils
                                        </span>
                                      </div>
                                      
                                      {classPupils.length > 0 ? (
                                        <div className="space-y-1 mt-2 pt-2 border-t border-gray-100">
                                          {classPupils.map(pupil => (
                                            <div key={pupil.id} className="flex items-center gap-2 text-xs">
                                              <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-medium">
                                                {pupil.pupil_name?.charAt(0)?.toUpperCase() || '?'}
                                              </span>
                                              <span className="text-[var(--wrife-text-main)]">{pupil.pupil_name}</span>
                                              <span className="text-[var(--wrife-text-muted)]">({pupil.pupil_email})</span>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-xs text-[var(--wrife-text-muted)] mt-2 pt-2 border-t border-gray-100">
                                          No pupils enrolled yet
                                        </p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-[var(--wrife-text-muted)] bg-white rounded-lg border border-[var(--wrife-border)] p-4 text-center">
                              No classes created yet
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-red-600">Failed to load user details</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 text-sm text-[var(--wrife-text-muted)]">
            Showing {filteredProfiles.length} of {profiles.length} users
            {filter === 'teacher' && ' (click to expand and view classes)'}
          </div>
        </div>
      </div>
    </>
  );
}
