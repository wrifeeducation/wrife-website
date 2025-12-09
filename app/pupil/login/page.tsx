"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface ClassMember {
  id: number;
  pupil_name: string;
}

interface ClassInfo {
  id: number;
  name: string;
  year_group: number;
  class_code: string;
}

export default function PupilLoginPage() {
  const [step, setStep] = useState<'code' | 'name'>('code');
  const [classCode, setClassCode] = useState('');
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [classMembers, setClassMembers] = useState<ClassMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [newPupilName, setNewPupilName] = useState('');
  const [isNewPupil, setIsNewPupil] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id, name, year_group, class_code')
        .eq('class_code', classCode.toUpperCase().trim())
        .single();

      if (classError || !classData) {
        setError('Class code not found. Please check and try again.');
        setLoading(false);
        return;
      }

      setClassInfo(classData);

      const { data: members, error: membersError } = await supabase
        .from('class_members')
        .select('id, pupil_name')
        .eq('class_id', classData.id)
        .order('pupil_name');

      if (membersError) throw membersError;

      setClassMembers(members || []);
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
      let pupilName = '';
      let memberId: number;

      if (isNewPupil) {
        if (!newPupilName.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        pupilName = newPupilName.trim();

        const { data: newMember, error: insertError } = await supabase
          .from('class_members')
          .insert({
            class_id: classInfo.id,
            pupil_name: pupilName,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        memberId = newMember.id;
      } else {
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
        pupilName = member.pupil_name;
        memberId = member.id;
      }

      const pupilSession = {
        memberId,
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--wrife-blue-soft)] mb-4">
              <span className="text-3xl">✏️</span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--wrife-text-main)]">
              Pupil Login
            </h1>
            <p className="text-sm text-[var(--wrife-text-muted)] mt-2">
              {step === 'code' 
                ? 'Enter your class code to get started' 
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
                className="w-full py-3 rounded-full font-bold text-white bg-[var(--wrife-blue)] hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? 'Finding class...' : 'Next'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleNameSubmit}>
              {classMembers.length > 0 && !isNewPupil ? (
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
                          {member.pupil_name}
                        </span>
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsNewPupil(true)}
                    className="mt-4 text-sm text-[var(--wrife-blue)] hover:underline"
                  >
                    I'm not on this list
                  </button>
                </div>
              ) : (
                <div className="mb-6">
                  <label 
                    htmlFor="pupilName" 
                    className="block text-sm font-semibold mb-2 text-[var(--wrife-text-main)]"
                  >
                    {classMembers.length > 0 ? "Enter your name" : "What's your name?"}
                  </label>
                  <input
                    id="pupilName"
                    type="text"
                    value={newPupilName}
                    onChange={(e) => setNewPupilName(e.target.value)}
                    placeholder="e.g., Alex Smith"
                    className="w-full px-4 py-3 rounded-lg border border-[var(--wrife-border)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                    required
                  />
                  {classMembers.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewPupil(false);
                        setNewPupilName('');
                      }}
                      className="mt-2 text-sm text-[var(--wrife-blue)] hover:underline"
                    >
                      Go back to name list
                    </button>
                  )}
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
                    setNewPupilName('');
                    setIsNewPupil(false);
                    setError('');
                  }}
                  className="flex-1 py-3 rounded-full font-bold border border-[var(--wrife-border)] text-[var(--wrife-text-muted)] hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-full font-bold text-white bg-[var(--wrife-blue)] hover:opacity-90 transition disabled:opacity-50"
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
