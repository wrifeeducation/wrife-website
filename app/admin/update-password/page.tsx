'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminUpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasValidSession, setHasValidSession] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setHasValidSession(true);
        setSessionChecked(true);
      } else if (event === 'SIGNED_IN' && session) {
        setHasValidSession(true);
        setSessionChecked(true);
      }
    });

    const handleRecoveryTokens = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      if (type === 'recovery' && accessToken && refreshToken) {
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          setError('Invalid or expired reset link. Please request a new one.');
          setSessionChecked(true);
          return;
        }

        if (data.session) {
          setHasValidSession(true);
          setSessionChecked(true);
          window.history.replaceState(null, '', window.location.pathname);
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasValidSession(true);
      }
      setSessionChecked(true);
    };

    handleRecoveryTokens();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      router.push('/admin/login');
    }, 3000);
  }

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--wrife-blue)] mx-auto"></div>
          <p className="mt-4 text-sm text-slate-400">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-4xl">🛡️</span>
            <div className="flex flex-col leading-tight text-left">
              <span className="font-extrabold text-2xl text-white">Admin Portal</span>
              <span className="text-sm text-slate-400">Set New Password</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-2xl shadow-blue-500/10">
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Password updated!</h2>
              <p className="text-sm text-slate-400 mb-4">
                Your admin password has been changed. Redirecting to login...
              </p>
              <Link href="/admin/login" className="text-sm text-[var(--wrife-blue)] hover:underline">
                Go to Admin Login now
              </Link>
            </div>
          ) : !hasValidSession ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Link expired</h2>
              <p className="text-sm text-slate-400 mb-4">
                This reset link is invalid or has expired.
              </p>
              {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
              <Link href="/admin/reset-password" className="text-sm text-[var(--wrife-blue)] hover:underline">
                Request a new reset link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-200 mb-2">
                  New password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent"
                  placeholder="Enter new password"
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
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[var(--wrife-blue)] px-6 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? 'Updating password...' : 'Set new password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
