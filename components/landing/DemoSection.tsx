"use client";

import InteractivePracticeDemo from './InteractivePracticeDemo';
import TeacherGuideDemo from './TeacherGuideDemo';
import PresentationDemo from './PresentationDemo';
import DWPAIDemo from './DWPAIDemo';

export default function DemoSection() {
  return (
    <section id="try-it" className="w-full px-4 md:px-8 py-16 bg-gradient-to-b from-[var(--wrife-bg)] to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Try Before You Buy
          </div>
          <h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--wrife-text-main)] mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Experience the WriFe Difference
          </h2>
          <p className="text-[var(--wrife-text-muted)] text-lg max-w-2xl mx-auto">
            Don&apos;t just take our word for it. Try Lesson 11 materials right now and see how WriFe transforms writing education.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <InteractivePracticeDemo />
          <TeacherGuideDemo />
          <PresentationDemo />
          <DWPAIDemo />
        </div>

        <div className="mt-12 text-center">
          <p className="text-[var(--wrife-text-muted)] mb-4">
            Loved what you saw? Get access to all 67 lessons, AI assessments, and class management tools.
          </p>
          <a
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 text-lg font-bold text-white bg-[var(--wrife-blue)] rounded-full shadow-lg hover:opacity-90 transition-opacity"
          >
            Start Your Free Trial
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
