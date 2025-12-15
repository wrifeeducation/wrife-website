'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

function JoinPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inviteCode, setInviteCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [inviteValid, setInviteValid] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [inviteData, setInviteData] = useState<{
    id: string;
    email: string;
    school_id: string;
  } | null>(null);

  useEffect(() => {
    const code = searchParams?.get('code');
    if (code) {
      setInviteCode(code);
      verifyInviteCode(code);
    }
  }, [searchParams]);

  async function verifyInviteCode(code: string) {
    if (!code || code.length < 6) return;
    
    setVerifyingCode(true);
    setError('');
    
    try {
      const { data: invite, error: inviteError } = await supabase
        .from('teacher_invites')
        .select('id, email, school_id, status, expires_at')
        .eq('invite_code', code.toUpperCase())
        .single();

      if (inviteError || !invite) {
        setError('Invalid invite code. Please check and try again.');
        setInviteValid(false);
        return;
      }

      if (invite.status !== 'pending') {
        setError('This invite has already been used or cancelled.');
        setInviteValid(false);
        return;
      }

      if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
        setError('This invite has expired. Please request a new one.');
        setInviteValid(false);
        return;
      }

      const { data: school } = await supabase
        .from('schools')
        .select('name')
        .eq('id', invite.school_id)
        .single();

      setSchoolName(school?.name || 'Unknown School');
      setEmail(invite.email);
      setInviteData({
        id: invite.id,
        email: invite.email,
        school_id: invite.school_id,
      });
      setInviteValid(true);
    } catch (err) {
      console.error('Error verifying invite:', err);
      setError('Failed to verify invite code');
      setInviteValid(false);
    } finally {
      setVerifyingCode(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!inviteData) {
      setError('Please enter a valid invite code first');
      setLoading(false);
      return;
    }

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

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: inviteData.email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: inviteData.email,
            display_name: displayName,
            role: 'teacher',
            school_id: inviteData.school_id,
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }

        const { error: updateInviteError } = await supabase
          .from('teacher_invites')
          .update({ 
            status: 'accepted',
            accepted_at: new Date().toISOString()
          })
          .eq('id', inviteData.id);

        if (updateInviteError) {
          console.error('Error updating invite:', updateInviteError);
        }
      }

      setSuccess(true);
    } catch (err) {
      console.error('Signup error:', err);
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-8 text-center">
            <div className="mb-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                <span className="text-3xl">✓</span>
              </div>
            </div>
            <h2 className="text-xl font-bold text-[var(--wrife-text-main)] mb-2">Welcome to {schoolName}!</h2>
            <p className="text-sm text-[var(--wrife-text-muted)] mb-6">
              Check your email to confirm your account, then you can start using WriFe.
            </p>
            <Link
              href="/login"
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
          <h1 className="text-2xl font-bold text-[var(--wrife-text-main)] mb-2">Join Your School</h1>
          <p className="text-sm text-[var(--wrife-text-muted)]">
            Enter your invite code to create a teacher account
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
          {!inviteValid ? (
            <div className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="inviteCode" className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
                  Invite Code
                </label>
                <input
                  id="inviteCode"
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-lg border border-[var(--wrife-border)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent text-center text-lg font-mono tracking-wider"
                  placeholder="ABCD1234"
                  maxLength={8}
                />
                <p className="text-xs text-[var(--wrife-text-muted)] mt-2">
                  Your school admin will provide this code
                </p>
              </div>

              <button
                onClick={() => verifyInviteCode(inviteCode)}
                disabled={verifyingCode || inviteCode.length < 6}
                className="w-full rounded-full bg-[var(--wrife-blue)] px-6 py-3 text-sm font-semibold text-white shadow-soft hover:opacity-90 transition disabled:opacity-50"
              >
                {verifyingCode ? 'Verifying...' : 'Verify Code'}
              </button>

              <div className="text-center pt-4 border-t border-[var(--wrife-border)]">
                <p className="text-sm text-[var(--wrife-text-muted)]">
                  Don't have an invite code?{' '}
                  <Link href="/signup" className="text-[var(--wrife-blue)] font-semibold hover:underline">
                    Sign up without one
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700 mb-4">
                You're joining <strong>{schoolName}</strong>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
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
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] bg-gray-50 text-[var(--wrife-text-muted)]"
                />
                <p className="text-xs text-[var(--wrife-text-muted)] mt-1">
                  This email was specified in your invitation
                </p>
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
                {loading ? 'Creating account...' : 'Join School & Create Account'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setInviteValid(false);
                  setInviteData(null);
                  setError('');
                }}
                className="w-full text-sm text-[var(--wrife-text-muted)] hover:text-[var(--wrife-blue)]"
              >
                ← Use a different invite code
              </button>
            </form>
          )}
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

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 w-96 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    }>
      <JoinPageContent />
    </Suspense>
  );
}
