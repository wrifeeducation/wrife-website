'use client';

import React, { useState, useMemo } from 'react';
import { AssignLessonModal } from './AssignLessonModal';
import { PresentationPlayer } from './PresentationPlayer';
import { useAuth } from '@/lib/auth-context';
import { isHtmlFile, getProxiedHtmlUrl } from '@/lib/fileUrlHelper';
import { getEntitlements, isFileTypeAllowed, getUpgradeMessage, TIER_DISPLAY_NAMES, type MembershipTier } from '@/lib/entitlements';
import { getPrimaryPresentation } from '@/lib/presentationUtils';

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
  resource: 'Resources',
};

const fileTypeOrder = [
  'teacher_guide',
  'presentation',
  'interactive_practice',
  'worksheet',
  'progress_tracker',
  'assessment',
  'resource',
];

const STANDARD_FILE_TYPES = new Set([
  'teacher_guide', 'presentation', 'interactive_practice',
  'worksheet', 'worksheet_core', 'worksheet_support', 'worksheet_challenge',
  'progress_tracker', 'assessment',
]);

export function LessonDetailPage({ lesson, files }: LessonDetailPageProps) {
  const [activeTab, setActiveTab] = useState(fileTypeOrder[0]);
  const [htmlContent, setHtmlContent] = useState<Record<number, string>>({});
  const [loadingHtml, setLoadingHtml] = useState<Record<number, boolean>>({});
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPresenter, setShowPresenter] = useState(false);
  const [presenterFile, setPresenterFile] = useState<{ file_url: string; file_name: string } | null>(null);
  const { user } = useAuth();

  const entitlements = useMemo(() => {
    return getEntitlements(user?.membership_tier, user?.school_tier);
  }, [user?.membership_tier, user?.school_tier]);

  const filesByType = files.reduce((acc, file) => {
    const baseType = file.file_type.replace(/_core|_support|_challenge/g, '');
    // Any file type not in the standard set goes into the Resources tab
    const bucket = STANDARD_FILE_TYPES.has(file.file_type) ? baseType : 'resource';
    if (!acc[bucket]) acc[bucket] = [];
    acc[bucket].push(file);
    return acc;
  }, {} as Record<string, LessonFile[]>);

  const isTabLocked = (tabType: string): boolean => {
    if (tabType === 'resource') return false; // Resources always free
    if (tabType === 'worksheet') {
      return !entitlements.allowedFileTypes.includes('worksheet_core');
    }
    return !entitlements.allowedFileTypes.includes(tabType);
  };

  const isFileLocked = (file: LessonFile): boolean => {
    return !isFileTypeAllowed(file.file_type, entitlements);
  };

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
              {entitlements.canAssignWork ? (
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-[var(--wrife-yellow)] hover:bg-[var(--wrife-yellow)]/90 text-[var(--wrife-text-main)] rounded-full font-semibold shadow-soft transition w-full sm:w-auto justify-center sm:justify-start"
                >
                  <span>📋</span>
                  Assign to Class
                </button>
              ) : (
                <a
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-500 rounded-full font-semibold w-full sm:w-auto justify-center sm:justify-start hover:bg-gray-300 transition"
                >
                  <span>🔒</span>
                  Assign to Class
                  <span className="text-xs ml-2">(Upgrade to Full)</span>
                </a>
              )}
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
            {fileTypeOrder.filter(type => type !== 'resource' || (filesByType['resource']?.length ?? 0) > 0).map((type) => {
              const locked = isTabLocked(type);
              return (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={`py-4 text-sm font-semibold border-b-2 transition flex items-center gap-1 ${
                    activeTab === type
                      ? 'border-[var(--wrife-blue)] text-[var(--wrife-blue)]'
                      : locked
                      ? 'border-transparent text-[var(--wrife-text-muted)]/50'
                      : 'border-transparent text-[var(--wrife-text-muted)] hover:text-[var(--wrife-blue)]'
                  }`}
                >
                  {fileTypeLabels[type]}
                  {locked && <span className="text-xs">🔒</span>}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {isTabLocked(activeTab) && (
          <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-[var(--wrife-yellow)]/20 to-[var(--wrife-blue-soft)] border border-[var(--wrife-yellow)]">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔒</span>
              <div className="flex-1">
                <p className="font-semibold text-[var(--wrife-text-main)]">
                  Premium Content
                </p>
                <p className="text-sm text-[var(--wrife-text-muted)]">
                  {getUpgradeMessage(entitlements.tier)}
                </p>
              </div>
              <a
                href="/pricing"
                className="px-4 py-2 bg-[var(--wrife-blue)] text-white rounded-full text-sm font-semibold hover:opacity-90 transition"
              >
                Upgrade
              </a>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white p-6 shadow-soft border border-[var(--wrife-border)]">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">
              {fileTypeLabels[activeTab]}
            </h2>

            {/* Smart-board launch button — only on Presentation tab */}
            {activeTab === 'presentation' && !isTabLocked('presentation') && filesByType['presentation']?.length > 0 && (
              <a
                href={`/lesson/${lesson.id}/present`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--wrife-blue)] hover:opacity-90 text-white rounded-full text-sm font-semibold shadow-soft transition"
                title="Open full-screen on smart board"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Launch on Smart Board
              </a>
            )}
          </div>

          {filesByType[activeTab] ? (
            <div className="space-y-3">
              {filesByType[activeTab].map((file) => {
                const fileIsHtml = isHtmlFile(file.file_url, file.file_type);
                const locked = isFileLocked(file);
                const isPresentation = file.file_type === 'presentation' || file.file_type === 'pptx';

                return (
                  <div key={file.id}>
                    <div className={`flex items-center justify-between p-4 rounded-lg border transition ${
                      locked
                        ? 'border-[var(--wrife-border)] bg-gray-50 opacity-75'
                        : 'border-[var(--wrife-border)] hover:bg-[var(--wrife-bg)]'
                    }`}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--wrife-text-main)] truncate flex items-center gap-2">
                          {isPresentation && !locked && <span title="Presentation">🖥️</span>}
                          {file.file_name}
                          {locked && <span className="text-xs">🔒</span>}
                        </p>
                        <p className="text-xs text-[var(--wrife-text-muted)] mt-1">
                          {file.file_type.includes('worksheet') &&
                            file.file_type.replace('worksheet_', '').toUpperCase()}
                          {isPresentation && !locked && 'Click "Present" to open on smart board'}
                          {locked && ' - Upgrade to access'}
                        </p>
                      </div>

                      <div className="flex gap-2 ml-4 flex-wrap justify-end">
                        {locked ? (
                          <span className="rounded-full bg-gray-300 px-4 py-2 text-xs font-semibold text-gray-500 cursor-not-allowed">
                            Locked
                          </span>
                        ) : isPresentation ? (
                          <>
                            {/* In-page player */}
                            <button
                              onClick={() => { setPresenterFile(file); setShowPresenter(true); }}
                              className="rounded-full bg-[var(--wrife-blue)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition"
                            >
                              🖥️ Present
                            </button>
                            <a
                              href={file.file_url}
                              download
                              className="rounded-full border border-[var(--wrife-blue)] px-4 py-2 text-xs font-semibold text-[var(--wrife-blue)] hover:bg-[var(--wrife-blue-soft)] transition"
                            >
                              Download
                            </a>
                          </>
                        ) : fileIsHtml ? (
                          <button
                            onClick={() => loadHtmlFile(file.id, file.file_url)}
                            className="rounded-full bg-[var(--wrife-blue)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition"
                          >
                            {loadingHtml[file.id] ? 'Loading...' : 'View Content'}
                          </button>
                        ) : (
                          <>
                            <a
                              href={file.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-full bg-[var(--wrife-blue)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition"
                            >
                              View
                            </a>
                            <a
                              href={file.file_url}
                              download
                              className="rounded-full border border-[var(--wrife-blue)] px-4 py-2 text-xs font-semibold text-[var(--wrife-blue)] hover:bg-[var(--wrife-blue-soft)] transition"
                            >
                              Download
                            </a>
                          </>
                        )}
                      </div>
                    </div>

                    {!locked && fileIsHtml && htmlContent[file.id] && (
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

        {/* Inline presentation player modal */}
        {showPresenter && presenterFile && (
          <PresentationPlayer
            fileUrl={presenterFile.file_url}
            fileName={presenterFile.file_name}
            lessonLabel={lessonNumber}
            onClose={() => { setShowPresenter(false); setPresenterFile(null); }}
          />
        )}
      </div>
    </div>
  );
}
