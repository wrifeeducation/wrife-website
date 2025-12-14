"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { PWPSession, Formula, SessionStats } from '@/components/pwp';

interface CurriculumData {
  lesson_number: number;
  lesson_name: string;
  concepts_cumulative: string[];
  pwp_duration_minutes: number;
  pwp_formula_count_min: number;
  pwp_formula_count_max: number;
  subject_assignment_type: string;
  subject_ideas: string[];
}

type SessionStatus = 'loading' | 'subject_select' | 'practicing' | 'completed' | 'error';

export default function PWPPracticePage() {
  const params = useParams();
  const router = useRouter();
  const lessonNumber = parseInt(params.lesson as string);

  const [status, setStatus] = useState<SessionStatus>('loading');
  const [curriculum, setCurriculum] = useState<CurriculumData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCurriculum();
  }, [lessonNumber]);

  const fetchCurriculum = async () => {
    try {
      const res = await fetch(`/api/pwp/curriculum?lesson=${lessonNumber}`);
      if (!res.ok) throw new Error('Failed to fetch curriculum');
      const data = await res.json();
      setCurriculum(data);
      setStatus('subject_select');
    } catch (err) {
      setError('Could not load lesson data');
      setStatus('error');
    }
  };

  const startSession = async () => {
    if (!subject.trim() || !curriculum) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/pwp/start-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson_number: lessonNumber,
          subject_text: subject.trim()
        })
      });

      if (!res.ok) throw new Error('Failed to start session');
      
      const data = await res.json();
      setSessionId(data.session_id);
      setFormulas(data.formulas);
      setStatus('practicing');
    } catch (err) {
      setError('Could not start practice session');
      setStatus('error');
    }
  };

  const handleFormulaSubmit = async (formulaNumber: number, sentence: string) => {
    const res = await fetch('/api/pwp/submit-formula', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        formula_number: formulaNumber,
        pupil_sentence: sentence
      })
    });

    if (!res.ok) {
      throw new Error('Failed to submit formula');
    }

    return res.json();
  };

  const handleSessionComplete = async (stats: SessionStats) => {
    setSessionStats(stats);
    setStatus('completed');

    try {
      await fetch('/api/pwp/complete-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          stats
        })
      });
    } catch (err) {
      console.error('Failed to save session completion');
    }
  };

  const renderSubjectSelect = () => {
    if (!curriculum) return null;

    return (
      <div className="max-w-xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-[var(--wrife-border)]">
          <div className="text-center mb-6">
            <span className="text-sm text-[var(--wrife-text-muted)]">L{lessonNumber} PWP Practice</span>
            <h1 className="text-2xl font-bold text-[var(--wrife-text-main)] mt-1">
              {curriculum.lesson_name}
            </h1>
            <p className="text-[var(--wrife-text-muted)] mt-2">
              ⏱️ About {curriculum.pwp_duration_minutes} minutes • {curriculum.pwp_formula_count_min}-{curriculum.pwp_formula_count_max} formulas
            </p>
          </div>

          <div className="mb-6">
            <h2 className="font-bold text-[var(--wrife-text-main)] mb-3">
              Choose Your Subject
            </h2>
            
            {curriculum.subject_assignment_type === 'given' ? (
              <div>
                <p className="text-sm text-[var(--wrife-text-muted)] mb-3">
                  Pick one of these subjects for today:
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {curriculum.subject_ideas?.map((idea) => (
                    <button
                      key={idea}
                      onClick={() => setSubject(idea)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${subject === idea
                          ? 'bg-[var(--wrife-blue)] text-white'
                          : 'bg-[var(--wrife-blue-soft)] text-[var(--wrife-blue)] hover:bg-[var(--wrife-blue)] hover:text-white'
                        }`}
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm text-[var(--wrife-text-muted)] mb-2">
                  Type your subject:
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter a subject..."
                  className="w-full px-4 py-3 border-2 border-[var(--wrife-border)] rounded-lg focus:border-[var(--wrife-blue)] focus:outline-none"
                />
              </div>
            )}
          </div>

          <div className="bg-[var(--wrife-bg)] rounded-lg p-4 mb-6">
            <h3 className="font-medium text-[var(--wrife-text-main)] mb-2">
              Today you will learn:
            </h3>
            <div className="flex flex-wrap gap-2">
              {curriculum.concepts_cumulative.map((concept) => (
                <span
                  key={concept}
                  className="px-3 py-1 bg-white rounded-full text-sm text-[var(--wrife-text-muted)] border"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={startSession}
            disabled={!subject.trim()}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all
              ${subject.trim()
                ? 'bg-[var(--wrife-blue)] text-white hover:bg-opacity-90 shadow-md'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            Start PWP Practice →
          </button>
        </div>
      </div>
    );
  };

  const renderCompleted = () => {
    if (!sessionStats || !curriculum) return null;

    return (
      <div className="max-w-xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-[var(--wrife-border)] text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-[var(--wrife-text-main)] mb-2">
            PWP Complete!
          </h1>
          <p className="text-[var(--wrife-text-muted)] mb-6">
            Great work on L{lessonNumber}: {curriculum.lesson_name}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[var(--wrife-blue-soft)] rounded-lg p-4">
              <p className="text-3xl font-bold text-[var(--wrife-blue)]">
                {sessionStats.formulasCompleted}/{sessionStats.totalFormulas}
              </p>
              <p className="text-sm text-[var(--wrife-text-muted)]">Formulas Done</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-3xl font-bold text-green-600">
                {Math.floor(sessionStats.duration / 60)}:{(sessionStats.duration % 60).toString().padStart(2, '0')}
              </p>
              <p className="text-sm text-[var(--wrife-text-muted)]">Time</p>
            </div>
          </div>

          {Object.keys(sessionStats.repetitionStats).length > 0 && (
            <div className="bg-[var(--wrife-bg)] rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-[var(--wrife-text-main)] mb-2 flex items-center gap-2">
                🧠 Words Practiced
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(sessionStats.repetitionStats)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .map(([word, count]) => (
                    <span
                      key={word}
                      className="px-2 py-1 bg-white rounded text-sm"
                    >
                      {word} <span className="text-[var(--wrife-blue)]">×{count}</span>
                    </span>
                  ))}
              </div>
            </div>
          )}

          <button
            onClick={() => router.push('/pupil/dashboard')}
            className="w-full py-3 bg-[var(--wrife-blue)] text-white rounded-lg font-bold hover:bg-opacity-90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--wrife-bg)]">
      <Navbar />
      
      <main className="pt-24 pb-12">
        {status === 'loading' && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-[var(--wrife-blue)] border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-[var(--wrife-text-muted)]">Loading...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="max-w-md mx-auto p-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-800 font-medium">{error}</p>
              <button
                onClick={() => router.push('/pupil/dashboard')}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

        {status === 'subject_select' && renderSubjectSelect()}

        {status === 'practicing' && sessionId && curriculum && (
          <PWPSession
            sessionId={sessionId}
            lessonNumber={lessonNumber}
            lessonName={curriculum.lesson_name}
            subject={subject}
            formulas={formulas}
            onComplete={handleSessionComplete}
            onFormulaSubmit={handleFormulaSubmit}
          />
        )}

        {status === 'completed' && renderCompleted()}
      </main>
    </div>
  );
}
