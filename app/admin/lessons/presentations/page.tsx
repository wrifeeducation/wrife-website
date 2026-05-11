'use client';

/**
 * Admin: Lesson Presentation Management
 * Shows all 68 lessons with their presentation status.
 * Allows uploading a new .pptx, linking a Google Drive URL, or replacing existing.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { adminFetch } from '@/lib/admin-fetch';
import { resolvePresentationUrls } from '@/lib/presentationUtils';

interface Lesson {
  id: number;
  lesson_number: number;
  part: string | null;
  title: string;
  presentation?: {
    file_name: string;
    file_url: string;
    file_type: string;
  } | null;
}

export default function AdminPresentationsPage() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<number | null>(null);
  const [linking, setLinking] = useState<number | null>(null);
  const [linkUrls, setLinkUrls] = useState<Record<number, string>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [filter, setFilter] = useState<'all' | 'missing' | 'present'>('all');

  const loadLessons = useCallback(async () => {
    setLoading(true);
    try {
      const [lessonsRes, filesRes] = await Promise.all([
        fetch('/api/lessons'),
        adminFetch('/api/admin/lesson-files'),
      ]);

      const lessonsData = await lessonsRes.json();
      const filesData = await filesRes.json();

      // Build lesson_id → presentation map
      const presentationMap: Record<number, Lesson['presentation']> = {};
      if (filesData.filesByLesson) {
        for (const [lessonId, fileList] of Object.entries(filesData.filesByLesson)) {
          const files = fileList as any[];
          const pres = files.find(
            f => f.fileType === 'presentation' || f.fileType === 'pptx'
          );
          if (pres) {
            presentationMap[Number(lessonId)] = {
              file_name: pres.name,
              file_url: pres.publicUrl,
              file_type: pres.fileType,
            };
          }
        }
      }

      const enriched: Lesson[] = (lessonsData.lessons || []).map((l: any) => ({
        id: l.id,
        lesson_number: l.lesson_number,
        part: l.part,
        title: l.title,
        presentation: presentationMap[l.id] || null,
      }));

      setLessons(enriched);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load lessons.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadLessons(); }, [loadLessons]);

  const uploadPresentation = async (lessonId: number, file: File) => {
    setUploading(lessonId);
    setMessage(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('lessonId', String(lessonId));
      form.append('fileCategory', 'presentation');

      // Use adminFetch but override Content-Type so FormData boundary is set correctly
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/lesson-files', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setMessage({ type: 'success', text: `Uploaded successfully for Lesson ${lessonId}` });
      await loadLessons();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setUploading(null);
    }
  };

  const linkPresentation = async (lessonId: number) => {
    const url = linkUrls[lessonId]?.trim();
    if (!url) return;
    setLinking(lessonId);
    setMessage(null);
    try {
      const res = await adminFetch('/api/admin/lesson-files', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          fileUrl: url,
          fileName: `L${lessonId}_Presentation`,
          fileType: 'presentation',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Link failed');
      setMessage({ type: 'success', text: `Linked presentation for Lesson ${lessonId}` });
      setLinkUrls(prev => ({ ...prev, [lessonId]: '' }));
      await loadLessons();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLinking(null);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--wrife-text-muted)]">Admin access required.</p>
      </div>
    );
  }

  const filteredLessons = lessons.filter(l => {
    if (filter === 'missing') return !l.presentation;
    if (filter === 'present') return !!l.presentation;
    return true;
  });

  const missingCount = lessons.filter(l => !l.presentation).length;
  const presentCount = lessons.filter(l => !!l.presentation).length;

  return (
    <div className="min-h-screen bg-[var(--wrife-bg)]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <a href="/admin/lessons" className="text-sm text-[var(--wrife-blue)] hover:underline mb-4 inline-block">
            ← Back to Lessons
          </a>
          <h1 className="text-2xl font-extrabold text-[var(--wrife-text-main)] mb-2">
            Lesson Presentations
          </h1>
          <p className="text-[var(--wrife-text-muted)] text-sm mb-4">
            Manage presentation files for all 68 lessons. Upload .pptx files or link Google Drive URLs.
          </p>

          {/* Stats */}
          <div className="flex gap-4 flex-wrap mb-4">
            <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-2 text-sm">
              <span className="font-bold text-green-700">{presentCount}</span>
              <span className="text-green-600 ml-1">with presentation</span>
            </div>
            <div className="rounded-xl bg-orange-50 border border-orange-200 px-4 py-2 text-sm">
              <span className="font-bold text-orange-700">{missingCount}</span>
              <span className="text-orange-600 ml-1">missing</span>
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            {(['all', 'present', 'missing'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition capitalize ${
                  filter === f
                    ? 'bg-[var(--wrife-blue)] text-white'
                    : 'bg-white border border-[var(--wrife-border)] text-[var(--wrife-text-muted)] hover:border-[var(--wrife-blue)]'
                }`}
              >
                {f === 'all' ? `All (${lessons.length})` : f === 'present' ? `✅ Present (${presentCount})` : `❌ Missing (${missingCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[var(--wrife-blue)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLessons.map(lesson => {
              const label = lesson.part
                ? `${lesson.lesson_number}${lesson.part}`
                : lesson.lesson_number;
              const hasPres = !!lesson.presentation;
              const presUrls = hasPres ? resolvePresentationUrls(lesson.presentation!.file_url) : null;

              return (
                <div
                  key={lesson.id}
                  className={`rounded-xl bg-white border p-4 shadow-soft transition ${
                    hasPres ? 'border-green-200' : 'border-orange-200'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-wrap">
                    {/* Lesson badge */}
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      hasPres
                        ? 'bg-[var(--wrife-blue-soft)] text-[var(--wrife-blue)]'
                        : 'bg-orange-100 text-orange-600'
                    }`}>
                      L{label}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--wrife-text-main)] truncate">
                        {lesson.title}
                      </p>

                      {hasPres ? (
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-green-600 font-medium">✅ {lesson.presentation!.file_name}</span>
                          <span className="text-xs text-[var(--wrife-text-muted)] bg-gray-100 px-2 py-0.5 rounded-full">
                            {presUrls?.type === 'google_drive' ? 'Google Drive' : 'Supabase .pptx'}
                          </span>
                          {/* Quick actions */}
                          <a
                            href={`/lesson/${lesson.id}/present`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[var(--wrife-blue)] hover:underline"
                          >
                            Preview →
                          </a>
                        </div>
                      ) : (
                        <p className="text-xs text-orange-500 mt-1">No presentation file</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 min-w-[220px]">
                      {/* Upload .pptx */}
                      <label className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed text-xs font-medium cursor-pointer transition ${
                        uploading === lesson.id
                          ? 'border-gray-300 text-gray-400 cursor-wait'
                          : 'border-[var(--wrife-blue)]/40 text-[var(--wrife-blue)] hover:border-[var(--wrife-blue)] hover:bg-[var(--wrife-blue-soft)]'
                      }`}>
                        <input
                          type="file"
                          accept=".pptx,.ppt"
                          className="hidden"
                          disabled={uploading === lesson.id}
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) uploadPresentation(lesson.id, file);
                            e.target.value = '';
                          }}
                        />
                        {uploading === lesson.id ? '⏳ Uploading…' : (hasPres ? '🔄 Replace .pptx' : '⬆ Upload .pptx')}
                      </label>

                      {/* Link Google Drive URL */}
                      <div className="flex gap-1">
                        <input
                          type="url"
                          placeholder="Paste Google Drive URL…"
                          value={linkUrls[lesson.id] || ''}
                          onChange={e => setLinkUrls(prev => ({ ...prev, [lesson.id]: e.target.value }))}
                          className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-[var(--wrife-border)] focus:outline-none focus:border-[var(--wrife-blue)] min-w-0"
                        />
                        <button
                          onClick={() => linkPresentation(lesson.id)}
                          disabled={!linkUrls[lesson.id]?.trim() || linking === lesson.id}
                          className="px-3 py-1.5 rounded-lg bg-[var(--wrife-blue)] text-white text-xs font-semibold hover:opacity-90 transition disabled:opacity-40"
                        >
                          {linking === lesson.id ? '…' : 'Link'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
