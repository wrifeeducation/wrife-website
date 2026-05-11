/**
 * Smart-board presentation page for a lesson.
 * Opens full-viewport, no navbar, no chrome — just the slides.
 * Accessed via /lesson/[id]/present
 *
 * If no presentation files are attached to the lesson, shows a graceful
 * board-friendly fallback (lesson title + back link) instead of a 404.
 */
import { notFound } from 'next/navigation';
import { getPool } from '@/lib/db';
import { SmartBoardPresenter } from '@/components/SmartBoardPresenter';

export default async function PresentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lessonId = parseInt(id, 10);

  if (isNaN(lessonId)) notFound();

  const pool = getPool();

  const lessonResult = await pool.query(
    `SELECT id, lesson_number, part, title FROM lessons WHERE id = $1`,
    [lessonId]
  );

  if (lessonResult.rows.length === 0) notFound();

  const lesson = lessonResult.rows[0];

  // Fetch all presentation-type files for this lesson
  const filesResult = await pool.query(
    `SELECT id, file_type, file_name, file_url
     FROM lesson_files
     WHERE lesson_id = $1
       AND file_type IN ('presentation', 'pptx')
     ORDER BY file_name`,
    [lessonId]
  );

  const presentations = filesResult.rows;

  const lessonLabel = lesson.part
    ? `${lesson.lesson_number}${lesson.part}`
    : lesson.lesson_number;

  // Graceful fallback when no presentation files are attached
  if (presentations.length === 0) {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center gap-8 bg-[#0f0f1e] text-white px-6"
        style={{ fontFamily: 'var(--font-geist-sans, sans-serif)' }}
      >
        {/* Lesson number badge */}
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--wrife-blue,#6C5CE7)] text-4xl font-bold shadow-lg shadow-[#6C5CE7]/30">
          {lessonLabel}
        </div>

        {/* Lesson title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-white/90 text-center max-w-2xl leading-snug">
          {lesson.title}
        </h1>

        {/* Notice */}
        <p className="text-white/40 text-sm text-center max-w-xs">
          No presentation file has been attached to this lesson yet.
        </p>

        {/* Back link */}
        <a
          href={`/lesson/${lessonId}`}
          className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 transition text-sm font-semibold text-white/80 hover:text-white"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to lesson
        </a>
      </div>
    );
  }

  return (
    <SmartBoardPresenter
      presentations={presentations}
      lessonLabel={lessonLabel}
      lessonTitle={lesson.title}
    />
  );
}
