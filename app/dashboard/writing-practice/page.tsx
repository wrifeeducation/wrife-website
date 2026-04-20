"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getEntitlements } from '@/lib/entitlements';

const TIER_NAMES: Record<number, string> = {
  1: 'Foundation',
  2: 'Building',
  3: 'Developing',
  4: 'Consolidating',
  5: 'Mastery',
};

interface ClassData {
  id: string;
  name: string;
  year_group: number;
  class_code: string;
}

interface PWPActivity {
  id: string;
  level: number;
  level_name: string;
  grammar_focus: string;
  sentence_structure: string;
  year_group_min: number;
  year_group_max: number;
  locked: boolean;
}

interface DWPLevel {
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
  locked: boolean;
}

interface AssignState {
  type: 'pwp' | 'dwp';
  itemId: string;
  itemName: string;
  levelId?: string;
}

export default function WritingPracticePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'pwp' | 'dwp'>('pwp');
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [pwpActivities, setPwpActivities] = useState<PWPActivity[]>([]);
  const [dwpLevels, setDwpLevels] = useState<DWPLevel[]>([]);
  const [pwpTier, setPwpTier] = useState<string>('free');
  const [dwpTier, setDwpTier] = useState<string>('free');
  const [pwpLimit, setPwpLimit] = useState<number | 'all'>(10);
  const [dwpLimit, setDwpLimit] = useState<number | 'all'>(10);

  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');

  const [assignState, setAssignState] = useState<AssignState | null>(null);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirectTo=/dashboard/writing-practice');
    }
    if (!loading && user && user.role === 'pupil') {
      router.push('/pupil/dashboard');
    }
  }, [user, loading, router]);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    setError('');
    try {
      const [classesRes, pwpRes, dwpRes] = await Promise.all([
        fetch('/api/classes'),
        fetch('/api/teacher/pwp/catalogue'),
        fetch('/api/teacher/dwp/catalogue'),
      ]);

      if (classesRes.ok) {
        const j = await classesRes.json();
        setClasses(j.classes || []);
      }

      if (pwpRes.ok) {
        const j = await pwpRes.json();
        setPwpActivities(j.activities || []);
        setPwpTier(j.tier || 'free');
        setPwpLimit(j.levelLimit ?? 10);
      }

      if (dwpRes.ok) {
        const j = await dwpRes.json();
        setDwpLevels(j.levels || []);
        setDwpTier(j.tier || 'free');
        setDwpLimit(j.levelLimit ?? 10);
      } else {
        const j = await dwpRes.json().catch(() => ({}));
        setError(j.error || 'Failed to load DWP levels');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load writing practice data');
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchAll();
  }, [user, fetchAll]);

  const entitlements = user
    ? getEntitlements(user.membership_tier, user.school_tier)
    : getEntitlements('free');

  function openAssignPWP(activity: PWPActivity) {
    setAssignState({ type: 'pwp', itemId: activity.id, itemName: `Level ${activity.level}: ${activity.level_name}` });
    setSelectedClassId(classes[0]?.id || '');
    setInstructions('');
    setDueDate('');
    setAssignError('');
    setAssignSuccess('');
  }

  function openAssignDWP(level: DWPLevel) {
    setAssignState({ type: 'dwp', itemId: level.id, itemName: `Level ${level.level_number}: ${level.activity_name}`, levelId: level.level_id });
    setSelectedClassId(classes[0]?.id || '');
    setInstructions('');
    setDueDate('');
    setAssignError('');
    setAssignSuccess('');
  }

  async function handleAssign() {
    if (!assignState || !selectedClassId) {
      setAssignError('Please select a class');
      return;
    }
    setAssigning(true);
    setAssignError('');
    try {
      let res: Response;
      if (assignState.type === 'pwp') {
        res = await fetch('/api/teacher/pwp-assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activity_id: assignState.itemId, class_id: selectedClassId, instructions, due_date: dueDate || null }),
        });
      } else {
        res = await fetch('/api/teacher/dwp/assign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ level_id: assignState.levelId, class_id: selectedClassId, instructions, due_date: dueDate || null }),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign');
      setAssignSuccess(`Assigned "${assignState.itemName}" successfully!`);
      setTimeout(() => {
        setAssignState(null);
        setAssignSuccess('');
      }, 1500);
    } catch (err: any) {
      setAssignError(err.message || 'Failed to assign');
    } finally {
      setAssigning(false);
    }
  }

  const isFree = entitlements.tier === 'free';
  const canAssign = entitlements.canAssignWork;

  const dwpByTier = dwpLevels.reduce((acc, level) => {
    if (!acc[level.tier_number]) acc[level.tier_number] = [];
    acc[level.tier_number].push(level);
    return acc;
  }, {} as Record<number, DWPLevel[]>);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--wrife-bg)]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-[var(--wrife-text-muted)] hover:text-[var(--wrife-text-main)] transition text-sm">
            ← Dashboard
          </Link>
        </div>

        <header className="mb-6">
          <h1 className="text-2xl font-extrabold text-[var(--wrife-text-main)]">Writing Practice</h1>
          <p className="text-sm text-[var(--wrife-text-muted)]">Assign PWP and DWP writing activities to your classes</p>
        </header>

        {isFree && (
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <p className="font-bold text-[var(--wrife-text-main)] text-sm">Free Plan — Preview Mode</p>
                <p className="text-sm text-[var(--wrife-text-muted)]">
                  You can browse the full catalogue. Upgrade to Standard or Full to assign activities to your class.
                </p>
              </div>
            </div>
            <Link
              href="/pricing"
              className="shrink-0 px-5 py-2 bg-[var(--wrife-blue)] text-white font-semibold rounded-full text-sm hover:opacity-90 transition"
            >
              Upgrade Now
            </Link>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        <nav className="flex gap-1 mb-6 border-b border-[var(--wrife-border)]">
          <button
            onClick={() => setActiveTab('pwp')}
            className={`px-5 py-3 text-sm font-semibold transition border-b-2 -mb-px ${
              activeTab === 'pwp'
                ? 'border-green-500 text-green-600 bg-green-50'
                : 'border-transparent text-[var(--wrife-text-muted)] hover:text-[var(--wrife-text-main)] hover:bg-white/50'
            }`}
          >
            📝 Progressive Writing Practice (PWP)
          </button>
          <button
            onClick={() => setActiveTab('dwp')}
            className={`px-5 py-3 text-sm font-semibold transition border-b-2 -mb-px ${
              activeTab === 'dwp'
                ? 'border-purple-500 text-purple-600 bg-purple-50'
                : 'border-transparent text-[var(--wrife-text-muted)] hover:text-[var(--wrife-text-main)] hover:bg-white/50'
            }`}
          >
            ✍️ Daily Writing Practice (DWP)
          </button>
        </nav>

        {dataLoading ? (
          <div className="flex justify-center py-16">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent"></div>
          </div>
        ) : (
          <>
            {activeTab === 'pwp' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-5 border-2 border-green-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">Progressive Writing Practice</h2>
                      <p className="text-sm text-green-700 mt-1">Formula-based sentence building with AI feedback. Each level focuses on different sentence structures and word classes.</p>
                    </div>
                    <span className="text-4xl ml-4">📝</span>
                  </div>
                  {pwpLimit !== 'all' && (
                    <p className="mt-3 text-xs text-amber-700 font-medium">
                      Showing first {pwpLimit} levels on Free plan — upgrade to access all {pwpActivities.length} levels
                    </p>
                  )}
                </div>

                {pwpActivities.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 border border-[var(--wrife-border)] text-center">
                    <span className="text-4xl mb-3 block">📭</span>
                    <p className="text-[var(--wrife-text-muted)]">No PWP activities found. Ask your admin to add some.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pwpActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className={`bg-white rounded-xl border shadow-sm overflow-hidden transition ${
                          activity.locked ? 'border-gray-200 opacity-75' : 'border-green-200 hover:border-green-400 hover:shadow-md'
                        }`}
                      >
                        <div className={`h-1.5 ${activity.locked ? 'bg-gray-200' : 'bg-gradient-to-r from-green-400 to-teal-400'}`} />
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${
                              activity.locked ? 'bg-gray-400' : 'bg-green-500'
                            }`}>
                              {activity.locked ? '🔒' : activity.level}
                            </span>
                            <span className="text-xs text-[var(--wrife-text-muted)]">Year {activity.year_group_min}–{activity.year_group_max}</span>
                          </div>
                          <h3 className="font-bold text-[var(--wrife-text-main)] text-sm leading-tight mb-1">
                            Level {activity.level}: {activity.level_name}
                          </h3>
                          <p className="text-xs text-[var(--wrife-text-muted)] mb-3 line-clamp-2">{activity.grammar_focus}</p>

                          {activity.locked ? (
                            <Link
                              href="/pricing"
                              className="block w-full text-center rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition"
                            >
                              🔒 Upgrade to Unlock
                            </Link>
                          ) : canAssign ? (
                            classes.length > 0 ? (
                              <button
                                onClick={() => openAssignPWP(activity)}
                                className="w-full rounded-full bg-green-500 px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition"
                              >
                                Assign to Class
                              </button>
                            ) : (
                              <Link
                                href="/dashboard"
                                className="block w-full text-center rounded-full border border-green-300 bg-green-50 px-4 py-2 text-xs font-semibold text-green-700 hover:bg-green-100 transition"
                              >
                                Create a class first
                              </Link>
                            )
                          ) : (
                            <Link
                              href="/pricing"
                              className="block w-full text-center rounded-full border border-[var(--wrife-blue)] bg-blue-50 px-4 py-2 text-xs font-semibold text-[var(--wrife-blue)] hover:bg-blue-100 transition"
                            >
                              Upgrade to Assign
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'dwp' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-5 border-2 border-purple-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">Daily Writing Practice — 40-Level Programme</h2>
                      <p className="text-sm text-purple-700 mt-1">A structured progression from word sorting to extended writing, with AI-powered assessment and badges at each milestone.</p>
                    </div>
                    <span className="text-4xl ml-4">✍️</span>
                  </div>
                  {dwpLimit !== 'all' && (
                    <p className="mt-3 text-xs text-amber-700 font-medium">
                      First {dwpLimit} levels available on Free plan — upgrade to unlock all 40 levels
                    </p>
                  )}
                </div>

                {dwpLevels.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 border border-[var(--wrife-border)] text-center">
                    <span className="text-4xl mb-3 block">📭</span>
                    <p className="text-[var(--wrife-text-muted)]">No DWP levels found.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {Object.entries(dwpByTier)
                      .sort(([a], [b]) => parseInt(a) - parseInt(b))
                      .map(([tierNum, tierLevels]) => (
                        <div key={tierNum}>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="h-px flex-1 bg-purple-200" />
                            <h3 className="text-sm font-bold text-purple-700 px-3 py-1 bg-purple-100 rounded-full">
                              Tier {tierNum}: {TIER_NAMES[parseInt(tierNum)] || `Tier ${tierNum}`}
                            </h3>
                            <div className="h-px flex-1 bg-purple-200" />
                          </div>

                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {tierLevels.map((level) => (
                              <div
                                key={level.id}
                                className={`bg-white rounded-xl border shadow-sm overflow-hidden transition ${
                                  level.locked ? 'border-gray-200 opacity-75' : 'border-purple-200 hover:border-purple-400 hover:shadow-md'
                                }`}
                              >
                                <div className={`h-1.5 ${
                                  level.locked ? 'bg-gray-200' :
                                  level.programme_finale ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                                  level.tier_finale ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                                  level.milestone ? 'bg-gradient-to-r from-green-400 to-teal-400' :
                                  'bg-gradient-to-r from-purple-400 to-blue-400'
                                }`} />
                                <div className="p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${
                                      level.locked ? 'bg-gray-400' :
                                      level.programme_finale ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                      level.tier_finale ? 'bg-purple-500' :
                                      level.milestone ? 'bg-green-500' :
                                      'bg-purple-400'
                                    }`}>
                                      {level.locked ? '🔒' : level.level_number}
                                    </span>
                                    <div className="flex gap-1">
                                      {level.milestone && !level.locked && (
                                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-semibold">MILESTONE</span>
                                      )}
                                      {level.tier_finale && !level.locked && (
                                        <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-semibold">FINALE</span>
                                      )}
                                    </div>
                                  </div>
                                  <h3 className="font-bold text-[var(--wrife-text-main)] text-sm leading-tight mb-1">
                                    {level.activity_name}
                                  </h3>
                                  <p className="text-xs text-[var(--wrife-text-muted)] mb-1">{level.expected_time_minutes} mins • {level.passing_threshold}% to pass</p>

                                  {level.locked ? (
                                    <Link
                                      href="/pricing"
                                      className="block w-full text-center rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition mt-2"
                                    >
                                      🔒 Upgrade to Unlock
                                    </Link>
                                  ) : canAssign ? (
                                    classes.length > 0 ? (
                                      <button
                                        onClick={() => openAssignDWP(level)}
                                        className="w-full rounded-full bg-purple-500 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition mt-2"
                                      >
                                        Assign to Class
                                      </button>
                                    ) : (
                                      <Link
                                        href="/dashboard"
                                        className="block w-full text-center rounded-full border border-purple-300 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition mt-2"
                                      >
                                        Create a class first
                                      </Link>
                                    )
                                  ) : (
                                    <Link
                                      href="/pricing"
                                      className="block w-full text-center rounded-full border border-[var(--wrife-blue)] bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[var(--wrife-blue)] hover:bg-blue-100 transition mt-2"
                                    >
                                      Upgrade to Assign
                                    </Link>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {assignState && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">Assign to Class</h2>
                  <p className="text-sm text-[var(--wrife-text-muted)] mt-0.5">{assignState.itemName}</p>
                </div>
                <button onClick={() => setAssignState(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
              </div>

              {assignError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{assignError}</div>
              )}
              {assignSuccess && (
                <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">{assignSuccess}</div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">Class</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                >
                  <option value="">Select a class…</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} (Year {cls.year_group})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">Instructions (optional)</label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                  rows={2}
                  placeholder="Add any extra instructions for pupils…"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">Due Date (optional)</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setAssignState(null)}
                  className="flex-1 rounded-full border border-[var(--wrife-border)] px-5 py-2.5 text-sm font-semibold text-[var(--wrife-text-muted)] hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={!selectedClassId || assigning}
                  className={`flex-1 rounded-full px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50 ${
                    assignState.type === 'dwp' ? 'bg-purple-500' : 'bg-green-500'
                  }`}
                >
                  {assigning ? 'Assigning…' : 'Assign to Class'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
