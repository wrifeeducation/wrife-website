"use client";

import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import LessonLibrary from "../components/LessonLibrary";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--wrife-bg)" }}>
      <Navbar />
      <HeroSection />
      <LessonLibrary />
    </div>
  );
}
