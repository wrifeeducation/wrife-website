'use client';

import { useState, useEffect, useCallback } from 'react';
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
  isFolder: boolean;
  publicUrl?: string;
  subFiles?: { name: string; publicUrl: string }[];
}

export default function AdminPracticeFilesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<number | ''>('');
  const [dragActive, setDragActive] = useState(false);
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
      fetchData();
    }
  }, [user, authLoading, router]);

  async function fetchData() {
    try {
      const [lessonsRes, filesRes] = await Promise.all([
        supabase.from('lessons').select('id, lesson_number, title, part').order('lesson_number'),
        fetch('/api/admin/storage'),
      ]);

      setLessons(lessonsRes.data || []);

      if (filesRes.ok) {
        const filesData = await filesRes.json();
        setUploadedFiles(filesData.files || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }

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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, [selectedLesson]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  async function handleFiles(files: File[]) {
    if (!selectedLesson) {
      setErrorMessage('Please select a lesson first');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setUploading(true);
    setErrorMessage('');

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('lessonId', selectedLesson.toString());
        formData.append('fileName', file.name);

        const response = await fetch('/api/admin/storage', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Upload failed');
        }
      }

      setSuccessMessage(`Successfully uploaded ${files.length} file(s)`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload files');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setUploading(false);
    }
  }

  async function linkToLesson(publicUrl: string, lessonId: number) {
    try {
      const lesson = lessons.find(l => l.id === lessonId);
      if (!lesson) return;

      const fileName = `Interactive Practice - Lesson ${lesson.lesson_number}${lesson.part || ''}`;

      const { error } = await supabase.from('lesson_files').insert({
        lesson_id: lessonId,
        file_type: 'interactive_practice',
        file_name: fileName,
        file_url: publicUrl,
      });

      if (error) throw error;

      setSuccessMessage('File linked to lesson successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to link file');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  }

  async function deleteFile(filePath: string) {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch('/api/admin/storage', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Delete failed');
      }

      setSuccessMessage('File deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete file');
      setTimeout(() => setErrorMessage(''), 5000);
    }
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
            <h1 className="text-2xl font-extrabold text-[var(--wrife-text-main)] mt-2">Practice Activity Files</h1>
            <p className="text-sm text-[var(--wrife-text-muted)] mt-1">
              Upload HTML practice activities for interactive lessons
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
            <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-4">Upload New File</h2>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
                Select Lesson
              </label>
              <select
                value={selectedLesson}
                onChange={(e) => setSelectedLesson(e.target.value ? parseInt(e.target.value) : '')}
                className="w-full max-w-md px-4 py-2 rounded-lg border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
              >
                <option value="">Choose a lesson...</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    Lesson {lesson.lesson_number}{lesson.part || ''}: {lesson.title}
                  </option>
                ))}
              </select>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                dragActive
                  ? 'border-[var(--wrife-blue)] bg-[var(--wrife-blue-soft)]'
                  : 'border-[var(--wrife-border)] hover:border-[var(--wrife-blue)]'
              }`}
            >
              {uploading ? (
                <div className="flex flex-col items-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--wrife-blue)] border-r-transparent mb-3"></div>
                  <p className="text-[var(--wrife-text-muted)]">Uploading...</p>
                </div>
              ) : (
                <>
                  <div className="text-4xl mb-3">📁</div>
                  <p className="text-[var(--wrife-text-main)] font-semibold mb-2">
                    Drag and drop HTML files here
                  </p>
                  <p className="text-sm text-[var(--wrife-text-muted)] mb-4">
                    or click to browse
                  </p>
                  <label className="inline-block">
                    <input
                      type="file"
                      accept=".html,.htm,.css,.js"
                      multiple
                      onChange={handleFileInput}
                      className="hidden"
                      disabled={!selectedLesson}
                    />
                    <span className={`inline-block rounded-full px-6 py-2 text-sm font-semibold cursor-pointer transition ${
                      selectedLesson
                        ? 'bg-[var(--wrife-blue)] text-white hover:opacity-90'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}>
                      Choose Files
                    </span>
                  </label>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6">
            <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-4">Uploaded Files</h2>

            {uploadedFiles.length === 0 ? (
              <p className="text-[var(--wrife-text-muted)] text-center py-8">
                No files uploaded yet. Upload your first practice activity above.
              </p>
            ) : (
              <div className="space-y-4">
                {uploadedFiles.map((file) => (
                  <div key={file.name} className="border border-[var(--wrife-border)] rounded-lg p-4">
                    {file.isFolder ? (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xl">📂</span>
                          <span className="font-semibold text-[var(--wrife-text-main)]">{file.name}</span>
                        </div>
                        {file.subFiles && file.subFiles.length > 0 && (
                          <div className="ml-6 space-y-2">
                            {file.subFiles.map((subFile) => (
                              <div key={subFile.name} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">📄</span>
                                  <span className="text-sm text-[var(--wrife-text-main)]">{subFile.name}</span>
                                </div>
                                <div className="flex gap-2">
                                  <a
                                    href={subFile.publicUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-[var(--wrife-blue)] hover:underline"
                                  >
                                    Preview
                                  </a>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(subFile.publicUrl);
                                      setSuccessMessage('URL copied to clipboard!');
                                      setTimeout(() => setSuccessMessage(''), 2000);
                                    }}
                                    className="text-xs text-[var(--wrife-blue)] hover:underline"
                                  >
                                    Copy URL
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">📄</span>
                          <span className="font-semibold text-[var(--wrife-text-main)]">{file.name}</span>
                        </div>
                        <div className="flex gap-2">
                          {file.publicUrl && (
                            <>
                              <a
                                href={file.publicUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full border border-[var(--wrife-blue)] px-4 py-1.5 text-xs font-semibold text-[var(--wrife-blue)] hover:bg-[var(--wrife-blue-soft)] transition"
                              >
                                Preview
                              </a>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(file.publicUrl!);
                                  setSuccessMessage('URL copied to clipboard!');
                                  setTimeout(() => setSuccessMessage(''), 2000);
                                }}
                                className="rounded-full border border-[var(--wrife-blue)] px-4 py-1.5 text-xs font-semibold text-[var(--wrife-blue)] hover:bg-[var(--wrife-blue-soft)] transition"
                              >
                                Copy URL
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => deleteFile(file.name)}
                            className="rounded-full border border-red-300 px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 bg-[var(--wrife-blue-soft)] rounded-2xl p-6">
            <h3 className="font-bold text-[var(--wrife-text-main)] mb-2">How to use uploaded files</h3>
            <ol className="list-decimal list-inside text-sm text-[var(--wrife-text-muted)] space-y-2">
              <li>Upload your HTML practice activity file by selecting a lesson and dropping the file above</li>
              <li>Copy the public URL of the uploaded file</li>
              <li>Go to the Lesson Management page and add a new "Interactive Practice" file entry with this URL</li>
              <li>Pupils will see the interactive practice button on their assignment page</li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
