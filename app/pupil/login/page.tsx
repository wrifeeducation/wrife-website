"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import ChildMascot from '@/components/mascots/ChildMascot';

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

  return (
    <div className="min-h-screen bg-[var(--wrife-bg)]">
      <Navbar />

      <main className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-8">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <ChildMascot size="lg" waving={true} />
            </div>
            <h1
              className="text-2xl font-bold text-[var(--wrife-text-main)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Hello there!
            </h1>
            <p className="text-sm text-[var(--wrife-text-muted)] mt-2">
              Enter your details to start learning
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="classCode"
                className="block text-sm font-semibold mb-2 text-[var(--wrife-text-main)]"
              >
                Class Code
              </label>
              <input
                id="classCode"
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                placeholder="e.g. BLU52341"
                className="w-full px-4 py-3 rounded-lg text-center text-xl font-mono tracking-widest uppercase border border-[var(--wrife-border)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                maxLength={10}
                autoComplete="off"
                required
              />
              <p className="text-xs text-[var(--wrife-text-muted)] mt-1 text-center">
                Ask your teacher for your class code
              </p>
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold mb-2 text-[var(--wrife-text-main)]"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                className="w-full px-4 py-3 rounded-lg border border-[var(--wrife-border)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label
                htmlFor="pin"
                className="block text-sm font-semibold mb-2 text-[var(--wrife-text-main)]"
              >
                PIN
              </label>
              <input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="4-digit PIN"
                className="w-full px-4 py-3 rounded-lg text-center text-2xl tracking-widest border border-[var(--wrife-border)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                maxLength={4}
                inputMode="numeric"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || classCode.length < 4 || !username || pin.length !== 4}
              className="w-full py-3 rounded-full font-bold text-white bg-[var(--wrife-orange)] hover:opacity-90 transition disabled:opacity-50 mt-2"
            >
              {loading ? 'Logging in...' : 'Start Learning'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--wrife-border)] text-center">
            <p className="text-sm text-[var(--wrife-text-muted)]">
              Are you a teacher?{' '}
              <Link href="/login" className="text-[var(--wrife-blue)] font-semibold hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
