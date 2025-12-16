'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase, syncSessionToServer } from '@/lib/supabase';
import Link from 'next/link';
import BookLogo from '@/components/mascots/BookLogo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading, signIn, signOut, getDashboardPath } = useAuth();
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const redirectTo = params?.get('redirectTo');

  useEffect(() => {
    // Wait for auth to finish loading before redirecting
    if (!authLoading && user) {
      const dashboardPath = getDashboardPath();
      console.log('Login page: User authenticated, redirecting to:', redirectTo || dashboardPath);
      window.location.href = redirectTo || dashboardPath;
    }
  }, [user, authLoading, redirectTo, getDashboardPath]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('[Login] Attempting sign in for:', email);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.log('[Login] Sign in error:', signInError.message);
      setError(signInError.message);
      setLoading(false);
      return;
    }

    console.log('[Login] Sign in successful, user:', data.user?.id);
    console.log('[Login] Session from response:', data.session ? 'Present' : 'Missing');
    
    if (data.session && data.user) {
      await syncSessionToServer('SIGNED_IN', data.session);
      console.log('[Login] Session synced to server');
      
      const profileResponse = await fetch(`/api/auth/profile?userId=${data.user.id}`);
      const profileData = await profileResponse.json();
      const profile = profileData.profile;
      console.log('[Login] Profile:', profile);
      
      if (profile?.role === 'admin') {
        setError('Admin accounts must use the Admin Portal.');
        await supabase.auth.signOut();
        await syncSessionToServer('SIGNED_OUT', null);
        setLoading(false);
        router.push('/admin/login');
        return;
      }
      
      const targetPath = redirectTo || (profile?.role === 'teacher' ? '/dashboard' : '/pupil/dashboard');
      console.log('[Login] Redirecting to:', targetPath);
      window.location.href = targetPath;
    } else {
      console.log('[Login] No session in response, something went wrong');
      setError('Sign in was successful but session was not established. Please try again.');
      setLoading(false);
    }
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
              className="w-full rounded-full bg-[var(--wrife-orange)] px-6 py-3 text-sm font-bold text-white shadow-soft hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--wrife-text-muted)]">
              Don&apos;t have an account?{' '}
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
