'use client';

import React, { useState } from 'react';
import { AssignLessonModal } from './AssignLessonModal';
import { useAuth } from '@/lib/auth-context';
import { isHtmlFile, getProxiedHtmlUrl } from '@/lib/fileUrlHelper';

interface LessonFile {
  id: number;
  file_type: string;
  file_name: string;
  file_url: string;
}

interface LessonDetailPageProps {
  lesson: {
    id: number;
    lesson_number: number;
    part: string | null;
    title: string;
    summary: string;
    duration_minutes: number;
    year_group_min: number;
    year_group_max: number;
  };
  files: LessonFile[];
}

const fileTypeLabels: Record<string, string> = {
  teacher_guide: 'Teacher Guide',
  presentation: 'Lesson Presentation',
  interactive_practice: 'Practice Activities',
  worksheet: 'Worksheets',
  progress_tracker: 'Progress Tracker',
  assessment: 'Assessment',
};

const fileTypeOrder = [
  'teacher_guide',
  'presentation',
  'interactive_practice',
  'worksheet',
  'progress_tracker',
  'assessment',
];

export function LessonDetailPage({ lesson, files }: LessonDetailPageProps) {
  const [activeTab, setActiveTab] = useState(fileTypeOrder[0]);
  const [htmlContent, setHtmlContent] = useState<Record<number, string>>({});
  const [loadingHtml, setLoadingHtml] = useState<Record<number, boolean>>({});
  const [showAssignModal, setShowAssignModal] = useState(false);
  const { user } = useAuth();

  const filesByType = files.reduce((acc, file) => {
    const baseType = file.file_type.replace(/_core|_support|_challenge/g, '');
    if (!acc[baseType]) acc[baseType] = [];
    acc[baseType].push(file);
    return acc;
  }, {} as Record<string, LessonFile[]>);

  const lessonNumber = lesson.part 
    ? `${lesson.lesson_number}${lesson.part}` 
    : lesson.lesson_number;

  const loadHtmlFile = async (fileId: number, fileUrl: string) => {
    setLoadingHtml(prev => ({ ...prev, [fileId]: true }));
    try {
      const response = await fetch(`/api/fetch-html?url=${encodeURIComponent(fileUrl)}`);
      const html = await response.text();
      setHtmlContent(prev => ({ ...prev, [fileId]: html }));
    } catch (error) {
      console.error('Error loading HTML:', error);
      setHtmlContent(prev => ({ 
        ...prev, 
        [fileId]: '<p>Error loading content. Please try downloading instead.</p>' 
      }));
    } finally {
      setLoadingHtml(prev => ({ ...prev, [fileId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--wrife-bg)]">
      <div className="bg-white border-b border-[var(--wrife-border)]">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 items-center justify-center rounded-full bg-[var(--wrife-blue-soft)] text-2xl sm:text-3xl font-bold text-[var(--wrife-blue)]">
              L{lessonNumber}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--wrife-text-main)] mb-2">
                {lesson.title}
              </h1>
              <p className="text-sm text-[var(--wrife-text-muted)] mb-3">
                {lesson.summary}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-[var(--wrife-blue-soft)] px-3 py-1 text-xs font-semibold text-[var(--wrife-blue)]">
                  {lesson.duration_minutes} min
                </span>
                <span className="rounded-full bg-[var(--wrife-green)]/20 px-3 py-1 text-xs font-semibold text-[var(--wrife-green)]">
                  Years {lesson.year_group_min}-{lesson.year_group_max}
                </span>
              </div>
            </div>
          </div>
          
          {user && (user.role === 'teacher' || user.role === 'school_admin' || user.role === 'admin') && (
            <div className="mt-4 mb-2">
              <button
                onClick={() => setShowAssignModal(true)}
                className="inline-flex items-center gap-2 px-6 py-2 bg-[var(--wrife-yellow)] hover:bg-[var(--wrife-yellow)]/90 text-[var(--wrife-text-main)] rounded-full font-semibold shadow-soft transition w-full sm:w-auto justify-center sm:justify-start"
              >
                <span>📋</span>
                Assign to Class
              </button>
            </div>
          )}
        </div>
      </div>

      <AssignLessonModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        lessonId={lesson.id}
        lessonTitle={lesson.title}
      />

      <div className="bg-white border-b border-[var(--wrife-border)] overflow-x-auto">
        <div className="mx-auto max-w-6xl px-4">
          <nav className="flex gap-6 whitespace-nowrap">
            {fileTypeOrder.map((type) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`py-4 text-sm font-semibold border-b-2 transition ${
                  activeTab === type
                    ? 'border-[var(--wrife-blue)] text-[var(--wrife-blue)]'
                    : 'border-transparent text-[var(--wrife-text-muted)] hover:text-[var(--wrife-blue)]'
                }`}
              >
                {fileTypeLabels[type]}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="rounded-2xl bg-white p-6 shadow-soft border border-[var(--wrife-border)]">
          <h2 className="text-lg font-bold text-[var(--wrife-text-main)] mb-4">
            {fileTypeLabels[activeTab]}
          </h2>

          {filesByType[activeTab] ? (
            <div className="space-y-3">
              {filesByType[activeTab].map((file) => {
                const fileIsHtml = isHtmlFile(file.file_url, file.file_type);
                
                return (
                  <div key={file.id}>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--wrife-border)] hover:bg-[var(--wrife-bg)] transition">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--wrife-text-main)] truncate">
                          {file.file_name}
                        </p>
                        <p className="text-xs text-[var(--wrife-text-muted)] mt-1">
                          {file.file_type.includes('worksheet') && 
                            file.file_type.replace('worksheet_', '').toUpperCase()}
                        </p>
                      </div>

                      <div className="flex gap-2 ml-4">
                        {fileIsHtml ? (
                          <button
                            onClick={() => loadHtmlFile(file.id, file.file_url)}
                            className="rounded-full bg-[var(--wrife-blue)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition"
                          >
                            {loadingHtml[file.id] ? 'Loading...' : 'View Content'}
                          </button>
                        ) : (
                          <a
                            href={file.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-[var(--wrife-blue)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition"
                          >
                            View
                          </a>
                        )}
                        {!fileIsHtml && (
                          <a
                            href={file.file_url}
                            download
                            className="rounded-full border border-[var(--wrife-blue)] px-4 py-2 text-xs font-semibold text-[var(--wrife-blue)] hover:bg-[var(--wrife-blue-soft)] transition"
                          >
                            Download
                          </a>
                        )}
                      </div>
                    </div>

                    {fileIsHtml && htmlContent[file.id] && (
                      <div className="mt-3 p-6 rounded-lg border border-[var(--wrife-border)] bg-white">
                        <iframe
                          srcDoc={htmlContent[file.id]}
                          className="w-full min-h-[600px] border-0"
                          title={file.file_name}
                          sandbox="allow-same-origin allow-scripts"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-[var(--wrife-text-muted)]">
              No files available for this section yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
