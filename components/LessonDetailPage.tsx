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

interface Tab {
  id: string;
  label: string;
  iconLabel: string;
}

const tabs: Tab[] = [
  { id: "teacher-guide", label: "Teacher Guide", iconLabel: "TG" },
  { id: "presentation", label: "Presentation", iconLabel: "PR" },
  { id: "practice", label: "Practice Activities", iconLabel: "PA" },
  { id: "worksheets", label: "Worksheets", iconLabel: "WS" },
  { id: "progress", label: "Progress Tracker", iconLabel: "PT" },
  { id: "assessment", label: "Assessment", iconLabel: "AS" },
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

function TabIcon({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-md text-xs font-bold mr-2"
      style={{
        backgroundColor: "var(--wrife-blue-soft)",
        color: "var(--wrife-blue)",
      }}
    >
      {label}
    </span>
  );
}

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
  const activeTabData = tabs.find((t) => t.id === activeTab);

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
          <div className="flex items-start gap-3 sm:gap-4 mb-4">
            <div
              className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "var(--wrife-blue-soft)" }}
            >
              <span
                className="text-base sm:text-xl font-bold"
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

          <div className="flex flex-wrap gap-2 sm:gap-3 mt-4">
            <span
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium"
              style={{
                backgroundColor: "var(--wrife-surface)",
                color: "var(--wrife-text-main)",
                border: "1px solid var(--wrife-border)",
              }}
            >
              Duration: {duration}
            </span>
            <span
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium"
              style={{
                backgroundColor: "var(--wrife-surface)",
                color: "var(--wrife-text-main)",
                border: "1px solid var(--wrife-border)",
              }}
            >
              Years {yearGroups}
            </span>
            <span
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium"
              style={{
                backgroundColor: "var(--wrife-surface)",
                color: "var(--wrife-text-main)",
                border: "1px solid var(--wrife-border)",
              }}
            >
              Chapter {chapter}, Unit {unit}
            </span>
          </div>
        </header>

        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 mb-6">
          <div
            className="flex whitespace-nowrap gap-1 p-1 rounded-xl min-w-max md:min-w-0"
            style={{
              backgroundColor: "var(--wrife-surface)",
              border: "1px solid var(--wrife-border)",
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-shrink-0 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex items-center min-h-[44px]"
                style={{
                  backgroundColor:
                    activeTab === tab.id ? "var(--wrife-bg)" : "transparent",
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
                <TabIcon label={tab.iconLabel} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        <div
          className="rounded-2xl p-4 sm:p-6 md:p-8"
          style={{
            backgroundColor: "var(--wrife-surface)",
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-base sm:text-lg font-bold"
              style={{
                backgroundColor: "var(--wrife-blue-soft)",
                color: "var(--wrife-blue)",
              }}
            >
              {activeTabData?.iconLabel}
            </div>
            <div>
              <h2
                className="text-xl font-bold"
                style={{ color: "var(--wrife-text-main)" }}
              >
                {activeTabData?.label}
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

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90 hover:shadow-md min-h-[44px]"
              style={{
                backgroundColor: "var(--wrife-blue)",
                color: "white",
              }}
            >
              View Resource
            </button>
            <button
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium border-2 transition-all hover:opacity-80 min-h-[44px]"
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
