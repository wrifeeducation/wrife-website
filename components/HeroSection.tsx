"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const typewriterWords = [
  "story.",
  "adventure.",
  "voice.",
  "world.",
  "journey.",
  "chapter.",
];

const stats = [
  { value: "67", label: "Structured Lessons" },
  { value: "432+", label: "Practice Activities" },
  { value: "75", label: "Badges to Earn" },
  { value: "KS1–3", label: "Curriculum Aligned" },
];

export default function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState(typewriterWords[0]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(typewriterWords[0].length);

  useEffect(() => {
    const currentWord = typewriterWords[wordIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting) {
      if (charIndex < currentWord.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentWord.slice(0, charIndex + 1));
          setCharIndex((c) => c + 1);
        }, 80);
      } else {
        // Pause before deleting
        timeout = setTimeout(() => setIsDeleting(true), 1800);
      }
    } else {
      if (charIndex > 0) {
        timeout = setTimeout(() => {
          setDisplayText(currentWord.slice(0, charIndex - 1));
          setCharIndex((c) => c - 1);
        }, 45);
      } else {
        setIsDeleting(false);
        setWordIndex((i) => (i + 1) % typewriterWords.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, wordIndex]);

  return (
    <section className="w-full bg-[var(--wrife-bg)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-4 md:pt-14 md:pb-8">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-0">

          {/* ── Left column ── */}
          <div className="flex-1 lg:pr-8 text-center lg:text-left">

            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 bg-[var(--wrife-blue-soft)] text-[var(--wrife-blue)] text-sm font-bold px-4 py-1.5 rounded-full mb-7">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Writing Resources for UK Schools
            </div>

            {/* Headline */}
            <h1
              className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.1] text-[var(--wrife-text-main)] mb-6"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
            >
              Every child.{" "}
              <br className="hidden sm:block" />
              Their own{" "}
              <span style={{ color: "var(--wrife-blue)" }}>
                {displayText}
                <span className="typewriter-cursor" />
              </span>
            </h1>

            <p className="text-lg md:text-xl text-[var(--wrife-text-muted)] mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              67 structured lessons, daily writing practice, AI-powered feedback,
              and a full teacher dashboard — everything you need to build confident writers.
            </p>

            {/* Portal cards */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              {/* Pupil portal */}
              <Link
                href="/pupil/login"
                className="group flex items-center gap-4 bg-white rounded-2xl px-5 py-4 border-2 border-[var(--wrife-border)] shadow-card hover:border-[var(--wrife-orange)] hover:shadow-soft transition-all"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "var(--wrife-orange)" }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-bold text-[var(--wrife-text-main)] text-base leading-tight">I&apos;m a Pupil</div>
                  <div className="text-sm text-[var(--wrife-text-muted)]">Start practising →</div>
                </div>
              </Link>

              {/* Teacher portal */}
              <Link
                href="/login"
                className="group flex items-center gap-4 bg-white rounded-2xl px-5 py-4 border-2 border-[var(--wrife-border)] shadow-card hover:border-[var(--wrife-blue)] hover:shadow-soft transition-all"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "var(--wrife-blue)" }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-bold text-[var(--wrife-text-main)] text-base leading-tight">I&apos;m a Teacher</div>
                  <div className="text-sm text-[var(--wrife-text-muted)]">View dashboard →</div>
                </div>
              </Link>
            </div>

            {/* CTA row */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link
                href="/signup"
                className="px-8 py-4 text-base font-bold text-white rounded-full shadow-soft hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "var(--wrife-orange)" }}
              >
                Start Free Trial
              </Link>
              <a
                href="#features"
                className="text-sm font-semibold text-[var(--wrife-text-muted)] hover:text-[var(--wrife-blue)] transition-colors flex items-center gap-1"
              >
                See how it works
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>
          </div>

          {/* ── Right column — mascot constellation ── */}
          <div className="flex-shrink-0 relative w-[280px] h-[340px] sm:w-[340px] sm:h-[400px] lg:w-[400px] lg:h-[450px]">

            {/* Central lavender circle + waving mascot */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center"
              style={{
                width: "220px",
                height: "220px",
                backgroundColor: "var(--wrife-blue-soft)",
              }}
            >
              <Image
                src="/mascots/pencil-waving.png"
                alt="WriFe mascot waving"
                width={170}
                height={204}
                className="drop-shadow-lg"
                priority
              />
            </div>

            {/* Top-right — celebrating */}
            <div
              className="absolute mascot-float-a"
              style={{ top: "2%", right: "5%", transform: "rotate(-12deg)" }}
            >
              <Image
                src="/mascots/pencil-celebrating.png"
                alt=""
                width={90}
                height={110}
                className="drop-shadow-md"
              />
            </div>

            {/* Bottom-left — thinking */}
            <div
              className="absolute mascot-float-c"
              style={{ bottom: "6%", left: "4%", transform: "rotate(6deg)" }}
            >
              <Image
                src="/mascots/pencil-thinking.png"
                alt=""
                width={72}
                height={88}
                className="drop-shadow-md"
              />
            </div>

            {/* Bottom-right — reading with gold star badge */}
            <div
              className="absolute mascot-float-b"
              style={{ bottom: "4%", right: "4%", transform: "rotate(10deg)" }}
            >
              <div className="relative">
                <Image
                  src="/mascots/pencil-reading.png"
                  alt=""
                  width={80}
                  height={96}
                  className="drop-shadow-md"
                />
                {/* Gold star badge */}
                <div
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-soft"
                  style={{ backgroundColor: "var(--wrife-yellow)", color: "white" }}
                >
                  ★
                </div>
              </div>
            </div>

            {/* Decorative dots */}
            <div
              className="absolute top-[15%] left-[8%] w-3 h-3 rounded-full opacity-40"
              style={{ backgroundColor: "var(--wrife-blue)" }}
            />
            <div
              className="absolute top-[10%] right-[28%] w-2 h-2 rounded-full opacity-30"
              style={{ backgroundColor: "var(--wrife-orange)" }}
            />
            <div
              className="absolute bottom-[22%] right-[18%] w-2.5 h-2.5 rounded-full opacity-40"
              style={{ backgroundColor: "var(--wrife-yellow)" }}
            />
          </div>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="border-t border-b border-[var(--wrife-border)] bg-white mt-6">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-[var(--wrife-border)]">
            {stats.map((s) => (
              <div key={s.label} className="text-center px-4">
                <div
                  className="text-3xl font-extrabold mb-0.5"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--wrife-blue)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {s.value}
                </div>
                <div className="text-sm text-[var(--wrife-text-muted)] font-medium">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
