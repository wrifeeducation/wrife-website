'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

const planDetails: Record<string, { name: string; monthlyPrice: string; yearlyPrice: string }> = {
  standard: { name: 'Standard Teacher', monthlyPrice: '£4.99/month', yearlyPrice: '£49/year' },
  full: { name: 'Full Teacher', monthlyPrice: '£9.99/month', yearlyPrice: '£99/year' },
};

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedBilling, setSelectedBilling] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get('plan');
    const billing = params.get('billing');
    if (plan) setSelectedPlan(plan);
    if (billing) setSelectedBilling(billing);
  }, []);

  const planInfo = selectedPlan ? planDetails[selectedPlan] : null;
  const displayPrice = planInfo
    ? (selectedBilling === 'monthly' ? planInfo.monthlyPrice : planInfo.yearlyPrice)
    : null;

  const loginUrl = selectedPlan
    ? `/login?plan=${selectedPlan}&billing=${selectedBilling || 'yearly'}`
    : '/login';

  const redirectAfterVerify = selectedPlan
    ? `/pricing?plan=${selectedPlan}&billing=${selectedBilling || 'yearly'}`
    : '/dashboard';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const redirectUrl = selectedPlan
      ? `${origin}/pricing?plan=${selectedPlan}&billing=${selectedBilling || 'yearly'}`
      : undefined;

    const { error } = await signUp(email, password, displayName, redirectUrl);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-8 text-center">
            <div className="mb-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--wrife-green)]/20 mb-4">
                <span className="text-3xl">✓</span>
              </div>
            </div>
            <h2 className="text-xl font-bold text-[var(--wrife-text-main)] mb-2">Check your email</h2>
            <p className="text-sm text-[var(--wrife-text-muted)] mb-6">
              We&apos;ve sent you a confirmation link to <strong>{email}</strong>. 
              Please check your inbox and click the link to verify your account.
            </p>
            {planInfo && (
              <p className="text-sm text-[var(--wrife-text-muted)] mb-6">
                Once verified, you&apos;ll be taken straight to checkout for the <strong>{planInfo.name}</strong> plan.
              </p>
            )}
            <Link
              href={loginUrl}
              className="inline-block rounded-full bg-[var(--wrife-blue)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
            >
              Go to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center px-4 py-12">
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
          <h1 className="text-2xl font-bold text-[var(--wrife-text-main)] mb-2">Create your account</h1>
          <p className="text-sm text-[var(--wrife-text-muted)]">
            {planInfo ? 'Sign up to get started with your plan' : 'Join WriFe as a teacher'}
          </p>
        </div>

        {planInfo && (
          <div className="bg-[var(--wrife-blue)]/5 border border-[var(--wrife-blue)]/20 rounded-xl p-4 mb-6 text-center">
            <p className="text-sm text-[var(--wrife-text-muted)] mb-1">Selected plan</p>
            <p className="text-lg font-bold text-[var(--wrife-text-main)]">{planInfo.name}</p>
            <p className="text-sm font-semibold text-[var(--wrife-blue)]">{displayPrice}</p>
            <p className="text-xs text-[var(--wrife-text-muted)] mt-2">
              You&apos;ll be taken to checkout after creating your account
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-[var(--wrife-coral)]/10 border border-[var(--wrife-coral)] text-sm text-[var(--wrife-danger)]">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="displayName" className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
                Full Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent"
                placeholder="Mr. Smith"
              />
            </div>

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
              <p className="text-xs text-[var(--wrife-text-muted)] mt-1">
                Must be at least 8 characters
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[var(--wrife-blue)] px-6 py-3 text-sm font-semibold text-white shadow-soft hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Creating account...' : (planInfo ? 'Create account & continue to checkout' : 'Create account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--wrife-text-muted)]">
              Already have an account?{' '}
              <Link href={loginUrl} className="text-[var(--wrife-blue)] font-semibold hover:underline">
                Sign in
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
