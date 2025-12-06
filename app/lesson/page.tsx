"use client";

import Navbar from "../../components/Navbar";
import LessonDetailPage from "../../components/LessonDetailPage";

export default function LessonDemo() {
  return (
    <div suppressHydrationWarning>
      <Navbar />
      <LessonDetailPage
        lessonNumber="27a"
        title="What is a paragraph?"
        summary="Understand the structure and purpose of paragraphs, learning how to organize ideas into coherent units that improve readability and help readers follow your writing more easily."
        chapter={2}
        unit={9}
        duration="45-50 minutes"
        yearGroups="3-4"
      />
    </div>
  );
}
