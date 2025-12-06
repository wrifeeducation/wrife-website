"use client";

import { useState } from "react";
import Link from "next/link";

interface LessonDetailProps {
  lessonNumber: string;
  title: string;
  summary: string;
  chapter: number;
  unit: number;
  duration: string;
  yearGroups: string;
}

const tabs = [
  { id: "teacher-guide", label: "Teacher Guide", icon: "📖" },
  { id: "presentation", label: "Presentation", icon: "📊" },
  { id: "practice", label: "Practice Activities", icon: "✏️" },
  { id: "worksheets", label: "Worksheets", icon: "📄" },
  { id: "progress", label: "Progress Tracker", icon: "📈" },
  { id: "assessment", label: "Assessment", icon: "✅" },
];

const tabContent: Record<string, { description: string; bullets: string[] }> = {
  "teacher-guide": {
    description: "Comprehensive teaching instructions and lesson objectives",
    bullets: [
      "Step-by-step lesson plan with timing suggestions",
      "Key vocabulary and concepts to introduce",
      "Differentiation strategies for diverse learners",
    ],
  },
  presentation: {
    description: "Interactive slides for classroom delivery",
    bullets: [
      "Engaging visual content aligned with lesson objectives",
      "Discussion prompts and thinking questions",
      "Example texts and model writing samples",
    ],
  },
  practice: {
    description: "Hands-on activities for student engagement",
    bullets: [
      "Guided practice exercises with scaffolding",
      "Partner and group collaboration activities",
      "Independent practice tasks for consolidation",
    ],
  },
  worksheets: {
    description: "Printable resources for classroom use",
    bullets: [
      "Student activity sheets ready to print",
      "Graphic organizers and planning templates",
      "Answer keys for teacher reference",
    ],
  },
  progress: {
    description: "Tools for monitoring student development",
    bullets: [
      "Learning objective checklists",
      "Self-assessment rubrics for students",
      "Class tracking spreadsheet templates",
    ],
  },
  assessment: {
    description: "Evaluation materials and success criteria",
    bullets: [
      "Formative assessment tasks",
      "Summative assessment options",
      "Marking guides with example responses",
    ],
  },
};

export default function LessonDetailPage({
  lessonNumber,
  title,
  summary,
  chapter,
  unit,
  duration,
  yearGroups,
}: LessonDetailProps) {
  const [activeTab, setActiveTab] = useState("teacher-guide");

  const currentTabContent = tabContent[activeTab];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--wrife-bg)" }}
    >
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link
                href="/"
                className="hover:underline"
                style={{ color: "var(--wrife-blue)" }}
              >
                All Lessons
              </Link>
            </li>
            <li style={{ color: "var(--wrife-text-muted)" }}>/</li>
            <li style={{ color: "var(--wrife-text-muted)" }}>
              Lesson {lessonNumber}
            </li>
          </ol>
        </nav>

        <header className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div
              className="flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "var(--wrife-blue-soft)" }}
            >
              <span
                className="text-xl font-bold"
                style={{ color: "var(--wrife-blue)" }}
              >
                L{lessonNumber}
              </span>
            </div>
            <div className="flex-1">
              <h1
                className="text-2xl md:text-3xl font-bold mb-2"
                style={{ color: "var(--wrife-text-main)" }}
              >
                {title}
              </h1>
              <p
                className="text-base leading-relaxed"
                style={{ color: "var(--wrife-text-muted)" }}
              >
                {summary}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
              style={{
                backgroundColor: "var(--wrife-surface)",
                color: "var(--wrife-text-main)",
                border: "1px solid var(--wrife-border)",
              }}
            >
              ⏱️ {duration}
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
              style={{
                backgroundColor: "var(--wrife-surface)",
                color: "var(--wrife-text-main)",
                border: "1px solid var(--wrife-border)",
              }}
            >
              👥 Years {yearGroups}
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
              style={{
                backgroundColor: "var(--wrife-surface)",
                color: "var(--wrife-text-main)",
                border: "1px solid var(--wrife-border)",
              }}
            >
              📚 Chapter {chapter}, Unit {unit}
            </span>
          </div>
        </header>

        <div
          className="flex overflow-x-auto gap-1 mb-6 p-1 rounded-xl"
          style={{
            backgroundColor: "var(--wrife-surface)",
            border: "1px solid var(--wrife-border)",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-shrink-0 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
              style={{
                backgroundColor:
                  activeTab === tab.id
                    ? "var(--wrife-bg)"
                    : "transparent",
                color:
                  activeTab === tab.id
                    ? "var(--wrife-blue)"
                    : "var(--wrife-text-muted)",
                borderBottom:
                  activeTab === tab.id
                    ? "2px solid var(--wrife-blue)"
                    : "2px solid transparent",
              }}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div
          className="rounded-2xl p-6 md:p-8"
          style={{
            backgroundColor: "var(--wrife-surface)",
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">
              {tabs.find((t) => t.id === activeTab)?.icon}
            </span>
            <div>
              <h2
                className="text-xl font-bold"
                style={{ color: "var(--wrife-text-main)" }}
              >
                {tabs.find((t) => t.id === activeTab)?.label}
              </h2>
              <p
                className="text-sm"
                style={{ color: "var(--wrife-text-muted)" }}
              >
                {currentTabContent.description}
              </p>
            </div>
          </div>

          <ul className="space-y-3 mb-8">
            {currentTabContent.bullets.map((bullet, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-base"
                style={{ color: "var(--wrife-text-main)" }}
              >
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: "var(--wrife-blue-soft)",
                    color: "var(--wrife-blue)",
                  }}
                >
                  {index + 1}
                </span>
                {bullet}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3">
            <button
              className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90 hover:shadow-md"
              style={{
                backgroundColor: "var(--wrife-blue)",
                color: "white",
              }}
            >
              View Resource
            </button>
            <button
              className="px-6 py-2.5 rounded-lg text-sm font-medium border-2 transition-all hover:opacity-80"
              style={{
                backgroundColor: "transparent",
                color: "var(--wrife-blue)",
                borderColor: "var(--wrife-blue)",
              }}
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
