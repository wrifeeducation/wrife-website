'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { adminFetch } from '@/lib/admin-fetch';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function InviteTeacherPage() {
  const router = useRouter();
  const params = useParams();
  const schoolId = params?.id as string || '';
  const { user, loading: authLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fallbackLink, setFallbackLink] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await adminFetch('/api/admin/invite-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          schoolId,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error || 'Failed to invite teacher');
      }

      setSuccess(true);
      if (data.fallbackLink) {
        setFallbackLink(data.fallbackLink);
      } else {
        setTimeout(() => {
          router.push(`/admin/schools/${schoolId}/users`);
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--wrife-blue)]"></div>
        </div>
      </>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'school_admin')) {
    router.push('/dashboard');
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[var(--wrife-bg)] py-8">
        <div className="mx-auto max-w-md px-4">
          <div className="mb-6">
            <Link href={`/admin/schools/${schoolId}/users`} className="text-sm text-[var(--wrife-blue)] hover:underline mb-2 inline-block">
              ← Back to Users
            </Link>
            <h1 className="text-2xl font-extrabold text-[var(--wrife-text-main)]">Invite Teacher</h1>
            <p className="text-sm text-[var(--wrife-text-muted)] mt-1">
              Send an invitation to a new teacher
            </p>
          </div>

          {success ? (
            <div className={`border rounded-xl p-6 ${fallbackLink ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200 text-center'}`}>
              {fallbackLink ? (
                <>
                  <p className="text-amber-700 font-semibold mb-2">Account created — email delivery failed</p>
                  <p className="text-sm text-amber-600 mb-4">
                    The teacher&apos;s account has been set up, but the welcome email could not be sent. Share the link below directly with the teacher so they can set their password:
                  </p>
                  <div className="bg-white border border-amber-200 rounded-lg p-3 mb-4 break-all text-xs text-amber-800 font-mono">
                    {fallbackLink}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(fallbackLink);
                    }}
                    className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition mr-2"
                  >
                    Copy Link
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(`/admin/schools/${schoolId}/users`)}
                    className="rounded-full bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:opacity-90 transition"
                  >
                    Done
                  </button>
                </>
              ) : (
                <>
                  <p className="text-green-700 font-semibold">Teacher invited successfully!</p>
                  <p className="text-sm text-green-600 mt-1">Redirecting...</p>
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-[var(--wrife-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent"
                  placeholder="teacher@school.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--wrife-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--wrife-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent"
                    placeholder="Smith"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-[var(--wrife-blue)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
              >
                {submitting ? 'Sending Invite...' : 'Send Invitation'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
