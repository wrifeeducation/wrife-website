'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { DWP_LEVELS, TIER_NAMES, TIER_DESCRIPTIONS, WritingLevel } from '@/lib/dwp-levels-data';

interface DBWritingLevel {
  id: string;
  level_number: number;
  tier_number: number;
  level_id: string;
  activity_name: string;
  activity_type: string;
  learning_objective: string;
  prompt_title: string;
  prompt_instructions: string;
  rubric: Record<string, unknown>;
  passing_threshold: number;
  expected_time_minutes: number;
  tier_finale: boolean;
  programme_finale: boolean;
  milestone: boolean;
}

export default function AdminDWPLevelsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [levels, setLevels] = useState<DBWritingLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
      fetchLevels();
    }
  }, [user, authLoading, router]);

  async function fetchLevels() {
    try {
      const { data, error } = await supabase
        .from('writing_levels')
        .select('*')
        .order('level_number', { ascending: true });

      if (error) throw error;
      setLevels(data || []);
    } catch (err) {
      console.error('Error fetching levels:', err);
      setErrorMessage('Failed to fetch levels. The table may not exist yet.');
    } finally {
      setLoading(false);
    }
  }

  async function seedAllLevels() {
    if (!confirm('This will insert all 40 DWP levels into the database. Continue?')) {
      return;
    }

    setSeeding(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const levelsToInsert = DWP_LEVELS.map(level => ({
        level_number: level.level_number,
        tier_number: level.tier_number,
        level_id: level.level_id,
        activity_name: level.activity_name,
        activity_type: level.activity_type,
        learning_objective: level.learning_objective,
        prompt_title: level.prompt_title,
        prompt_instructions: level.prompt_instructions,
        prompt_example: level.prompt_example || null,
        word_bank: level.word_bank || null,
        rubric: level.rubric,
        passing_threshold: level.passing_threshold,
        expected_time_minutes: level.expected_time_minutes,
        difficulty_level: level.difficulty_level,
        age_range: level.age_range,
        tier_finale: level.tier_finale,
        programme_finale: level.programme_finale,
        milestone: level.milestone,
        display_order: level.display_order,
      }));

      const { error } = await supabase
        .from('writing_levels')
        .upsert(levelsToInsert, { onConflict: 'level_id' });

      if (error) throw error;

      setSuccessMessage(`Successfully seeded all ${DWP_LEVELS.length} levels!`);
      fetchLevels();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      console.error('Error seeding levels:', err);
      setErrorMessage(err.message || 'Failed to seed levels');
    } finally {
      setSeeding(false);
    }
  }

  async function deleteAllLevels() {
    if (!confirm('WARNING: This will delete ALL writing levels. This cannot be undone. Are you sure?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('writing_levels')
        .delete()
        .neq('level_number', -1);

      if (error) throw error;

      setSuccessMessage('All levels deleted');
      fetchLevels();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete levels');
    }
  }

  const filteredLevels = selectedTier === null
    ? levels
    : levels.filter(l => l.tier_number === selectedTier);

  const groupedByTier = filteredLevels.reduce((acc, level) => {
    if (!acc[level.tier_number]) {
      acc[level.tier_number] = [];
    }
    acc[level.tier_number].push(level);
    return acc;
  }, {} as { [key: number]: DBWritingLevel[] });

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
              <h1 className="text-2xl font-extrabold text-[var(--wrife-text-main)] mt-2">Daily Writing Practice Levels</h1>
              <p className="text-sm text-[var(--wrife-text-muted)] mt-1">
                {levels.length} levels loaded across 8 tiers
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={seedAllLevels}
                disabled={seeding}
                className="rounded-full bg-[var(--wrife-blue)] px-6 py-3 text-sm font-semibold text-white shadow-soft hover:opacity-90 transition disabled:opacity-50"
              >
                {seeding ? 'Seeding...' : levels.length > 0 ? 'Update All Levels' : 'Seed All 40 Levels'}
              </button>
              {levels.length > 0 && (
                <button
                  onClick={deleteAllLevels}
                  className="rounded-full border border-red-300 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                >
                  Delete All
                </button>
              )}
            </div>
          </div>

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {errorMessage}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={selectedTier ?? ''}
                onChange={(e) => setSelectedTier(e.target.value ? parseInt(e.target.value) : null)}
                className="flex-1 px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
              >
                <option value="">All Tiers</option>
                {Object.entries(TIER_NAMES).map(([num, name]) => (
                  <option key={num} value={num}>Tier {num}: {name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6 p-4 bg-[var(--wrife-blue-soft)] rounded-2xl border border-[var(--wrife-blue)]/20">
            <h3 className="font-bold text-[var(--wrife-text-main)] mb-2">Daily Writing Practice Programme</h3>
            <p className="text-sm text-[var(--wrife-text-muted)]">
              40-level progressive writing system with AI assessment. 8 tiers from Word Awareness to Short Narratives.
              Pupils must score 80%+ to advance. AI provides personalized feedback using level-specific rubrics.
            </p>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="bg-white rounded-lg p-2">
                <span className="font-semibold">Tier 1-2:</span> Foundation (Ages 6-7)
              </div>
              <div className="bg-white rounded-lg p-2">
                <span className="font-semibold">Tier 3-4:</span> Developing (Ages 7-9)
              </div>
              <div className="bg-white rounded-lg p-2">
                <span className="font-semibold">Tier 5-6:</span> Advanced (Ages 8-10)
              </div>
              <div className="bg-white rounded-lg p-2">
                <span className="font-semibold">Tier 7-8:</span> Mastery (Ages 9-11)
              </div>
            </div>
          </div>

          {levels.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-12 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">No Levels Found</h3>
              <p className="text-[var(--wrife-text-muted)] mb-4">
                Click "Seed All 40 Levels" to populate the database with the complete DWP curriculum.
              </p>
              <p className="text-xs text-[var(--wrife-text-muted)]">
                Note: Make sure the database migration has been run first.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByTier)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([tier, tierLevels]) => (
                  <div key={tier} className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-4">
                      <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">
                        Tier {tier}: {TIER_NAMES[parseInt(tier)]}
                      </h2>
                      <p className="text-sm text-[var(--wrife-text-muted)]">
                        {TIER_DESCRIPTIONS[parseInt(tier)]} • {tierLevels.length} levels
                      </p>
                    </div>
                    <div className="divide-y divide-[var(--wrife-border)]">
                      {tierLevels.map((level) => (
                        <div key={level.id} className="px-6 py-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-bold ${
                                  level.programme_finale ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                  level.tier_finale ? 'bg-purple-500' :
                                  level.milestone ? 'bg-green-500' :
                                  'bg-blue-500'
                                }`}>
                                  {level.level_number}
                                </span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-[var(--wrife-text-main)]">{level.activity_name}</h3>
                                    {level.programme_finale && (
                                      <span className="text-xs bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                                        FINALE
                                      </span>
                                    )}
                                    {level.tier_finale && !level.programme_finale && (
                                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                                        Tier Finale
                                      </span>
                                    )}
                                    {level.milestone && !level.tier_finale && (
                                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                                        Milestone
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-[var(--wrife-text-muted)]">
                                    {level.activity_type} • {level.expected_time_minutes} mins • {level.passing_threshold}% to pass
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm text-[var(--wrife-text-muted)]">{level.learning_objective}</p>
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
    </>
  );
}
