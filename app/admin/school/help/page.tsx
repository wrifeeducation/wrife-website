'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function SchoolAdminHelpPage() {
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
            <Link href="/admin/school" className="text-[var(--wrife-blue)] hover:underline text-sm">
              ← Back to Dashboard
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-2xl">🏫</span>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-[var(--wrife-text-main)]">School Admin Guide</h1>
                <p className="text-sm text-[var(--wrife-text-muted)]">Managing your school in WriFe</p>
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="text-[var(--wrife-text-muted)] mb-6">
                As a School Admin, you can manage teachers and monitor classes within your school. 
                This guide will help you get started.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">1. Your School Dashboard</h2>
                  <p className="text-[var(--wrife-text-muted)] mb-4">
                    Your dashboard shows an overview of your school's usage and activity.
                  </p>
                  <div className="bg-[var(--wrife-bg)] rounded-lg p-4 space-y-2">
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Teacher count:</strong> How many teachers are registered vs. your limit</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Pupil count:</strong> Total pupils across all classes vs. your limit</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Active classes:</strong> Number of classes created by your teachers</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Subscription tier:</strong> Your school's current plan</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">👩‍🏫</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">2. Managing Teachers</h2>
                  <p className="text-[var(--wrife-text-muted)] mb-4">
                    View and manage the teachers in your school.
                  </p>
                  <div className="bg-[var(--wrife-bg)] rounded-lg p-4 space-y-2">
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>View teachers:</strong> See all teachers assigned to your school</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Teacher details:</strong> View each teacher's classes and pupil counts</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Contact info:</strong> Access teacher email addresses</p>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Teachers are assigned to your school by the Super Admin. Contact them if you need to add new teachers.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📚</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">3. Viewing Classes</h2>
                  <p className="text-[var(--wrife-text-muted)] mb-4">
                    Monitor all classes in your school.
                  </p>
                  <div className="bg-[var(--wrife-bg)] rounded-lg p-4 space-y-2">
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Class list:</strong> See all classes with their year groups</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Teacher assignment:</strong> Which teacher runs each class</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Pupil counts:</strong> How many pupils are in each class</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Class codes:</strong> Unique codes pupils use to join</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📈</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">4. Understanding Your Limits</h2>
                  <p className="text-[var(--wrife-text-muted)] mb-4">
                    Your subscription tier determines how many teachers and pupils you can have.
                  </p>
                  <div className="bg-[var(--wrife-bg)] rounded-lg p-4 space-y-2">
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Teacher limit:</strong> Maximum number of teacher accounts</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Pupil limit:</strong> Maximum total pupils across all classes</p>
                    <p className="text-sm text-[var(--wrife-text-main)]"><strong>Approaching limits:</strong> Dashboard shows yellow/red indicators</p>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <strong>Need more capacity?</strong> Contact the Super Admin to upgrade your subscription tier.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📋</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">5. Best Practices</h2>
                  <p className="text-[var(--wrife-text-muted)] mb-4">
                    Tips for effectively managing your school.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm text-[var(--wrife-text-main)]">Regularly check your usage against limits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm text-[var(--wrife-text-main)]">Ensure all teachers know how to create classes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm text-[var(--wrife-text-main)]">Share class codes with parents for pupil registration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm text-[var(--wrife-text-main)]">Review class activity monthly</span>
                    </li>
                  </ul>
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
