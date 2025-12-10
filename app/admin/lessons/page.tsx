'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Lesson {
  id: number;
  lesson_number: number;
  title: string;
  has_parts: boolean;
  part: string | null;
  chapter: number;
  unit: number;
  summary: string | null;
  duration_minutes: number | null;
  year_group_min: number | null;
  year_group_max: number | null;
}

const chapterTitles: { [key: number]: string } = {
  1: 'Stories and Words',
  2: 'Sentences',
  3: 'Planning and Drafting',
  4: 'Editing to Final Composition',
  5: 'Building Cohesion and Final Composition',
  6: 'Writing for Different Purposes/Audiences',
  7: 'Project Based Writing',
};

const unitTitles: { [key: number]: string } = {
  1: 'Stories',
  2: 'Story Structure',
  3: 'Parts of Speech 1',
  4: 'Parts of Speech 2',
  5: 'Reading Comprehension',
  6: 'Sentence Types',
  7: 'Phrases and Clauses',
  8: 'Simple (Single-Clause) Sentences',
  9: 'Paragraphs',
  10: 'Planning',
  11: 'Developing a Story',
  12: 'Editing',
  13: 'Building Cohesion Within and Across Paragraphs',
  14: 'Non-Fiction Writing',
  15: 'Fictional Writing',
  16: 'Exploring Different Projects',
};

export default function AdminLessonsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    lesson_number: 1,
    title: '',
    has_parts: false,
    part: '',
    chapter: 1,
    unit: 1,
    summary: '',
    duration_minutes: 45,
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
      fetchLessons();
    }
  }, [user, authLoading, router]);

  async function fetchLessons() {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('lesson_number', { ascending: true })
        .order('part', { ascending: true });

      if (error) throw error;
      setLessons(data || []);
    } catch (err) {
      console.error('Error fetching lessons:', err);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      lesson_number: lessons.length > 0 ? Math.max(...lessons.map(l => l.lesson_number)) + 1 : 1,
      title: '',
      has_parts: false,
      part: '',
      chapter: 1,
      unit: 1,
      summary: '',
      duration_minutes: 45,
      year_group_min: 2,
      year_group_max: 6,
    });
    setFormError('');
  }

  function openAddModal() {
    resetForm();
    setShowAddModal(true);
  }

  function openEditModal(lesson: Lesson) {
    setEditingLesson(lesson);
    setFormData({
      lesson_number: lesson.lesson_number,
      title: lesson.title,
      has_parts: lesson.has_parts,
      part: lesson.part || '',
      chapter: lesson.chapter,
      unit: lesson.unit,
      summary: lesson.summary || '',
      duration_minutes: lesson.duration_minutes || 45,
      year_group_min: lesson.year_group_min || 2,
      year_group_max: lesson.year_group_max || 6,
    });
    setFormError('');
    setShowEditModal(true);
  }

  async function handleAddLesson(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim()) {
      setFormError('Title is required');
      return;
    }

    try {
      const { error } = await supabase
        .from('lessons')
        .insert({
          lesson_number: formData.lesson_number,
          title: formData.title.trim(),
          has_parts: formData.has_parts,
          part: formData.has_parts ? formData.part : null,
          chapter: formData.chapter,
          unit: formData.unit,
          summary: formData.summary.trim() || null,
          duration_minutes: formData.duration_minutes,
          year_group_min: formData.year_group_min,
          year_group_max: formData.year_group_max,
        });

      if (error) throw error;

      setSuccessMessage('Lesson added successfully!');
      setShowAddModal(false);
      fetchLessons();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to add lesson');
    }
  }

  async function handleUpdateLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!editingLesson) return;
    setFormError('');

    if (!formData.title.trim()) {
      setFormError('Title is required');
      return;
    }

    try {
      const { error } = await supabase
        .from('lessons')
        .update({
          lesson_number: formData.lesson_number,
          title: formData.title.trim(),
          has_parts: formData.has_parts,
          part: formData.has_parts ? formData.part : null,
          chapter: formData.chapter,
          unit: formData.unit,
          summary: formData.summary.trim() || null,
          duration_minutes: formData.duration_minutes,
          year_group_min: formData.year_group_min,
          year_group_max: formData.year_group_max,
        })
        .eq('id', editingLesson.id);

      if (error) throw error;

      setSuccessMessage('Lesson updated successfully!');
      setShowEditModal(false);
      setEditingLesson(null);
      fetchLessons();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to update lesson');
    }
  }

  async function handleDeleteLesson(lesson: Lesson) {
    const lessonName = lesson.has_parts && lesson.part 
      ? `Lesson ${lesson.lesson_number}${lesson.part}: ${lesson.title}`
      : `Lesson ${lesson.lesson_number}: ${lesson.title}`;
      
    if (!confirm(`Are you sure you want to delete "${lessonName}"? This cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lesson.id);

      if (error) throw error;

      setSuccessMessage('Lesson deleted successfully!');
      fetchLessons();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error deleting lesson:', err);
      alert('Failed to delete lesson: ' + err.message);
    }
  }

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = searchQuery === '' ||
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.lesson_number.toString().includes(searchQuery);
    const matchesChapter = selectedChapter === null || lesson.chapter === selectedChapter;
    return matchesSearch && matchesChapter;
  });

  const groupedByChapter = filteredLessons.reduce((acc, lesson) => {
    if (!acc[lesson.chapter]) {
      acc[lesson.chapter] = [];
    }
    acc[lesson.chapter].push(lesson);
    return acc;
  }, {} as { [key: number]: Lesson[] });

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
              <h1 className="text-2xl font-extrabold text-[var(--wrife-text-main)] mt-2">Manage Lessons</h1>
              <p className="text-sm text-[var(--wrife-text-muted)] mt-1">
                {lessons.length} lessons in the curriculum
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="rounded-full bg-[var(--wrife-blue)] px-6 py-3 text-sm font-semibold text-white shadow-soft hover:opacity-90 transition"
            >
              + Add Lesson
            </button>
          </div>

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              {successMessage}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Search lessons by title or number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
              />
              <select
                value={selectedChapter ?? ''}
                onChange={(e) => setSelectedChapter(e.target.value ? parseInt(e.target.value) : null)}
                className="px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
              >
                <option value="">All Chapters</option>
                {Object.entries(chapterTitles).map(([num, title]) => (
                  <option key={num} value={num}>Chapter {num}: {title}</option>
                ))}
              </select>
            </div>
          </div>

          {Object.keys(groupedByChapter).length === 0 ? (
            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-12 text-center">
              <p className="text-[var(--wrife-text-muted)]">No lessons found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByChapter)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([chapter, chapterLessons]) => (
                  <div key={chapter} className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] overflow-hidden">
                    <div className="bg-[var(--wrife-blue-soft)] px-6 py-4">
                      <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">
                        Chapter {chapter}: {chapterTitles[parseInt(chapter)] || 'Lessons'}
                      </h2>
                      <p className="text-sm text-[var(--wrife-text-muted)]">
                        {chapterLessons.length} lessons
                      </p>
                    </div>
                    <div className="divide-y divide-[var(--wrife-border)]">
                      {chapterLessons.map((lesson) => (
                        <div key={lesson.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--wrife-blue)] text-white text-sm font-bold">
                                {lesson.lesson_number}{lesson.part || ''}
                              </span>
                              <div>
                                <h3 className="font-semibold text-[var(--wrife-text-main)]">{lesson.title}</h3>
                                <p className="text-xs text-[var(--wrife-text-muted)]">
                                  Unit {lesson.unit}: {unitTitles[lesson.unit] || 'Lesson'} • Years {lesson.year_group_min}-{lesson.year_group_max}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(lesson)}
                              className="rounded-full border border-[var(--wrife-blue)] px-4 py-1.5 text-xs font-semibold text-[var(--wrife-blue)] hover:bg-[var(--wrife-blue-soft)] transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(lesson)}
                              className="rounded-full border border-red-300 px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                            >
                              Delete
                            </button>
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-[var(--wrife-text-main)] mb-4">
                {showEditModal ? 'Edit Lesson' : 'Add New Lesson'}
              </h2>
              
              {formError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {formError}
                </div>
              )}

              <form onSubmit={showEditModal ? handleUpdateLesson : handleAddLesson}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                        Lesson Number
                      </label>
                      <input
                        type="number"
                        value={formData.lesson_number}
                        onChange={(e) => setFormData({ ...formData, lesson_number: parseInt(e.target.value) || 1 })}
                        className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                        Has Parts?
                      </label>
                      <div className="flex items-center gap-4 h-10">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.has_parts}
                            onChange={(e) => setFormData({ ...formData, has_parts: e.target.checked })}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">Yes</span>
                        </label>
                        {formData.has_parts && (
                          <input
                            type="text"
                            placeholder="a, b, c..."
                            value={formData.part}
                            onChange={(e) => setFormData({ ...formData, part: e.target.value })}
                            className="w-20 px-3 py-1.5 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                            maxLength={1}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                      placeholder="Enter lesson title..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                        Chapter
                      </label>
                      <select
                        value={formData.chapter}
                        onChange={(e) => setFormData({ ...formData, chapter: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                      >
                        {Object.entries(chapterTitles).map(([num, title]) => (
                          <option key={num} value={num}>{num}. {title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                        Unit
                      </label>
                      <select
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                      >
                        {Object.entries(unitTitles).map(([num, title]) => (
                          <option key={num} value={num}>{num}. {title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                      Summary
                    </label>
                    <textarea
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                      rows={3}
                      placeholder="Brief description of the lesson..."
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                        Duration (min)
                      </label>
                      <input
                        type="number"
                        value={formData.duration_minutes}
                        onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 45 })}
                        className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                        Min Year
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
                        Max Year
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
                      setEditingLesson(null);
                    }}
                    className="flex-1 rounded-full border border-[var(--wrife-border)] px-6 py-3 text-sm font-semibold text-[var(--wrife-text-muted)] hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-full bg-[var(--wrife-blue)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
                  >
                    {showEditModal ? 'Update Lesson' : 'Add Lesson'}
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
