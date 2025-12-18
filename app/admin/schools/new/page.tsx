'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { adminFetch } from '@/lib/admin-fetch';

export default function NewSchoolPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    teacher_limit: 10,
    pupil_limit: 300,
    subscription_tier: 'trial',
  });

  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/admin/login');
      } else if (user.role !== 'admin') {
        router.replace('/dashboard');
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, authLoading, router]);

  if (authLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--wrife-blue)] mx-auto"></div>
          <p className="mt-2 text-sm text-[var(--wrife-text-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await adminFetch('/api/admin/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to create school');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--wrife-bg)] p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin')}
            className="text-sm text-[var(--wrife-blue)] hover:underline"
          >
            ← Back to Admin Dashboard
          </button>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft border border-[var(--wrife-border)]">
          <h1 className="text-2xl font-bold text-[var(--wrife-text-main)] mb-6">
            Create New School
          </h1>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                School Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-[var(--wrife-border)] px-4 py-2 text-sm"
                placeholder="St Mary's Primary School"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                Domain (optional)
              </label>
              <input
                type="text"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="w-full rounded-xl border border-[var(--wrife-border)] px-4 py-2 text-sm"
                placeholder="stmarys.edu"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                  Teacher Limit *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.teacher_limit || ''}
                  onChange={(e) => setFormData({ ...formData, teacher_limit: e.target.value ? parseInt(e.target.value) : 0 })}
                  className="w-full rounded-xl border border-[var(--wrife-border)] px-4 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                  Pupil Limit *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.pupil_limit || ''}
                  onChange={(e) => setFormData({ ...formData, pupil_limit: e.target.value ? parseInt(e.target.value) : 0 })}
                  className="w-full rounded-xl border border-[var(--wrife-border)] px-4 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                Subscription Tier *
              </label>
              <select
                value={formData.subscription_tier}
                onChange={(e) => setFormData({ ...formData, subscription_tier: e.target.value })}
                className="w-full rounded-xl border border-[var(--wrife-border)] px-4 py-2 text-sm"
              >
                <option value="trial">Trial</option>
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="flex-1 rounded-full border border-[var(--wrife-border)] px-6 py-2 text-sm font-semibold text-[var(--wrife-text-main)] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-full bg-[var(--wrife-blue)] px-6 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create School'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
