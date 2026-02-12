'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface PupilDetail {
  id: string;
  firstName: string;
  lastName: string;
  yearGroup: number;
  className: string;
  currentLesson: number;
  adaptationLevel: string;
  dailyLoginStreak: number;
  totalWordsWritten: number;
  storyType: string;
}

interface ActivitySummary {
  wLevel: string;
  totalAttempts: number;
  avgPercentage: number;
  masteryCount: number;
}

interface SentenceRecord {
  id: string;
  lessonNumber: number;
  dateWritten: string;
  sentenceText: string;
  storyPart: string;
  aiAnalysisScore: number;
  formulaCorrect: boolean;
}

interface AssessmentRecord {
  id: number;
  lessonNumber: number;
  assessmentDate: string;
  totalScore: number;
  percentage: number;
  masteryStatus: string;
}

interface Note {
  id: number;
  noteText: string;
  priority: string;
  createdAt: string;
}

export default function PupilDetailPage() {
  const params = useParams();
  const pupilId = params?.id as string;
  const router = useRouter();

  const [pupil, setPupil] = useState<PupilDetail | null>(null);
  const [activitySummary, setActivitySummary] = useState<ActivitySummary[]>([]);
  const [sentences, setSentences] = useState<SentenceRecord[]>([]);
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [notePriority, setNotePriority] = useState('medium');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'story' | 'assessments' | 'notes'>('overview');

  useEffect(() => {
    if (pupilId) {
      fetchPupilData(pupilId);
    }
  }, [pupilId]);

  async function fetchPupilData(id: string) {
    try {
      const response = await fetch('/api/teacher/pupil-detail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pupilId: id }),
      });

      if (response.ok) {
        const data = await response.json();
        setPupil(data.pupil);
        setActivitySummary(data.activitySummary || []);
        setSentences(data.sentences || []);
        setAssessments(data.assessments || []);
        setNotes(data.notes || []);
      }
    } catch (err) {
      console.error('Error fetching pupil data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddNote() {
    if (!newNote.trim()) return;

    try {
      const response = await fetch('/api/teacher/add-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pupilId,
          noteText: newNote.trim(),
          priority: notePriority,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNotes([data.note, ...notes]);
        setNewNote('');
      }
    } catch (err) {
      console.error('Error adding note:', err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--wrife-bg)]">
        <Navbar />
        <div className="flex justify-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent"></div>
        </div>
      </div>
    );
  }

  if (!pupil) {
    return (
      <div className="min-h-screen bg-[var(--wrife-bg)]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-[var(--wrife-text-muted)]">Pupil not found.</p>
          <Link href="/dashboard?tab=pupils" className="text-[var(--wrife-blue)] font-semibold">
            Back to Pupils
          </Link>
        </div>
      </div>
    );
  }

  const overallMastery = activitySummary.length > 0
    ? Math.round(activitySummary.reduce((sum, a) => sum + a.avgPercentage, 0) / activitySummary.length)
    : 0;

  const statusColor = overallMastery >= 80 ? 'text-green-600' : overallMastery >= 60 ? 'text-yellow-600' : 'text-red-600';
  const statusBg = overallMastery >= 80 ? 'bg-green-50 border-green-200' : overallMastery >= 60 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';

  return (
    <div className="min-h-screen bg-[var(--wrife-bg)]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard?tab=pupils" className="text-[var(--wrife-text-muted)] hover:text-[var(--wrife-text-main)]">
              ← Back
            </Link>
            <div className="h-12 w-12 rounded-full bg-[var(--wrife-blue-soft)] flex items-center justify-center text-lg font-bold text-[var(--wrife-blue)]">
              {pupil.firstName.charAt(0)}{pupil.lastName?.charAt(0) || ''}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--wrife-text-main)]">
                {pupil.firstName} {pupil.lastName}
              </h1>
              <p className="text-sm text-[var(--wrife-text-muted)]">
                {pupil.className} &bull; Year {pupil.yearGroup} &bull; Lesson {pupil.currentLesson}
              </p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-xl border ${statusBg}`}>
            <p className={`text-lg font-bold ${statusColor}`}>{overallMastery}%</p>
            <p className="text-xs text-gray-500">Overall</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <div className="bg-white rounded-xl p-3 border border-[var(--wrife-border)] text-center">
            <p className="text-xl font-bold text-[var(--wrife-blue)]">{pupil.currentLesson}</p>
            <p className="text-xs text-[var(--wrife-text-muted)]">Lesson</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-[var(--wrife-border)] text-center">
            <p className="text-xl font-bold text-orange-500">{pupil.dailyLoginStreak}</p>
            <p className="text-xs text-[var(--wrife-text-muted)]">Streak</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-[var(--wrife-border)] text-center">
            <p className="text-xl font-bold text-green-600">{pupil.totalWordsWritten}</p>
            <p className="text-xs text-[var(--wrife-text-muted)]">Words</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-[var(--wrife-border)] text-center">
            <p className="text-xl font-bold text-purple-600">{sentences.length}</p>
            <p className="text-xs text-[var(--wrife-text-muted)]">Sentences</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-[var(--wrife-border)] text-center">
            <p className="text-xl font-bold text-[var(--wrife-text-main)]">{pupil.adaptationLevel}</p>
            <p className="text-xs text-[var(--wrife-text-muted)]">Level</p>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex gap-1 mb-6 border-b border-[var(--wrife-border)] overflow-x-auto">
          {(['overview', 'activities', 'story', 'assessments', 'notes'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition ${
                activeTab === tab
                  ? 'border-[var(--wrife-blue)] text-[var(--wrife-blue)] bg-white'
                  : 'border-transparent text-[var(--wrife-text-muted)] hover:text-[var(--wrife-text-main)]'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* W-Level Mastery */}
            <div className="bg-white rounded-2xl p-6 border border-[var(--wrife-border)]">
              <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-4">W-Level Mastery</h3>
              {activitySummary.length === 0 ? (
                <p className="text-sm text-[var(--wrife-text-muted)]">No activity data yet.</p>
              ) : (
                <div className="space-y-3">
                  {activitySummary.map(s => (
                    <div key={s.wLevel}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold">{s.wLevel}</span>
                        <span className={s.avgPercentage >= 80 ? 'text-green-600' : s.avgPercentage >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                          {s.avgPercentage}% ({s.masteryCount} mastered)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            s.avgPercentage >= 80 ? 'bg-green-500' : s.avgPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${s.avgPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Sentences */}
            <div className="bg-white rounded-2xl p-6 border border-[var(--wrife-border)]">
              <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-4">Recent PWP Sentences</h3>
              {sentences.length === 0 ? (
                <p className="text-sm text-[var(--wrife-text-muted)]">No sentences written yet.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {sentences.slice(-5).reverse().map(s => (
                    <div key={s.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-[var(--wrife-text-main)]">
                        &ldquo;{s.sentenceText}&rdquo;
                      </p>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-[var(--wrife-text-muted)]">
                          L{s.lessonNumber} &bull; {s.storyPart}
                        </span>
                        <span className={`text-xs font-semibold ${
                          s.aiAnalysisScore >= 80 ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {s.aiAnalysisScore}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Insights */}
            <div className="lg:col-span-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">AI Insights</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-700">Strengths</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activitySummary.filter(a => a.avgPercentage >= 80).map(a => a.wLevel).join(', ') || 'Building confidence across all levels'}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-700">Areas for Growth</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activitySummary.filter(a => a.avgPercentage < 70).map(a => a.wLevel).join(', ') || 'On track across all levels'}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-700">Recommendation</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {overallMastery >= 80
                      ? 'Ready for challenge activities. Consider advancing to the next lesson.'
                      : overallMastery >= 60
                      ? 'Making progress. Continue with core activities and provide targeted support.'
                      : 'Needs intervention. Consider the 5-day support protocol.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <div className="bg-white rounded-2xl p-6 border border-[var(--wrife-border)]">
            <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-4">Activity Progress</h3>
            {activitySummary.length === 0 ? (
              <p className="text-[var(--wrife-text-muted)]">No activities completed yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--wrife-border)]">
                      <th className="text-left py-2 text-sm font-semibold text-[var(--wrife-text-muted)]">W-Level</th>
                      <th className="text-center py-2 text-sm font-semibold text-[var(--wrife-text-muted)]">Attempts</th>
                      <th className="text-center py-2 text-sm font-semibold text-[var(--wrife-text-muted)]">Avg Score</th>
                      <th className="text-center py-2 text-sm font-semibold text-[var(--wrife-text-muted)]">Mastered</th>
                      <th className="text-center py-2 text-sm font-semibold text-[var(--wrife-text-muted)]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activitySummary.map(s => (
                      <tr key={s.wLevel} className="border-b border-[var(--wrife-border)]">
                        <td className="py-3 font-semibold">{s.wLevel}</td>
                        <td className="py-3 text-center">{s.totalAttempts}</td>
                        <td className="py-3 text-center">{s.avgPercentage}%</td>
                        <td className="py-3 text-center">{s.masteryCount}</td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            s.avgPercentage >= 80 ? 'bg-green-100 text-green-700'
                            : s.avgPercentage >= 70 ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                          }`}>
                            {s.avgPercentage >= 80 ? '✓' : s.avgPercentage >= 70 ? '⚠' : '✗'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Story Tab */}
        {activeTab === 'story' && (
          <div className="bg-white rounded-2xl p-6 border border-[var(--wrife-border)]">
            <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-4">
              {pupil.firstName}&apos;s Growing Story
            </h3>
            {sentences.length === 0 ? (
              <p className="text-[var(--wrife-text-muted)]">No sentences written yet.</p>
            ) : (
              <div className="space-y-3">
                {sentences.map(s => (
                  <div key={s.id} className="p-4 rounded-xl border border-[var(--wrife-border)] hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          s.storyPart === 'beginning' ? 'bg-blue-100 text-blue-700'
                          : s.storyPart === 'middle' ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                        }`}>
                          {s.storyPart.charAt(0).toUpperCase()}
                        </span>
                        <span className="text-xs text-[var(--wrife-text-muted)]">
                          Lesson {s.lessonNumber} &bull; {new Date(s.dateWritten).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                      <span className={`text-xs font-bold ${
                        s.aiAnalysisScore >= 80 ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {s.aiAnalysisScore}%{s.formulaCorrect ? ' ✓' : ''}
                      </span>
                    </div>
                    <p className="text-[var(--wrife-text-main)]">&ldquo;{s.sentenceText}&rdquo;</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Assessments Tab */}
        {activeTab === 'assessments' && (
          <div className="bg-white rounded-2xl p-6 border border-[var(--wrife-border)]">
            <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-4">Assessment History</h3>
            {assessments.length === 0 ? (
              <p className="text-[var(--wrife-text-muted)]">No formal assessments yet.</p>
            ) : (
              <div className="space-y-3">
                {assessments.map(a => (
                  <div key={a.id} className={`p-4 rounded-xl border ${
                    a.masteryStatus === 'mastered' ? 'border-green-200 bg-green-50'
                    : a.masteryStatus === 'nearly_there' ? 'border-yellow-200 bg-yellow-50'
                    : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">Lesson {a.lessonNumber}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(a.assessmentDate).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{a.percentage}%</p>
                        <span className={`text-xs font-semibold ${
                          a.masteryStatus === 'mastered' ? 'text-green-600'
                          : a.masteryStatus === 'nearly_there' ? 'text-yellow-600'
                          : 'text-red-600'
                        }`}>
                          {a.masteryStatus === 'mastered' ? 'Mastered' : a.masteryStatus === 'nearly_there' ? 'Nearly There' : 'Needs Support'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="bg-white rounded-2xl p-6 border border-[var(--wrife-border)]">
            <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-4">Teacher Notes</h3>

            {/* Add Note */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note about this pupil..."
                className="w-full px-3 py-2 border rounded-lg text-sm mb-2"
                rows={2}
              />
              <div className="flex justify-between items-center">
                <select
                  value={notePriority}
                  onChange={(e) => setNotePriority(e.target.value)}
                  className="px-3 py-1 border rounded text-sm"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium</option>
                  <option value="high">High Priority</option>
                </select>
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="px-4 py-2 bg-[var(--wrife-blue)] text-white rounded-full text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  Add Note
                </button>
              </div>
            </div>

            {notes.length === 0 ? (
              <p className="text-[var(--wrife-text-muted)]">No notes yet.</p>
            ) : (
              <div className="space-y-2">
                {notes.map(n => (
                  <div key={n.id} className={`p-3 rounded-lg border ${
                    n.priority === 'high' ? 'border-red-200 bg-red-50'
                    : n.priority === 'medium' ? 'border-yellow-200 bg-yellow-50'
                    : 'border-gray-200 bg-gray-50'
                  }`}>
                    <p className="text-sm text-[var(--wrife-text-main)]">{n.noteText}</p>
                    <p className="text-xs text-[var(--wrife-text-muted)] mt-1">
                      {new Date(n.createdAt).toLocaleDateString('en-GB')} &bull; {n.priority}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
