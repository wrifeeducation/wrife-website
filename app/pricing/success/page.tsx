'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/auth-context';
import { getEntitlements, TIER_DISPLAY_NAMES, type MembershipTier } from '@/lib/entitlements';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const { user, loading, refreshProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const hasRefreshed = useRef(false);

  useEffect(() => {
    async function refreshAndRedirect() {
      if (!loading && user && !hasRefreshed.current) {
        hasRefreshed.current = true;
        await refreshProfile();
        setRefreshing(false);
      }
    }
    
    refreshAndRedirect();
  }, [loading, user, refreshProfile]);

  useEffect(() => {
    if (!refreshing) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push('/dashboard');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [refreshing, router]);

  if (loading || refreshing) {
    return (
      <div className="min-h-screen bg-[var(--wrife-bg)]">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-20">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent mb-6"></div>
            <h1 className="text-2xl font-bold text-[var(--wrife-text-main)] mb-2">
              Activating Your Subscription...
            </h1>
            <p className="text-[var(--wrife-text-muted)]">
              Please wait while we update your account.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const entitlements = user ? getEntitlements(user.membership_tier, user.school_tier) : null;
  const tierName = entitlements ? TIER_DISPLAY_NAMES[entitlements.tier as MembershipTier] : 'Unknown';

  return (
    <div className="min-h-screen bg-[var(--wrife-bg)]">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-20">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-[var(--wrife-text-main)] mb-2">
            Welcome to {tierName}!
          </h1>
          
          <p className="text-lg text-[var(--wrife-text-muted)] mb-8">
            Your subscription is now active. You have full access to all your plan features.
          </p>

          <div className="bg-[var(--wrife-blue-soft)] rounded-2xl p-6 mb-8">
            <h2 className="font-semibold text-[var(--wrife-text-main)] mb-4">
              Your New Features:
            </h2>
            <ul className="text-left space-y-2 text-[var(--wrife-text-muted)]">
              {entitlements?.canAccessAllComponents && (
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Full access to all lesson materials
                </li>
              )}
              {entitlements?.canManageClasses && (
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Class management and pupil tracking
                </li>
              )}
              {entitlements?.canAssignWork && (
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Assign work to your classes
                </li>
              )}
              {entitlements?.canViewProgress && (
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  View pupil progress and AI assessments
                </li>
              )}
            </ul>
          </div>

          <p className="text-sm text-[var(--wrife-text-muted)] mb-6">
            Redirecting to your dashboard in {countdown} seconds...
          </p>

          <Link
            href="/dashboard"
            className="inline-block px-8 py-3 bg-[var(--wrife-blue)] text-white font-semibold rounded-full hover:opacity-90 transition"
          >
            Go to Dashboard Now
          </Link>
        </div>
      </main>
    </div>
  );
}
