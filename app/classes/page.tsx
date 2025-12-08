'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Class {
  id: number;
  name: string;
  year_group: number;
  class_code: string;
  school_name: string | null;
  created_at: string;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchClasses();
    }
  }, [user, authLoading, router]);

  async function fetchClasses() {
    setLoading(true);
    setError('');

    try {
      const { data, error: fetchError } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user?.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setClasses(data || []);
    } catch (err: any) {
      console.error('Error fetching classes:', err);
      setError(err.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--wrife-bg)' }}>
          <div className="max-w-4xl mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded-2xl"></div>
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
      <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--wrife-bg)' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-extrabold" style={{ color: 'var(--wrife-text-main)' }}>
                My Classes
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--wrife-text-muted)' }}>
                Manage your classes and pupils
              </p>
            </div>
            <Link href="/classes/new">
              <button
                className="rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: 'var(--wrife-blue)', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)' }}
              >
                + Create New Class
              </button>
            </Link>
          </div>

          {error && (
            <div className="p-4 rounded-lg mb-6 text-sm" style={{ backgroundColor: '#FEE2E2', border: '1px solid #EF4444', color: '#DC2626' }}>
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl p-6 animate-pulse"
                  style={{ backgroundColor: 'var(--wrife-surface)', border: '1px solid var(--wrife-border)' }}
                >
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : classes.length === 0 ? (
            <div
              className="text-center py-12 rounded-2xl"
              style={{ backgroundColor: 'var(--wrife-surface)', border: '1px solid var(--wrife-border)' }}
            >
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--wrife-text-main)' }}>
                No classes yet
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--wrife-text-muted)' }}>
                Create your first class to start managing your pupils
              </p>
              <Link href="/classes/new">
                <button
                  className="rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  style={{ backgroundColor: 'var(--wrife-blue)' }}
                >
                  Create Your First Class
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {classes.map((classItem) => (
                <div
                  key={classItem.id}
                  className="rounded-2xl p-6 transition hover:shadow-lg cursor-pointer"
                  style={{ backgroundColor: 'var(--wrife-surface)', border: '1px solid var(--wrife-border)', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)' }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: 'var(--wrife-text-main)' }}>
                        {classItem.name}
                      </h3>
                      <div className="flex flex-wrap gap-3 mt-2">
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: 'var(--wrife-blue-soft)', color: 'var(--wrife-blue)' }}
                        >
                          Year {classItem.year_group}
                        </span>
                        {classItem.school_name && (
                          <span
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: 'var(--wrife-bg)', color: 'var(--wrife-text-muted)' }}
                          >
                            {classItem.school_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs" style={{ color: 'var(--wrife-text-muted)' }}>Class Code</p>
                        <p className="font-mono font-bold text-lg" style={{ color: 'var(--wrife-blue)' }}>
                          {classItem.class_code}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
