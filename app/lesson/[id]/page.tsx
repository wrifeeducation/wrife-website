import { supabase } from "../../../lib/supabase";
import Navbar from "../../../components/Navbar";
import LessonDetailPage from "../../../components/LessonDetailPage";
import { notFound } from "next/navigation";

interface Lesson {
  id: number;
  title: string;
  has_parts: boolean;
  part: string | null;
  chapter: number;
  unit: number;
  summary: string | null;
  duration_minutes: number | null;
  year_groups: string | null;
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lessonId = parseInt(id, 10);

  if (isNaN(lessonId)) {
    notFound();
  }

  const { data: lesson, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  if (error || !lesson) {
    notFound();
  }

  const typedLesson = lesson as Lesson;

  const formattedNumber =
    typedLesson.has_parts && typedLesson.part
      ? `${typedLesson.id}${typedLesson.part}`
      : `${typedLesson.id}`;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--wrife-bg)" }}>
      <Navbar />
      <LessonDetailPage
        lessonNumber={formattedNumber}
        title={typedLesson.title}
        summary={typedLesson.summary || "No summary available"}
        chapter={typedLesson.chapter}
        unit={typedLesson.unit}
        duration={
          typedLesson.duration_minutes
            ? `${typedLesson.duration_minutes} minutes`
            : "Duration not specified"
        }
        yearGroups={typedLesson.year_groups || "Not specified"}
      />
    </div>
  );
}
