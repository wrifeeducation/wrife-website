'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { adminFetch } from '@/lib/admin-fetch';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
}

interface SchoolStats {
  teachers: User[];
  teacherCount: number;
  pupils: User[];
  pupilCount: number;
}

export default function SchoolUsersPage() {
  const router = useRouter();
  const params = useParams();
  const schoolId = params?.id as string || '';
  const { user, loading: authLoading } = useAuth();
  
  const [stats, setStats] = useState<SchoolStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'teachers' | 'pupils'>('teachers');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.role !== 'admin' && user.role !== 'school_admin') {
        router.push('/dashboard');
        return;
      }
      fetchUsers();
    }
  }, [user, authLoading, router, schoolId]);

  async function fetchUsers() {
    try {
      const response = await adminFetch(`/api/_admin/school-stats?schoolId=${schoolId}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setStats(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }

  async function removeUser(userId: string, role: string) {
    if (!confirm(`Are you sure you want to remove this ${role}?`)) return;
    
    try {
      const response = await adminFetch('/api/_admin/remove-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      fetchUsers();
    } catch (err) {
      console.error('Error removing user:', err);
      alert('Failed to remove user');
    }
  }

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--wrife-blue)]"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[var(--wrife-bg)] py-8">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-6">
            <Link href="/admin" className="text-sm text-[var(--wrife-blue)] hover:underline mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-extrabold text-[var(--wrife-text-main)]">Manage Users</h1>
            <p className="text-sm text-[var(--wrife-text-muted)] mt-1">
              View and manage teachers and pupils for this school
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] overflow-hidden">
            <div className="flex border-b border-[var(--wrife-border)]">
              <button
                onClick={() => setActiveTab('teachers')}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
                  activeTab === 'teachers'
                    ? 'text-[var(--wrife-blue)] border-b-2 border-[var(--wrife-blue)] bg-[var(--wrife-blue-soft)]'
                    : 'text-[var(--wrife-text-muted)] hover:bg-gray-50'
                }`}
              >
                Teachers ({stats?.teacherCount || 0})
              </button>
              <button
                onClick={() => setActiveTab('pupils')}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
                  activeTab === 'pupils'
                    ? 'text-[var(--wrife-blue)] border-b-2 border-[var(--wrife-blue)] bg-[var(--wrife-blue-soft)]'
                    : 'text-[var(--wrife-text-muted)] hover:bg-gray-50'
                }`}
              >
                Pupils ({stats?.pupilCount || 0})
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'teachers' && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-[var(--wrife-text-main)]">Teachers</h2>
                    <Link href={`/admin/schools/${schoolId}/invite-teacher`}>
                      <button className="rounded-full bg-[var(--wrife-blue)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition">
                        + Invite Teacher
                      </button>
                    </Link>
                  </div>
                  
                  {stats?.teachers.length === 0 ? (
                    <p className="text-center text-[var(--wrife-text-muted)] py-8">No teachers yet</p>
                  ) : (
                    <div className="space-y-3">
                      {stats?.teachers.map((teacher) => (
                        <div key={teacher.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <p className="font-semibold text-[var(--wrife-text-main)]">
                              {teacher.display_name || `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() || 'Unnamed'}
                            </p>
                            <p className="text-sm text-[var(--wrife-text-muted)]">{teacher.email}</p>
                          </div>
                          <button
                            onClick={() => removeUser(teacher.id, 'teacher')}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'pupils' && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-[var(--wrife-text-main)]">Pupils</h2>
                    <Link href={`/admin/schools/${schoolId}/add-pupil`}>
                      <button className="rounded-full bg-[var(--wrife-blue)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition">
                        + Add Pupil
                      </button>
                    </Link>
                  </div>
                  
                  {stats?.pupils.length === 0 ? (
                    <p className="text-center text-[var(--wrife-text-muted)] py-8">No pupils yet</p>
                  ) : (
                    <div className="space-y-3">
                      {stats?.pupils.map((pupil) => (
                        <div key={pupil.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <p className="font-semibold text-[var(--wrife-text-main)]">
                              {pupil.display_name || `${pupil.first_name || ''} ${pupil.last_name || ''}`.trim() || 'Unnamed'}
                            </p>
                            <p className="text-sm text-[var(--wrife-text-muted)]">{pupil.email}</p>
                          </div>
                          <button
                            onClick={() => removeUser(pupil.id, 'pupil')}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
