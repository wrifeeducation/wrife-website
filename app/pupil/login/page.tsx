"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function PupilLoginPage() {
  const [classCode, setClassCode] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/pupil/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classCode: classCode.trim().toUpperCase(),
          username: username.trim().toLowerCase(),
          pin: pin.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid details. Please check and try again.');
        setLoading(false);
        return;
      }

      // ── Store SSO tokens for cross-domain links (WITHOUT calling setSession) ─
      // We intentionally do NOT call supabase.auth.setSession() here because
      // that would write to the shared Supabase auth cookie on wrife.co.uk,
      // overwriting any active teacher session in the same browser.
      //
      // Instead, tokens are stashed in localStorage under 'pupilSSOTokens'.
      // lib/pupil-sso.ts reads from there when building the SSO URL for
      // practice.wrife.co.uk and pwp-studio.wrife.co.uk.
      if (data.access_token && data.refresh_token) {
        try {
          localStorage.setItem('pupilSSOTokens', JSON.stringify({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600),
          }));
        } catch (e) {
          // Non-fatal — SSO links will fall back to base URL
        }
      }

      // ── Store slim metadata in localStorage (display + API params) ─────────
      const pupil = data.pupil;
      const pupilSession = {
        pupilId: pupil.id,
        pupilName: pupil.displayName || `${pupil.firstName} ${pupil.lastName || ''}`.trim(),
        firstName: pupil.firstName,
        classId: pupil.classId,
        className: pupil.className,
        classCode: classCode.trim().toUpperCase(),
        yearGroup: pupil.yearGroup,
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem('pupilSession', JSON.stringify(pupilSession));

      router.push('/pupil/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = classCode.length >= 4 && username.trim().length > 0 && pin.length === 4;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ backgroundColor: "var(--wrife-bg)" }}
    >
      {/* ── Decorative background blobs ── */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 pointer-events-none"
        style={{ backgroundColor: "var(--wrife-blue)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-64 h-64 rounded-full translate-y-1/2 -translate-x-1/2 opacity-15 pointer-events-none"
        style={{ backgroundColor: "var(--wrife-orange)" }}
      />

      {/* ── Branding link ── */}
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 group"
      >
        <span
          className="font-extrabold text-2xl"
          style={{ fontFamily: "var(--font-display)", color: "var(--wrife-blue)" }}
        >
          WriFe
        </span>
      </Link>

      {/* ── Mascot ── */}
      <div className="relative mb-2">
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-30 scale-110 pointer-events-none"
          style={{ backgroundColor: "var(--wrife-yellow)" }}
        />
        <Image
          src="/mascots/pencil-waving.png"
          alt="WriFe mascot waving"
          width={130}
          height={156}
          className="relative drop-shadow-lg mascot-float-b"
          priority
        />
      </div>

      {/* ── Headline ── */}
      <div className="text-center mb-8">
        <h1
          className="text-3xl sm:text-4xl font-extrabold mb-2"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--wrife-text-main)",
          }}
        >
          Hello! Ready to write?
        </h1>
        <p className="text-base" style={{ color: "var(--wrife-text-muted)" }}>
          Enter your details to start your adventure
        </p>
      </div>

      {/* ── Form card ── */}
      <div
        className="w-full max-w-sm rounded-3xl p-7 shadow-strong"
        style={{
          backgroundColor: "var(--wrife-surface)",
          border: "2px solid var(--wrife-border)",
        }}
      >
        {error && (
          <div
            className="mb-5 p-3 rounded-xl text-sm font-medium flex items-start gap-2"
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
          {/* Class Code */}
          <div>
            <label
              htmlFor="classCode"
              className="block text-sm font-bold mb-2"
              style={{ color: "var(--wrife-text-main)" }}
            >
              Class Code
            </label>
            <input
              id="classCode"
              type="text"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              placeholder="e.g. BLU52341"
              className="w-full px-4 py-3.5 rounded-xl text-center text-xl font-mono tracking-[0.25em] uppercase transition-all focus:outline-none"
              style={{
                border: classCode.length >= 4 ? "2px solid var(--wrife-blue)" : "2px solid var(--wrife-border)",
                backgroundColor: classCode.length >= 4 ? "var(--wrife-blue-soft)" : "white",
                color: "var(--wrife-text-main)",
              }}
              maxLength={10}
              autoComplete="off"
              required
            />
            <p
              className="text-xs mt-1.5 text-center"
              style={{ color: "var(--wrife-text-muted)" }}
            >
              Ask your teacher for your class code
            </p>
          </div>

          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-bold mb-2"
              style={{ color: "var(--wrife-text-main)" }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              className="w-full px-4 py-3.5 rounded-xl transition-all focus:outline-none"
              style={{
                border: username.length > 0 ? "2px solid var(--wrife-blue)" : "2px solid var(--wrife-border)",
                backgroundColor: username.length > 0 ? "var(--wrife-blue-soft)" : "white",
                color: "var(--wrife-text-main)",
              }}
              autoComplete="username"
              required
            />
          </div>

          {/* PIN */}
          <div>
            <label
              htmlFor="pin"
              className="block text-sm font-bold mb-2"
              style={{ color: "var(--wrife-text-main)" }}
            >
              PIN
            </label>
            <input
              id="pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="••••"
              className="w-full px-4 py-3.5 rounded-xl text-center text-3xl tracking-[0.5em] transition-all focus:outline-none"
              style={{
                border: pin.length === 4 ? "2px solid var(--wrife-orange)" : "2px solid var(--wrife-border)",
                backgroundColor: pin.length === 4 ? "var(--wrife-orange-soft)" : "white",
                color: "var(--wrife-text-main)",
              }}
              maxLength={4}
              inputMode="numeric"
              autoComplete="current-password"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="w-full py-4 rounded-full font-bold text-lg text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 shadow-soft mt-2"
            style={{ backgroundColor: "var(--wrife-orange)" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Logging in...
              </span>
            ) : (
              "Let's go! →"
            )}
          </button>
        </form>
      </div>

      {/* ── Teacher link ── */}
      <p
        className="mt-7 text-sm"
        style={{ color: "var(--wrife-text-muted)" }}
      >
        Are you a teacher?{" "}
        <Link
          href="/login"
          className="font-semibold hover:underline"
          style={{ color: "var(--wrife-blue)" }}
        >
          Sign in here
        </Link>
      </p>
    </div>
  );
}
