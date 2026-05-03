/**
 * Smart-board presentation page for a lesson.
 * Opens full-viewport, no navbar, no chrome — just the slides.
 * Accessed via /lesson/[id]/present
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

  if (presentations.length === 0) {
    notFound();
  }

  const lessonLabel = lesson.part
    ? `${lesson.lesson_number}${lesson.part}`
    : lesson.lesson_number;

  return (
    <SmartBoardPresenter
      presentations={presentations}
      lessonLabel={lessonLabel}
      lessonTitle={lesson.title}
    />
  );
}
