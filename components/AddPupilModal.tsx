'use client';

import { useState } from 'react';

interface AddedPupil {
  firstName: string;
  lastName: string;
  username: string;
  pin: string;
}

interface AddPupilModalProps {
  classId: string;
  classCode: string;
  className: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddPupilModal({ classId, classCode, className, onClose, onSuccess }: AddPupilModalProps) {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bulkNames, setBulkNames] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedPupils, setAddedPupils] = useState<AddedPupil[]>([]);
  const [done, setDone] = useState(false);

  async function handleAddSingle() {
    if (!firstName.trim()) {
      setError('First name is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/classes/${classId}/pupils`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add pupil');
      setAddedPupils([{
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: data.credentials.username,
        pin: data.credentials.pin,
      }]);
      setDone(true);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add pupil');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddBulk() {
    const lines = bulkNames.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      setError('Enter at least one name');
      return;
    }
    const pupils = lines.map(line => {
      const parts = line.split(/\s+/);
      return { firstName: parts[0], lastName: parts.slice(1).join(' ') || undefined };
    });
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/classes/${classId}/pupils`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pupils }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add pupils');
      const created: AddedPupil[] = (data.pupils || []).map((p: any) => ({
        firstName: p.first_name,
        lastName: p.last_name || '',
        username: p.credentials.username,
        pin: p.credentials.pin,
      }));
      setAddedPupils(created);
      setDone(true);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add pupils');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit() {
    if (mode === 'single') handleAddSingle();
    else handleAddBulk();
  }

  function handleAddMore() {
    setDone(false);
    setFirstName('');
    setLastName('');
    setBulkNames('');
    setAddedPupils([]);
    setError(null);
  }

  const bulkCount = bulkNames.split('\n').filter(l => l.trim()).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-[var(--wrife-text-main)]">Add Pupils</h2>
              <p className="text-sm text-[var(--wrife-text-muted)]">{className}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!done ? (
            <>
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setMode('single')}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                    mode === 'single'
                      ? 'bg-[var(--wrife-blue)] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  One pupil
                </button>
                <button
                  onClick={() => setMode('bulk')}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                    mode === 'bulk'
                      ? 'bg-[var(--wrife-blue)] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Multiple pupils
                </button>
              </div>

              {mode === 'single' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                      First name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                      placeholder="e.g. Emma"
                      className="w-full rounded-lg border border-[var(--wrife-border)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                      Last name <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                      placeholder="e.g. Smith"
                      className="w-full rounded-lg border border-[var(--wrife-border)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                    Pupil names <span className="text-gray-400 font-normal">(one per line)</span>
                  </label>
                  <p className="text-xs text-[var(--wrife-text-muted)] mb-2">
                    Enter each pupil's name on a new line. Include last name if needed (e.g. &quot;Emma Smith&quot;)
                  </p>
                  <textarea
                    value={bulkNames}
                    onChange={e => setBulkNames(e.target.value)}
                    placeholder={"Emma Smith\nJack Jones\nSophia Brown\nLiam Taylor"}
                    rows={8}
                    className="w-full rounded-lg border border-[var(--wrife-border)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] font-mono resize-none"
                    autoFocus
                  />
                </div>
              )}

              {error && (
                <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-6 w-full rounded-full bg-[var(--wrife-blue)] py-3 text-sm font-semibold text-white hover:bg-[var(--wrife-blue-dark)] disabled:opacity-50 transition"
              >
                {loading
                  ? 'Adding...'
                  : mode === 'single'
                  ? 'Add Pupil'
                  : `Add ${bulkCount} Pupil${bulkCount !== 1 ? 's' : ''}`
                }
              </button>
            </>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[var(--wrife-text-main)]">
                    {addedPupils.length} pupil{addedPupils.length !== 1 ? 's' : ''} added!
                  </p>
                  <p className="text-xs text-[var(--wrife-text-muted)]">Note their login details or print login cards from the class page</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 text-xs text-amber-700">
                You can view login details again at any time by printing login cards from the class page.
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto">
                {addedPupils.map((pupil, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="font-semibold text-[var(--wrife-text-main)] mb-3">
                      {pupil.firstName} {pupil.lastName}
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-white rounded-lg p-2 border border-gray-200">
                        <p className="text-gray-500 mb-1">Class Code</p>
                        <p className="font-mono font-bold text-[var(--wrife-blue)] text-sm">{classCode}</p>
                      </div>
                      <div className="bg-white rounded-lg p-2 border border-gray-200">
                        <p className="text-gray-500 mb-1">Username</p>
                        <p className="font-mono font-bold text-gray-800 text-sm">{pupil.username}</p>
                      </div>
                      <div className="bg-white rounded-lg p-2 border border-gray-200">
                        <p className="text-gray-500 mb-1">PIN</p>
                        <p className="font-mono font-bold text-gray-800 text-lg tracking-widest">{pupil.pin}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleAddMore}
                  className="flex-1 py-2.5 rounded-full border border-[var(--wrife-blue)] text-[var(--wrife-blue)] text-sm font-semibold hover:bg-[var(--wrife-blue-soft)] transition"
                >
                  Add more pupils
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-full bg-[var(--wrife-blue)] text-white text-sm font-semibold hover:bg-[var(--wrife-blue-dark)] transition"
                >
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
