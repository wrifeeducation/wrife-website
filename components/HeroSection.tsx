"use client";

import Link from "next/link";
import Image from "next/image";
import BookLogo from "./mascots/BookLogo";

const stats = [
  { value: "67", label: "Lessons" },
  { value: "3", label: "Practice Apps" },
  { value: "AI", label: "Powered Feedback" },
  { value: "KS1–3", label: "Coverage" },
];

export default function HeroSection() {
  return (
    <section className="w-full bg-[var(--wrife-bg)] overflow-hidden">
      {/* Main hero */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

          {/* Left — copy */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[var(--wrife-blue-soft)] text-[var(--wrife-blue)] text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              <BookLogo size="sm" />
              Writing Resources for UK Schools
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-[var(--wrife-text-main)] mb-5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              A complete writing system for{" "}
              <span style={{ color: "var(--wrife-blue)" }}>ages 6–14</span>
            </h1>

            <p className="text-lg md:text-xl text-[var(--wrife-text-muted)] mb-8 max-w-xl mx-auto lg:mx-0">
              67 structured lessons, daily writing practice, AI-powered feedback,
              and a full teacher dashboard — everything you need to build confident writers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <Link
                href="/signup"
                className="px-8 py-4 text-lg font-bold text-white bg-[var(--wrife-orange)] rounded-full shadow-soft hover:opacity-90 transition-opacity"
              >
                Start Free Trial
              </Link>
              <a
                href="#features"
                className="px-8 py-4 text-lg font-bold text-[var(--wrife-text-main)] bg-white border-2 border-[var(--wrife-border)] rounded-full hover:border-[var(--wrife-blue)] hover:text-[var(--wrife-blue)] transition-colors"
              >
                Explore Features
              </a>
            </div>

            {/* Login links */}
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start text-sm text-[var(--wrife-text-muted)]">
              <span>Already have an account?</span>
              <div className="flex gap-4">
                <Link href="/login" className="font-semibold text-[var(--wrife-blue)] hover:underline">
                  Teacher Login
                </Link>
                <span>·</span>
                <Link href="/pupil/login" className="font-semibold text-[var(--wrife-yellow)] hover:underline">
                  Pupil Login
                </Link>
              </div>
            </div>
          </div>

          {/* Right — mascot */}
          <div className="flex-shrink-0 flex items-end justify-center">
            <div className="relative">
              {/* Decorative blob behind mascot */}
              <div
                className="absolute inset-0 -z-10 rounded-full blur-3xl opacity-30"
                style={{
                  backgroundColor: "var(--wrife-yellow)",
                  transform: "scale(1.2)",
                }}
              />
              <Image
                src="/mascots/pencil-waving.png"
                alt="WriFe mascot"
                width={340}
                height={400}
                className="drop-shadow-xl"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="border-t border-b border-[var(--wrife-border)] bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-[var(--wrife-border)]">
            {stats.map((s) => (
              <div key={s.label} className="text-center px-4">
                <div
                  className="text-3xl font-extrabold text-[var(--wrife-blue)] mb-0.5"
                  style={{ fontFamily: "var(--font-display)" }}
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
