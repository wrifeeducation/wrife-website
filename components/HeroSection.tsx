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
          <div className="flex flex-wrap justify-center gap-6 lg:gap-8 max-w-5xl items-center">
            
            <Link 
              href="/login"
              className="group relative transform hover:scale-105 transition-all duration-300"
            >
              <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-3xl opacity-20 group-hover:opacity-30 blur-xl transition-opacity"></div>
              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-white" style={{ transform: 'perspective(1000px) rotateY(-5deg) rotateX(2deg)' }}>
                <img 
                  src="/demo-assets/teacher-login.png"
                  alt="Teacher Login Portal"
                  className="w-[220px] h-auto object-cover"
                />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[var(--wrife-orange)] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                Teacher Portal
              </div>
            </Link>

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
                <h4 className="font-bold text-sm mb-1">Stories and Words</h4>
                <p className="text-xs opacity-75">Chapter 1 - 17 lessons</p>
              </div>
            </div>

            <Link 
              href="/pupil/login"
              className="group relative transform hover:scale-105 transition-all duration-300"
            >
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-3xl opacity-20 group-hover:opacity-30 blur-xl transition-opacity"></div>
              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-white" style={{ transform: 'perspective(1000px) rotateY(5deg) rotateX(2deg)' }}>
                <img 
                  src="/demo-assets/pupil-login.png"
                  alt="Pupil Login Portal"
                  className="w-[220px] h-auto object-cover"
                />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[var(--wrife-blue)] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                Pupil Portal
              </div>
            </Link>

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
