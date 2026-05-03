'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function TeacherAccountPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [currentPassword, setCurrentPassword]   = useState('');
  const [newPassword, setNewPassword]           = useState('');
  const [confirmPassword, setConfirmPassword]   = useState('');
  const [saving, setSaving]                     = useState(false);
  const [success, setSuccess]                   = useState('');
  const [error, setError]                       = useState('');

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
    if (currentPassword === newPassword) {
      setError('New password must be different from your current password');
      return;
    }

    setSaving(true);

    // Re-authenticate first to verify current password
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email) {
      setError('No active session — please sign in again.');
      setSaving(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: currentPassword,
    });
    if (signInError) {
      setError('Current password is incorrect');
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
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

  return (
    <div className="min-h-screen bg-[var(--wrife-bg)]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-sm text-[var(--wrife-text-muted)]">
          <Link href="/dashboard" className="hover:text-[var(--wrife-blue)] transition-colors">
            Dashboard
          </Link>
          <span>›</span>
          <span className="text-[var(--wrife-text-main)] font-medium">Account Settings</span>
        </div>

        <h1 className="text-2xl font-extrabold text-[var(--wrife-text-main)] mb-1">Account Settings</h1>
        <p className="text-base text-[var(--wrife-text-muted)] mb-8">
          {user?.display_name || user?.email}
        </p>

        {/* Change Password card */}
        <div className="bg-white rounded-2xl border border-[var(--wrife-border)] shadow-sm p-6">
          <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-1">Change Password</h2>
          <p className="text-sm text-[var(--wrife-text-muted)] mb-6">
            You&apos;ll be asked to sign in again after changing your password.
          </p>

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
              <span>✓</span> {success}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1.5">
                Current password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--wrife-border)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent text-base"
                placeholder="Enter your current password"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1.5">
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
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--wrife-border)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent text-base"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1.5">
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
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--wrife-border)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent text-base"
                placeholder="Repeat new password"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link
                href="/reset-password"
                className="text-sm text-[var(--wrife-blue)] hover:underline"
              >
                Forgot current password?
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-[var(--wrife-blue)] px-6 py-2.5 text-base font-semibold text-white shadow-sm hover:opacity-90 transition disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Update password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
