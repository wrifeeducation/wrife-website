"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Lesson {
  id: number;
  lesson_number: number;
  title: string;
  summary: string;
  chapter: number;
  year_group_min: number;
  year_group_max: number;
  duration_minutes: number;
}

const staticLessons: Lesson[] = [
  { id: 1, lesson_number: 1, title: "My Favourite Things", summary: "Introduce personal narrative writing through describing favourite items, people, and places.", chapter: 1, year_group_min: 2, year_group_max: 3, duration_minutes: 30 },
  { id: 2, lesson_number: 2, title: "A Day in My Life", summary: "Learn to structure a simple timeline narrative about daily routines and activities.", chapter: 1, year_group_min: 2, year_group_max: 3, duration_minutes: 35 },
  { id: 3, lesson_number: 3, title: "My Best Friend", summary: "Explore character description through writing about friends and important people.", chapter: 1, year_group_min: 2, year_group_max: 3, duration_minutes: 30 },
  { id: 4, lesson_number: 4, title: "The Magic Door", summary: "Introduction to imaginative writing with fantasy settings and creative story starters.", chapter: 2, year_group_min: 3, year_group_max: 4, duration_minutes: 40 },
  { id: 5, lesson_number: 5, title: "Lost in the Woods", summary: "Build suspense and tension through adventure narrative writing techniques.", chapter: 2, year_group_min: 3, year_group_max: 4, duration_minutes: 40 },
  { id: 6, lesson_number: 6, title: "The Dragon's Island", summary: "Create mythical creatures and fantastical worlds using vivid descriptive language.", chapter: 2, year_group_min: 3, year_group_max: 5, duration_minutes: 45 },
];

const chapterColors: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: 'bg-[var(--wrife-blue-soft)]', text: 'text-[var(--wrife-blue)]', border: 'border-[var(--wrife-blue)]' },
  2: { bg: 'bg-[var(--wrife-yellow-soft)]', text: 'text-[var(--wrife-orange)]', border: 'border-[var(--wrife-yellow)]' },
  3: { bg: 'bg-[var(--wrife-green-soft)]', text: 'text-[var(--wrife-green)]', border: 'border-[var(--wrife-green)]' },
  4: { bg: 'bg-[var(--wrife-coral)]/10', text: 'text-[var(--wrife-coral)]', border: 'border-[var(--wrife-coral)]' },
  5: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-300' },
  6: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-300' },
  7: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-300' },
};

export default function FeaturedLessons() {
  const [lessons, setLessons] = useState<Lesson[]>(staticLessons);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLessons() {
      try {
        const { data, error } = await supabase
          .from("lessons")
          .select("id, lesson_number, title, summary, chapter, year_group_min, year_group_max, duration_minutes")
          .order("lesson_number")
          .limit(6);

        if (!error && data && data.length > 0) {
          setLessons(data);
        }
      } catch (e) {
        console.log("Using static lesson data");
      } finally {
        setLoading(false);
      }
    }
    fetchLessons();
  }, []);

  return (
    <section id="lessons" className="w-full px-4 md:px-8 py-16 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--wrife-text-main)] mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Explore Our 67-Lesson Curriculum
          </h2>
          <p className="text-[var(--wrife-text-muted)] text-lg max-w-2xl mx-auto">
            A carefully structured progression from personal stories to published compositions. 
            Every lesson builds on the last.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => {
            const colors = chapterColors[lesson.chapter] || chapterColors[1];
            return (
              <Link
                key={lesson.id}
                href={`/lesson/${lesson.lesson_number}`}
                className={`group ${colors.bg} rounded-2xl p-6 border-2 ${colors.border} border-opacity-30 hover:border-opacity-100 transition-all hover:shadow-soft`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-bold ${colors.text}`}>
                    Lesson {lesson.lesson_number}
                  </span>
                  <span className="text-xs text-[var(--wrife-text-muted)] bg-white px-2 py-1 rounded-full">
                    {lesson.duration_minutes} min
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2 group-hover:text-[var(--wrife-blue)] transition-colors">
                  {lesson.title}
                </h3>
                <p className="text-sm text-[var(--wrife-text-muted)] line-clamp-2 mb-3">
                  {lesson.summary}
                </p>
                <div className="flex items-center gap-3 text-xs text-[var(--wrife-text-muted)]">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Chapter {lesson.chapter}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Years {lesson.year_group_min}-{lesson.year_group_max}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/login?redirectTo=/lessons"
            className="inline-flex items-center gap-2 px-8 py-4 text-lg font-bold text-white bg-[var(--wrife-blue)] rounded-full shadow-soft hover:opacity-90 transition-opacity"
          >
            View All 67 Lessons
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
