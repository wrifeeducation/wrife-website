'use client';

import { useState, useEffect, use, Suspense } from 'react';
import { useAuth } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AddPupilModal } from '@/components/AddPupilModal';
import { SubmissionReviewModal } from '@/components/SubmissionReviewModal';
import { PWPReviewModal } from '@/components/PWPReviewModal';
import { AssignPWPModal } from '@/components/AssignPWPModal';
import { AssignDWPModal } from '@/components/AssignDWPModal';

interface Class {
  id: string;
  name: string;
  year_group: number;
  class_code: string;
  school_name: string | null;
}

interface Pupil {
  id: string;
  first_name: string;
  last_name: string | null;
  username: string | null;
  pin_display: string | null;
  year_group: number;
  is_active: boolean;
}

interface Assignment {
  id: number;
  title: string;
  lesson_id: number;
  created_at: string;
}

interface Submission {
  id: number;
  assignment_id: number;
  pupil_id: string;
  status: string;
  content: string | null;
  submitted_at: string | null;
}

interface ProgressRecord {
  id: number;
  pupil_id: string;
  lesson_id: number;
  status: string;
  completed_at: string | null;
}

interface PWPAssignment {
  id: number;
  activity_id: number;
  instructions: string | null;
  due_date: string | null;
  created_at: string;
  progressive_activities: {
    id: number;
    level: number;
    level_name: string;
    grammar_focus: string;
    sentence_structure: string;
  } | null;
}

interface PWPSubmission {
  id: number;
  pwp_assignment_id: number;
  pupil_id: string;
  status: string;
  content: string | null;
  submitted_at: string | null;
}

interface DWPAssignment {
  id: number;
  level_id: string;
  instructions: string | null;
  due_date: string | null;
  created_at: string;
  writing_levels?: {
    level_number: number;
    tier_number: number;
    activity_name: string;
  } | null;
}

interface WritingAttempt {
  id: string;
  dwp_assignment_id: number;
  pupil_id: string;
  status: string;
  passed: boolean | null;
  percentage: number | null;
  performance_band: string | null;
}

interface PWPCurriculumAssignment {
  id: number;
  lesson_number: number;
  assigned_date: string;
  due_date: string | null;
  is_active: boolean;
  custom_instructions: string | null;
  curriculum_map?: {
    lesson_name: string;
    pwp_stage: string;
    concepts_introduced: string[];
  } | null;
}

interface PWPSession {
  id: string;
  pupil_id: string;
  lesson_number: number;
  status: string;
  formulas_completed: number;
  formulas_total: number;
  accuracy_percentage: number | null;
  completed_at: string | null;
}

function ClassDetailPageInner({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [classData, setClassData] = useState<Class | null>(null);
  const [pupils, setPupils] = useState<Pupil[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPupil, setShowAddPupil] = useState(false);
  const [showAssignPWP, setShowAssignPWP] = useState(false);
  const [showAssignDWP, setShowAssignDWP] = useState(false);
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab');
  const initialTab = tabParam && ['pupils', 'progress', 'pwp', 'dwp'].includes(tabParam) 
    ? tabParam as 'pupils' | 'progress' | 'pwp' | 'dwp'
    : 'pupils';
  const [activeTab, setActiveTab] = useState<'pupils' | 'progress' | 'pwp' | 'dwp'>(initialTab);
  const [pwpAssignments, setPwpAssignments] = useState<PWPAssignment[]>([]);
  const [pwpSubmissions, setPwpSubmissions] = useState<PWPSubmission[]>([]);
  const [dwpAssignments, setDwpAssignments] = useState<DWPAssignment[]>([]);
  const [writingAttempts, setWritingAttempts] = useState<WritingAttempt[]>([]);
  const [pwpCurriculumAssignments, setPwpCurriculumAssignments] = useState<PWPCurriculumAssignment[]>([]);
  const [pwpSessions, setPwpSessions] = useState<PWPSession[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<{
    submission: Submission;
    pupilName: string;
    assignmentTitle: string;
  } | null>(null);
  const [selectedPWPSubmission, setSelectedPWPSubmission] = useState<{
    submission: PWPSubmission;
    pupilName: string;
    activityName: string;
  } | null>(null);
  const [expandedPupilId, setExpandedPupilId] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchClassData();
    fetchPupils();
    fetchAssignments();
    fetchSubmissions();
    fetchProgressRecords();
    fetchPWPAssignments();
    fetchPWPSubmissions();
    fetchDWPAssignments();
    fetchWritingAttempts();
    fetchPWPCurriculumAssignments();
  }, [user, resolvedParams.id, router]);

  useEffect(() => {
    if (pupils.length > 0) {
      fetchPWPSessions();
    }
  }, [pupils, resolvedParams.id]);

  useEffect(() => {
    if (tabParam && ['pupils', 'progress', 'pwp', 'dwp'].includes(tabParam)) {
      setActiveTab(tabParam as 'pupils' | 'progress' | 'pwp' | 'dwp');
    }
  }, [tabParam]);

  async function fetchClassData() {
    try {
      const response = await fetch(`/api/classes/${resolvedParams.id}`);
      if (!response.ok) {
        const data = await response.json();
        console.error('Error fetching class:', data.error);
        setLoading(false);
        return;
      }
      const data = await response.json();
      setClassData(data.class);
    } catch (err) {
      console.error('Error fetching class:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPupils() {
    try {
      const response = await fetch(`/api/classes/${resolvedParams.id}/pupils`);
      const data = await response.json();
      if (!response.ok) {
        console.error('Error fetching pupils:', data.error);
        setPupils([]);
        return;
      }
      setPupils(data.pupils || []);
    } catch (err) {
      console.error('Error fetching pupils:', err);
      setPupils([]);
    }
  }

  async function fetchAssignments() {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('id, title, lesson_id, created_at')
        .eq('class_id', resolvedParams.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
  }

  async function fetchSubmissions() {
    try {
      const { data: classAssignments, error: assignError } = await supabase
        .from('assignments')
        .select('id')
        .eq('class_id', resolvedParams.id);

      if (assignError?.code === 'PGRST205') {
        setSubmissions([]);
        return;
      }

      if (!classAssignments || classAssignments.length === 0) {
        setSubmissions([]);
        return;
      }

      const assignmentIds = classAssignments.map(a => a.id);
      
      const { data, error } = await supabase
        .from('submissions')
        .select('id, assignment_id, pupil_id, status, content, submitted_at')
        .in('assignment_id', assignmentIds);

      if (error?.code === 'PGRST205') {
        setSubmissions([]);
        return;
      }
      if (error) throw error;
      setSubmissions(data || []);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setSubmissions([]);
    }
  }

  async function fetchProgressRecords() {
    try {
      const { data, error } = await supabase
        .from('progress_records')
        .select('id, pupil_id, lesson_id, status, completed_at')
        .eq('class_id', resolvedParams.id);

      if (error?.code === 'PGRST205') {
        setProgressRecords([]);
        return;
      }
      if (error) throw error;
      setProgressRecords(data || []);
    } catch (err) {
      console.error('Error fetching progress records:', err);
      setProgressRecords([]);
    }
  }

  async function fetchPWPAssignments() {
    try {
      const response = await fetch(`/api/teacher/pwp-assignments?classId=${resolvedParams.id}`);
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error fetching PWP assignments:', data.error);
        setPwpAssignments([]);
        return;
      }
      
      const formattedAssignments = (data.assignments || []).map((a: any) => ({
        id: a.id,
        activity_id: a.activity_id,
        instructions: a.instructions,
        due_date: a.due_date,
        created_at: a.created_at,
        progressive_activities: {
          id: a.activity_id,
          level: a.level,
          level_name: a.level_name,
          grammar_focus: a.grammar_focus,
          sentence_structure: a.sentence_structure || '',
        }
      }));
      
      setPwpAssignments(formattedAssignments);
    } catch (err) {
      console.error('Error fetching PWP assignments:', err);
      setPwpAssignments([]);
    }
  }

  async function fetchPWPSubmissions() {
    try {
      const { data: classPWPAssignments, error: pwpError } = await supabase
        .from('pwp_assignments')
        .select('id')
        .eq('class_id', resolvedParams.id);

      if (pwpError?.code === 'PGRST205') {
        setPwpSubmissions([]);
        return;
      }

      if (!classPWPAssignments || classPWPAssignments.length === 0) {
        setPwpSubmissions([]);
        return;
      }

      const assignmentIds = classPWPAssignments.map(a => a.id);
      
      const { data, error } = await supabase
        .from('pwp_submissions')
        .select('id, pwp_assignment_id, pupil_id, status, content, submitted_at')
        .in('pwp_assignment_id', assignmentIds);

      if (error?.code === 'PGRST205') {
        setPwpSubmissions([]);
        return;
      }
      if (error) throw error;
      setPwpSubmissions(data || []);
    } catch (err) {
      console.error('Error fetching PWP submissions:', err);
      setPwpSubmissions([]);
    }
  }

  function getPWPSubmissionForPupil(pupilId: string, pwpAssignmentId: number): PWPSubmission | undefined {
    return pwpSubmissions.find(s => s.pupil_id === pupilId && s.pwp_assignment_id === pwpAssignmentId);
  }

  async function handleDeletePWPAssignment(assignmentId: number) {
    if (!confirm('Are you sure you want to remove this PWP assignment?')) return;

    try {
      const response = await fetch(`/api/teacher/pwp-assignments?id=${assignmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete');
      }

      fetchPWPAssignments();
      fetchPWPSubmissions();
    } catch (err) {
      console.error('Error deleting PWP assignment:', err);
      alert('Failed to delete assignment');
    }
  }

  async function fetchDWPAssignments() {
    try {
      const { data, error } = await supabase
        .from('dwp_assignments')
        .select(`
          id, level_id, instructions, due_date, created_at,
          writing_levels (level_number, tier_number, activity_name)
        `)
        .eq('class_id', resolvedParams.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDwpAssignments((data as unknown as DWPAssignment[]) || []);
    } catch (err) {
      console.error('Error fetching DWP assignments:', err);
    }
  }

  async function fetchWritingAttempts() {
    try {
      const { data: classDWPAssignments } = await supabase
        .from('dwp_assignments')
        .select('id')
        .eq('class_id', resolvedParams.id);

      if (!classDWPAssignments || classDWPAssignments.length === 0) {
        setWritingAttempts([]);
        return;
      }

      const assignmentIds = classDWPAssignments.map(a => a.id);
      
      const { data, error } = await supabase
        .from('writing_attempts')
        .select('id, dwp_assignment_id, pupil_id, status, passed, percentage, performance_band')
        .in('dwp_assignment_id', assignmentIds);

      if (error) throw error;
      setWritingAttempts(data || []);
    } catch (err) {
      console.error('Error fetching writing attempts:', err);
    }
  }

  async function fetchPWPCurriculumAssignments() {
    try {
      const { data, error } = await supabase
        .from('pwp_class_assignments')
        .select(`
          id, lesson_number, assigned_date, due_date, is_active, custom_instructions,
          curriculum_map (lesson_name, pwp_stage, concepts_introduced)
        `)
        .eq('class_id', resolvedParams.id)
        .eq('is_active', true)
        .order('lesson_number', { ascending: true });

      if (error?.code === 'PGRST205') {
        setPwpCurriculumAssignments([]);
        return;
      }
      if (error) throw error;
      setPwpCurriculumAssignments((data as unknown as PWPCurriculumAssignment[]) || []);
    } catch (err) {
      console.error('Error fetching PWP curriculum assignments:', err);
      setPwpCurriculumAssignments([]);
    }
  }

  async function fetchPWPSessions() {
    try {
      const { data, error } = await supabase
        .from('pwp_sessions')
        .select('id, pupil_id, lesson_number, status, formulas_completed, formulas_total, accuracy_percentage, completed_at')
        .eq('class_id', resolvedParams.id)
        .order('started_at', { ascending: false });

      if (error?.code === 'PGRST205') {
        setPwpSessions([]);
        return;
      }
      if (error) throw error;
      setPwpSessions((data as unknown as PWPSession[]) || []);
    } catch (err) {
      console.error('Error fetching PWP sessions:', err);
      setPwpSessions([]);
    }
  }

  function getPWPSessionForPupil(pupilId: string, lessonNumber: number): PWPSession | undefined {
    return pwpSessions.find(s => s.pupil_id === pupilId && s.lesson_number === lessonNumber && s.status === 'completed');
  }

  function getPWPSessionStatus(pupilId: string, lessonNumber: number): 'completed' | 'in_progress' | 'not_started' {
    const sessions = pwpSessions.filter(s => s.pupil_id === pupilId && s.lesson_number === lessonNumber);
    if (sessions.some(s => s.status === 'completed')) return 'completed';
    if (sessions.some(s => s.status === 'in_progress')) return 'in_progress';
    return 'not_started';
  }

  function getWritingAttemptForPupil(pupilId: string, dwpAssignmentId: number): WritingAttempt | undefined {
    return writingAttempts.find(a => a.pupil_id === pupilId && a.dwp_assignment_id === dwpAssignmentId);
  }

  async function handleDeleteDWPAssignment(assignmentId: number) {
    if (!confirm('Are you sure you want to remove this DWP assignment?')) return;

    try {
      const { error } = await supabase
        .from('dwp_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
      fetchDWPAssignments();
      fetchWritingAttempts();
    } catch (err) {
      console.error('Error deleting DWP assignment:', err);
      alert('Failed to delete assignment');
    }
  }

  function getSubmissionForPupil(pupilId: string, assignmentId: number): Submission | undefined {
    return submissions.find(s => s.pupil_id === pupilId && s.assignment_id === assignmentId);
  }

  function isPracticeComplete(pupilId: string, lessonId: number): boolean {
    return progressRecords.some(p => p.pupil_id === pupilId && p.lesson_id === lessonId && p.status === 'completed');
  }

  function getPracticeStatus(pupilId: string, lessonId: number): string | null {
    const record = progressRecords.find(p => p.pupil_id === pupilId && p.lesson_id === lessonId);
    return record?.status || null;
  }

  function getPracticeStatusBadge(status: string | null) {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 text-xs" title="Practice Completed">
            🎮
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-100 text-yellow-600 text-xs" title="Practice In Progress">
            ◐
          </span>
        );
      default:
        return null;
    }
  }

  function getStatusBadge(status: string | undefined) {
    switch (status) {
      case 'submitted':
        return (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600" title="Submitted">
            ✓
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-600" title="In Progress">
            ◐
          </span>
        );
      case 'reviewed':
        return (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600" title="Reviewed">
            ★
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-400" title="Not Started">
            ○
          </span>
        );
    }
  }

  async function handleRemovePupil(pupilId: string) {
    if (!confirm('Are you sure you want to remove this pupil from the class? This cannot be undone.')) return;

    try {
      const response = await fetch(`/api/classes/${resolvedParams.id}/pupils/${pupilId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove pupil');
      }
      fetchPupils();
      fetchSubmissions();
    } catch (err) {
      console.error('Error removing pupil:', err);
      alert('Failed to remove pupil');
    }
  }

  async function handleDeleteClass() {
    if (!user || !classData) return;
    if (!confirm(`Are you sure you want to delete "${classData.name}"? This will remove all pupils and assignments for this class.`)) return;

    try {
      const res = await fetch(`/api/classes/${resolvedParams.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete class');
      }
      router.push('/dashboard');
    } catch (err) {
      console.error('Error deleting class:', err);
      alert('Failed to delete class: ' + (err as any)?.message);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent"></div>
            <p className="mt-4 text-sm text-[var(--wrife-text-muted)]">Loading class...</p>
          </div>
        </div>
      </>
    );
  }

  if (!classData) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[var(--wrife-bg)] flex items-center justify-center">
          <div className="text-center">
            <p className="text-[var(--wrife-text-main)]">Class not found</p>
            <Link href="/classes" className="text-sm text-[var(--wrife-blue)] hover:underline mt-2 inline-block">
              ← Back to classes
            </Link>
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
          <div className="mb-6">
            <Link href="/classes" className="text-sm text-[var(--wrife-blue)] hover:underline mb-2 inline-block">
              ← Back to classes
            </Link>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-extrabold text-[var(--wrife-text-main)]">
                    {classData.name}
                  </h1>
                  <span className="rounded-full bg-[var(--wrife-blue-soft)] px-3 py-1 text-xs font-semibold text-[var(--wrife-blue)]">
                    Year {classData.year_group}
                  </span>
                </div>
                {classData.school_name && (
                  <p className="text-sm text-[var(--wrife-text-muted)]">{classData.school_name}</p>
                )}
              </div>
              <button
                onClick={handleDeleteClass}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-semibold transition border border-red-200"
              >
                Delete Class
              </button>
            </div>
          </div>

          <div className="mb-6 bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--wrife-text-main)] mb-1">Class Code</p>
                <p className="text-2xl font-bold text-[var(--wrife-blue)] tracking-wider font-mono">
                  {classData.class_code}
                </p>
                <p className="text-xs text-[var(--wrife-text-muted)] mt-1">
                  Share this code with pupils to join the class
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/classes/${resolvedParams.id}/login-cards`}
                  className="rounded-full bg-[var(--wrife-blue)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--wrife-blue-dark)] transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Login Cards
                </Link>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(classData.class_code);
                    alert('Class code copied to clipboard!');
                  }}
                  className="rounded-full border border-[var(--wrife-blue)] px-4 py-2 text-sm font-semibold text-[var(--wrife-blue)] hover:bg-[var(--wrife-blue-soft)] transition"
                >
                  Copy Code
                </button>
              </div>
            </div>
          </div>

          <div className="mb-4 flex gap-2 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('pupils')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  activeTab === 'pupils'
                    ? 'bg-[var(--wrife-blue)] text-white'
                    : 'bg-white border border-[var(--wrife-border)] text-[var(--wrife-text-main)] hover:bg-[var(--wrife-bg)]'
                }`}
              >
                Pupils ({pupils.length})
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  activeTab === 'progress'
                    ? 'bg-[var(--wrife-blue)] text-white'
                    : 'bg-white border border-[var(--wrife-border)] text-[var(--wrife-text-main)] hover:bg-[var(--wrife-bg)]'
                }`}
              >
                Progress
              </button>
              <button
                onClick={() => setActiveTab('pwp')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  activeTab === 'pwp'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white border border-purple-200 text-purple-600 hover:bg-purple-50'
                }`}
              >
                PWP ({pwpAssignments.length})
              </button>
              <button
                onClick={() => setActiveTab('dwp')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  activeTab === 'dwp'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-50'
                }`}
              >
                DWP ({dwpAssignments.length})
              </button>
            </div>
            <Link
              href={`/classes/${resolvedParams.id}/report`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Progress Report
            </Link>
          </div>

          {activeTab === 'pupils' && (
          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">
                Pupils ({pupils.length})
              </h2>
              <button
                onClick={() => setShowAddPupil(true)}
                className="rounded-full bg-[var(--wrife-blue)] px-4 py-2 text-sm font-semibold text-white shadow-soft hover:opacity-90 transition"
              >
                + Add Pupil
              </button>
            </div>

            {pupils.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <span className="text-5xl">👥</span>
                </div>
                <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">No pupils yet</h3>
                <p className="text-sm text-[var(--wrife-text-muted)] mb-4">
                  Add pupils to this class to start tracking their progress
                </p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {pupils.map((pupil) => (
                  <div
                    key={pupil.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-[var(--wrife-border)] hover:bg-[var(--wrife-bg)] transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[var(--wrife-blue-soft)] flex items-center justify-center text-sm font-bold text-[var(--wrife-blue)] uppercase">
                        {pupil.first_name.charAt(0)}{pupil.last_name?.charAt(0) || ''}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--wrife-text-main)]">
                          {pupil.first_name} {pupil.last_name || ''}
                        </p>
                        {pupil.username && (
                          <p className="text-xs text-[var(--wrife-text-muted)] font-mono">
                            {pupil.username}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemovePupil(pupil.id)}
                      className="text-red-500 hover:text-red-700 transition text-sm"
                      title="Remove pupil"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}

          {activeTab === 'progress' && (
          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
            <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-4">
              Class Progress
            </h2>

            {assignments.length === 0 && pwpAssignments.length === 0 && dwpAssignments.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4"><span className="text-5xl">📋</span></div>
                <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">No assignments yet</h3>
                <p className="text-sm text-[var(--wrife-text-muted)] mb-4">
                  Assign lessons, PWP activities, or DWP levels to start tracking progress
                </p>
                <Link href="/" className="inline-block rounded-full bg-[var(--wrife-blue)] px-6 py-2 text-sm font-semibold text-white shadow-soft hover:opacity-90 transition">
                  Browse Lessons
                </Link>
              </div>
            ) : pupils.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4"><span className="text-5xl">👥</span></div>
                <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">No pupils yet</h3>
                <p className="text-sm text-[var(--wrife-text-muted)]">Add pupils to see their progress</p>
              </div>
            ) : (
              <>
                {/* Class summary banner */}
                {(() => {
                  const pendingLessonReviews = submissions.filter(s => s.status === 'submitted').length;
                  const pendingPwpReviews = pwpSubmissions.filter(s => s.status === 'submitted').length;
                  const totalPending = pendingLessonReviews + pendingPwpReviews;
                  const totalAssessed = writingAttempts.filter(a => a.status === 'assessed').length;
                  const totalTasks = (assignments.length + pwpAssignments.length + dwpAssignments.length) * pupils.length;
                  const totalDone =
                    submissions.filter(s => s.status === 'submitted' || s.status === 'reviewed').length +
                    pwpSubmissions.filter(s => s.status === 'submitted' || s.status === 'reviewed').length +
                    writingAttempts.filter(a => a.status === 'assessed').length;
                  const classPercent = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;
                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                      <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 text-center">
                        <p className="text-2xl font-bold text-blue-700">{classPercent}%</p>
                        <p className="text-xs text-blue-600 mt-1">Class Completion</p>
                      </div>
                      <div className={`rounded-xl p-3 border text-center ${totalPending > 0 ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
                        <p className={`text-2xl font-bold ${totalPending > 0 ? 'text-amber-700' : 'text-gray-400'}`}>{totalPending}</p>
                        <p className={`text-xs mt-1 ${totalPending > 0 ? 'text-amber-600' : 'text-gray-400'}`}>Awaiting Review</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-3 border border-green-100 text-center">
                        <p className="text-2xl font-bold text-green-700">{totalAssessed}</p>
                        <p className="text-xs text-green-600 mt-1">DWP Assessed</p>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-3 border border-purple-100 text-center">
                        <p className="text-2xl font-bold text-purple-700">{pupils.length}</p>
                        <p className="text-xs text-purple-600 mt-1">Pupils</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Pupil cards */}
                <div className="space-y-2">
                  {pupils.map((pupil) => {
                    // Lesson assignments
                    const lessonSubs = submissions.filter(s => s.pupil_id === pupil.id);
                    const lessonSubmitted = lessonSubs.filter(s => s.status === 'submitted' || s.status === 'reviewed').length;
                    const lessonReviewed = lessonSubs.filter(s => s.status === 'reviewed').length;
                    const lessonAwaitingReview = lessonSubs.filter(s => s.status === 'submitted').length;

                    // PWP
                    const pupilPwpSubs = pwpSubmissions.filter(s => s.pupil_id === pupil.id);
                    const pwpSubmitted = pupilPwpSubs.filter(s => s.status === 'submitted' || s.status === 'reviewed').length;
                    const pwpReviewed = pupilPwpSubs.filter(s => s.status === 'reviewed').length;
                    const pwpAwaitingReview = pupilPwpSubs.filter(s => s.status === 'submitted').length;

                    // DWP
                    const pupilAttempts = writingAttempts.filter(a => a.pupil_id === pupil.id);
                    const dwpAssessed = pupilAttempts.filter(a => a.status === 'assessed').length;
                    const dwpPassed = pupilAttempts.filter(a => a.passed === true).length;
                    const avgPct = pupilAttempts.filter(a => a.percentage != null).length > 0
                      ? Math.round(pupilAttempts.reduce((sum, a) => sum + (a.percentage ?? 0), 0) / pupilAttempts.filter(a => a.percentage != null).length)
                      : null;

                    // Overall %
                    const totalAssigned = assignments.length + pwpAssignments.length + dwpAssignments.length;
                    const totalDone = lessonSubmitted + pwpSubmitted + dwpAssessed;
                    const overallPct = totalAssigned > 0 ? Math.round((totalDone / totalAssigned) * 100) : 0;

                    const isExpanded = expandedPupilId === pupil.id;
                    const pupilFullName = `${pupil.first_name} ${pupil.last_name || ''}`.trim();
                    const needsAttention = lessonAwaitingReview > 0 || pwpAwaitingReview > 0;

                    return (
                      <div key={pupil.id} className={`border rounded-xl overflow-hidden transition ${needsAttention ? 'border-amber-200' : 'border-[var(--wrife-border)]'}`}>
                        {/* Row header — always visible */}
                        <button
                          className="w-full text-left px-4 py-3 hover:bg-[var(--wrife-bg)] transition flex items-center gap-3"
                          onClick={() => setExpandedPupilId(isExpanded ? null : pupil.id)}
                        >
                          {/* Avatar */}
                          <div className="h-9 w-9 rounded-full bg-[var(--wrife-blue-soft)] flex items-center justify-center text-xs font-bold text-[var(--wrife-blue)] uppercase shrink-0">
                            {pupil.first_name.charAt(0)}{pupil.last_name?.charAt(0) || ''}
                          </div>

                          {/* Name + progress bar */}
                          <div className="min-w-[130px]">
                            <p className="font-semibold text-sm text-[var(--wrife-text-main)] leading-tight">
                              {pupilFullName}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="h-1.5 w-20 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[var(--wrife-blue)] transition-all"
                                  style={{ width: `${overallPct}%` }}
                                />
                              </div>
                              <span className="text-xs text-[var(--wrife-text-muted)]">{overallPct}%</span>
                            </div>
                          </div>

                          {/* Three pillars */}
                          <div className="flex gap-2 flex-1 justify-end items-center flex-wrap">
                            {assignments.length > 0 && (
                              <div className="text-center px-3 py-1 bg-gray-50 rounded-lg min-w-[72px]">
                                <p className="text-xs text-[var(--wrife-text-muted)]">Writing</p>
                                <p className="text-sm font-bold text-[var(--wrife-text-main)]">{lessonSubmitted}/{assignments.length}</p>
                                {lessonAwaitingReview > 0 && (
                                  <p className="text-xs text-amber-600 font-semibold">↑ review</p>
                                )}
                              </div>
                            )}
                            {pwpAssignments.length > 0 && (
                              <div className="text-center px-3 py-1 bg-purple-50 rounded-lg min-w-[72px]">
                                <p className="text-xs text-purple-500">Sentences</p>
                                <p className="text-sm font-bold text-[var(--wrife-text-main)]">{pwpSubmitted}/{pwpAssignments.length}</p>
                                {pwpReviewed > 0 && (
                                  <p className="text-xs text-blue-500 font-semibold">★ {pwpReviewed}</p>
                                )}
                              </div>
                            )}
                            {dwpAssignments.length > 0 && (
                              <div className="text-center px-3 py-1 bg-green-50 rounded-lg min-w-[72px]">
                                <p className="text-xs text-green-600">Daily Writing</p>
                                <p className="text-sm font-bold text-[var(--wrife-text-main)]">{dwpAssessed}/{dwpAssignments.length}</p>
                                {avgPct !== null && (
                                  <p className="text-xs text-green-600 font-semibold">{avgPct}% avg</p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Chevron */}
                          <svg
                            className={`w-4 h-4 text-[var(--wrife-text-muted)] shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Expanded detail */}
                        {isExpanded && (
                          <div className="border-t border-[var(--wrife-border)] bg-[var(--wrife-bg)] px-4 py-4 space-y-4">

                            {/* Lesson assignments */}
                            {assignments.length > 0 && (
                              <div>
                                <p className="text-xs font-bold text-[var(--wrife-text-main)] uppercase tracking-wide mb-2">📝 Writing Assignments</p>
                                <div className="space-y-1">
                                  {assignments.map(a => {
                                    const sub = getSubmissionForPupil(pupil.id, a.id);
                                    return (
                                      <div key={a.id} className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-2 border border-[var(--wrife-border)]">
                                        <span className="text-[var(--wrife-text-main)] truncate mr-2">{a.title}</span>
                                        {sub ? (
                                          <button
                                            onClick={() => setSelectedSubmission({ submission: sub, pupilName: pupilFullName, assignmentTitle: a.title })}
                                            className="shrink-0 hover:scale-110 transition"
                                          >
                                            {getStatusBadge(sub.status)}
                                          </button>
                                        ) : getStatusBadge(undefined)}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* PWP assignments */}
                            {pwpAssignments.length > 0 && (
                              <div>
                                <p className="text-xs font-bold text-[var(--wrife-text-main)] uppercase tracking-wide mb-2">🟣 Sentence Practice (PWP)</p>
                                <div className="space-y-1">
                                  {pwpAssignments.map(a => {
                                    const sub = pwpSubmissions.find(s => s.pupil_id === pupil.id && s.pwp_assignment_id === a.id);
                                    return (
                                      <div key={a.id} className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-2 border border-[var(--wrife-border)]">
                                        <span className="text-[var(--wrife-text-main)] truncate mr-2">
                                          L{a.progressive_activities?.level} — {a.progressive_activities?.level_name}
                                        </span>
                                        {sub ? (
                                          <button
                                            onClick={() => setSelectedPWPSubmission({ submission: sub, pupilName: pupilFullName, activityName: a.progressive_activities?.level_name || 'PWP Activity' })}
                                            className="shrink-0 hover:scale-110 transition"
                                          >
                                            {getStatusBadge(sub.status)}
                                          </button>
                                        ) : getStatusBadge(undefined)}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* DWP assignments */}
                            {dwpAssignments.length > 0 && (
                              <div>
                                <p className="text-xs font-bold text-[var(--wrife-text-main)] uppercase tracking-wide mb-2">✍️ Daily Writing (DWP)</p>
                                <div className="space-y-1">
                                  {dwpAssignments.map(a => {
                                    const attempt = getWritingAttemptForPupil(pupil.id, a.id);
                                    return (
                                      <div key={a.id} className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-2 border border-[var(--wrife-border)]">
                                        <span className="text-[var(--wrife-text-main)] truncate mr-2">
                                          L{a.writing_levels?.level_number} — {a.writing_levels?.activity_name}
                                        </span>
                                        {attempt ? (
                                          <div className="flex items-center gap-2 shrink-0">
                                            {attempt.passed ? (
                                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">✓ Passed</span>
                                            ) : (
                                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">✗ Not Yet</span>
                                            )}
                                            {attempt.percentage != null && (
                                              <span className="text-xs text-[var(--wrife-text-muted)]">{attempt.percentage}%</span>
                                            )}
                                          </div>
                                        ) : (
                                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-400">Not Started</span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          )}

          {showAddPupil && (
            <AddPupilModal
              classId={resolvedParams.id}
              classCode={classData.class_code}
              className={classData.name}
              onClose={() => setShowAddPupil(false)}
              onSuccess={() => {
                fetchPupils();
                fetchSubmissions();
              }}
            />
          )}

          {selectedSubmission && (
            <SubmissionReviewModal
              submission={selectedSubmission.submission}
              pupilName={selectedSubmission.pupilName}
              assignmentTitle={selectedSubmission.assignmentTitle}
              onClose={() => setSelectedSubmission(null)}
              onAssessmentComplete={() => fetchSubmissions()}
            />
          )}

          {selectedPWPSubmission && (
            <PWPReviewModal
              submission={selectedPWPSubmission.submission}
              pupilName={selectedPWPSubmission.pupilName}
              activityName={selectedPWPSubmission.activityName}
              onClose={() => setSelectedPWPSubmission(null)}
              onStatusUpdate={() => fetchPWPSubmissions()}
            />
          )}

          {activeTab === 'pwp' && (
          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">
                  Progressive Writing Practice
                </h2>
                <p className="text-sm text-[var(--wrife-text-muted)]">
                  Assign grammar-based writing activities to build sentence construction skills
                </p>
              </div>
              <button
                onClick={() => setShowAssignPWP(true)}
                className="rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:opacity-90 transition"
              >
                + Assign PWP
              </button>
            </div>

            {pwpAssignments.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <span className="text-5xl">📝</span>
                </div>
                <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">No PWP activities assigned</h3>
                <p className="text-sm text-[var(--wrife-text-muted)] mb-4">
                  Assign progressive writing practice activities to help pupils build sentence construction skills
                </p>
              </div>
            ) : pupils.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <span className="text-5xl">👥</span>
                </div>
                <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">No pupils yet</h3>
                <p className="text-sm text-[var(--wrife-text-muted)]">
                  Add pupils to see their PWP progress
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="flex gap-4 text-xs text-[var(--wrife-text-muted)]">
                    <span className="flex items-center gap-1">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 text-xs">✓</span>
                      Submitted
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-100 text-yellow-600 text-xs">◐</span>
                      In Progress
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs">★</span>
                      Reviewed
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-400 text-xs">○</span>
                      Not Started
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--wrife-border)]">
                        <th className="text-left py-3 px-2 font-semibold text-[var(--wrife-text-main)] sticky left-0 bg-white">
                          Pupil
                        </th>
                        {pwpAssignments.map((assignment) => (
                          <th key={assignment.id} className="text-center py-3 px-2 font-semibold text-[var(--wrife-text-main)] min-w-[100px]">
                            <div className="flex flex-col items-center gap-1">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-600 text-xs font-bold">
                                L{assignment.progressive_activities?.level ?? '?'}
                              </span>
                              <span className="block truncate max-w-[80px] text-xs" title={assignment.progressive_activities?.level_name ?? ''}>
                                {(assignment.progressive_activities?.level_name ?? 'Unknown').slice(0, 10)}...
                              </span>
                              <button
                                onClick={() => handleDeletePWPAssignment(assignment.id)}
                                className="text-xs text-red-400 hover:text-red-600"
                                title="Remove assignment"
                              >
                                ✕
                              </button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pupils.map((pupil) => (
                        <tr key={pupil.id} className="border-b border-[var(--wrife-border)] hover:bg-[var(--wrife-bg)]">
                          <td className="py-3 px-2 sticky left-0 bg-white">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600 uppercase">
                                {pupil.first_name.charAt(0)}{pupil.last_name?.charAt(0) || ''}
                              </div>
                              <span className="font-medium text-[var(--wrife-text-main)]">
                                {pupil.first_name} {pupil.last_name || ''}
                              </span>
                            </div>
                          </td>
                          {pwpAssignments.map((assignment) => {
                            const pwpSubmission = getPWPSubmissionForPupil(pupil.id, assignment.id);
                            return (
                              <td key={assignment.id} className="text-center py-3 px-2">
                                {pwpSubmission ? (
                                  <button
                                    onClick={() => setSelectedPWPSubmission({
                                      submission: pwpSubmission,
                                      pupilName: `${pupil.first_name} ${pupil.last_name || ''}`,
                                      activityName: assignment.progressive_activities?.level_name || 'PWP Activity'
                                    })}
                                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full cursor-pointer hover:ring-2 hover:ring-offset-1 ${
                                      pwpSubmission.status === 'reviewed' 
                                        ? 'bg-blue-100 text-blue-600 hover:ring-blue-400'
                                        : pwpSubmission.status === 'submitted'
                                        ? 'bg-green-100 text-green-600 hover:ring-green-400'
                                        : 'bg-yellow-100 text-yellow-600 hover:ring-yellow-400'
                                    }`} 
                                    title={`Click to review - ${pwpSubmission.status}`}
                                  >
                                    {pwpSubmission.status === 'reviewed' ? '★' : pwpSubmission.status === 'submitted' ? '✓' : '◐'}
                                  </button>
                                ) : (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-400" title="Not Started">
                                    ○
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* New PWP Curriculum Progress Section */}
            {pwpCurriculumAssignments.length > 0 && pupils.length > 0 && (
              <div className="mt-8 pt-6 border-t border-[var(--wrife-border)]">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🧩</span>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--wrife-text-main)]">
                      PWP Curriculum Progress (L10-67)
                    </h3>
                    <p className="text-sm text-[var(--wrife-text-muted)]">
                      Track pupil progress through the formula-based writing curriculum
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex gap-4 text-xs text-[var(--wrife-text-muted)]">
                    <span className="flex items-center gap-1">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 text-xs">✓</span>
                      Completed
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-100 text-yellow-600 text-xs">◐</span>
                      In Progress
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-400 text-xs">○</span>
                      Not Started
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--wrife-border)]">
                        <th className="text-left py-3 px-2 font-semibold text-[var(--wrife-text-main)] sticky left-0 bg-white">
                          Pupil
                        </th>
                        {pwpCurriculumAssignments.map((assignment) => (
                          <th key={assignment.id} className="text-center py-3 px-2 font-semibold text-[var(--wrife-text-main)] min-w-[100px]">
                            <div className="flex flex-col items-center gap-1">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-600 text-xs font-bold">
                                L{assignment.lesson_number}
                              </span>
                              <span className="block truncate max-w-[80px] text-xs text-[var(--wrife-text-muted)]" title={assignment.curriculum_map?.lesson_name ?? ''}>
                                {(assignment.curriculum_map?.lesson_name ?? 'Lesson').slice(0, 12)}...
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pupils.map((pupil) => (
                        <tr key={pupil.id} className="border-b border-[var(--wrife-border)] hover:bg-[var(--wrife-bg)]">
                          <td className="py-3 px-2 sticky left-0 bg-white">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600 uppercase">
                                {pupil.first_name.charAt(0)}{pupil.last_name?.charAt(0) || ''}
                              </div>
                              <span className="font-medium text-[var(--wrife-text-main)]">
                                {pupil.first_name} {pupil.last_name || ''}
                              </span>
                            </div>
                          </td>
                          {pwpCurriculumAssignments.map((assignment) => {
                            const sessionStatus = getPWPSessionStatus(pupil.id, assignment.lesson_number);
                            const session = getPWPSessionForPupil(pupil.id, assignment.lesson_number);
                            return (
                              <td key={assignment.id} className="text-center py-3 px-2">
                                {sessionStatus === 'completed' ? (
                                  <div className="flex flex-col items-center">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600" title="Completed">
                                      ✓
                                    </span>
                                    {session?.accuracy_percentage != null && (
                                      <span className="text-xs text-green-600 mt-1">{Math.round(session.accuracy_percentage)}%</span>
                                    )}
                                  </div>
                                ) : sessionStatus === 'in_progress' ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-600" title="In Progress">
                                    ◐
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-400" title="Not Started">
                                    ○
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          )}

          {showAssignPWP && classData && user && (
            <AssignPWPModal
              isOpen={showAssignPWP}
              onClose={() => setShowAssignPWP(false)}
              classId={classData.id}
              className={classData.name}
              yearGroup={classData.year_group}
              teacherId={user.id}
              onAssigned={() => {
                fetchPWPAssignments();
                fetchPWPSubmissions();
              }}
            />
          )}

          {activeTab === 'dwp' && (
          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">
                  Daily Writing Practice
                </h2>
                <p className="text-sm text-[var(--wrife-text-muted)]">
                  40-level progressive writing programme with AI assessment
                </p>
              </div>
              <button
                onClick={() => setShowAssignDWP(true)}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:opacity-90 transition"
              >
                + Assign DWP
              </button>
            </div>

            {dwpAssignments.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <span className="text-5xl">📝</span>
                </div>
                <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">No DWP activities assigned</h3>
                <p className="text-sm text-[var(--wrife-text-muted)] mb-4">
                  Assign daily writing practice levels to help pupils progress through the 40-level programme
                </p>
              </div>
            ) : pupils.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <span className="text-5xl">👥</span>
                </div>
                <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">No pupils yet</h3>
                <p className="text-sm text-[var(--wrife-text-muted)]">
                  Add pupils to see their DWP progress
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="flex gap-4 text-xs text-[var(--wrife-text-muted)]">
                    <span className="flex items-center gap-1">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 text-xs">✓</span>
                      Passed
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-100 text-yellow-600 text-xs">◐</span>
                      In Progress
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600 text-xs">✗</span>
                      Needs Retry
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-400 text-xs">○</span>
                      Not Started
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--wrife-border)]">
                        <th className="text-left py-3 px-2 font-semibold text-[var(--wrife-text-main)] sticky left-0 bg-white">
                          Pupil
                        </th>
                        {dwpAssignments.map((assignment) => (
                          <th key={assignment.id} className="text-center py-3 px-2 font-semibold text-[var(--wrife-text-main)] min-w-[100px]">
                            <div className="flex flex-col items-center gap-1">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                                {assignment.writing_levels?.level_number ?? '?'}
                              </span>
                              <span className="block truncate max-w-[80px] text-xs" title={assignment.writing_levels?.activity_name ?? ''}>
                                {(assignment.writing_levels?.activity_name ?? 'Unknown').slice(0, 12)}...
                              </span>
                              <button
                                onClick={() => handleDeleteDWPAssignment(assignment.id)}
                                className="text-xs text-red-400 hover:text-red-600"
                                title="Remove assignment"
                              >
                                ✕
                              </button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pupils.map((pupil) => (
                        <tr key={pupil.id} className="border-b border-[var(--wrife-border)] hover:bg-[var(--wrife-bg)]">
                          <td className="py-3 px-2 sticky left-0 bg-white">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 uppercase">
                                {pupil.first_name.charAt(0)}{pupil.last_name?.charAt(0) || ''}
                              </div>
                              <span className="font-medium text-[var(--wrife-text-main)]">
                                {pupil.first_name} {pupil.last_name || ''}
                              </span>
                            </div>
                          </td>
                          {dwpAssignments.map((assignment) => {
                            const attempt = getWritingAttemptForPupil(pupil.id, assignment.id);
                            return (
                              <td key={assignment.id} className="text-center py-3 px-2">
                                {attempt ? (
                                  <div className="flex flex-col items-center gap-0.5">
                                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                                      attempt.passed === true
                                        ? 'bg-green-100 text-green-600'
                                        : attempt.passed === false
                                        ? 'bg-red-100 text-red-600'
                                        : attempt.status === 'draft'
                                        ? 'bg-yellow-100 text-yellow-600'
                                        : 'bg-blue-100 text-blue-600'
                                    }`} title={attempt.passed ? 'Passed' : attempt.passed === false ? 'Needs Retry' : attempt.status}>
                                      {attempt.passed === true ? '✓' : attempt.passed === false ? '✗' : attempt.status === 'draft' ? '◐' : '?'}
                                    </span>
                                    {attempt.percentage !== null && (
                                      <span className="text-[10px] text-[var(--wrife-text-muted)]">{attempt.percentage}%</span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-400" title="Not Started">
                                    ○
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
          )}

          {showAssignDWP && classData && user && (
            <AssignDWPModal
              isOpen={showAssignDWP}
              onClose={() => setShowAssignDWP(false)}
              classId={classData.id}
              className={classData.name}
              yearGroup={classData.year_group}
              teacherId={user.id}
              onAssigned={() => {
                fetchDWPAssignments();
                fetchWritingAttempts();
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <ClassDetailPageInner params={params} />
    </Suspense>
  );
}
