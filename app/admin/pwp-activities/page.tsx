'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

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

const levelDescriptions: { [key: number]: string } = {
  1: 'Simple Sentences (Subject + Verb + Object)',
  2: 'Sentences with Prepositions',
  3: 'Using Determiners (a, an, the)',
  4: 'Combined Structures',
  5: 'Compound Sentences',
  6: 'Complex Sentences',
  7: 'Multi-clause Sentences',
};

export default function AdminPWPActivitiesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activities, setActivities] = useState<PWPActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<PWPActivity | null>(null);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [schemaReloading, setSchemaReloading] = useState(false);
  
  const [formData, setFormData] = useState({
    level: 1,
    level_name: '',
    grammar_focus: '',
    sentence_structure: '',
    instructions: '',
    examples: '',
    practice_prompts: '',
    year_group_min: 2,
    year_group_max: 6,
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      fetchActivities();
    }
  }, [user, authLoading, router]);

  async function fetchActivities() {
    try {
      const { data, error } = await supabase
        .from('progressive_activities')
        .select('*')
        .order('level', { ascending: true });

      if (error) throw error;
      setActivities(data || []);
    } catch (err: any) {
      console.error('Error fetching activities:', err);
      if (err.message?.includes('schema cache')) {
        setFormError('Database schema cache issue detected. Please click "Refresh Schema Cache" to fix.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleReloadSchema() {
    setSchemaReloading(true);
    setFormError('');
    try {
      const response = await fetch('/api/admin/reload-schema', { method: 'POST' });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setSuccessMessage('Schema cache refreshed. Please try your operation again.');
      setTimeout(() => {
        setSuccessMessage('');
        fetchActivities();
      }, 2000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to reload schema');
    } finally {
      setSchemaReloading(false);
    }
  }

  function resetForm() {
    setFormData({
      level: 1,
      level_name: levelDescriptions[1] || '',
      grammar_focus: '',
      sentence_structure: '',
      instructions: '',
      examples: '',
      practice_prompts: '',
      year_group_min: 2,
      year_group_max: 6,
    });
    setFormError('');
  }

  function openAddModal() {
    resetForm();
    setShowAddModal(true);
  }

  function openEditModal(activity: PWPActivity) {
    setEditingActivity(activity);
    setFormData({
      level: activity.level,
      level_name: activity.level_name,
      grammar_focus: activity.grammar_focus,
      sentence_structure: activity.sentence_structure,
      instructions: activity.instructions,
      examples: Array.isArray(activity.examples) ? activity.examples.join('\n') : '',
      practice_prompts: Array.isArray(activity.practice_prompts) ? activity.practice_prompts.join('\n') : '',
      year_group_min: activity.year_group_min,
      year_group_max: activity.year_group_max,
    });
    setFormError('');
    setShowEditModal(true);
  }

  async function handleAddActivity(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!formData.level_name.trim() || !formData.instructions.trim()) {
      setFormError('Level name and instructions are required');
      return;
    }

    try {
      const examplesArray = formData.examples.split('\n').filter(e => e.trim());
      const promptsArray = formData.practice_prompts.split('\n').filter(p => p.trim());

      const { error } = await supabase
        .from('progressive_activities')
        .insert({
          level: formData.level,
          level_name: formData.level_name.trim(),
          grammar_focus: formData.grammar_focus.trim(),
          sentence_structure: formData.sentence_structure.trim(),
          instructions: formData.instructions.trim(),
          examples: examplesArray,
          practice_prompts: promptsArray,
          year_group_min: formData.year_group_min,
          year_group_max: formData.year_group_max,
        });

      if (error) throw error;

      setSuccessMessage('Activity added successfully!');
      setShowAddModal(false);
      fetchActivities();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to add activity');
    }
  }

  async function handleUpdateActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!editingActivity) return;
    setFormError('');

    if (!formData.level_name.trim() || !formData.instructions.trim()) {
      setFormError('Level name and instructions are required');
      return;
    }

    try {
      const examplesArray = formData.examples.split('\n').filter(e => e.trim());
      const promptsArray = formData.practice_prompts.split('\n').filter(p => p.trim());

      const { error } = await supabase
        .from('progressive_activities')
        .update({
          level: formData.level,
          level_name: formData.level_name.trim(),
          grammar_focus: formData.grammar_focus.trim(),
          sentence_structure: formData.sentence_structure.trim(),
          instructions: formData.instructions.trim(),
          examples: examplesArray,
          practice_prompts: promptsArray,
          year_group_min: formData.year_group_min,
          year_group_max: formData.year_group_max,
        })
        .eq('id', editingActivity.id);

      if (error) throw error;

      setSuccessMessage('Activity updated successfully!');
      setShowEditModal(false);
      setEditingActivity(null);
      fetchActivities();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to update activity');
    }
  }

  async function handleDeleteActivity(activity: PWPActivity) {
    if (!confirm(`Are you sure you want to delete "Level ${activity.level}: ${activity.level_name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('progressive_activities')
        .delete()
        .eq('id', activity.id);

      if (error) throw error;

      setSuccessMessage('Activity deleted successfully!');
      fetchActivities();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error deleting activity:', err);
      alert('Failed to delete activity: ' + err.message);
    }
  }

  const filteredActivities = selectedLevel === null 
    ? activities 
    : activities.filter(a => a.level === selectedLevel);

  const groupedByLevel = filteredActivities.reduce((acc, activity) => {
    if (!acc[activity.level]) {
      acc[activity.level] = [];
    }
    acc[activity.level].push(activity);
    return acc;
  }, {} as { [key: number]: PWPActivity[] });

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[var(--wrife-bg)] py-8">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex justify-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent"></div>
            </div>
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
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <Link href="/admin" className="text-[var(--wrife-blue)] hover:underline">
                  ← Back to Admin
                </Link>
              </div>
              <h1 className="text-2xl font-extrabold text-[var(--wrife-text-main)] mt-2">Progressive Writing Practice</h1>
              <p className="text-sm text-[var(--wrife-text-muted)] mt-1">
                {activities.length} activities across 7 progression levels
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="rounded-full bg-[var(--wrife-blue)] px-6 py-3 text-sm font-semibold text-white shadow-soft hover:opacity-90 transition"
            >
              + Add Activity
            </button>
          </div>

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              {successMessage}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={selectedLevel ?? ''}
                onChange={(e) => setSelectedLevel(e.target.value ? parseInt(e.target.value) : null)}
                className="flex-1 px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
              >
                <option value="">All Levels</option>
                {Object.entries(levelDescriptions).map(([num, desc]) => (
                  <option key={num} value={num}>Level {num}: {desc}</option>
                ))}
              </select>
              <button
                onClick={handleReloadSchema}
                disabled={schemaReloading}
                className="px-4 py-2 rounded-lg border border-orange-300 text-sm font-medium text-orange-600 hover:bg-orange-50 transition disabled:opacity-50"
              >
                {schemaReloading ? 'Refreshing...' : 'Refresh Schema Cache'}
              </button>
            </div>
          </div>

          <div className="mb-6 p-4 bg-[var(--wrife-blue-soft)] rounded-2xl border border-[var(--wrife-blue)]/20">
            <h3 className="font-bold text-[var(--wrife-text-main)] mb-2">Content Generation Guide</h3>
            <p className="text-sm text-[var(--wrife-text-muted)] mb-2">
              Use Claude AI to generate PWP activities with this prompt format:
            </p>
            <div className="bg-white rounded-lg p-3 text-xs font-mono text-[var(--wrife-text-muted)] whitespace-pre-wrap">
{`Generate a Progressive Writing Practice activity for Level [1-7].

Level Name: [e.g., "Simple Sentences"]
Grammar Focus: [e.g., "Subject + Verb + Object"]
Sentence Structure: [e.g., "Subject + Verb + Object"]
Instructions: [Clear pupil-facing instructions, 2-3 sentences]
Examples: [5 example sentences at this level, one per line]
Practice Prompts: [5 sentence starters with blanks, one per line]
Year Groups: [Min and Max, e.g., 2-4]`}
            </div>
          </div>

          {Object.keys(groupedByLevel).length === 0 ? (
            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-12 text-center">
              <p className="text-[var(--wrife-text-muted)]">No activities found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByLevel)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([level, levelActivities]) => (
                  <div key={level} className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-100 to-blue-100 px-6 py-4">
                      <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">
                        Level {level}: {levelDescriptions[parseInt(level)] || 'Activities'}
                      </h2>
                      <p className="text-sm text-[var(--wrife-text-muted)]">
                        {levelActivities.length} {levelActivities.length === 1 ? 'activity' : 'activities'}
                      </p>
                    </div>
                    <div className="divide-y divide-[var(--wrife-border)]">
                      {levelActivities.map((activity) => (
                        <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white text-sm font-bold">
                                  {activity.level}
                                </span>
                                <div>
                                  <h3 className="font-semibold text-[var(--wrife-text-main)]">{activity.level_name}</h3>
                                  <p className="text-xs text-[var(--wrife-text-muted)]">
                                    {activity.grammar_focus} • Years {activity.year_group_min}-{activity.year_group_max}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm text-[var(--wrife-text-muted)] mb-2">{activity.instructions}</p>
                              <div className="flex gap-4 text-xs text-[var(--wrife-text-muted)]">
                                <span>{Array.isArray(activity.examples) ? activity.examples.length : 0} examples</span>
                                <span>{Array.isArray(activity.practice_prompts) ? activity.practice_prompts.length : 0} prompts</span>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                onClick={() => openEditModal(activity)}
                                className="rounded-full border border-[var(--wrife-blue)] px-4 py-1.5 text-xs font-semibold text-[var(--wrife-blue)] hover:bg-[var(--wrife-blue-soft)] transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteActivity(activity)}
                                className="rounded-full border border-red-300 px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-[var(--wrife-text-main)] mb-4">
                {showEditModal ? 'Edit Activity' : 'Add New Activity'}
              </h2>
              
              {formError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {formError}
                </div>
              )}

              <form onSubmit={showEditModal ? handleUpdateActivity : handleAddActivity}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                        Level (1-7)
                      </label>
                      <select
                        value={formData.level}
                        onChange={(e) => {
                          const level = parseInt(e.target.value);
                          setFormData({ 
                            ...formData, 
                            level,
                            level_name: formData.level_name || levelDescriptions[level] || ''
                          });
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map(level => (
                          <option key={level} value={level}>Level {level}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                        Level Name
                      </label>
                      <input
                        type="text"
                        value={formData.level_name}
                        onChange={(e) => setFormData({ ...formData, level_name: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                        placeholder="e.g., Simple Sentences"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                        Grammar Focus
                      </label>
                      <input
                        type="text"
                        value={formData.grammar_focus}
                        onChange={(e) => setFormData({ ...formData, grammar_focus: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                        placeholder="e.g., Subject + Verb + Object"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                        Sentence Structure
                      </label>
                      <input
                        type="text"
                        value={formData.sentence_structure}
                        onChange={(e) => setFormData({ ...formData, sentence_structure: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                        placeholder="e.g., Subject + Verb + Object"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                      Instructions (for pupils)
                    </label>
                    <textarea
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                      rows={3}
                      placeholder="Clear instructions for pupils on how to complete this activity..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                      Examples (one per line)
                    </label>
                    <textarea
                      value={formData.examples}
                      onChange={(e) => setFormData({ ...formData, examples: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] font-mono"
                      rows={5}
                      placeholder="Sam ate rice.&#10;The dog chased the ball.&#10;Mum baked a cake."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                      Practice Prompts (one per line)
                    </label>
                    <textarea
                      value={formData.practice_prompts}
                      onChange={(e) => setFormData({ ...formData, practice_prompts: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] font-mono"
                      rows={5}
                      placeholder="The boy _____ (action) the _____.&#10;My friend _____ a _____."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                        Min Year Group
                      </label>
                      <select
                        value={formData.year_group_min}
                        onChange={(e) => setFormData({ ...formData, year_group_min: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                      >
                        {[2, 3, 4, 5, 6].map(year => (
                          <option key={year} value={year}>Year {year}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                        Max Year Group
                      </label>
                      <select
                        value={formData.year_group_max}
                        onChange={(e) => setFormData({ ...formData, year_group_max: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                      >
                        {[2, 3, 4, 5, 6].map(year => (
                          <option key={year} value={year}>Year {year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setEditingActivity(null);
                    }}
                    className="flex-1 rounded-full border border-[var(--wrife-border)] px-6 py-3 text-sm font-semibold text-[var(--wrife-text-muted)] hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-full bg-[var(--wrife-blue)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
                  >
                    {showEditModal ? 'Update Activity' : 'Add Activity'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
