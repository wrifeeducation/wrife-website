'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, signIn } = useAuth();

  useEffect(() => {
    if (user) {
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get('redirectTo') || '/dashboard';
      router.push(redirectTo);
    }
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get('redirectTo') || '/dashboard';
      window.location.href = redirectTo;
    }
  }

  return (
    <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-[var(--wrife-blue-soft)] flex items-center justify-center">
              <span className="text-2xl font-black text-[var(--wrife-blue)]">W</span>
            </div>
            <div className="flex flex-col leading-tight text-left">
              <span className="font-extrabold text-xl text-[var(--wrife-text-main)]">WriFe</span>
              <span className="text-xs text-[var(--wrife-text-muted)]">Writing for Everyone</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[var(--wrife-text-main)] mb-2">Welcome back</h1>
          <p className="text-sm text-[var(--wrife-text-muted)]">Sign in to your teacher account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-[var(--wrife-coral)]/10 border border-[var(--wrife-coral)] text-sm text-[var(--wrife-danger)]">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent"
                placeholder="your.email@school.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <div className="text-right">
              <Link href="/reset-password" className="text-sm text-[var(--wrife-blue)] hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[var(--wrife-blue)] px-6 py-3 text-sm font-semibold text-white shadow-soft hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--wrife-text-muted)]">
              Don't have an account?{' '}
              <Link href="/signup" className="text-[var(--wrife-blue)] font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-[var(--wrife-text-muted)] hover:text-[var(--wrife-blue)]">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
