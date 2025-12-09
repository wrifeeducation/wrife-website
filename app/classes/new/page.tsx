'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function NewClassPage() {
  const [name, setName] = useState('');
  const [yearGroup, setYearGroup] = useState<number>(3);
  const [schoolName, setSchoolName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--wrife-bg)' }}>
          <div className="mx-auto max-w-2xl px-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--wrife-surface)', border: '1px solid var(--wrife-border)' }}>
                <div className="space-y-5">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_class_code');

      if (codeError) throw codeError;

      const { data, error: insertError } = await supabase
        .from('classes')
        .insert({
          teacher_id: user.id,
          name,
          year_group: yearGroup,
          class_code: codeData,
          school_name: schoolName || null,
          school_id: user.school_id || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      router.push('/classes');
    } catch (err: any) {
      console.error('Error creating class:', err);
      setError(err.message || 'Failed to create class');
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--wrife-bg)' }}>
        <div className="mx-auto max-w-2xl px-4">
          <div className="mb-6">
            <Link href="/classes" className="text-sm hover:underline mb-2 inline-block" style={{ color: 'var(--wrife-blue)' }}>
              ← Back to classes
            </Link>
            <h1 className="text-2xl font-extrabold" style={{ color: 'var(--wrife-text-main)' }}>Create New Class</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--wrife-text-muted)' }}>
              Set up a new class to start managing your pupils
            </p>
          </div>

          <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--wrife-surface)', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)', border: '1px solid var(--wrife-border)' }}>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#FEE2E2', border: '1px solid #EF4444', color: '#DC2626' }}>
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-semibold mb-2" style={{ color: 'var(--wrife-text-main)' }}>
                  Class Name <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g., Year 4 Maple"
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                  style={{ border: '1px solid var(--wrife-border)', color: 'var(--wrife-text-main)' }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--wrife-text-muted)' }}>
                  This is how you will identify the class
                </p>
              </div>

              <div>
                <label htmlFor="yearGroup" className="block text-sm font-semibold mb-2" style={{ color: 'var(--wrife-text-main)' }}>
                  Year Group <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  id="yearGroup"
                  value={yearGroup}
                  onChange={(e) => setYearGroup(parseInt(e.target.value))}
                  required
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                  style={{ border: '1px solid var(--wrife-border)', color: 'var(--wrife-text-main)' }}
                >
                  <option value={2}>Year 2</option>
                  <option value={3}>Year 3</option>
                  <option value={4}>Year 4</option>
                  <option value={5}>Year 5</option>
                  <option value={6}>Year 6</option>
                </select>
              </div>

              <div>
                <label htmlFor="schoolName" className="block text-sm font-semibold mb-2" style={{ color: 'var(--wrife-text-main)' }}>
                  School Name <span className="text-xs font-normal" style={{ color: 'var(--wrife-text-muted)' }}>(Optional)</span>
                </label>
                <input
                  id="schoolName"
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g., Riverside Primary"
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                  style={{ border: '1px solid var(--wrife-border)', color: 'var(--wrife-text-main)' }}
                />
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--wrife-blue-soft)', border: '1px solid var(--wrife-blue)' }}>
                <p className="text-sm" style={{ color: 'var(--wrife-text-main)' }}>
                  <strong>Class Code:</strong> A unique code will be automatically generated. 
                  Share this code with your pupils so they can join the class.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Link href="/classes" className="flex-1">
                  <button
                    type="button"
                    className="w-full rounded-full px-6 py-3 text-sm font-semibold transition hover:opacity-80"
                    style={{ border: '1px solid var(--wrife-border)', color: 'var(--wrife-text-main)', backgroundColor: 'var(--wrife-surface)' }}
                  >
                    Cancel
                  </button>
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--wrife-blue)', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)' }}
                >
                  {loading ? 'Creating...' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
