"use client";

import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import LessonCard from "../components/LessonCard";

const sampleLessons = [
  {
    lessonNumber: "1",
    title: "Developing Awareness of Personal Stories",
    summary:
      "Students learn to recognize the stories within their own lives, identifying meaningful moments that can become the foundation for personal narrative writing.",
    tags: ["Chapter 1", "Years 2-3", "Foundation"],
  },
  {
    lessonNumber: "2",
    title: "Finding Story Seeds in Everyday Life",
    summary:
      "Explore techniques for discovering writing inspiration in daily experiences, helping students build a collection of ideas for future writing projects.",
    tags: ["Chapter 1", "Years 2-3"],
  },
  {
    lessonNumber: "27a",
    title: "Introduction to Descriptive Language",
    summary:
      "Learn to use sensory details and vivid vocabulary to bring writing to life, making stories more engaging and immersive for readers.",
    tags: ["Chapter 3", "Years 3-4", "Advanced"],
  },
];

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--wrife-bg)" }}>
      <Navbar />
      <HeroSection />

      <section className="w-full px-4 md:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-2xl md:text-3xl font-bold mb-8"
            style={{ color: "var(--wrife-text-main)" }}
          >
            Sample Lessons
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleLessons.map((lesson) => (
              <LessonCard
                key={lesson.lessonNumber}
                lessonNumber={lesson.lessonNumber}
                title={lesson.title}
                summary={lesson.summary}
                tags={lesson.tags}
                onOpen={() => alert(`Opening lesson ${lesson.lessonNumber}`)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
