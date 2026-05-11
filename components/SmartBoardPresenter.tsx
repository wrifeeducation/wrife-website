'use client';

/**
 * SmartBoardPresenter
 * Full-viewport, no-chrome presentation player for smart boards.
 * If a lesson has multiple presentations (e.g. Lesson 66 mini-lessons),
 * shows a tabbed selector at the top.
 * QR code panel lets pupils scan to log in at wrife.co.uk/pupil/login.
 */

import { useState, useRef } from 'react';
import { resolvePresentationUrls } from '@/lib/presentationUtils';

const LOGIN_URL = 'https://wrife.co.uk/pupil/login';
const QR_API   = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&format=svg&data=${encodeURIComponent(LOGIN_URL)}&bgcolor=1a1a2e&color=ffffff&margin=6`;

interface PresentationFile {
  id: number;
  file_type: string;
  file_name: string;
  file_url: string;
}

interface SmartBoardPresenterProps {
  presentations: PresentationFile[];
  lessonLabel: string | number;
  lessonTitle: string;
}

export function SmartBoardPresenter({ presentations, lessonLabel, lessonTitle }: SmartBoardPresenterProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const active = presentations[activeIndex];
  const resolved = resolvePresentationUrls(active.file_url);

  const handleSelect = (idx: number) => {
    setActiveIndex(idx);
    setLoading(true);
    setError(false);
  };

  const openFullscreen = () => {
    window.open(resolved.presentUrl, '_blank', 'noopener,noreferrer');
  };

  const goBack = () => {
    window.history.back();
  };

  // Shorten display name: remove leading L##_ prefix and .pptx suffix
  const shortName = (name: string) =>
    name.replace(/^L\d+[a-z]?_?/i, '').replace(/\.pptx$/i, '').replace(/_/g, ' ');

  return (
    <div className="fixed inset-0 flex flex-col bg-black" style={{ fontFamily: 'var(--font-geist-sans, sans-serif)' }}>

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2 bg-[#0f0f1e] border-b border-white/10 flex-shrink-0">

        {/* Back button */}
        <button
          onClick={goBack}
          title="Back to lesson"
          className="flex items-center gap-1.5 text-white/60 hover:text-white transition text-sm flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="hidden sm:inline text-xs">Back</span>
        </button>

        {/* Lesson badge */}
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--wrife-blue,#6C5CE7)] text-white text-xs font-bold flex-shrink-0">
          {lessonLabel}
        </div>

        {/* Lesson title */}
        <span className="text-white/80 text-sm font-semibold truncate flex-1 min-w-0">
          {lessonTitle}
        </span>

        {/* Multi-presentation tabs (Lesson 66 mini-lessons etc.) */}
        {presentations.length > 1 && (
          <div className="hidden md:flex items-center gap-1 overflow-x-auto flex-shrink-0">
            {presentations.map((p, i) => (
              <button
                key={p.id}
                onClick={() => handleSelect(i)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  i === activeIndex
                    ? 'bg-[var(--wrife-blue,#6C5CE7)] text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                }`}
              >
                {shortName(p.file_name) || `Part ${i + 1}`}
              </button>
            ))}
          </div>
        )}

        {/* Mobile: part selector dropdown */}
        {presentations.length > 1 && (
          <select
            value={activeIndex}
            onChange={e => handleSelect(Number(e.target.value))}
            className="md:hidden bg-white/10 text-white text-xs rounded-lg px-2 py-1 border border-white/20 outline-none flex-shrink-0"
          >
            {presentations.map((p, i) => (
              <option key={p.id} value={i} className="bg-[#1a1a2e] text-white">
                {shortName(p.file_name) || `Part ${i + 1}`}
              </option>
            ))}
          </select>
        )}

        {/* Fullscreen button */}
        <button
          onClick={openFullscreen}
          title="Open in fullscreen present mode"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--wrife-blue,#6C5CE7)] hover:opacity-90 text-white text-xs font-semibold transition flex-shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
          </svg>
          <span className="hidden sm:inline">Present</span>
        </button>

        {/* QR code toggle */}
        <button
          onClick={() => setShowQr(q => !q)}
          title="Show QR code — pupils scan to log in"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex-shrink-0 ${
            showQr
              ? 'bg-white text-[#0f0f1e]'
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          {/* QR icon */}
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <path strokeLinecap="round" d="M14 14h3m0 0v3m0-3h3m-3 3v3m0 0h3" />
          </svg>
          <span className="hidden sm:inline">QR</span>
        </button>
      </div>

      {/* ── QR code panel (bottom-right corner overlay) ─────────────────── */}
      {showQr && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1a1a2e] border border-white/20 rounded-2xl p-4 shadow-2xl flex flex-col items-center gap-3 w-56">
          {/* Close button */}
          <button
            onClick={() => setShowQr(false)}
            className="absolute top-2 right-2 text-white/40 hover:text-white transition"
            title="Close QR panel"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Heading */}
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wide pt-1">Scan to log in</p>

          {/* QR image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={QR_API}
            alt={`QR code for ${LOGIN_URL}`}
            width={160}
            height={160}
            className="rounded-xl"
          />

          {/* URL text */}
          <p className="text-white/50 text-[10px] text-center leading-relaxed">
            {LOGIN_URL}
          </p>
        </div>
      )}

      {/* ── Iframe ──────────────────────────────────────────────────────── */}
      <div className="relative flex-1 min-h-0 bg-[#07071a]">
        {loading && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/50">
            <div className="w-10 h-10 border-4 border-[var(--wrife-blue,#6C5CE7)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Loading slides…</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/70 px-6 text-center">
            <span className="text-5xl">⚠️</span>
            <p className="text-base font-semibold text-white">Unable to load the presentation in-browser</p>
            <p className="text-sm max-w-sm text-white/60">
              The file may not be publicly accessible, or the viewer is temporarily unavailable.
              Try opening it directly.
            </p>
            <button
              onClick={openFullscreen}
              className="mt-2 px-5 py-2.5 bg-[var(--wrife-blue,#6C5CE7)] text-white rounded-full text-sm font-semibold hover:opacity-90 transition"
            >
              Open in New Tab
            </button>
          </div>
        )}

        <iframe
          ref={iframeRef}
          key={active.id} // remount when switching presentations
          src={resolved.embedUrl}
          className={`w-full h-full border-0 transition-opacity duration-300 ${loading || error ? 'opacity-0' : 'opacity-100'}`}
          title={active.file_name}
          allow="fullscreen"
          allowFullScreen
          onLoad={() => setLoading(false)}
          onError={() => { setLoading(false); setError(true); }}
        />
      </div>
    </div>
  );
}
