'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AddPupilModalProps {
  classId: string;
  classYearGroup: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddPupilModal({ classId, classYearGroup, onClose, onSuccess }: AddPupilModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [yearGroup, setYearGroup] = useState(classYearGroup);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Step 1: Create a temporary email
      const randomId = Math.random().toString(36).substring(2, 8);
      const tempEmail = `${firstName.toLowerCase()}${lastName.toLowerCase()}${randomId}@wrife.co.uk`;
      const tempPassword = Math.random().toString(36).slice(-12);

      // Step 2: Create auth user (trigger will auto-create profile with pupil role)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: tempEmail,
        password: tempPassword,
        options: {
          data: {
            role: 'pupil',
            first_name: firstName,
            last_name: lastName,
            display_name: `${firstName} ${lastName}`,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      const userId = authData.user.id;

      // Step 3: Wait for trigger to complete (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 4: Create pupil record
      const { error: pupilError } = await supabase
        .from('pupils')
        .insert({
          id: userId,
          first_name: firstName,
          last_name: lastName,
          display_name: `${firstName} ${lastName}`,
          year_group: yearGroup,
        });

      if (pupilError) {
        console.error('Pupil insert error:', pupilError);
        throw pupilError;
      }

      // Step 5: Add pupil to class
      const { error: memberError } = await supabase
        .from('class_members')
        .insert({
          class_id: classId,
          pupil_id: userId,
        });

      if (memberError) {
        console.error('Class member insert error:', memberError);
        throw memberError;
      }

      // Success!
      onSuccess();
    } catch (err: any) {
      console.error('Error creating pupil:', err);
      setError(err.message || 'Failed to create pupil');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-strong max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[var(--wrife-text-main)]">Add New Pupil</h3>
          <button
            onClick={onClose}
            className="text-[var(--wrife-text-muted)] hover:text-[var(--wrife-text-main)] transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="firstName" className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder="e.g., Emily"
              className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              placeholder="e.g., Smith"
              className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="yearGroup" className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
              Year Group <span className="text-red-500">*</span>
            </label>
            <select
              id="yearGroup"
              value={yearGroup}
              onChange={(e) => setYearGroup(parseInt(e.target.value))}
              required
              className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent"
            >
              <option value={2}>Year 2</option>
              <option value={3}>Year 3</option>
              <option value={4}>Year 4</option>
              <option value={5}>Year 5</option>
              <option value={6}>Year 6</option>
            </select>
          </div>

          <div className="p-3 rounded-lg bg-[var(--wrife-blue-soft)] text-xs text-[var(--wrife-text-main)]">
            The pupil will be able to log in using the class code.
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-[var(--wrife-border)] px-6 py-3 text-sm font-semibold text-[var(--wrife-text-main)] hover:bg-[var(--wrife-bg)] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-[var(--wrife-blue)] px-6 py-3 text-sm font-semibold text-white shadow-soft hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Pupil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
