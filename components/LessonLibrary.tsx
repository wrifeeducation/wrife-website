"use client";

import { useState, useMemo, useEffect } from "react";
import LessonCard from "./LessonCard";
import { supabase } from "../lib/supabase";

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

const chapters = [
  { label: "All Chapters", value: 0 },
  { label: "Chapter 1", value: 1 },
  { label: "Chapter 2", value: 2 },
  { label: "Chapter 3", value: 3 },
  { label: "Chapter 4", value: 4 },
  { label: "Chapter 5", value: 5 },
  { label: "Chapter 6", value: 6 },
  { label: "Chapter 7", value: 7 },
];

const yearGroups = [
  "All Year Groups",
  "Years 2-3",
  "Years 3-4",
  "Years 4-5",
];

function getLessonNumber(lesson: Lesson): string {
  if (lesson.has_parts && lesson.part) {
    return `${lesson.lesson_number}${lesson.part}`;
  }
  return `${lesson.lesson_number}`;
}

function getLessonTags(lesson: Lesson): string[] {
  const tags: string[] = [];
  tags.push(`Chapter ${lesson.chapter}`);
  if (lesson.year_groups) {
    tags.push(lesson.year_groups);
  }
  return tags;
}

export default function LessonLibrary() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [selectedYearGroup, setSelectedYearGroup] = useState("All Year Groups");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchLessons() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching lessons:", error);
        setError(error.message);
      } else {
        setLessons(data || []);
      }
      setLoading(false);
    }

    fetchLessons();
  }, []);

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const matchesChapter =
        selectedChapter === 0 || lesson.chapter === selectedChapter;
      const matchesYearGroup =
        selectedYearGroup === "All Year Groups" ||
        lesson.year_groups === selectedYearGroup;
      const matchesSearch =
        searchQuery === "" ||
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lesson.summary && lesson.summary.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesChapter && matchesYearGroup && matchesSearch;
    });
  }, [lessons, selectedChapter, selectedYearGroup, searchQuery]);

  return (
    <section
      className="w-full px-4 md:px-8 py-12"
      style={{ backgroundColor: "var(--wrife-bg)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{ color: "var(--wrife-text-main)" }}
          >
            All Lessons
          </h2>
          <p
            className="text-base"
            style={{ color: "var(--wrife-text-muted)" }}
          >
            {loading ? "Loading..." : error ? "Error loading lessons" : `${lessons.length} comprehensive writing lessons`}
          </p>
          {!loading && !error && lessons.length === 0 && (
            <p className="text-sm mt-2" style={{ color: "#F59E0B" }}>
              No lessons found in database. Please check that the lessons table has data in Supabase.
            </p>
          )}
        </div>

        <div
          className="flex flex-col sm:flex-row gap-4 mb-8 p-4 rounded-xl"
          style={{
            backgroundColor: "var(--wrife-surface)",
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
          }}
        >
          <select
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(Number(e.target.value))}
            className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2"
            style={{
              backgroundColor: "var(--wrife-bg)",
              color: "var(--wrife-text-main)",
              border: "1px solid var(--wrife-border)",
            }}
          >
            {chapters.map((chapter) => (
              <option key={chapter.value} value={chapter.value}>
                {chapter.label}
              </option>
            ))}
          </select>

          <select
            value={selectedYearGroup}
            onChange={(e) => setSelectedYearGroup(e.target.value)}
            className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2"
            style={{
              backgroundColor: "var(--wrife-bg)",
              color: "var(--wrife-text-main)",
              border: "1px solid var(--wrife-border)",
            }}
          >
            {yearGroups.map((yearGroup) => (
              <option key={yearGroup} value={yearGroup}>
                {yearGroup}
              </option>
            ))}
          </select>

          <div className="flex-1">
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "var(--wrife-bg)",
                color: "var(--wrife-text-main)",
                border: "1px solid var(--wrife-border)",
              }}
            />
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-2xl p-4 animate-pulse"
                style={{
                  backgroundColor: "var(--wrife-surface)",
                  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
                  border: "1px solid var(--wrife-border)",
                }}
              >
                <div className="h-9 w-9 bg-gray-200 rounded-full mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6 mb-3"></div>
                <div className="flex gap-2">
                  <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                  <div className="h-5 bg-gray-200 rounded-full w-20"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div
            className="text-center py-12 rounded-xl mb-4"
            style={{
              backgroundColor: "#FEE2E2",
              border: "1px solid #EF4444",
            }}
          >
            <p
              className="text-lg font-medium mb-2"
              style={{ color: "#DC2626" }}
            >
              Error loading lessons
            </p>
            <p
              className="text-sm"
              style={{ color: "#991B1B" }}
            >
              {error}
            </p>
          </div>
        )}

        {!loading && filteredLessons.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLessons.map((lesson) => (
              <LessonCard
                key={`${lesson.id}-${lesson.part || ""}`}
                lessonNumber={getLessonNumber(lesson)}
                linkNumber={lesson.lesson_number}
                title={lesson.title}
                summary={lesson.summary || ""}
                tags={getLessonTags(lesson)}
              />
            ))}
          </div>
        )}

        {!loading && filteredLessons.length === 0 && (
          <div
            className="text-center py-12 rounded-xl"
            style={{
              backgroundColor: "var(--wrife-surface)",
              border: "1px solid var(--wrife-border)",
            }}
          >
            <p
              className="text-lg font-medium mb-2"
              style={{ color: "var(--wrife-text-main)" }}
            >
              No lessons found
            </p>
            <p
              className="text-sm"
              style={{ color: "var(--wrife-text-muted)" }}
            >
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
