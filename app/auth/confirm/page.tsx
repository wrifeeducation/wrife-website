'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

type Status = 'verifying' | 'success' | 'error';

const MESSAGES: Record<string, { heading: string; body: string }> = {
  signup:         { heading: 'Email confirmed!',       body: 'Your account is ready. Taking you to your dashboard…' },
  recovery:       { heading: 'Identity verified!',     body: 'Redirecting you to set a new password…' },
  invite:         { heading: 'Invitation accepted!',   body: 'Setting up your account…' },
  magiclink:      { heading: 'Signed in!',             body: 'Taking you to your dashboard…' },
  email_change:   { heading: 'Email updated!',         body: 'Your email address has been changed.' },
};

export default function AuthConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>('verifying');
  const [errorMsg, setErrorMsg] = useState('');
  const [type, setType] = useState('signup');

  useEffect(() => {
    async function confirm() {
      // Supabase puts the token in either query params or the URL hash
      const tokenHash =
        searchParams.get('token_hash') ||
        new URLSearchParams(window.location.hash.substring(1)).get('token_hash');

      const typeParam =
        (searchParams.get('type') ||
          new URLSearchParams(window.location.hash.substring(1)).get('type') ||
          'signup') as string;

      const next =
        searchParams.get('next') ||
        new URLSearchParams(window.location.hash.substring(1)).get('next') ||
        null;

      setType(typeParam);

      if (!tokenHash) {
        setErrorMsg('This confirmation link is missing required parameters. Please request a new one.');
        setStatus('error');
        return;
      }

      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: typeParam as any,
      });

      if (error) {
        console.error('[AuthConfirm] verifyOtp error:', error.message);
        setErrorMsg(
          error.message.toLowerCase().includes('expired')
            ? 'This link has expired. Please request a new one below.'
            : `Verification failed: ${error.message}`
        );
        setStatus('error');
        return;
      }

      setStatus('success');

      // Determine where to redirect after a short delay
      let destination = '/dashboard';

      if (typeParam === 'recovery' || typeParam === 'invite') {
        destination = '/update-password';
      } else if (next) {
        // Validate the `next` param is a relative path (no open redirects)
        destination = next.startsWith('/') ? next : '/dashboard';
      }

      setTimeout(() => router.replace(destination), 1800);
    }

    confirm();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const msg = MESSAGES[type] || MESSAGES.signup;

  return (
    <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">

        {/* Logo */}
        <div className="inline-flex items-center gap-2 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-[var(--wrife-blue-soft)] flex items-center justify-center">
            <span className="text-2xl font-black text-[var(--wrife-blue)]">W</span>
          </div>
          <div className="flex flex-col leading-tight text-left">
            <span className="font-extrabold text-xl text-[var(--wrife-text-main)]">WriFe</span>
            <span className="text-xs text-[var(--wrife-text-muted)]">Writing for Everyone</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-8">

          {status === 'verifying' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--wrife-blue)] mx-auto mb-4" />
              <h1 className="text-lg font-bold text-[var(--wrife-text-main)]">Verifying your link…</h1>
              <p className="text-sm text-[var(--wrife-text-muted)] mt-2">Just a moment</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-[var(--wrife-text-main)] mb-2">{msg.heading}</h1>
              <p className="text-sm text-[var(--wrife-text-muted)]">{msg.body}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-[var(--wrife-text-main)] mb-2">Verification failed</h1>
              <p className="text-sm text-[var(--wrife-text-muted)] mb-6">{errorMsg}</p>
              <div className="flex flex-col gap-3">
                {(type === 'recovery' || type === 'invite') ? (
                  <Link
                    href="/reset-password"
                    className="block w-full text-center py-3 px-6 rounded-full bg-[var(--wrife-blue)] text-white text-sm font-semibold hover:opacity-90 transition"
                  >
                    Request a new link
                  </Link>
                ) : (
                  <Link
                    href="/signup"
                    className="block w-full text-center py-3 px-6 rounded-full bg-[var(--wrife-blue)] text-white text-sm font-semibold hover:opacity-90 transition"
                  >
                    Back to sign up
                  </Link>
                )}
                <Link
                  href="/login"
                  className="text-sm text-[var(--wrife-blue)] hover:underline"
                >
                  Already have an account? Sign in
                </Link>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
