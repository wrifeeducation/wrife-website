'use client';

import { useState, useEffect } from 'react';

interface PWPActivity {
  id: number;
  level: number;
  level_name: string;
  grammar_focus: string;
  sentence_structure: string;
  instructions: string;
  examples: string[];
  practice_prompts: string[];
  year_group_min: number;
  year_group_max: number;
}

interface AssignPWPModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className: string;
  yearGroup: number;
  teacherId: string;
  onAssigned: () => void;
}

const levelDescriptions: { [key: number]: string } = {
  1: 'Simple Sentences',
  2: 'With Prepositions',
  3: 'Using Determiners',
  4: 'Combined Structures',
  5: 'Compound Sentences',
  6: 'Complex Sentences',
  7: 'Multi-clause Sentences',
};

export function AssignPWPModal({ isOpen, onClose, classId, className, yearGroup, teacherId, onAssigned }: AssignPWPModalProps) {
  const [activities, setActivities] = useState<PWPActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<PWPActivity | null>(null);
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchActivities();
    }
  }, [isOpen, yearGroup]);

  async function fetchActivities() {
    setLoading(true);
    try {
      const response = await fetch(`/api/teacher/pwp-activities?yearGroup=${yearGroup}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch activities');
      }
      
      setActivities(data.activities || []);
    } catch (err) {
      console.error('Error fetching PWP activities:', err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign() {
    if (!selectedActivity) {
      setError('Please select an activity');
      return;
    }

    setAssigning(true);
    setError('');

    try {
      const response = await fetch('/api/teacher/pwp-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_id: selectedActivity.id,
          class_id: classId,
          instructions: instructions.trim() || null,
          due_date: dueDate || null,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign activity');
      }

      setSuccessMessage(`Level ${selectedActivity.level}: ${selectedActivity.level_name} assigned successfully!`);
      setTimeout(() => {
        setSuccessMessage('');
        setSelectedActivity(null);
        setInstructions('');
        setDueDate('');
        onAssigned();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to assign activity');
    } finally {
      setAssigning(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-[var(--wrife-text-main)]">Assign PWP Activity</h2>
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
          ) : activities.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[var(--wrife-text-muted)]">No PWP activities available for Year {yearGroup}</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
                  Select Level
                </label>
                <div className="grid gap-2 max-h-64 overflow-y-auto">
                  {activities.map((activity) => (
                    <button
                      key={activity.id}
                      onClick={() => setSelectedActivity(activity)}
                      className={`w-full text-left p-4 rounded-lg border transition ${
                        selectedActivity?.id === activity.id
                          ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                          : 'border-[var(--wrife-border)] hover:border-purple-300 hover:bg-purple-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-bold ${
                          selectedActivity?.id === activity.id ? 'bg-purple-600' : 'bg-purple-400'
                        }`}>
                          {activity.level}
                        </span>
                        <div className="flex-1">
                          <p className="font-semibold text-[var(--wrife-text-main)]">{activity.level_name}</p>
                          <p className="text-xs text-[var(--wrife-text-muted)]">{activity.grammar_focus}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedActivity && (
                <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-[var(--wrife-text-main)] mb-2">Selected Activity</h4>
                  <p className="text-sm text-[var(--wrife-text-muted)] mb-2">{selectedActivity.instructions}</p>
                  <div className="text-xs text-purple-600">
                    Structure: {selectedActivity.sentence_structure}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                  Additional Instructions (optional)
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  disabled={!selectedActivity || assigning}
                  className="flex-1 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
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
