'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface ClassInfo {
  id: number;
  name: string;
  year_group: number;
  class_code: string;
  pupil_count: number;
  created_at: string;
}

export default function ClassesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newYearGroup, setNewYearGroup] = useState(5);

  const fetchClasses = useCallback(async () => {
    try {
      const response = await fetch('/api/classes');
      const data = await response.json();
      if (data.classes) {
        setClasses(data.classes);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login?redirectTo=/classes');
      return;
    }
    if (user.role !== 'teacher' && user.role !== 'school_admin' && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchClasses();
  }, [user, authLoading, router, fetchClasses]);

  async function handleCreateClass(e: React.FormEvent) {
    e.preventDefault();
    if (!newClassName.trim()) return;

    setCreating(true);
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClassName,
          yearGroup: newYearGroup
        })
      });

      const data = await response.json();
      if (data.class) {
        setClasses(prev => [{ ...data.class, pupil_count: 0 }, ...prev]);
        setNewClassName('');
        setShowCreate(false);
      }
    } catch (error) {
      console.error('Error creating class:', error);
    } finally {
      setCreating(false);
    }
  }

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent"></div>
            <p className="mt-4 text-sm text-[var(--wrife-text-muted)]">Loading classes...</p>
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
              <Link href="/dashboard" className="text-[var(--wrife-blue)] hover:underline text-sm">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-extrabold text-[var(--wrife-text-main)]">My Classes</h1>
              <p className="text-sm text-[var(--wrife-text-muted)] mt-1">
                Manage your classes and pupils
              </p>
            </div>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="rounded-full bg-[var(--wrife-blue)] px-6 py-3 text-sm font-semibold text-white shadow-soft hover:opacity-90 transition"
            >
              + New Class
            </button>
          </div>

          {showCreate && (
            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6 mb-6">
              <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-4">Create New Class</h2>
              <form onSubmit={handleCreateClass} className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Class name (e.g., 5 Blue)"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                  required
                />
                <select
                  value={newYearGroup}
                  onChange={(e) => setNewYearGroup(parseInt(e.target.value))}
                  className="px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                >
                  {[1, 2, 3, 4, 5, 6].map(year => (
                    <option key={year} value={year}>Year {year}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-[var(--wrife-blue)] text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Class'}
                </button>
              </form>
            </div>
          )}

          {classes.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-12 text-center">
              <div className="mb-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--wrife-blue-soft)] mb-4">
                  <span className="text-3xl">📚</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">No classes yet</h3>
              <p className="text-sm text-[var(--wrife-text-muted)] mb-6">
                Create your first class to start managing pupils and assignments
              </p>
              <button
                onClick={() => setShowCreate(true)}
                className="rounded-full bg-[var(--wrife-blue)] px-6 py-3 text-sm font-semibold text-white shadow-soft hover:opacity-90 transition"
              >
                Create Your First Class
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {classes.map((cls) => (
                <Link key={cls.id} href={`/classes/${cls.id}`}>
                  <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6 hover:shadow-strong transition cursor-pointer">
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-[var(--wrife-text-main)]">{cls.name}</h3>
                        <span className="rounded-full bg-[var(--wrife-blue-soft)] px-3 py-1 text-xs font-semibold text-[var(--wrife-blue)]">
                          Year {cls.year_group}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4 p-3 rounded-lg bg-[var(--wrife-bg)] border border-[var(--wrife-border)]">
                      <p className="text-xs text-[var(--wrife-text-muted)] mb-1">Class Code (for pupil login)</p>
                      <p className="text-lg font-bold text-[var(--wrife-text-main)] tracking-wider font-mono">
                        {cls.class_code}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--wrife-text-muted)]">👥</span>
                        <span className="font-semibold text-[var(--wrife-text-main)]">
                          {cls.pupil_count || 0} pupils
                        </span>
                      </div>
                      <span className="text-[var(--wrife-blue)] font-medium">
                        Manage →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
