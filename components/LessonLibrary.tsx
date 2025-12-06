"use client";

import { useState, useMemo } from "react";
import LessonCard from "./LessonCard";

interface Lesson {
  lessonNumber: string;
  title: string;
  summary: string;
  chapter: string;
  yearGroup: string;
  tags: string[];
}

const demoLessons: Lesson[] = [
  {
    lessonNumber: "1",
    title: "Developing Awareness of Personal Stories",
    summary:
      "Students learn to recognize the stories within their own lives, identifying meaningful moments that can become the foundation for personal narrative writing.",
    chapter: "Chapter 1",
    yearGroup: "Years 2-3",
    tags: ["Chapter 1", "Years 2-3", "Foundation"],
  },
  {
    lessonNumber: "10",
    title: "Present or Past Tense",
    summary:
      "Explore the differences between present and past tense, learning when to use each effectively in narrative and descriptive writing.",
    chapter: "Chapter 1",
    yearGroup: "Years 2-3",
    tags: ["Chapter 1", "Years 2-3"],
  },
  {
    lessonNumber: "27a",
    title: "What is a paragraph?",
    summary:
      "Understand the structure and purpose of paragraphs, learning how to organize ideas into coherent units that improve readability.",
    chapter: "Chapter 2",
    yearGroup: "Years 3-4",
    tags: ["Chapter 2", "Years 3-4"],
  },
  {
    lessonNumber: "27b",
    title: "Introduction to the Connect Grid",
    summary:
      "Learn to use the Connect Grid tool for organizing ideas and creating logical connections between different parts of your writing.",
    chapter: "Chapter 2",
    yearGroup: "Years 3-4",
    tags: ["Chapter 2", "Years 3-4"],
  },
  {
    lessonNumber: "35",
    title: "Developing a Storyline",
    summary:
      "Master the art of creating compelling storylines with clear beginnings, middles, and endings that engage readers throughout.",
    chapter: "Chapter 3",
    yearGroup: "Years 3-4",
    tags: ["Chapter 3", "Years 3-4", "Advanced"],
  },
  {
    lessonNumber: "52",
    title: "Writing a News Report",
    summary:
      "Discover the conventions of news writing, including the inverted pyramid structure, headlines, and objective reporting techniques.",
    chapter: "Chapter 6",
    yearGroup: "Years 4-5",
    tags: ["Chapter 6", "Years 4-5", "Non-Fiction"],
  },
];

const chapters = [
  "All Chapters",
  "Chapter 1",
  "Chapter 2",
  "Chapter 3",
  "Chapter 4",
  "Chapter 5",
  "Chapter 6",
  "Chapter 7",
];

const yearGroups = ["All Year Groups", "Years 2-3", "Years 3-4", "Years 4-5"];

export default function LessonLibrary() {
  const [selectedChapter, setSelectedChapter] = useState("All Chapters");
  const [selectedYearGroup, setSelectedYearGroup] = useState("All Year Groups");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLessons = useMemo(() => {
    return demoLessons.filter((lesson) => {
      const matchesChapter =
        selectedChapter === "All Chapters" || lesson.chapter === selectedChapter;
      const matchesYearGroup =
        selectedYearGroup === "All Year Groups" ||
        lesson.yearGroup === selectedYearGroup;
      const matchesSearch =
        searchQuery === "" ||
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.summary.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesChapter && matchesYearGroup && matchesSearch;
    });
  }, [selectedChapter, selectedYearGroup, searchQuery]);

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
            67 comprehensive writing lessons
          </p>
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
            onChange={(e) => setSelectedChapter(e.target.value)}
            className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2"
            style={{
              backgroundColor: "var(--wrife-bg)",
              color: "var(--wrife-text-main)",
              border: "1px solid var(--wrife-border)",
            }}
          >
            {chapters.map((chapter) => (
              <option key={chapter} value={chapter}>
                {chapter}
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

        {filteredLessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLessons.map((lesson) => (
              <LessonCard
                key={lesson.lessonNumber}
                lessonNumber={lesson.lessonNumber}
                title={lesson.title}
                summary={lesson.summary}
                tags={lesson.tags}
                onOpen={() => alert(`Opening lesson ${lesson.lessonNumber}: ${lesson.title}`)}
              />
            ))}
          </div>
        ) : (
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
