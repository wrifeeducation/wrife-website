'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Class {
  id: string;
  name: string;
  year_group: number;
  class_code: string;
  school_name: string | null;
}

interface Pupil {
  id: string;
  first_name: string;
  last_name: string | null;
  username: string | null;
  pin_display: string | null;
  year_group: number;
}

/** Generate a random 4-digit PIN string */
function randomPin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export default function LoginCardsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [classData, setClassData] = useState<Class | null>(null);
  const [pupils, setPupils] = useState<Pupil[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Per-pupil inline PIN edit state: pupilId → draft PIN string
  const [editingPin, setEditingPin] = useState<Record<string, string>>({});
  // Track saving state per pupil
  const [savingPin, setSavingPin] = useState<Record<string, boolean>>({});
  // Track bulk-generate state
  const [generatingAll, setGeneratingAll] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [user, resolvedParams.id, router]);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/teacher/class-login-cards?classId=${resolvedParams.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch class data');
      }

      setClassData(data.classData);
      setPupils(data.pupils || []);
    } catch (err) {
      console.error('Error fetching class data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load class data');
    } finally {
      setLoading(false);
    }
  }

  /** Save a single pupil's new PIN via the API */
  async function savePin(pupilId: string, newPin: string) {
    if (!/^\d{4}$/.test(newPin)) return;
    setSavingPin(prev => ({ ...prev, [pupilId]: true }));
    try {
      const res = await fetch('/api/teacher/reset-pupil-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pupilId, newPin, classId: resolvedParams.id }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Failed to save PIN: ${err.error ?? 'Unknown error'}`);
        return;
      }
      // Update local state so card shows the new PIN immediately
      setPupils(prev =>
        prev.map(p => (p.id === pupilId ? { ...p, pin_display: newPin } : p))
      );
      setEditingPin(prev => {
        const next = { ...prev };
        delete next[pupilId];
        return next;
      });
    } catch {
      alert('Network error — please try again.');
    } finally {
      setSavingPin(prev => ({ ...prev, [pupilId]: false }));
    }
  }

  /** Generate and save 4-digit PINs for every pupil currently showing — */
  async function generateAllMissingPins() {
    const missing = pupils.filter(p => !p.pin_display);
    if (missing.length === 0) return;
    setGeneratingAll(true);
    const updates: { id: string; pin: string }[] = missing.map(p => ({
      id: p.id,
      pin: randomPin(),
    }));
    // Save in parallel (max 5 at a time to avoid overwhelming the server)
    const chunks: typeof updates[] = [];
    for (let i = 0; i < updates.length; i += 5) chunks.push(updates.slice(i, i + 5));
    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(({ id, pin }) =>
          fetch('/api/teacher/reset-pupil-pin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pupilId: id, newPin: pin, classId: resolvedParams.id }),
          })
        )
      );
      // Update local state for this chunk
      setPupils(prev =>
        prev.map(p => {
          const found = chunk.find(u => u.id === p.id);
          return found ? { ...p, pin_display: found.pin } : p;
        })
      );
    }
    setGeneratingAll(false);
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <Link href="/classes" className="text-sm text-blue-500 hover:underline">
            Back to classes
          </Link>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-800">Class not found</p>
          <Link href="/classes" className="text-sm text-blue-500 hover:underline mt-2 inline-block">
            Back to classes
          </Link>
        </div>
      </div>
    );
  }

  const loginUrl = 'wrife.co.uk/pupil/login';
  const missingPinCount = pupils.filter(p => !p.pin_display).length;

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-page {
            page-break-inside: avoid;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print bg-gray-100 py-4 px-6 border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div>
            <Link href={`/classes/${resolvedParams.id}`} className="text-sm text-blue-500 hover:underline">
              ← Back to {classData.name}
            </Link>
            <h1 className="text-xl font-bold text-gray-800 mt-1">
              Pupil Login Cards — {classData.name}
            </h1>
            <p className="text-sm text-gray-500">
              {pupils.length} pupils
              {missingPinCount > 0 && (
                <span className="ml-2 text-amber-600 font-medium">
                  · {missingPinCount} PIN{missingPinCount > 1 ? 's' : ''} not set
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {missingPinCount > 0 && (
              <button
                onClick={generateAllMissingPins}
                disabled={generatingAll}
                className="bg-amber-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-amber-600 transition flex items-center gap-2 disabled:opacity-60"
              >
                {generatingAll ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Generating…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M5.635 19A9 9 0 104.582 9" />
                    </svg>
                    Generate {missingPinCount} Missing PIN{missingPinCount > 1 ? 's' : ''}
                  </>
                )}
              </button>
            )}
            <button
              onClick={handlePrint}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Cards
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {pupils.map((pupil) => {
              const draft = editingPin[pupil.id];
              const isSaving = !!savingPin[pupil.id];

              return (
                <div
                  key={pupil.id}
                  className="print-page border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gradient-to-br from-blue-50 to-white"
                >
                  {/* Pupil header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {pupil.first_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">
                        {pupil.first_name} {pupil.last_name || ''}
                      </p>
                      <p className="text-xs text-gray-500">{classData.name}</p>
                    </div>
                  </div>

                  {/* Credentials grid */}
                  <div className="grid grid-cols-3 gap-1.5 mb-3">
                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <p className="text-[10px] text-gray-500 mb-0.5">Class Code</p>
                      <p className="text-base font-mono font-bold text-blue-600 tracking-wide leading-tight">
                        {classData.class_code}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <p className="text-[10px] text-gray-500 mb-0.5">Username</p>
                      <p className="text-base font-mono font-bold text-gray-800 leading-tight break-all">
                        {pupil.username || '—'}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <p className="text-[10px] text-gray-500 mb-0.5">PIN</p>
                      {pupil.pin_display ? (
                        <p className="text-xl font-mono font-bold text-gray-800 tracking-widest leading-tight">
                          {pupil.pin_display}
                        </p>
                      ) : draft !== undefined ? (
                        /* Inline PIN edit mode */
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            pattern="\d{4}"
                            value={draft}
                            onChange={e => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                              setEditingPin(prev => ({ ...prev, [pupil.id]: val }));
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && draft.length === 4) savePin(pupil.id, draft);
                              if (e.key === 'Escape') {
                                setEditingPin(prev => {
                                  const next = { ...prev };
                                  delete next[pupil.id];
                                  return next;
                                });
                              }
                            }}
                            className="w-14 text-base font-mono font-bold border border-amber-400 rounded px-1 py-0.5 text-center focus:outline-none focus:ring-2 focus:ring-amber-400"
                            autoFocus
                          />
                          <button
                            onClick={() => savePin(pupil.id, draft)}
                            disabled={draft.length !== 4 || isSaving}
                            className="text-green-600 font-bold text-lg leading-none disabled:opacity-40"
                            title="Save PIN"
                          >
                            {isSaving ? '…' : '✓'}
                          </button>
                        </div>
                      ) : (
                        /* No PIN — show Set PIN button */
                        <button
                          onClick={() => setEditingPin(prev => ({ ...prev, [pupil.id]: '' }))}
                          className="no-print text-[11px] font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 border border-amber-300 rounded px-1.5 py-0.5 leading-tight transition"
                        >
                          Set PIN
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Login instructions */}
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <ol className="text-[10px] text-gray-600 space-y-0.5">
                      <li>1. Go to <span className="font-semibold">{loginUrl}</span></li>
                      <li>2. Enter class code, username &amp; PIN above</li>
                    </ol>
                  </div>
                </div>
              );
            })}
          </div>

          {pupils.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No pupils in this class yet.</p>
              <Link
                href={`/classes/${resolvedParams.id}`}
                className="text-blue-500 hover:underline text-sm mt-2 inline-block"
              >
                Add pupils to generate login cards
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
