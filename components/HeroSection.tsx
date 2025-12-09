import Link from "next/link";
import PencilMascot from "./mascots/PencilMascot";

export default function HeroSection() {
  return (
    <section className="w-full px-4 md:px-8 py-12 md:py-20 bg-[var(--wrife-bg)]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 text-[var(--wrife-text-main)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            A complete writing system for ages 6-10.
          </h1>
          <p className="text-lg md:text-xl text-[var(--wrife-text-muted)] mb-8">
            67 lessons. Daily practice. AI-powered support.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 text-lg font-bold text-white bg-[var(--wrife-orange)] rounded-full shadow-soft hover:opacity-90 transition-opacity"
            >
              Start Free Trial
            </Link>
            <a
              href="#lessons"
              className="px-8 py-4 text-lg font-bold text-[var(--wrife-text-main)] bg-white border-2 border-[var(--wrife-border)] rounded-full hover:border-[var(--wrife-blue)] hover:text-[var(--wrife-blue)] transition-colors"
            >
              Explore Lessons
            </a>
          </div>
        </div>

        <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-4">
          <div className="flex flex-wrap justify-center gap-4 lg:gap-6 max-w-4xl">
            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-4 w-48 transform hover:scale-105 transition-transform">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--wrife-blue)] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">W</span>
                </div>
                <span className="font-bold text-sm text-[var(--wrife-text-main)]">WriFe</span>
              </div>
              <p className="text-xs text-[var(--wrife-text-muted)] mb-3">
                Write a short story about a magical journey.
              </p>
              <button className="w-full py-2 bg-[var(--wrife-orange)] text-white text-xs font-bold rounded-lg">
                Start
              </button>
            </div>

            <div className="bg-[var(--wrife-blue)] rounded-2xl shadow-soft p-4 w-64 text-white transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center">
                    <span className="text-xs font-bold">W</span>
                  </div>
                  <span className="font-bold text-sm">WriFe</span>
                </div>
                <span className="text-xs opacity-75">Go</span>
              </div>
              <div className="flex gap-2 mb-3 text-xs opacity-90">
                <span className="px-2 py-1 bg-white/10 rounded">Teacher Guide</span>
                <span className="px-2 py-1 bg-white/20 rounded">Presentation</span>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <h4 className="font-bold text-sm mb-1">The Dragon's Island</h4>
                <p className="text-xs opacity-75">67 lessons</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-4 w-56 transform hover:scale-105 transition-transform">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[var(--wrife-yellow)] flex items-center justify-center">
                  <span className="text-lg">👧</span>
                </div>
                <div>
                  <span className="font-bold text-sm text-[var(--wrife-text-main)]">Jessica</span>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[var(--wrife-green)]"></span>
                    <span className="text-xs text-[var(--wrife-text-muted)]">Good</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-[var(--wrife-text-main)]">
                One day, I found a...
              </p>
            </div>

            <div className="bg-[var(--wrife-blue)] rounded-2xl shadow-soft p-4 w-52 text-white transform hover:scale-105 transition-transform">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center">
                  <span className="text-xs font-bold">W</span>
                </div>
                <span className="font-bold text-sm">WriFe</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-300">⭐</span>
                  <div>
                    <p className="text-xs font-bold">Language</p>
                    <p className="text-xs opacity-75">You used plenty of description</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-300">✓</span>
                  <div>
                    <p className="text-xs font-bold">Conventions</p>
                    <p className="text-xs opacity-75">Remember to check your punctuation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:absolute lg:right-0 lg:bottom-0 lg:translate-x-1/4">
            <PencilMascot size="xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
