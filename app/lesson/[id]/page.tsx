import { supabase } from "../../../lib/supabase";
import Navbar from "../../../components/Navbar";
import LessonDetailPage from "../../../components/LessonDetailPage";
import { notFound } from "next/navigation";

interface Lesson {
  id: number;
  lesson_number: number;
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
  const lessonNumber = parseInt(id, 10);

  if (isNaN(lessonNumber)) {
    notFound();
  }

  const { data: lessons, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("lesson_number", lessonNumber)
    .order("part", { ascending: true });

  if (error || !lessons || lessons.length === 0) {
    notFound();
  }

  const lesson = lessons[0] as Lesson;

  const formattedNumber =
    lesson.has_parts && lesson.part
      ? `${lesson.lesson_number}${lesson.part}`
      : `${lesson.lesson_number}`;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--wrife-bg)" }}>
      <Navbar />
      <LessonDetailPage
        lessonNumber={formattedNumber}
        title={lesson.title}
        summary={lesson.summary || "No summary available"}
        chapter={lesson.chapter}
        unit={lesson.unit}
        duration={
          lesson.duration_minutes
            ? `${lesson.duration_minutes} minutes`
            : "Duration not specified"
        }
        yearGroups={lesson.year_groups || "Not specified"}
      />
    </div>
  );
}
