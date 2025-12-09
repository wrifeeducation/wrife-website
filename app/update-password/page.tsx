'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BookLogo from '@/components/mascots/BookLogo';
import Link from 'next/link';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasValidSession, setHasValidSession] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasValidSession(true);
      }
      setSessionChecked(true);
    };
    checkSession();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      router.push('/login');
    }, 3000);
  }

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--wrife-blue)] mx-auto"></div>
          <p className="mt-4 text-sm text-[var(--wrife-text-muted)]">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <BookLogo size="lg" />
            <div className="flex flex-col leading-tight text-left">
              <span className="font-extrabold text-2xl text-[var(--wrife-text-main)]" style={{ fontFamily: 'var(--font-display)' }}>WriFe</span>
              <span className="text-xs text-[var(--wrife-text-muted)]">Writing for Everyone</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[var(--wrife-text-main)] mb-2">Set new password</h1>
          <p className="text-sm text-[var(--wrife-text-muted)]">
            Choose a strong password for your account
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--wrife-mint)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[var(--wrife-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">Password updated!</h2>
              <p className="text-sm text-[var(--wrife-text-muted)] mb-4">
                Your password has been successfully changed. Redirecting to sign in...
              </p>
              <Link href="/login" className="text-sm text-[var(--wrife-blue)] hover:underline">
                Go to sign in now
              </Link>
            </div>
          ) : !hasValidSession ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--wrife-coral)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[var(--wrife-danger)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">Link expired</h2>
              <p className="text-sm text-[var(--wrife-text-muted)] mb-4">
                This reset link is invalid or has expired. Please request a new password reset.
              </p>
              <Link href="/reset-password" className="text-sm text-[var(--wrife-blue)] hover:underline">
                Request a new reset link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-[var(--wrife-coral)]/10 border border-[var(--wrife-coral)] text-sm text-[var(--wrife-danger)]">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
                  New password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent"
                  placeholder="••••••••"
                />
                <p className="text-xs text-[var(--wrife-text-muted)] mt-1">Must be at least 6 characters</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
                  Confirm new password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[var(--wrife-blue)] px-6 py-3 text-sm font-bold text-white shadow-soft hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
