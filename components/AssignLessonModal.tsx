'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

interface AssignLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: number;
  lessonTitle: string;
}

interface ClassOption {
  id: number;
  name: string;
  year_group: number;
}

export function AssignLessonModal({ isOpen, onClose, lessonId, lessonTitle }: AssignLessonModalProps) {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingClasses, setFetchingClasses] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && user) {
      fetchClasses();
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
      setDueDate(oneWeekFromNow.toISOString().split('T')[0]);
    }
  }, [isOpen, user]);

  async function fetchClasses() {
    if (!user) return;
    setFetchingClasses(true);
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, year_group')
        .eq('teacher_id', user.id)
        .order('name');

      if (error) {
        console.error('Error fetching classes:', error);
        setClasses([]);
      } else {
        setClasses(data || []);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
      setClasses([]);
    } finally {
      setFetchingClasses(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!selectedClassId) {
      setError('Please select a class');
      return;
    }

    if (!user) {
      setError('You must be logged in');
      return;
    }

    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from('assignments')
        .insert({
          lesson_id: lessonId,
          class_id: parseInt(selectedClassId),
          teacher_id: user.id,
          title: lessonTitle,
          instructions: instructions.trim() || null,
          due_date: dueDate || null,
        });

      if (insertError) throw insertError;

      const selectedClass = classes.find(c => c.id === parseInt(selectedClassId));
      alert(`Lesson assigned to ${selectedClass?.name || 'class'}!`);
      onClose();
      window.location.reload();
    } catch (err: any) {
      console.error('Error assigning lesson:', err);
      setError(err.message || 'Failed to assign lesson');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setSelectedClassId('');
    setInstructions('');
    setError('');
    onClose();
  }

  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-strong max-w-[600px] w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[var(--wrife-text-main)]">Assign Lesson</h3>
          <button
            onClick={handleClose}
            className="text-[var(--wrife-text-muted)] hover:text-[var(--wrife-text-main)] transition text-xl"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 p-3 rounded-lg bg-[var(--wrife-blue-soft)]">
          <p className="text-sm font-semibold text-[var(--wrife-text-main)]">{lessonTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="classSelect" className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
              Class <span className="text-red-500">*</span>
            </label>
            {fetchingClasses ? (
              <div className="text-sm text-[var(--wrife-text-muted)]">Loading classes...</div>
            ) : classes.length === 0 ? (
              <div className="p-3 rounded-lg bg-[var(--wrife-bg)] border border-[var(--wrife-border)] text-sm text-[var(--wrife-text-muted)]">
                You need to create a class first
              </div>
            ) : (
              <select
                id="classSelect"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent"
              >
                <option value="">Select a class...</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    Year {cls.year_group} - {cls.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
              Due Date (optional)
            </label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={today}
              className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="instructions" className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
              Instructions (optional)
            </label>
            <textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value.slice(0, 500))}
              rows={4}
              maxLength={500}
              placeholder="Add any instructions for your pupils..."
              className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent resize-none"
            />
            <div className="text-xs text-[var(--wrife-text-muted)] text-right mt-1">
              {instructions.length}/500 characters
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-full border border-[var(--wrife-border)] px-6 py-2 text-sm font-semibold text-[var(--wrife-text-main)] hover:bg-[var(--wrife-bg)] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || classes.length === 0}
              className="flex-1 rounded-full bg-[var(--wrife-blue)] px-6 py-2 text-sm font-semibold text-white shadow-soft hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Assigning...' : 'Assign Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
