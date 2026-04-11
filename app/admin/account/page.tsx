'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function AdminAccountPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/admin/login');
        return;
      }
      if (user.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [user, authLoading, router]);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    setSaving(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError('No active session. Please log in again.');
      setSaving(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email!,
      password: currentPassword,
    });

    if (signInError) {
      setError('Current password is incorrect');
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setSuccess('Password changed successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSaving(false);
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--wrife-blue)]"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-900 py-10 px-4">
        <div className="mx-auto max-w-lg">
          <div className="mb-6">
            <Link
              href="/admin"
              className="text-sm text-slate-400 hover:text-white transition inline-flex items-center gap-1"
            >
              ← Back to Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">🛡️</span>
            <div>
              <h1 className="text-2xl font-extrabold text-white">My Account</h1>
              <p className="text-sm text-slate-400">{user?.email}</p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-2xl shadow-blue-500/10">
            <h2 className="text-lg font-bold text-white mb-1">Change Password</h2>
            <p className="text-sm text-slate-400 mb-5">
              Update your admin password. You will remain logged in after changing it.
            </p>

            {success && (
              <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/40 text-sm text-green-400">
                {success}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-semibold text-slate-200 mb-2">
                  Current password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-200 mb-2">
                  New password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent"
                  placeholder="New password"
                />
                <p className="text-xs text-slate-500 mt-1">Must be at least 8 characters</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-200 mb-2">
                  Confirm new password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-full bg-[var(--wrife-blue)] px-6 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition disabled:opacity-50 mt-2"
              >
                {saving ? 'Changing password...' : 'Change password'}
              </button>
            </form>
          </div>

          <div className="mt-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Other options</h3>
            <div className="space-y-2">
              <Link
                href="/admin/reset-password"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
              >
                <span>→</span>
                <span>Send a password reset email instead</span>
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
              >
                <span>→</span>
                <span>Manage admin accounts and user roles</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
