'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Lesson {
  id: number;
  lesson_number: number;
  title: string;
  part: string | null;
}

interface UploadedFile {
  name: string;
  fileType: string;
  publicUrl: string;
}

interface UploadProgress {
  fileName: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

const FILE_CATEGORIES = [
  { value: 'teacher_guide', label: 'Teacher Guide' },
  { value: 'presentation', label: 'Lesson Presentation' },
  { value: 'interactive_practice', label: 'Interactive Practice' },
  { value: 'worksheet_support', label: 'Worksheet (Support)' },
  { value: 'worksheet_core', label: 'Worksheet (Core)' },
  { value: 'worksheet_challenge', label: 'Worksheet (Challenge)' },
  { value: 'progress_tracker', label: 'Progress Tracker' },
  { value: 'assessment', label: 'Assessment' },
];

export default function AdminLessonFilesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<number | ''>('');
  const [selectedFileCategory, setSelectedFileCategory] = useState<string>('teacher_guide');
  const [lessonFiles, setLessonFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (selectedLessonId) {
      fetchLessonFiles(selectedLessonId);
    } else {
      setLessonFiles([]);
    }
  }, [selectedLessonId]);

  async function fetchLessons() {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, lesson_number, title, part')
        .order('lesson_number');
      
      if (!error && data) {
        setLessons(data);
      }
    } catch (err) {
      console.error('Error fetching lessons:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLessonFiles(lessonId: number) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`/api/admin/lesson-files?lessonId=${lessonId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });

      if (response.ok) {
        const data = await response.json();
        setLessonFiles(data.files || []);
      }
    } catch (err) {
      console.error('Error fetching lesson files:', err);
    }
  }

  const handleChooseFiles = () => {
    if (!selectedLessonId) {
      setErrorMessage('Please select a lesson first');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (!selectedLessonId) {
      setErrorMessage('Please select a lesson first');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, [selectedLessonId]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  async function handleFiles(files: File[]) {
    if (!selectedLessonId) {
      setErrorMessage('Please select a lesson first');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setUploading(true);
    setErrorMessage('');
    
    const progress: UploadProgress[] = files.map(f => ({
      fileName: f.name,
      status: 'pending',
    }));
    setUploadProgress(progress);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        setUploadProgress(prev => prev.map((p, idx) => 
          idx === i ? { ...p, status: 'uploading' } : p
        ));

        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('lessonId', selectedLessonId.toString());
          formData.append('fileCategory', selectedFileCategory);

          const response = await fetch('/api/admin/lesson-files', {
            method: 'POST',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            body: formData,
          });

          if (response.ok) {
            setUploadProgress(prev => prev.map((p, idx) => 
              idx === i ? { ...p, status: 'success' } : p
            ));
            successCount++;
          } else {
            const data = await response.json();
            setUploadProgress(prev => prev.map((p, idx) => 
              idx === i ? { ...p, status: 'error', error: data.error } : p
            ));
            errorCount++;
          }
        } catch (err: any) {
          setUploadProgress(prev => prev.map((p, idx) => 
            idx === i ? { ...p, status: 'error', error: err.message } : p
          ));
          errorCount++;
        }
      }

      const selectedLessonData = lessons.find(l => l.id === selectedLessonId);
      const lessonLabel = selectedLessonData 
        ? `Lesson ${selectedLessonData.lesson_number}${selectedLessonData.part || ''}`
        : `Lesson`;

      if (successCount > 0) {
        setSuccessMessage(`Successfully uploaded ${successCount} file(s) to ${lessonLabel}${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
        setTimeout(() => setSuccessMessage(''), 5000);
      }
      
      if (errorCount > 0 && successCount === 0) {
        setErrorMessage(`Failed to upload ${errorCount} file(s)`);
        setTimeout(() => setErrorMessage(''), 5000);
      }

      fetchLessonFiles(selectedLessonId);
      
      setTimeout(() => setUploadProgress([]), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload files');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setUploading(false);
    }
  }

  async function deleteFile(fileName: string) {
    if (!selectedLessonId) return;
    if (!confirm(`Are you sure you want to delete ${fileName}?`)) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/admin/lesson-files', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ lessonId: selectedLessonId, fileName }),
      });

      if (response.ok) {
        setSuccessMessage('File deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchLessonFiles(selectedLessonId);
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Delete failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete file');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  }

  function getFileIcon(fileType: string): string {
    const icons: Record<string, string> = {
      pdf: '📕',
      docx: '📘',
      xlsx: '📗',
      html: '🌐',
      pptx: '📙',
    };
    return icons[fileType] || '📄';
  }

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
          <div className="mb-6">
            <Link href="/admin" className="text-[var(--wrife-blue)] hover:underline">
              ← Back to Admin
            </Link>
            <h1 className="text-2xl font-extrabold text-[var(--wrife-text-main)] mt-2">Lesson File Management</h1>
            <p className="text-sm text-[var(--wrife-text-muted)] mt-1">
              Upload and manage all lesson files (PDF, DOCX, XLSX, HTML). New uploads automatically replace existing files.
            </p>
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

          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6 mb-6">
            <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-4">Upload Files</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
                  Select Lesson
                </label>
                <select
                  value={selectedLessonId}
                  onChange={(e) => setSelectedLessonId(e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                >
                  <option value="">Choose a lesson...</option>
                  {lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      Lesson {lesson.lesson_number}{lesson.part || ''}: {lesson.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
                  File Category
                </label>
                <select
                  value={selectedFileCategory}
                  onChange={(e) => setSelectedFileCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                >
                  {FILE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                dragActive
                  ? 'border-[var(--wrife-blue)] bg-[var(--wrife-blue-soft)]'
                  : selectedLessonId
                    ? 'border-[var(--wrife-border)] hover:border-[var(--wrife-blue)]'
                    : 'border-gray-200 bg-gray-50'
              }`}
            >
              {uploading ? (
                <div className="space-y-3">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent mb-3"></div>
                  <p className="text-[var(--wrife-text-main)] font-semibold">Uploading files...</p>
                  <div className="max-w-md mx-auto space-y-2">
                    {uploadProgress.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <span className={`w-4 h-4 flex items-center justify-center ${
                          p.status === 'success' ? 'text-green-500' :
                          p.status === 'error' ? 'text-red-500' :
                          p.status === 'uploading' ? 'text-blue-500' : 'text-gray-400'
                        }`}>
                          {p.status === 'success' ? '✓' :
                           p.status === 'error' ? '✗' :
                           p.status === 'uploading' ? '↻' : '○'}
                        </span>
                        <span className="truncate flex-1 text-left">{p.fileName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-4xl mb-3">📁</div>
                  <p className="text-[var(--wrife-text-main)] font-semibold mb-2">
                    Drag and drop all lesson files here
                  </p>
                  <p className="text-sm text-[var(--wrife-text-muted)] mb-1">
                    Supports PDF, DOCX, XLSX, HTML (up to 8 files at once)
                  </p>
                  <p className="text-xs text-[var(--wrife-text-muted)] mb-4">
                    New uploads automatically replace existing files with the same name
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.xlsx,.xls,.html,.htm,.pptx,.ppt"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={handleChooseFiles}
                    disabled={!selectedLessonId}
                    className={`inline-block rounded-full px-6 py-2 text-sm font-semibold transition ${
                      selectedLessonId
                        ? 'bg-[var(--wrife-blue)] text-white hover:opacity-90 cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Choose Files
                  </button>
                </>
              )}
            </div>
          </div>

          {selectedLessonId && (
            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
              <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-4">
                Current Files for {lessons.find(l => l.id === selectedLessonId)?.title || 'Selected Lesson'}
              </h2>

              {lessonFiles.length === 0 ? (
                <p className="text-[var(--wrife-text-muted)] text-center py-8">
                  No files uploaded yet for this lesson.
                </p>
              ) : (
                <div className="grid gap-3">
                  {lessonFiles.map((file) => (
                    <div key={file.name} className="flex items-center justify-between border border-[var(--wrife-border)] rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getFileIcon(file.fileType)}</span>
                        <div>
                          <p className="font-semibold text-[var(--wrife-text-main)]">{file.name}</p>
                          <p className="text-xs text-[var(--wrife-text-muted)] uppercase">{file.fileType}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={file.fileType === 'html' ? `/api/fetch-html?url=${encodeURIComponent(file.publicUrl)}` : file.publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full border border-[var(--wrife-blue)] px-4 py-1.5 text-xs font-semibold text-[var(--wrife-blue)] hover:bg-[var(--wrife-blue-soft)] transition"
                        >
                          {file.fileType === 'html' ? 'Preview' : 'View'}
                        </a>
                        <button
                          onClick={() => deleteFile(file.name)}
                          className="rounded-full border border-red-300 px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-6 bg-[var(--wrife-blue-soft)] rounded-2xl p-6">
            <h3 className="font-bold text-[var(--wrife-text-main)] mb-2">How it works</h3>
            <ol className="list-decimal list-inside text-sm text-[var(--wrife-text-muted)] space-y-2">
              <li>Select a lesson from the dropdown</li>
              <li>Drag and drop all 8 files at once (or click to browse)</li>
              <li>Files upload in parallel and automatically replace any existing files with the same name</li>
              <li>View, download, or delete files as needed</li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
