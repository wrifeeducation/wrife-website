'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function SuperAdminHelpPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--wrife-blue)]"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[var(--wrife-bg)] py-8">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-6">
            <Link href="/admin" className="text-[var(--wrife-blue)] hover:underline text-sm">
              ← Back to Dashboard
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-2xl">🛡️</span>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-[var(--wrife-text-main)]">Super Admin Guide</h1>
                <p className="text-sm text-[var(--wrife-text-muted)]">Everything you need to manage WriFe</p>
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="text-[var(--wrife-text-muted)] mb-6">
                As a Super Admin, you have full control over all schools, users, and subscriptions in WriFe. 
                This guide will walk you through the key features available to you.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🏫</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">1. Creating Schools</h2>
                  <p className="text-[var(--wrife-text-muted)] mb-4">
                    Schools are the foundation of WriFe. Each school can have its own teachers, pupils, and classes.
                  </p>
                  <div className="bg-[var(--wrife-bg)] rounded-lg p-4 space-y-2">
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Step 1:</strong> Click the "+ New School" button on your dashboard</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Step 2:</strong> Enter the school name and domain (e.g., oakwood-primary.edu)</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Step 3:</strong> Set teacher and pupil limits based on the subscription</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Step 4:</strong> Choose a subscription tier (Trial, Basic, Pro, Enterprise)</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Step 5:</strong> Click "Create School" to finish</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">👥</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">2. Managing Users</h2>
                  <p className="text-[var(--wrife-text-muted)] mb-4">
                    Assign users to schools and manage their roles from the User Management page.
                  </p>
                  <div className="bg-[var(--wrife-bg)] rounded-lg p-4 space-y-2">
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Step 1:</strong> Click "Manage Users" on your dashboard</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Step 2:</strong> Find the user you want to assign (use filters to narrow down)</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Step 3:</strong> Select a school from the dropdown to assign them</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Step 4:</strong> Change their role if needed (Teacher, Pupil, School Admin)</p>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <strong>Tip:</strong> Use the "Unassigned" filter to quickly find users who haven't been assigned to a school yet.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">3. Understanding Subscription Tiers</h2>
                  <p className="text-[var(--wrife-text-muted)] mb-4">
                    Each tier provides different limits for teachers and pupils.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                      <p className="font-semibold text-yellow-700 text-sm">Trial</p>
                      <p className="text-xs text-yellow-600">5 teachers, 100 pupils</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <p className="font-semibold text-blue-700 text-sm">Basic</p>
                      <p className="text-xs text-blue-600">10 teachers, 300 pupils</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <p className="font-semibold text-purple-700 text-sm">Pro</p>
                      <p className="text-xs text-purple-600">25 teachers, 750 pupils</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <p className="font-semibold text-green-700 text-sm">Enterprise</p>
                      <p className="text-xs text-green-600">Unlimited</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">⚡</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">4. Activating & Deactivating Schools</h2>
                  <p className="text-[var(--wrife-text-muted)] mb-4">
                    Control which schools are active in the system.
                  </p>
                  <div className="bg-[var(--wrife-bg)] rounded-lg p-4 space-y-2">
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>To toggle:</strong> Click the green/grey dot next to a school's name</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Green dot:</strong> School is active - teachers and pupils can access content</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Grey dot:</strong> School is inactive - access is restricted</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🔍</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">5. Viewing School Details</h2>
                  <p className="text-[var(--wrife-text-muted)] mb-4">
                    Get detailed information about any school.
                  </p>
                  <div className="bg-[var(--wrife-bg)] rounded-lg p-4 space-y-2">
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Step 1:</strong> Click "View Details" on any school card</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Step 2:</strong> Browse tabs: Overview, Classes, Teachers, Pupils</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Step 3:</strong> View class codes, teacher assignments, and usage stats</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-[var(--wrife-blue-soft)] rounded-2xl p-6 text-center">
            <p className="text-[var(--wrife-text-main)] mb-4">Need more help?</p>
            <p className="text-sm text-[var(--wrife-text-muted)]">
              Contact support at <span className="text-[var(--wrife-blue)]">support@wrife.com</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
