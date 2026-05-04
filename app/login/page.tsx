'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

const trustItems = [
  { value: "67", label: "Structured Lessons" },
  { value: "432+", label: "Practice Activities" },
  { value: "AI", label: "Powered Feedback" },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading, signIn, signOut, getDashboardPath } = useAuth();
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const redirectTo = params?.get('redirectTo');
  const planParam = params?.get('plan');
  const billingParam = params?.get('billing');

  const getRedirectUrl = () => {
    if (planParam) {
      return `/pricing?plan=${planParam}&billing=${billingParam || 'yearly'}`;
    }
    return redirectTo || getDashboardPath();
  };

  useEffect(() => {
    if (!authLoading && user) {
      const target = getRedirectUrl();
      console.log('Login page: User authenticated, redirecting to:', target);
      window.location.href = target;
    }
  }, [user, authLoading, redirectTo, planParam, billingParam, getDashboardPath]);

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
      console.log('[Login] Session established');

      const profileResponse = await fetch(`/api/auth/profile?userId=${data.user.id}&email=${encodeURIComponent(email)}`);
      const profileData = await profileResponse.json();
      const profile = profileData.profile;
      console.log('[Login] Profile:', profile);

      if (!profile) {
        console.log('[Login] No profile found, signing out');
        setError('Your account setup is incomplete. Please contact support or try signing up again.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (profile.role === 'admin') {
        setError('Admin accounts must use the Admin Portal.');
        await supabase.auth.signOut();
        setLoading(false);
        router.push('/admin/login');
        return;
      }

      const targetPath = getRedirectUrl();
      console.log('[Login] Redirecting to:', targetPath);
      window.location.href = targetPath;
    } else {
      console.log('[Login] No session in response, something went wrong');
      setError('Sign in was successful but session was not established. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — brand / trust ── */}
      <div
        className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-10 xl:p-14 relative overflow-hidden"
        style={{ backgroundColor: "var(--wrife-blue)" }}
      >
        {/* Background decoration */}
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10 pointer-events-none"
          style={{ backgroundColor: "white" }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{ backgroundColor: "var(--wrife-orange)" }}
        />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <span
            className="font-extrabold text-2xl text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            WriFe
          </span>
        </Link>

        {/* Centre content */}
        <div className="relative z-10 flex flex-col items-start">
          {/* Mascot */}
          <div className="mb-8 mascot-float-a">
            <Image
              src="/mascots/pencil-celebrating.png"
              alt="WriFe mascot"
              width={140}
              height={168}
              className="drop-shadow-xl"
            />
          </div>

          <h2
            className="text-3xl xl:text-4xl font-extrabold text-white mb-4 leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Every child.<br />Their own story.
          </h2>
          <p className="text-white/75 text-base leading-relaxed max-w-xs">
            A complete writing system for UK schools — structured lessons,
            daily practice, and a full teacher dashboard.
          </p>

          {/* Trust stats */}
          <div className="mt-8 flex gap-6">
            {trustItems.map((item) => (
              <div key={item.label}>
                <div
                  className="text-2xl font-extrabold text-white"
                  style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
                >
                  {item.value}
                </div>
                <div className="text-xs text-white/60 mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-white/40 text-xs relative z-10">
          © {new Date().getFullYear()} WriFe Education Ltd
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div
        className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 xl:px-24"
        style={{ backgroundColor: "var(--wrife-surface)" }}
      >
        {/* Mobile logo (hidden on lg+) */}
        <div className="lg:hidden mb-10 flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <span
              className="font-extrabold text-2xl"
              style={{ fontFamily: "var(--font-display)", color: "var(--wrife-blue)" }}
            >
              WriFe
            </span>
          </Link>
        </div>

        <div className="w-full max-w-sm mx-auto">
          <div className="mb-8">
            <h1
              className="text-2xl sm:text-3xl font-extrabold mb-2"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--wrife-text-main)",
              }}
            >
              Welcome back
            </h1>
            <p style={{ color: "var(--wrife-text-muted)" }} className="text-sm">
              Sign in to your teacher account
            </p>
          </div>

          {error && (
            <div
              className="mb-6 p-4 rounded-xl text-sm flex items-start gap-2"
              style={{
                backgroundColor: "var(--wrife-coral-soft)",
                color: "var(--wrife-danger)",
                border: "1px solid var(--wrife-coral)",
              }}
            >
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold mb-2"
                style={{ color: "var(--wrife-text-main)" }}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl transition-all focus:outline-none"
                style={{
                  border: email.length > 0 ? "2px solid var(--wrife-blue)" : "2px solid var(--wrife-border)",
                  backgroundColor: "white",
                  color: "var(--wrife-text-main)",
                }}
                placeholder="your.email@school.com"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold"
                  style={{ color: "var(--wrife-text-main)" }}
                >
                  Password
                </label>
                <Link
                  href="/reset-password"
                  className="text-xs font-medium hover:underline"
                  style={{ color: "var(--wrife-blue)" }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl pr-12 transition-all focus:outline-none"
                  style={{
                    border: password.length > 0 ? "2px solid var(--wrife-blue)" : "2px solid var(--wrife-border)",
                    backgroundColor: "white",
                    color: "var(--wrife-text-main)",
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded"
                  style={{ color: "var(--wrife-text-muted)" }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 shadow-soft"
              style={{ backgroundColor: "var(--wrife-orange)" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Sign up link */}
          <div
            className="mt-8 pt-6 text-center text-sm"
            style={{
              borderTop: "1px solid var(--wrife-border)",
              color: "var(--wrife-text-muted)",
            }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href={planParam ? `/signup?plan=${planParam}&billing=${billingParam || 'yearly'}` : '/signup'}
              className="font-semibold hover:underline"
              style={{ color: "var(--wrife-blue)" }}
            >
              Start free trial
            </Link>
          </div>

          {/* Pupil link */}
          <div className="mt-4 text-center">
            <Link
              href="/pupil/login"
              className="text-xs hover:underline"
              style={{ color: "var(--wrife-text-muted)" }}
            >
              Pupil? Log in here →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
