'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { TIER_NAMES } from '@/lib/dwp-levels-data';

interface WritingLevel {
  id: string;
  level_number: number;
  tier_number: number;
  level_id: string;
  activity_name: string;
  activity_type: string;
  learning_objective: string;
  prompt_title: string;
  expected_time_minutes: number;
  passing_threshold: number;
  tier_finale: boolean;
  milestone: boolean;
  programme_finale: boolean;
}

interface AssignDWPModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: number;
  className: string;
  yearGroup: number;
  teacherId: string;
  onAssigned: () => void;
}

export function AssignDWPModal({ isOpen, onClose, classId, className, yearGroup, teacherId, onAssigned }: AssignDWPModalProps) {
  const [levels, setLevels] = useState<WritingLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<WritingLevel | null>(null);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchLevels();
    }
  }, [isOpen]);

  async function fetchLevels() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('writing_levels')
        .select('*')
        .order('level_number', { ascending: true });

      if (error) throw error;
      setLevels(data || []);
    } catch (err) {
      console.error('Error fetching writing levels:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign() {
    if (!selectedLevel) {
      setError('Please select a writing level');
      return;
    }

    setAssigning(true);
    setError('');

    try {
      const { error } = await supabase
        .from('dwp_assignments')
        .insert({
          level_id: selectedLevel.level_id,
          class_id: classId,
          teacher_id: teacherId,
          instructions: instructions.trim() || null,
          due_date: dueDate || null,
        });

      if (error) throw error;

      setSuccessMessage(`Level ${selectedLevel.level_number}: ${selectedLevel.activity_name} assigned successfully!`);
      setTimeout(() => {
        setSuccessMessage('');
        setSelectedLevel(null);
        setInstructions('');
        setDueDate('');
        onAssigned();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to assign writing level');
    } finally {
      setAssigning(false);
    }
  }

  const filteredLevels = selectedTier
    ? levels.filter(l => l.tier_number === selectedTier)
    : levels;

  const groupedByTier = filteredLevels.reduce((acc, level) => {
    if (!acc[level.tier_number]) {
      acc[level.tier_number] = [];
    }
    acc[level.tier_number].push(level);
    return acc;
  }, {} as { [key: number]: WritingLevel[] });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-[var(--wrife-text-main)]">Assign Daily Writing Practice</h2>
              <p className="text-sm text-[var(--wrife-text-muted)]">to {className}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              {successMessage}
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent"></div>
            </div>
          ) : levels.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[var(--wrife-text-muted)]">No writing levels available. Please seed the levels first.</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
                  Filter by Tier
                </label>
                <select
                  value={selectedTier ?? ''}
                  onChange={(e) => setSelectedTier(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                >
                  <option value="">All Tiers</option>
                  {Object.entries(TIER_NAMES).map(([num, name]) => (
                    <option key={num} value={num}>Tier {num}: {name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
                  Select Level
                </label>
                <div className="max-h-72 overflow-y-auto border border-[var(--wrife-border)] rounded-lg">
                  {Object.entries(groupedByTier)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([tier, tierLevels]) => (
                      <div key={tier}>
                        <div className="sticky top-0 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 text-sm font-semibold text-[var(--wrife-text-main)]">
                          Tier {tier}: {TIER_NAMES[parseInt(tier)]}
                        </div>
                        {tierLevels.map((level) => (
                          <button
                            key={level.id}
                            onClick={() => setSelectedLevel(level)}
                            className={`w-full text-left px-4 py-3 border-b border-[var(--wrife-border)] transition ${
                              selectedLevel?.id === level.id
                                ? 'bg-blue-50 border-l-4 border-l-[var(--wrife-blue)]'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-bold ${
                                level.programme_finale ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                level.tier_finale ? 'bg-purple-500' :
                                level.milestone ? 'bg-green-500' :
                                'bg-blue-500'
                              }`}>
                                {level.level_number}
                              </span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-[var(--wrife-text-main)] text-sm">{level.activity_name}</p>
                                  {level.tier_finale && (
                                    <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-semibold">
                                      FINALE
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-[var(--wrife-text-muted)]">
                                  {level.expected_time_minutes} mins • {level.passing_threshold}% to pass
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ))}
                </div>
              </div>

              {selectedLevel && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-[var(--wrife-text-main)] mb-2">
                    Level {selectedLevel.level_number}: {selectedLevel.activity_name}
                  </h4>
                  <p className="text-sm text-[var(--wrife-text-muted)]">{selectedLevel.learning_objective}</p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                  Additional Instructions (optional)
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                  rows={2}
                  placeholder="Add any extra instructions for pupils..."
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                  Due Date (optional)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-full border border-[var(--wrife-border)] px-6 py-3 text-sm font-semibold text-[var(--wrife-text-muted)] hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={!selectedLevel || assigning}
                  className="flex-1 rounded-full bg-[var(--wrife-blue)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
                >
                  {assigning ? 'Assigning...' : 'Assign to Class'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
