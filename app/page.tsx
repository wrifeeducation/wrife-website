"use client";

import dynamic from "next/dynamic";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";

const LessonLibrary = dynamic(() => import("../components/LessonLibrary"), {
  ssr: false,
  loading: () => (
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
          <p className="text-base" style={{ color: "var(--wrife-text-muted)" }}>
            Loading lessons...
          </p>
        </div>
      </div>
    </section>
  ),
});

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--wrife-bg)" }}>
      <Navbar />
      <HeroSection />
      <LessonLibrary />
    </div>
  );
}
