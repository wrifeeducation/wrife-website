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
  year_group_min: number | null;
  year_group_max: number | null;
}

interface GroupedLessons {
  [chapter: number]: {
    [unit: number]: Lesson[];
  };
}

const chapterTitles: { [key: number]: string } = {
  1: "Stories and Words",
  2: "Sentences",
  3: "Planning and Drafting",
  4: "Editing to Final Composition",
  5: "Building Cohesion and Final Composition",
  6: "Writing for Different Purposes/Audiences",
  7: "Project Based Writing",
};

const unitTitles: { [key: number]: string } = {
  1: "Stories",
  2: "Story Structure",
  3: "Parts of Speech 1",
  4: "Parts of Speech 2",
  5: "Reading Comprehension",
  6: "Sentence Types",
  7: "Phrases and Clauses",
  8: "Simple (Single-Clause) Sentences",
  9: "Paragraphs",
  10: "Planning",
  11: "Developing a Story",
  12: "Editing",
  13: "Building Cohesion Within and Across Paragraphs",
  14: "Non-Fiction Writing",
  15: "Fictional Writing",
  16: "Exploring Different Projects",
};

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
  if (lesson.year_group_min && lesson.year_group_max) {
    tags.push(`Years ${lesson.year_group_min}-${lesson.year_group_max}`);
  }
  return tags;
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={`w-5 h-5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function LessonLibrary() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYearGroup, setSelectedYearGroup] = useState("All Year Groups");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchLessons() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .order("lesson_number", { ascending: true });

      if (error) {
        console.error("Error fetching lessons:", error);
        setError("Unable to load lessons. Please refresh the page.");
      } else {
        setLessons(data || []);
      }
      setLoading(false);
    }

    fetchLessons();
  }, []);

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      let matchesYearGroup = selectedYearGroup === "All Year Groups";
      if (!matchesYearGroup && lesson.year_group_min && lesson.year_group_max) {
        const lessonYears = `Years ${lesson.year_group_min}-${lesson.year_group_max}`;
        matchesYearGroup = lessonYears === selectedYearGroup;
      }
      const matchesSearch =
        searchQuery === "" ||
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lesson.summary && lesson.summary.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesYearGroup && matchesSearch;
    });
  }, [lessons, selectedYearGroup, searchQuery]);

  const groupedLessons = useMemo(() => {
    const grouped: GroupedLessons = {};
    
    filteredLessons.forEach((lesson) => {
      if (!grouped[lesson.chapter]) {
        grouped[lesson.chapter] = {};
      }
      if (!grouped[lesson.chapter][lesson.unit]) {
        grouped[lesson.chapter][lesson.unit] = [];
      }
      grouped[lesson.chapter][lesson.unit].push(lesson);
    });

    return grouped;
  }, [filteredLessons]);

  const toggleChapter = (chapter: number) => {
    setExpandedChapters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chapter)) {
        newSet.delete(chapter);
      } else {
        newSet.add(chapter);
      }
      return newSet;
    });
  };

  const toggleUnit = (chapter: number, unit: number) => {
    const key = `${chapter}-${unit}`;
    setExpandedUnits((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allChapters = new Set(Object.keys(groupedLessons).map(Number));
    const allUnits = new Set<string>();
    Object.entries(groupedLessons).forEach(([chapter, units]) => {
      Object.keys(units).forEach((unit) => {
        allUnits.add(`${chapter}-${unit}`);
      });
    });
    setExpandedChapters(allChapters);
    setExpandedUnits(allUnits);
  };

  const collapseAll = () => {
    setExpandedChapters(new Set());
    setExpandedUnits(new Set());
  };

  const getChapterLessonCount = (chapter: number): number => {
    const units = groupedLessons[chapter];
    if (!units) return 0;
    return Object.values(units).reduce((sum, lessons) => sum + lessons.length, 0);
  };

  const getUnitLessonCount = (chapter: number, unit: number): number => {
    return groupedLessons[chapter]?.[unit]?.length || 0;
  };

  const sortedChapters = Object.keys(groupedLessons).map(Number).sort((a, b) => a - b);

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

          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
              style={{
                backgroundColor: "var(--wrife-blue)",
                color: "white",
              }}
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
              style={{
                backgroundColor: "var(--wrife-bg)",
                color: "var(--wrife-text-main)",
                border: "1px solid var(--wrife-border)",
              }}
            >
              Collapse All
            </button>
          </div>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl p-4 animate-pulse"
                style={{
                  backgroundColor: "var(--wrife-surface)",
                  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
                  border: "1px solid var(--wrife-border)",
                }}
              >
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-center">
            <p className="text-red-600 font-semibold mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-red-600 underline hover:text-red-700"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && sortedChapters.length > 0 && (
          <div className="space-y-4">
            {sortedChapters.map((chapter) => {
              const isChapterExpanded = expandedChapters.has(chapter);
              const units = groupedLessons[chapter];
              const sortedUnits = Object.keys(units).map(Number).sort((a, b) => a - b);

              return (
                <div
                  key={chapter}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    backgroundColor: "var(--wrife-surface)",
                    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
                    border: "1px solid var(--wrife-border)",
                  }}
                >
                  <button
                    onClick={() => toggleChapter(chapter)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <h3
                        className="text-lg font-bold"
                        style={{ color: "var(--wrife-text-main)" }}
                      >
                        Chapter {chapter}: {chapterTitles[chapter] || "Lessons"}
                      </h3>
                      <p
                        className="text-sm mt-1"
                        style={{ color: "var(--wrife-text-muted)" }}
                      >
                        {getChapterLessonCount(chapter)} lessons in {sortedUnits.length} units
                      </p>
                    </div>
                    <div style={{ color: "var(--wrife-blue)" }}>
                      <ChevronIcon isOpen={isChapterExpanded} />
                    </div>
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isChapterExpanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-4 pb-4 space-y-3">
                      {sortedUnits.map((unit) => {
                        const unitKey = `${chapter}-${unit}`;
                        const isUnitExpanded = expandedUnits.has(unitKey);
                        const unitLessons = units[unit];

                        return (
                          <div
                            key={unitKey}
                            className="rounded-xl overflow-hidden"
                            style={{
                              backgroundColor: "var(--wrife-bg)",
                              border: "1px solid var(--wrife-border)",
                            }}
                          >
                            <button
                              onClick={() => toggleUnit(chapter, unit)}
                              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                                  style={{
                                    backgroundColor: "var(--wrife-blue-soft)",
                                    color: "var(--wrife-blue)",
                                  }}
                                >
                                  {unit}
                                </span>
                                <div>
                                  <h4
                                    className="font-semibold"
                                    style={{ color: "var(--wrife-text-main)" }}
                                  >
                                    Unit {unit}: {unitTitles[unit] || "Lessons"}
                                  </h4>
                                  <p
                                    className="text-xs"
                                    style={{ color: "var(--wrife-text-muted)" }}
                                  >
                                    {getUnitLessonCount(chapter, unit)} lessons
                                  </p>
                                </div>
                              </div>
                              <div style={{ color: "var(--wrife-blue)" }}>
                                <ChevronIcon isOpen={isUnitExpanded} />
                              </div>
                            </button>

                            <div
                              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                isUnitExpanded ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0"
                              }`}
                            >
                              <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-3">
                                {unitLessons.map((lesson) => (
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
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && !error && filteredLessons.length === 0 && (
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
