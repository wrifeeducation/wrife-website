'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
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
  class_name: string;
  lesson_title: string | null;
}

interface Pupil {
  id: string;
  first_name: string;
  last_name: string | null;
}

interface Submission {
  id: number;
  pupil_id: string;
  content: string;
  status: string;
  submitted_at: string | null;
  teacher_feedback: string | null;
  pupil_name: string;
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

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  not_started: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Not Started' },
  draft: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'In Progress' },
  submitted: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Submitted' },
  reviewed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Reviewed' },
};

function StatusChip({ status }: { status: string }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.not_started;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

export default function AssignmentReviewPage() {
  const params = useParams();
  const assignmentId = params?.id as string;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [pupils, setPupils] = useState<Pupil[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assessments, setAssessments] = useState<Map<number, AIAssessment>>(new Map());
  const [activityProgress, setActivityProgress] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [assessing, setAssessing] = useState<number | null>(null);
  const [teacherFeedback, setTeacherFeedback] = useState('');
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user) { router.push('/login'); return; }
      fetchData();
    }
  }, [user, authLoading, assignmentId]);

  useEffect(() => {
    if (selectedSubmission) {
      setTeacherFeedback(selectedSubmission.teacher_feedback || '');
      setFeedbackSaved(false);
    }
  }, [selectedSubmission?.id]);

  async function fetchData() {
    try {
      const res = await fetch(`/api/teacher/assignments/${assignmentId}/review`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Assignment not found');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setAssignment(data.assignment);
      setPupils(data.pupils || []);
      setSubmissions(data.submissions || []);

      const assessmentMap = new Map<number, AIAssessment>();
      (data.assessments || []).forEach((a: AIAssessment) => {
        assessmentMap.set(a.submission_id, a);
      });
      setAssessments(assessmentMap);

      const progressMap = new Map<string, string>();
      (data.progressRecords || []).forEach((p: any) => {
        const existing = progressMap.get(p.pupil_id);
        if (!existing || existing !== 'completed') {
          progressMap.set(p.pupil_id, p.status);
        }
      });
      setActivityProgress(progressMap);
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
        body: JSON.stringify({ submission_id: submissionId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Assessment failed');
      setAssessments(prev => {
        const newMap = new Map(prev);
        newMap.set(submissionId, result.assessment);
        return newMap;
      });
      setSubmissions(prev =>
        prev.map(s => s.id === submissionId ? { ...s, status: 'reviewed' } : s)
      );
      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission(prev => prev ? { ...prev, status: 'reviewed' } : prev);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to run assessment');
    } finally {
      setAssessing(null);
    }
  }

  async function handleSaveFeedback() {
    if (!selectedSubmission) return;
    setSavingFeedback(true);
    setError('');
    try {
      const res = await fetch(`/api/teacher/assignments/${assignmentId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          teacherFeedback: teacherFeedback.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save feedback');

      const updatedSub = { ...selectedSubmission, status: 'reviewed', teacher_feedback: teacherFeedback.trim() };
      setSubmissions(prev => prev.map(s => s.id === selectedSubmission.id ? updatedSub : s));
      setSelectedSubmission(updatedSub);
      setFeedbackSaved(true);
    } catch (err: any) {
      setError(err.message || 'Could not save feedback');
    } finally {
      setSavingFeedback(false);
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
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            <Link href="/dashboard" className="text-[var(--wrife-blue)] hover:underline mt-4 inline-block">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </>
    );
  }

  const submissionMap = new Map(submissions.map(s => [s.pupil_id, s]));
  const submittedPupils = submissions.filter(s => s.status === 'submitted');
  const reviewedPupils = submissions.filter(s => s.status === 'reviewed');
  const draftPupils = submissions.filter(s => s.status === 'draft');
  const notStartedPupils = pupils.filter(p => !submissionMap.has(p.id));
  const hasActivityData = activityProgress.size > 0;

  const dueDate = assignment.due_date ? new Date(assignment.due_date) : null;
  const isOverdue = dueDate && dueDate < new Date();

  const currentAssessment = selectedSubmission ? assessments.get(selectedSubmission.id) : null;
  const canRunAI = selectedSubmission?.status === 'submitted' && !currentAssessment;
  const canSaveFeedback = selectedSubmission && selectedSubmission.status !== 'not_started';

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[var(--wrife-bg)] py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-4">
            <Link href="/dashboard?tab=assignments" className="text-[var(--wrife-blue)] hover:underline text-sm">
              ← Back to Assignments
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6 mb-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-[var(--wrife-text-main)]">{assignment.title}</h1>
                <p className="text-sm text-[var(--wrife-text-muted)] mt-1">{assignment.class_name}</p>
                {assignment.lesson_title && (
                  <p className="text-xs text-[var(--wrife-text-muted)] mt-0.5">{assignment.lesson_title}</p>
                )}
                {dueDate && (
                  <p className={`text-xs font-semibold mt-1 ${isOverdue ? 'text-red-600' : 'text-[var(--wrife-text-muted)]'}`}>
                    {isOverdue ? 'Overdue: ' : 'Due: '}
                    {dueDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                )}
              </div>
              <div className="flex gap-6">
                {[
                  { count: pupils.length, label: 'Total', color: 'text-[var(--wrife-text-main)]' },
                  { count: submittedPupils.length, label: 'To Review', color: 'text-yellow-600' },
                  { count: reviewedPupils.length, label: 'Reviewed', color: 'text-green-600' },
                ].map(({ count, label, color }) => (
                  <div key={label} className="text-center">
                    <p className={`text-2xl font-bold ${color}`}>{count}</p>
                    <p className="text-xs text-[var(--wrife-text-muted)]">{label}</p>
                  </div>
                ))}
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

          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-5 mb-6">
            <h2 className="text-sm font-bold text-[var(--wrife-text-muted)] uppercase tracking-wider mb-4">
              Class Progress
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Not Started', pupils: notStartedPupils.map(p => ({ id: p.id, name: `${p.first_name} ${p.last_name || ''}`.trim(), status: 'not_started' })), style: STATUS_STYLES.not_started },
                { label: 'In Progress', pupils: draftPupils.map(s => ({ id: s.pupil_id, name: s.pupil_name, status: 'draft' })), style: STATUS_STYLES.draft },
                { label: 'Submitted', pupils: submittedPupils.map(s => ({ id: s.pupil_id, name: s.pupil_name, status: 'submitted' })), style: STATUS_STYLES.submitted },
                { label: 'Reviewed', pupils: reviewedPupils.map(s => ({ id: s.pupil_id, name: s.pupil_name, status: 'reviewed' })), style: STATUS_STYLES.reviewed },
              ].map(({ label, pupils: groupPupils, style }) => (
                <div key={label} className={`rounded-xl border p-3 ${style.bg} border-opacity-50`} style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold uppercase tracking-wide ${style.text}`}>{label}</span>
                    <span className={`text-lg font-bold ${style.text}`}>{groupPupils.length}</span>
                  </div>
                  <div className="space-y-1">
                    {groupPupils.slice(0, 6).map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          const sub = submissions.find(s => s.pupil_id === p.id);
                          if (sub) setSelectedSubmission(sub);
                        }}
                        disabled={label === 'Not Started'}
                        className={`w-full text-left text-xs rounded-lg px-2 py-1 truncate transition ${
                          label === 'Not Started'
                            ? 'text-gray-500 cursor-default'
                            : `${style.text} hover:bg-white/60 cursor-pointer font-medium`
                        } ${selectedSubmission && submissions.find(s => s.pupil_id === p.id)?.id === selectedSubmission.id ? 'bg-white/80 font-bold' : ''}`}
                      >
                        {p.name}
                      </button>
                    ))}
                    {groupPupils.length > 6 && (
                      <p className={`text-xs ${style.text} opacity-70 px-2`}>+{groupPupils.length - 6} more</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] overflow-hidden">
              <div className="p-4 border-b border-[var(--wrife-border)] flex items-center justify-between">
                <h2 className="text-base font-bold text-[var(--wrife-text-main)]">
                  Submissions ({submissions.length})
                </h2>
                {submittedPupils.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                    {submittedPupils.length} need review
                  </span>
                )}
              </div>

              {submissions.length === 0 ? (
                <div className="p-8 text-center">
                  <span className="text-5xl block mb-4">📝</span>
                  <h3 className="text-base font-bold text-[var(--wrife-text-main)] mb-1">No submissions yet</h3>
                  <p className="text-sm text-[var(--wrife-text-muted)]">Pupils haven't submitted their work</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--wrife-border)] max-h-[520px] overflow-y-auto">
                  {submissions.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubmission(sub)}
                      className={`w-full p-4 text-left hover:bg-[var(--wrife-bg)] transition ${
                        selectedSubmission?.id === sub.id ? 'bg-[var(--wrife-blue-soft)] border-l-4 border-[var(--wrife-blue)]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-[var(--wrife-text-main)]">
                          {sub.pupil_name}
                        </span>
                        <div className="flex items-center gap-2">
                          {hasActivityData && (
                            <span title="Practice activity status">
                              {activityProgress.get(sub.pupil_id) === 'completed' ? '✅' :
                               activityProgress.get(sub.pupil_id) === 'in_progress' ? '◐' : '—'}
                            </span>
                          )}
                          <StatusChip status={sub.status} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--wrife-text-muted)]">
                          {sub.submitted_at
                            ? new Date(sub.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                            : 'Draft'}
                        </span>
                        {assessments.has(sub.id) && (
                          <BandBadge score={assessments.get(sub.id)!.banding_score} />
                        )}
                      </div>
                      {sub.teacher_feedback && (
                        <p className="text-xs text-amber-600 mt-1 truncate">✏️ Feedback added</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-3 bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] overflow-hidden">
              {selectedSubmission ? (
                <>
                  <div className="p-4 border-b border-[var(--wrife-border)] flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h2 className="text-base font-bold text-[var(--wrife-text-main)]">
                        {selectedSubmission.pupil_name}
                      </h2>
                      <p className="text-xs text-[var(--wrife-text-muted)]">
                        {selectedSubmission.content?.split(/\s+/).filter(w => w).length || 0} words
                        {selectedSubmission.submitted_at && ` · Submitted ${new Date(selectedSubmission.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusChip status={selectedSubmission.status} />
                      {canRunAI && (
                        <button
                          onClick={() => handleRunAssessment(selectedSubmission.id)}
                          disabled={assessing === selectedSubmission.id}
                          className="rounded-full bg-[var(--wrife-blue)] px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
                        >
                          {assessing === selectedSubmission.id ? (
                            <span className="flex items-center gap-1">
                              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                              Assessing...
                            </span>
                          ) : 'Run AI Assessment'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                    <div className="bg-[var(--wrife-bg)] rounded-xl p-4">
                      <h3 className="text-xs font-bold text-[var(--wrife-text-muted)] uppercase tracking-wider mb-2">
                        Pupil's Writing
                      </h3>
                      <p className="text-sm text-[var(--wrife-text-main)] whitespace-pre-wrap leading-relaxed">
                        {selectedSubmission.content || <em className="text-gray-400">No content yet</em>}
                      </p>
                    </div>

                    {currentAssessment && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[var(--wrife-text-muted)] uppercase tracking-wider">AI Assessment</span>
                          <BandBadge score={currentAssessment.banding_score} />
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                          <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">Strengths</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {currentAssessment.strengths.map((s, i) => <li key={i} className="text-sm text-green-700">{s}</li>)}
                          </ul>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                          <h4 className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-2">Areas for Improvement</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {currentAssessment.improvements.map((s, i) => <li key={i} className="text-sm text-yellow-700">{s}</li>)}
                          </ul>
                        </div>
                        {currentAssessment.mechanical_edits.length > 0 && (
                          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                            <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">Spelling & Grammar</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {currentAssessment.mechanical_edits.map((s, i) => <li key={i} className="text-sm text-red-700">{s}</li>)}
                            </ul>
                          </div>
                        )}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                          <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Improved Example</h4>
                          <p className="text-sm text-blue-700 italic">"{currentAssessment.improved_example}"</p>
                        </div>
                      </div>
                    )}

                    {canSaveFeedback && (
                      <div className="border-t border-[var(--wrife-border)] pt-4">
                        <h3 className="text-xs font-bold text-[var(--wrife-text-muted)] uppercase tracking-wider mb-2">
                          Your Feedback to {selectedSubmission.pupil_name.split(' ')[0]}
                        </h3>
                        <textarea
                          value={teacherFeedback}
                          onChange={(e) => { setTeacherFeedback(e.target.value); setFeedbackSaved(false); }}
                          rows={4}
                          placeholder="Write a personal note for this pupil — what they did well, what to focus on next..."
                          className="w-full px-4 py-3 rounded-xl border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] resize-none"
                        />
                        <div className="flex items-center justify-between mt-2">
                          {feedbackSaved && (
                            <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                              ✓ Saved & marked as reviewed
                            </span>
                          )}
                          {!feedbackSaved && <span />}
                          <button
                            onClick={handleSaveFeedback}
                            disabled={savingFeedback}
                            className="rounded-full bg-[var(--wrife-blue)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
                          >
                            {savingFeedback ? 'Saving...' : selectedSubmission.status === 'reviewed' ? 'Update Feedback' : 'Save & Mark Reviewed'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center h-full flex flex-col items-center justify-center">
                  <span className="text-5xl mb-4">👈</span>
                  <h3 className="text-base font-bold text-[var(--wrife-text-main)] mb-1">Select a submission</h3>
                  <p className="text-sm text-[var(--wrife-text-muted)]">
                    Click a pupil's name in the progress grid or the list to view their work
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
