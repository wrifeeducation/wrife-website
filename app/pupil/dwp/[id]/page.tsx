'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface WritingLevel {
  id: string;
  level_number: number;
  tier_number: number;
  level_id: string;
  activity_name: string;
  activity_type: string;
  learning_objective: string;
  prompt_title: string;
  prompt_instructions: string;
  prompt_example?: string;
  word_bank?: string[];
  passing_threshold: number;
  expected_time_minutes: number;
  tier_finale: boolean;
  milestone: boolean;
  programme_finale: boolean;
}

interface DWPAssignment {
  id: number;
  level_id: string;
  class_id: number;
  teacher_id: string;
  instructions?: string;
  due_date?: string;
}

interface Assessment {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  performance_band: string;
  badge: string;
  feedback: {
    main_message: string;
    specific_praise: string;
    growth_area?: string;
    encouragement: string;
  };
}

export default function PupilDWPPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<DWPAssignment | null>(null);
  const [level, setLevel] = useState<WritingLevel | null>(null);
  const [pupilId, setPupilId] = useState<string | null>(null);
  const [pupilName, setPupilName] = useState<string>('');
  
  const [writing, setWriting] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [timeStarted, setTimeStarted] = useState<Date | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [error, setError] = useState('');
  
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('pupilSession');
    
    if (!stored) {
      router.push('/pupil/login');
      return;
    }
    
    try {
      const session = JSON.parse(stored);
      if (!session.pupilId) {
        router.push('/pupil/login');
        return;
      }
      
      setPupilId(session.pupilId);
      setPupilName(session.pupilName || '');
      setTimeStarted(new Date());
      fetchAssignmentData(session.pupilId);
    } catch {
      router.push('/pupil/login');
    }
  }, [id, router]);

  async function fetchAssignmentData(pupilId: string) {
    try {
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('dwp_assignments')
        .select('*')
        .eq('id', parseInt(id))
        .single();

      if (assignmentError) throw assignmentError;
      
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('class_members')
        .select('id')
        .eq('class_id', assignmentData.class_id)
        .eq('pupil_id', pupilId)
        .single();
      
      if (enrollmentError || !enrollment) {
        setError('You are not enrolled in this class');
        setLoading(false);
        return;
      }
      
      setAssignment(assignmentData);

      const { data: levelData, error: levelError } = await supabase
        .from('writing_levels')
        .select('*')
        .eq('level_id', assignmentData.level_id)
        .single();

      if (levelError) throw levelError;
      setLevel(levelData);

      const { data: existingAttempt } = await supabase
        .from('writing_attempts')
        .select('*')
        .eq('dwp_assignment_id', parseInt(id))
        .eq('pupil_id', pupilId)
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existingAttempt) {
        setWriting(existingAttempt.pupil_writing || '');
        setAttemptId(existingAttempt.id);
      }

    } catch (err) {
      console.error('Error fetching assignment:', err);
      setError('Could not load this writing activity');
    } finally {
      setLoading(false);
    }
  }

  function handleWritingChange(text: string) {
    setWriting(text);
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
  }

  async function saveDraft() {
    if (!pupilId || !assignment || !level) return;

    try {
      if (attemptId) {
        await supabase
          .from('writing_attempts')
          .update({
            pupil_writing: writing,
            word_count: wordCount,
          })
          .eq('id', attemptId);
      } else {
        const { data, error } = await supabase
          .from('writing_attempts')
          .insert({
            pupil_id: pupilId,
            dwp_assignment_id: assignment.id,
            level_id: level.level_id,
            pupil_writing: writing,
            word_count: wordCount,
            status: 'draft',
            time_started: timeStarted?.toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        if (data) setAttemptId(data.id);
      }
    } catch (err) {
      console.error('Error saving draft:', err);
    }
  }

  async function handleSubmit() {
    if (!pupilId || !assignment || !level || !writing.trim()) {
      setError('Please write something before submitting');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      let currentAttemptId = attemptId;

      if (!currentAttemptId) {
        const { data, error } = await supabase
          .from('writing_attempts')
          .insert({
            pupil_id: pupilId,
            dwp_assignment_id: assignment.id,
            level_id: level.level_id,
            pupil_writing: writing,
            word_count: wordCount,
            status: 'submitted',
            time_started: timeStarted?.toISOString(),
            time_submitted: new Date().toISOString(),
            time_elapsed_seconds: timeStarted ? Math.floor((Date.now() - timeStarted.getTime()) / 1000) : null,
          })
          .select()
          .single();

        if (error) throw error;
        currentAttemptId = data.id;
        setAttemptId(currentAttemptId);
      } else {
        await supabase
          .from('writing_attempts')
          .update({
            pupil_writing: writing,
            word_count: wordCount,
            status: 'submitted',
            time_submitted: new Date().toISOString(),
            time_elapsed_seconds: timeStarted ? Math.floor((Date.now() - timeStarted.getTime()) / 1000) : null,
          })
          .eq('id', currentAttemptId);
      }

      const response = await fetch('/api/dwp/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId: currentAttemptId,
          pupilId,
          levelId: level.level_id,
          pupilWriting: writing,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Assessment failed');
      }

      const result = await response.json();
      setAssessment(result.assessment);
      setShowResults(true);

    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent"></div>
        </div>
      </>
    );
  }

  if (error && !level) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[var(--wrife-bg)] py-8 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-soft p-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Link href="/pupil/dashboard" className="text-[var(--wrife-blue)] hover:underline">
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (showResults && assessment) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[var(--wrife-bg)] py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className={`p-6 text-center ${
                assessment.passed 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                  : 'bg-gradient-to-r from-orange-400 to-amber-500'
              }`}>
                <div className="text-6xl mb-4">
                  {assessment.passed ? '🎉' : '💪'}
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  {assessment.feedback.main_message}
                </h1>
                <div className="text-white/90 text-lg">
                  {assessment.badge}
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="text-3xl font-bold text-[var(--wrife-blue)]">{assessment.score}</div>
                    <div className="text-xs text-[var(--wrife-text-muted)]">Score</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <div className="text-3xl font-bold text-purple-600">{assessment.percentage}%</div>
                    <div className="text-xs text-[var(--wrife-text-muted)]">Percentage</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="text-3xl font-bold text-green-600 capitalize">{assessment.performance_band}</div>
                    <div className="text-xs text-[var(--wrife-text-muted)]">Level</div>
                  </div>
                </div>

                {assessment.feedback.specific_praise && (
                  <div className="mb-4 p-4 bg-green-50 rounded-xl border border-green-200">
                    <h3 className="font-semibold text-green-700 mb-1">⭐ What you did well:</h3>
                    <p className="text-green-800">{assessment.feedback.specific_praise}</p>
                  </div>
                )}

                {assessment.feedback.growth_area && (
                  <div className="mb-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <h3 className="font-semibold text-amber-700 mb-1">📝 To make it even better:</h3>
                    <p className="text-amber-800">{assessment.feedback.growth_area}</p>
                  </div>
                )}

                <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-[var(--wrife-blue)] font-medium">{assessment.feedback.encouragement}</p>
                </div>

                <div className="flex gap-3">
                  <Link
                    href="/pupil/dashboard"
                    className="flex-1 text-center rounded-full border border-[var(--wrife-border)] px-6 py-3 text-sm font-semibold text-[var(--wrife-text-muted)] hover:bg-gray-50 transition"
                  >
                    Back to Dashboard
                  </Link>
                  {!assessment.passed && (
                    <button
                      onClick={() => {
                        setShowResults(false);
                        setAssessment(null);
                        setAttemptId(null);
                        setWriting('');
                        setWordCount(0);
                        setTimeStarted(new Date());
                      }}
                      className="flex-1 rounded-full bg-[var(--wrife-blue)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[var(--wrife-bg)] py-6 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4">
            <Link href="/pupil/dashboard" className="text-[var(--wrife-blue)] hover:underline text-sm">
              ← Back to Dashboard
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg font-bold ${
                  level?.programme_finale ? 'ring-2 ring-yellow-400' : ''
                }`}>
                  {level?.level_number}
                </span>
                <div>
                  <h1 className="text-xl font-bold">{level?.activity_name}</h1>
                  <p className="text-white/80 text-sm">
                    Tier {level?.tier_number} • {level?.expected_time_minutes} minutes
                  </p>
                </div>
              </div>
              {level?.milestone && (
                <span className="inline-block mt-2 text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full font-semibold">
                  ⭐ Milestone Level!
                </span>
              )}
            </div>

            <div className="p-6">
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h2 className="font-bold text-[var(--wrife-text-main)] mb-2">{level?.prompt_title}</h2>
                <p className="text-[var(--wrife-text-main)] whitespace-pre-wrap text-sm">
                  {level?.prompt_instructions}
                </p>
              </div>

              {level?.word_bank && level.word_bank.length > 0 && (
                <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <h3 className="font-semibold text-purple-800 mb-2">Word Bank:</h3>
                  <div className="flex flex-wrap gap-2">
                    {level.word_bank.map((word, i) => (
                      <span key={i} className="px-3 py-1 bg-white rounded-full text-sm text-purple-700 border border-purple-200">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {assignment?.instructions && (
                <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <h3 className="font-semibold text-amber-800 mb-1">Teacher's Instructions:</h3>
                  <p className="text-amber-700 text-sm">{assignment.instructions}</p>
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-[var(--wrife-text-main)]">Your Writing:</label>
                  <span className="text-sm text-[var(--wrife-text-muted)]">
                    {wordCount} words
                  </span>
                </div>
                <textarea
                  value={writing}
                  onChange={(e) => handleWritingChange(e.target.value)}
                  onBlur={saveDraft}
                  className="w-full h-64 px-4 py-3 rounded-xl border-2 border-[var(--wrife-border)] text-[var(--wrife-text-main)] text-lg leading-relaxed focus:outline-none focus:border-[var(--wrife-blue)] focus:ring-2 focus:ring-[var(--wrife-blue)]/20 resize-none"
                  placeholder="Start writing here..."
                />
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={saveDraft}
                  className="rounded-full border border-[var(--wrife-border)] px-6 py-3 text-sm font-semibold text-[var(--wrife-text-muted)] hover:bg-gray-50 transition"
                >
                  Save Draft
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !writing.trim()}
                  className="flex-1 rounded-full bg-[var(--wrife-blue)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                      Checking your work...
                    </span>
                  ) : (
                    'Submit for Feedback'
                  )}
                </button>
              </div>

              <p className="text-center text-xs text-[var(--wrife-text-muted)] mt-4">
                Need {level?.passing_threshold}% to pass • Your work is saved automatically
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
