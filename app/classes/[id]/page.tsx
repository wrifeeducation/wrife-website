'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Class {
  id: number;
  name: string;
  year_group: number;
  class_code: string;
  school_name: string | null;
}

interface ClassMember {
  id: number;
  pupil_name: string;
  pupil_email: string | null;
}

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [classData, setClassData] = useState<Class | null>(null);
  const [pupils, setPupils] = useState<ClassMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPupil, setShowAddPupil] = useState(false);
  const [newPupilName, setNewPupilName] = useState('');
  const [newPupilEmail, setNewPupilEmail] = useState('');
  const [addingPupil, setAddingPupil] = useState(false);
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
      const { data, error } = await supabase
        .from('class_members')
        .select('*')
        .eq('class_id', resolvedParams.id)
        .order('pupil_name');

      if (error) throw error;
      setPupils(data || []);
    } catch (err) {
      console.error('Error fetching pupils:', err);
    }
  }

  async function handleAddPupil(e: React.FormEvent) {
    e.preventDefault();
    if (!newPupilName.trim()) return;

    setAddingPupil(true);
    try {
      const { error } = await supabase
        .from('class_members')
        .insert({
          class_id: parseInt(resolvedParams.id),
          pupil_name: newPupilName.trim(),
          pupil_email: newPupilEmail.trim() || null
        });

      if (error) throw error;

      setNewPupilName('');
      setNewPupilEmail('');
      setShowAddPupil(false);
      fetchPupils();
    } catch (err) {
      console.error('Error adding pupil:', err);
      alert('Failed to add pupil');
    } finally {
      setAddingPupil(false);
    }
  }

  async function handleRemovePupil(pupilId: number) {
    if (!confirm('Are you sure you want to remove this pupil from the class?')) return;

    try {
      const { error } = await supabase
        .from('class_members')
        .delete()
        .eq('id', pupilId);

      if (error) throw error;
      fetchPupils();
    } catch (err) {
      console.error('Error removing pupil:', err);
      alert('Failed to remove pupil');
    }
  }

  function getInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
    }
    return name.charAt(0);
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
          {/* Header */}
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
            </div>
          </div>

          {/* Class Code Card */}
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

          {/* Pupils Section */}
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
                        {getInitials(pupil.pupil_name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--wrife-text-main)]">
                          {pupil.pupil_name}
                        </p>
                        {pupil.pupil_email && (
                          <p className="text-xs text-[var(--wrife-text-muted)]">
                            {pupil.pupil_email}
                          </p>
                        )}
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

          {/* Add Pupil Modal */}
          {showAddPupil && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-strong max-w-md w-full p-6">
                <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-4">Add Pupil</h3>
                <form onSubmit={handleAddPupil}>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
                      Pupil Name *
                    </label>
                    <input
                      type="text"
                      value={newPupilName}
                      onChange={(e) => setNewPupilName(e.target.value)}
                      placeholder="Enter pupil's full name"
                      className="w-full rounded-lg border border-[var(--wrife-border)] px-4 py-3 text-sm focus:border-[var(--wrife-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--wrife-blue)]"
                      required
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      value={newPupilEmail}
                      onChange={(e) => setNewPupilEmail(e.target.value)}
                      placeholder="pupil@school.com"
                      className="w-full rounded-lg border border-[var(--wrife-border)] px-4 py-3 text-sm focus:border-[var(--wrife-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--wrife-blue)]"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddPupil(false)}
                      className="flex-1 rounded-full border border-[var(--wrife-border)] px-6 py-3 text-sm font-semibold text-[var(--wrife-text-main)] hover:bg-[var(--wrife-bg)] transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addingPupil || !newPupilName.trim()}
                      className="flex-1 rounded-full bg-[var(--wrife-blue)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
                    >
                      {addingPupil ? 'Adding...' : 'Add Pupil'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
