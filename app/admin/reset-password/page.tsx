'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function AdminResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/update-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-6">
          <Link
            href="/admin/login"
            className="text-sm text-slate-400 hover:text-white transition inline-flex items-center gap-1"
          >
            ← Back to Admin Login
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-4xl">🛡️</span>
            <div className="flex flex-col leading-tight text-left">
              <span className="font-extrabold text-2xl text-white">Admin Portal</span>
              <span className="text-sm text-slate-400">Password Reset</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-2xl shadow-blue-500/10">
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Check your email</h2>
              <p className="text-sm text-slate-400 mb-6">
                A password reset link has been sent to <strong className="text-slate-200">{email}</strong>
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Didn&apos;t receive it? Check your spam folder or try again.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="text-sm text-[var(--wrife-blue)] hover:underline"
              >
                Try a different email
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-400 mb-5">
                Enter your admin email address and we&apos;ll send you a secure link to reset your password.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-200 mb-2">
                    Admin email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent"
                    placeholder="admin@wrife.co.uk"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-[var(--wrife-blue)] px-6 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? 'Sending reset link...' : 'Send reset link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
