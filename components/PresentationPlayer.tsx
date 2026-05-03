'use client';

import { useEffect, useRef, useState } from 'react';
import { resolvePresentationUrls } from '@/lib/presentationUtils';

interface PresentationPlayerProps {
  /** Public URL of the presentation (Google Drive or Supabase .pptx) */
  fileUrl: string;
  /** Display name shown in the header */
  fileName: string;
  /** Lesson number / label e.g. "1" or "27a" */
  lessonLabel: string | number;
  /** Called when the player is closed */
  onClose: () => void;
}

export function PresentationPlayer({ fileUrl, fileName, lessonLabel, onClose }: PresentationPlayerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const resolved = resolvePresentationUrls(fileUrl);

  // Close on ESC key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const openFullscreen = () => {
    window.open(resolved.presentUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black"
      role="dialog"
      aria-modal="true"
      aria-label={`Presenting: ${fileName}`}
    >
      {/* ── Header bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a2e] border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--wrife-blue)] text-white text-sm font-bold flex-shrink-0">
            L{lessonLabel}
          </div>
          <span className="text-white font-semibold text-sm truncate">{fileName}</span>
          {resolved.type === 'pptx_office_online' && (
            <span className="hidden sm:inline-block text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full">
              Office Online
            </span>
          )}
          {resolved.type === 'google_drive' && (
            <span className="hidden sm:inline-block text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full">
              Google Slides
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Open in true fullscreen / present mode */}
          <button
            onClick={openFullscreen}
            title="Open in fullscreen present mode (new tab)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--wrife-blue)] hover:opacity-90 text-white text-xs font-semibold transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
            <span className="hidden sm:inline">Fullscreen</span>
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            title="Close (Esc)"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── iframe ──────────────────────────────────────────────────────── */}
      <div className="relative flex-1 min-h-0 bg-[#0d0d1a]">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/70">
            <div className="w-10 h-10 border-4 border-[var(--wrife-blue)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Loading presentation…</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/70 px-6 text-center">
            <span className="text-5xl">⚠️</span>
            <p className="text-base font-semibold text-white">Could not load the presentation</p>
            <p className="text-sm max-w-sm">
              This can happen if the file isn't publicly shared, or if pop-ups are blocked.
              Try opening it in a new tab instead.
            </p>
            <button
              onClick={openFullscreen}
              className="mt-2 px-5 py-2.5 bg-[var(--wrife-blue)] text-white rounded-full text-sm font-semibold hover:opacity-90 transition"
            >
              Open in New Tab
            </button>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={resolved.embedUrl}
          className={`w-full h-full border-0 transition-opacity duration-300 ${loading || error ? 'opacity-0' : 'opacity-100'}`}
          title={fileName}
          allow="fullscreen"
          allowFullScreen
          onLoad={() => setLoading(false)}
          onError={() => { setLoading(false); setError(true); }}
        />
      </div>

      {/* ── Footer hint ─────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-4 py-2 bg-[#1a1a2e] border-t border-white/10 text-center">
        <p className="text-xs text-white/40">
          Press <kbd className="px-1 py-0.5 rounded bg-white/10 text-white/60 font-mono text-xs">Esc</kbd> to close
          &nbsp;·&nbsp;
          Use arrow keys or click to advance slides
        </p>
      </div>
    </div>
  );
}
