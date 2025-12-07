import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { LessonDetailPage } from '@/components/LessonDetailPage';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lessonId = parseInt(id, 10);

  if (isNaN(lessonId)) {
    notFound();
  }

  const { data: lessons, error: lessonError } = await supabase
    .from('lessons')
    .select('*')
    .eq('lesson_number', lessonId)
    .order('part', { ascending: true });

  if (lessonError || !lessons || lessons.length === 0) {
    notFound();
  }

  const lesson = lessons[0];

  const { data: files, error: filesError } = await supabase
    .from('lesson_files')
    .select('id, file_type, file_name, file_url')
    .eq('lesson_id', lesson.id)
    .order('file_type');

  return <LessonDetailPage lesson={lesson} files={files || []} />;
}
