'use client'

import Image from 'next/image'

export default function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: 'var(--wrife-bg)' }}>
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232E5AFF' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-block rounded-full px-6 py-2 mb-8" style={{ backgroundColor: 'var(--wrife-blue-soft)', color: 'var(--wrife-blue)' }}>
              <p className="text-sm font-semibold">
                Free Pilot Programme - January-June 2026 - 10-20 Schools
              </p>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--wrife-text-main)' }}>
              Systematic Writing Instruction
              <span className="block mt-2" style={{ color: 'var(--wrife-blue)' }}>
                Aligned with 2024 Curriculum Review
              </span>
            </h1>

            <p className="text-xl md:text-2xl mb-8 leading-relaxed" style={{ color: 'var(--wrife-text-muted)' }}>
              Complete 67-lesson curriculum that teaches grammar through personal 
              storytelling. Reduce teacher planning time by 75% while building 
              confident writers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <a href="#application" className="inline-block font-semibold py-4 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg text-white" style={{ backgroundColor: 'var(--wrife-orange)' }}>
                Apply for Free Pilot →
              </a>
              <a href="#video" className="inline-block font-semibold py-4 px-8 rounded-full transition-all border-2" style={{ color: 'var(--wrife-blue)', borderColor: 'var(--wrife-blue)', backgroundColor: 'white' }}>
                Watch Video (2 min)
              </a>
            </div>

            <div className="pt-8 border-t" style={{ borderColor: 'var(--wrife-border)' }}>
              <p className="text-sm mb-2" style={{ color: 'var(--wrife-text-muted)' }}>Built by</p>
              <p className="text-lg font-semibold" style={{ color: 'var(--wrife-text-main)' }}>
                Michael Ankrah - Former Deputy Head Teacher - 20+ Years Primary Teaching
              </p>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              <Image 
                src="/mascots/pencil-waving.png" 
                alt="WriFe mascot - friendly pencil waving"
                width={350}
                height={400}
                className="drop-shadow-2xl"
                priority
              />
              
              <div className="absolute -top-4 -left-8 rounded-2xl p-4 shadow-lg" style={{ backgroundColor: 'white', border: '2px solid var(--wrife-blue-soft)' }}>
                <div className="text-3xl font-bold" style={{ color: 'var(--wrife-blue)' }}>67</div>
                <div className="text-xs" style={{ color: 'var(--wrife-text-muted)' }}>Structured Lessons</div>
              </div>
              
              <div className="absolute top-1/4 -right-4 rounded-2xl p-4 shadow-lg" style={{ backgroundColor: 'white', border: '2px solid var(--wrife-yellow-soft)' }}>
                <div className="text-3xl font-bold" style={{ color: 'var(--wrife-orange)' }}>75%</div>
                <div className="text-xs" style={{ color: 'var(--wrife-text-muted)' }}>Less Planning Time</div>
              </div>
              
              <div className="absolute bottom-8 -left-4 rounded-2xl p-4 shadow-lg" style={{ backgroundColor: 'white', border: '2px solid var(--wrife-green-soft)' }}>
                <div className="text-3xl font-bold" style={{ color: 'var(--wrife-green)' }}>20+</div>
                <div className="text-xs" style={{ color: 'var(--wrife-text-muted)' }}>Years Classroom-Tested</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
          <path fill="#ffffff" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
      </div>
    </section>
  )
}
