import { notFound } from 'next/navigation';
import { Pool } from 'pg';
import { LessonDetailPage } from '@/components/LessonDetailPage';
import Navbar from '@/components/Navbar';
import LessonPageWrapper from '@/components/LessonPageWrapper';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lessonId = parseInt(id, 10);

  if (isNaN(lessonId)) {
    notFound();
  }

  // Query lesson by ID from PostgreSQL
  const lessonResult = await pool.query(
    `SELECT id, lesson_number, part, title, summary, duration_minutes, year_group_min, year_group_max 
     FROM lessons 
     WHERE id = $1`,
    [lessonId]
  );

  if (lessonResult.rows.length === 0) {
    notFound();
  }

  const lesson = lessonResult.rows[0];

  // Query lesson files from PostgreSQL
  const filesResult = await pool.query(
    `SELECT id, file_type, file_name, file_url 
     FROM lesson_files 
     WHERE lesson_id = $1 
     ORDER BY file_type`,
    [lesson.id]
  );

  return (
    <LessonPageWrapper>
      <Navbar />
      <LessonDetailPage lesson={lesson} files={filesResult.rows || []} />
    </LessonPageWrapper>
  );
}
