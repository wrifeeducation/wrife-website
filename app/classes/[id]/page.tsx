'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AddPupilModal } from '@/components/AddPupilModal';

interface Class {
  id: number;
  name: string;
  year_group: number;
  class_code: string;
  school_name: string | null;
}

interface Pupil {
  id: string;
  first_name: string;
  last_name: string | null;
  year_group: number;
}

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [classData, setClassData] = useState<Class | null>(null);
  const [pupils, setPupils] = useState<Pupil[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPupil, setShowAddPupil] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchClassData();
    fetchPupils();
  }, [user, resolvedParams.id, router]);

  async function fetchClassData() {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

      if (error) throw error;
      setClassData(data);
    } catch (err) {
      console.error('Error fetching class:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPupils() {
    try {
      const { data: members, error } = await supabase
        .from('class_members')
        .select('pupil_id, pupils(*)')
        .eq('class_id', resolvedParams.id);

      if (error) throw error;

      const pupilsData = members?.map((m: any) => m.pupils).filter(Boolean) || [];
      setPupils(pupilsData);
    } catch (err) {
      console.error('Error fetching pupils:', err);
    }
  }

  async function handleRemovePupil(pupilId: string) {
    if (!confirm('Are you sure you want to remove this pupil from the class?')) return;

    try {
      const { error } = await supabase
        .from('class_members')
        .delete()
        .eq('class_id', resolvedParams.id)
        .eq('pupil_id', pupilId);

      if (error) throw error;
      fetchPupils();
    } catch (err) {
      console.error('Error removing pupil:', err);
      alert('Failed to remove pupil');
    }
  }

  async function handleDeleteClass() {
    if (!user || !classData) return;
    if (!confirm(`Are you sure you want to delete "${classData.name}"? This will remove all pupils and assignments for this class.`)) return;

    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', resolvedParams.id)
        .eq('teacher_id', user.id);

      if (error) throw error;
      router.push('/dashboard');
    } catch (err) {
      console.error('Error deleting class:', err);
      alert('Failed to delete class: ' + (err as any)?.message);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent"></div>
            <p className="mt-4 text-sm text-[var(--wrife-text-muted)]">Loading class...</p>
          </div>
        </div>
      </>
    );
  }

  if (!classData) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center">
          <div className="text-center">
            <p className="text-[var(--wrife-text-main)]">Class not found</p>
            <Link href="/classes" className="text-sm text-[var(--wrife-blue)] hover:underline mt-2 inline-block">
              ← Back to classes
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[var(--wrife-bg)] py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6">
            <Link href="/classes" className="text-sm text-[var(--wrife-blue)] hover:underline mb-2 inline-block">
              ← Back to classes
            </Link>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-extrabold text-[var(--wrife-text-main)]">
                    {classData.name}
                  </h1>
                  <span className="rounded-full bg-[var(--wrife-blue-soft)] px-3 py-1 text-xs font-semibold text-[var(--wrife-blue)]">
                    Year {classData.year_group}
                  </span>
                </div>
                {classData.school_name && (
                  <p className="text-sm text-[var(--wrife-text-muted)]">{classData.school_name}</p>
                )}
              </div>
              <button
                onClick={handleDeleteClass}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-semibold transition border border-red-200"
              >
                Delete Class
              </button>
            </div>
          </div>

          <div className="mb-6 bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--wrife-text-main)] mb-1">Class Code</p>
                <p className="text-2xl font-bold text-[var(--wrife-blue)] tracking-wider font-mono">
                  {classData.class_code}
                </p>
                <p className="text-xs text-[var(--wrife-text-muted)] mt-1">
                  Share this code with pupils to join the class
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(classData.class_code);
                  alert('Class code copied to clipboard!');
                }}
                className="rounded-full border border-[var(--wrife-blue)] px-4 py-2 text-sm font-semibold text-[var(--wrife-blue)] hover:bg-[var(--wrife-blue-soft)] transition"
              >
                Copy Code
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">
                Pupils ({pupils.length})
              </h2>
              <button
                onClick={() => setShowAddPupil(true)}
                className="rounded-full bg-[var(--wrife-blue)] px-4 py-2 text-sm font-semibold text-white shadow-soft hover:opacity-90 transition"
              >
                + Add Pupil
              </button>
            </div>

            {pupils.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <span className="text-5xl">👥</span>
                </div>
                <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">No pupils yet</h3>
                <p className="text-sm text-[var(--wrife-text-muted)] mb-4">
                  Add pupils to this class to start tracking their progress
                </p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {pupils.map((pupil) => (
                  <div
                    key={pupil.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-[var(--wrife-border)] hover:bg-[var(--wrife-bg)] transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[var(--wrife-blue-soft)] flex items-center justify-center text-sm font-bold text-[var(--wrife-blue)] uppercase">
                        {pupil.first_name.charAt(0)}{pupil.last_name?.charAt(0) || ''}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--wrife-text-main)]">
                          {pupil.first_name} {pupil.last_name || ''}
                        </p>
                        <p className="text-xs text-[var(--wrife-text-muted)]">
                          Year {pupil.year_group}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemovePupil(pupil.id)}
                      className="text-red-500 hover:text-red-700 transition text-sm"
                      title="Remove pupil"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {showAddPupil && (
            <AddPupilModal
              classId={resolvedParams.id}
              classYearGroup={classData.year_group}
              onClose={() => setShowAddPupil(false)}
              onSuccess={() => {
                fetchPupils();
                setShowAddPupil(false);
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
