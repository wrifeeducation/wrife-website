"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import ChildMascot from '@/components/mascots/ChildMascot';

interface ClassMember {
  id: string;
  pupil_id: string;
  first_name: string;
  last_name: string | null;
}

interface ClassInfo {
  id: string;
  name: string;
  year_group: number;
  class_code: string;
}

export default function PupilLoginPage() {
  const [step, setStep] = useState<'code' | 'name'>('code');
  const [classCode, setClassCode] = useState('');
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [classMembers, setClassMembers] = useState<ClassMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/pupil/lookup-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classCode: classCode.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error === 'Class code not found' 
          ? 'Class code not found. Please check and try again.' 
          : 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      setClassInfo(data.classInfo);
      setClassMembers(data.members);
      setStep('name');
    } catch (err) {
      console.error('Error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!classInfo) return;
    setLoading(true);
    setError('');

    try {
      if (!selectedMemberId) {
        setError('Please select your name from the list');
        setLoading(false);
        return;
      }
      
      const member = classMembers.find(m => m.id === selectedMemberId);
      if (!member) {
        setError('Please select your name from the list');
        setLoading(false);
        return;
      }
      
      const pupilName = `${member.first_name}${member.last_name ? ' ' + member.last_name : ''}`;
      const pupilId = member.pupil_id;

      const pupilSession = {
        pupilId,
        pupilName,
        classId: classInfo.id,
        className: classInfo.name,
        classCode: classInfo.class_code,
        yearGroup: classInfo.year_group,
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem('pupilSession', JSON.stringify(pupilSession));

      router.push('/pupil/dashboard');
    } catch (err) {
      console.error('Error:', err);
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
            <h1 className="text-2xl font-bold text-[var(--wrife-text-main)]" style={{ fontFamily: 'var(--font-display)' }}>
              Hello there!
            </h1>
            <p className="text-sm text-[var(--wrife-text-muted)] mt-2">
              {step === 'code' 
                ? 'Enter your class code to start learning' 
                : `Joining ${classInfo?.name}`}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {step === 'code' ? (
            <form onSubmit={handleCodeSubmit}>
              <div className="mb-6">
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
                  placeholder="e.g., ABC123"
                  className="w-full px-4 py-3 rounded-lg text-center text-2xl font-mono tracking-widest uppercase border border-[var(--wrife-border)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-[var(--wrife-text-muted)] mt-2 text-center">
                  Ask your teacher for the class code
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || classCode.length < 4}
                className="w-full py-3 rounded-full font-bold text-white bg-[var(--wrife-orange)] hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? 'Finding class...' : 'Next'}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--wrife-border)]"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm text-[var(--wrife-text-muted)]">or</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-3 rounded-full font-bold border-2 border-[var(--wrife-blue)] text-[var(--wrife-blue)] hover:bg-[var(--wrife-blue-soft)] transition flex items-center justify-center gap-2"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm14 0h4v4h-4v-4zm-3 0h2v2h-2v-2zm0 5h2v2h-2v-2zm5 0h2v2h-2v-2z"/>
                </svg>
                Scan QR Code
              </button>
            </form>
          ) : (
            <form onSubmit={handleNameSubmit}>
              {classMembers.length > 0 ? (
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-[var(--wrife-text-main)]">
                    Select your name
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {classMembers.map((member) => (
                      <label 
                        key={member.id}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition ${
                          selectedMemberId === member.id 
                            ? 'border-[var(--wrife-blue)] bg-[var(--wrife-blue-soft)]' 
                            : 'border-[var(--wrife-border)] hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="pupil"
                          value={member.id}
                          checked={selectedMemberId === member.id}
                          onChange={() => setSelectedMemberId(member.id)}
                          className="mr-3"
                        />
                        <span className="font-medium text-[var(--wrife-text-main)]">
                          {member.first_name}{member.last_name ? ` ${member.last_name}` : ''}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-[var(--wrife-text-muted)]">
                    Can't find your name? Ask your teacher to add you to the class.
                  </p>
                </div>
              ) : (
                <div className="mb-6 text-center py-4">
                  <p className="text-[var(--wrife-text-main)] font-semibold mb-2">
                    No pupils in this class yet
                  </p>
                  <p className="text-sm text-[var(--wrife-text-muted)]">
                    Ask your teacher to add you to the class first, then try again.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep('code');
                    setClassInfo(null);
                    setClassMembers([]);
                    setSelectedMemberId(null);
                    setError('');
                  }}
                  className="flex-1 py-3 rounded-full font-bold border border-[var(--wrife-border)] text-[var(--wrife-text-muted)] hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-full font-bold text-white bg-[var(--wrife-orange)] hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? 'Joining...' : 'Start Learning'}
                </button>
              </div>
            </form>
          )}

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
