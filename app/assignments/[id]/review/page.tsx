'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Assignment {
  id: number;
  title: string;
  instructions: string | null;
  due_date: string | null;
  lesson_id: number;
  class_id: number;
}

interface Submission {
  id: number;
  pupil_id: number;
  content: string;
  status: string;
  submitted_at: string | null;
  pupil_name?: string;
}

interface AIAssessment {
  id: number;
  submission_id: number;
  strengths: string[];
  improvements: string[];
  improved_example: string;
  mechanical_edits: string[];
  banding_score: number;
  created_at: string;
}

function BandBadge({ score }: { score: number }) {
  const bands = [
    { label: 'Emerging', bg: 'bg-red-100', text: 'text-red-700' },
    { label: 'Developing', bg: 'bg-yellow-100', text: 'text-yellow-700' },
    { label: 'Secure', bg: 'bg-green-100', text: 'text-green-700' },
    { label: 'Greater Depth', bg: 'bg-blue-100', text: 'text-blue-700' },
  ];
  const band = bands[Math.min(score - 1, 3)] || bands[0];
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${band.bg} ${band.text}`}>
      {band.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    submitted: 'bg-yellow-100 text-yellow-700',
    reviewed: 'bg-green-100 text-green-700',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${styles[status] || styles.draft}`}>
      {status}
    </span>
  );
}

export default function AssignmentReviewPage() {
  const params = useParams();
  const assignmentId = params?.id as string;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assessments, setAssessments] = useState<Map<number, AIAssessment>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [assessing, setAssessing] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      fetchData();
    }
  }, [user, authLoading, router, assignmentId]);

  async function fetchData() {
    try {
      // Only fetch assignment if teacher owns it
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('assignments')
        .select('*')
        .eq('id', assignmentId)
        .eq('teacher_id', user?.id)
        .single();

      if (assignmentError || !assignmentData) {
        setError('Assignment not found or you do not have permission to view it');
        setLoading(false);
        return;
      }
      
      setAssignment(assignmentData);

      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select('*')
        .eq('assignment_id', assignmentId)
        .order('submitted_at', { ascending: false });

      if (submissionsError) throw submissionsError;

      const enrichedSubmissions = await Promise.all(
        (submissionsData || []).map(async (sub) => {
          const { data: member } = await supabase
            .from('class_members')
            .select('pupil_name, pupils(first_name, last_name)')
            .eq('id', sub.pupil_id)
            .single();

          const pupilData = member?.pupils as { first_name: string; last_name?: string } | null;
          const pupilName = pupilData
            ? `${pupilData.first_name} ${pupilData.last_name || ''}`.trim()
            : member?.pupil_name || 'Unknown';

          return {
            ...sub,
            pupil_name: pupilName,
          };
        })
      );

      setSubmissions(enrichedSubmissions);

      const submissionIds = (submissionsData || []).map(s => s.id);
      if (submissionIds.length > 0) {
        const { data: assessmentsData } = await supabase
          .from('ai_assessments')
          .select('*')
          .in('submission_id', submissionIds);

        const assessmentMap = new Map<number, AIAssessment>();
        (assessmentsData || []).forEach(a => {
          assessmentMap.set(a.submission_id, a);
        });
        setAssessments(assessmentMap);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load assignment data');
    } finally {
      setLoading(false);
    }
  }

  async function handleRunAssessment(submissionId: number) {
    if (!user) return;
    setAssessing(submissionId);
    setError('');

    try {
      const response = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: submissionId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Assessment failed');
      }

      setAssessments(prev => {
        const newMap = new Map(prev);
        newMap.set(submissionId, result.assessment);
        return newMap;
      });

      setSubmissions(prev =>
        prev.map(s =>
          s.id === submissionId ? { ...s, status: 'reviewed' } : s
        )
      );
    } catch (err: any) {
      console.error('Assessment error:', err);
      setError(err.message || 'Failed to run assessment');
    } finally {
      setAssessing(null);
    }
  }

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent"></div>
            <p className="mt-4 text-sm text-[var(--wrife-text-muted)]">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  if (!assignment) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[var(--wrife-bg)] py-8">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h1 className="text-2xl font-bold text-[var(--wrife-text-main)]">Assignment not found</h1>
            <Link href="/classes" className="text-[var(--wrife-blue)] hover:underline mt-4 inline-block">
              ← Back to Classes
            </Link>
          </div>
        </div>
      </>
    );
  }

  const pendingCount = submissions.filter(s => s.status === 'submitted').length;
  const reviewedCount = submissions.filter(s => s.status === 'reviewed').length;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[var(--wrife-bg)] py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6">
            <Link href="/classes" className="text-[var(--wrife-blue)] hover:underline text-sm">
              ← Back to Classes
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-[var(--wrife-text-main)]">{assignment.title}</h1>
                {assignment.due_date && (
                  <p className="text-sm text-[var(--wrife-text-muted)] mt-1">
                    Due: {new Date(assignment.due_date).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                  <p className="text-xs text-[var(--wrife-text-muted)]">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{reviewedCount}</p>
                  <p className="text-xs text-[var(--wrife-text-muted)]">Reviewed</p>
                </div>
              </div>
            </div>
            {assignment.instructions && (
              <div className="mt-4 p-4 rounded-lg bg-[var(--wrife-bg)] border border-[var(--wrife-border)]">
                <p className="text-sm text-[var(--wrife-text-muted)]">
                  <strong>Instructions:</strong> {assignment.instructions}
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] overflow-hidden">
              <div className="p-4 border-b border-[var(--wrife-border)]">
                <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">
                  Submissions ({submissions.length})
                </h2>
              </div>

              {submissions.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mb-4">
                    <span className="text-5xl">📝</span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">No submissions yet</h3>
                  <p className="text-sm text-[var(--wrife-text-muted)]">
                    Pupils haven't submitted their work yet
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--wrife-border)] max-h-[500px] overflow-y-auto">
                  {submissions.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubmission(sub)}
                      className={`w-full p-4 text-left hover:bg-[var(--wrife-bg)] transition ${
                        selectedSubmission?.id === sub.id ? 'bg-[var(--wrife-blue-soft)]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-[var(--wrife-text-main)]">
                          {sub.pupil_name}
                        </span>
                        <StatusBadge status={sub.status} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-[var(--wrife-text-muted)]">
                        <span>
                          {sub.submitted_at
                            ? new Date(sub.submitted_at).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Not submitted'}
                        </span>
                        {assessments.has(sub.id) && (
                          <BandBadge score={assessments.get(sub.id)!.banding_score} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] overflow-hidden">
              {selectedSubmission ? (
                <>
                  <div className="p-4 border-b border-[var(--wrife-border)] flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">
                        {selectedSubmission.pupil_name}
                      </h2>
                      <p className="text-xs text-[var(--wrife-text-muted)]">
                        {selectedSubmission.content?.split(/\s+/).filter(w => w).length || 0} words
                      </p>
                    </div>
                    {selectedSubmission.status === 'submitted' && !assessments.has(selectedSubmission.id) && (
                      <button
                        onClick={() => handleRunAssessment(selectedSubmission.id)}
                        disabled={assessing === selectedSubmission.id}
                        className="rounded-full bg-[var(--wrife-blue)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
                      >
                        {assessing === selectedSubmission.id ? (
                          <span className="flex items-center gap-2">
                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                            Assessing...
                          </span>
                        ) : (
                          'Run AI Assessment'
                        )}
                      </button>
                    )}
                  </div>

                  <div className="p-4 max-h-[400px] overflow-y-auto">
                    <div className="bg-[var(--wrife-bg)] rounded-lg p-4 mb-4">
                      <h3 className="text-sm font-semibold text-[var(--wrife-text-main)] mb-2">Pupil's Writing</h3>
                      <p className="text-sm text-[var(--wrife-text-main)] whitespace-pre-wrap">
                        {selectedSubmission.content || 'No content'}
                      </p>
                    </div>

                    {assessments.has(selectedSubmission.id) && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm font-semibold text-[var(--wrife-text-main)]">AI Assessment</span>
                          <BandBadge score={assessments.get(selectedSubmission.id)!.banding_score} />
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-green-700 mb-2">Strengths</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {assessments.get(selectedSubmission.id)!.strengths.map((s, i) => (
                              <li key={i} className="text-sm text-green-700">{s}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-yellow-700 mb-2">Areas for Improvement</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {assessments.get(selectedSubmission.id)!.improvements.map((s, i) => (
                              <li key={i} className="text-sm text-yellow-700">{s}</li>
                            ))}
                          </ul>
                        </div>

                        {assessments.get(selectedSubmission.id)!.mechanical_edits.length > 0 && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-red-700 mb-2">Spelling & Grammar</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {assessments.get(selectedSubmission.id)!.mechanical_edits.map((s, i) => (
                                <li key={i} className="text-sm text-red-700">{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-blue-700 mb-2">Improved Example</h4>
                          <p className="text-sm text-blue-700 italic">
                            "{assessments.get(selectedSubmission.id)!.improved_example}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <div className="mb-4">
                    <span className="text-5xl">👈</span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">Select a submission</h3>
                  <p className="text-sm text-[var(--wrife-text-muted)]">
                    Click on a pupil's submission to view their work
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
