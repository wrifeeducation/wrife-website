'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminSetupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [adminExists, setAdminExists] = useState(false);
  const [authUserExists, setAuthUserExists] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'create' | 'recover'>('create');
  const router = useRouter();

  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch('/api/admin/setup');
        const data = await res.json();
        setAdminExists(data.adminExists);
        setAuthUserExists(data.authUserExists ?? false);
        if (data.email) {
          setAdminEmail(data.email);
          setEmail(data.email);
        }
      } catch {
        setError('Unable to check admin status');
      }
      setChecking(false);
    }
    checkAdmin();
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

    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          action: mode === 'recover' ? 'recover' : 'create',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to process request');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      setTimeout(() => {
        router.push('/admin/login');
      }, 3000);
    } catch {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--wrife-blue)] mx-auto"></div>
          <p className="mt-4 text-sm text-slate-400">Checking setup status...</p>
        </div>
      </div>
    );
  }

  if (adminExists && authUserExists && mode !== 'recover') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-[400px]">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Admin Already Exists</h2>
            <p className="text-sm text-slate-400 mb-6">
              An admin account has already been set up. If you need to regain access, use the password reset option on the login page.
            </p>
            <div className="space-y-3">
              <Link
                href="/admin/login"
                className="inline-block rounded-full bg-[var(--wrife-blue)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
              >
                Go to Admin Login
              </Link>
              <div>
                <button
                  onClick={() => setMode('recover')}
                  className="text-sm text-slate-500 hover:text-white transition"
                >
                  Need to reset admin credentials?
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (adminExists && !authUserExists && mode !== 'recover') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-[400px]">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 text-center">
            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Admin Recovery Needed</h2>
            <p className="text-sm text-slate-400 mb-4">
              An admin profile exists for <span className="text-white font-medium">{adminEmail}</span>, but the login account is missing. You can recover it by setting a new password.
            </p>
            <button
              onClick={() => setMode('recover')}
              className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
            >
              Recover Admin Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isRecovery = mode === 'recover';

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-4xl">{isRecovery ? '🔑' : '🔧'}</span>
            <div className="flex flex-col leading-tight text-left">
              <span className="font-extrabold text-2xl text-white">
                {isRecovery ? 'Account Recovery' : 'Admin Setup'}
              </span>
              <span className="text-sm text-slate-400">
                {isRecovery ? 'Reset your admin credentials' : 'Create your administrator account'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-2xl shadow-blue-500/10">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white mb-2">
                {isRecovery ? 'Account Recovered!' : 'Admin Account Created!'}
              </h2>
              <p className="text-sm text-slate-400 mb-4">
                Redirecting to admin login...
              </p>
              <Link href="/admin/login" className="text-sm text-[var(--wrife-blue)] hover:underline">
                Go to login now
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-sm text-red-400">
                  {error}
                </div>
              )}

              {!isRecovery && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-slate-200 mb-2">
                      First name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent"
                      placeholder="Admin"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-slate-200 mb-2">
                      Last name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent"
                      placeholder="User"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-200 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent"
                  placeholder="admin@wrife.co.uk"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-200 mb-2">
                  {isRecovery ? 'New password' : 'Password'}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent"
                  placeholder="••••••••"
                />
                <p className="text-xs text-slate-500 mt-1">Must be at least 8 characters</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-200 mb-2">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[var(--wrife-blue)] px-6 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition disabled:opacity-50 mt-2"
              >
                {loading
                  ? (isRecovery ? 'Recovering account...' : 'Creating account...')
                  : (isRecovery ? 'Recover Admin Account' : 'Create Admin Account')}
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center space-y-2">
          {isRecovery && (
            <button
              onClick={() => setMode('create')}
              className="block w-full text-sm text-slate-500 hover:text-white transition"
            >
              Back
            </button>
          )}
          <Link href="/admin/login" className="block text-sm text-slate-500 hover:text-white transition">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
