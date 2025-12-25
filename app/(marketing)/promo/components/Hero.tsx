'use client'

export default function Hero() {
  return (
    <section className="relative text-white overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--wrife-green) 0%, #2C5F2D 100%)' }}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-8">
            <p className="text-sm font-semibold">
              Free Pilot Programme - January-June 2026 - 10-20 Schools
            </p>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: "'Baloo 2', cursive" }}>
            Systematic Writing Instruction
            <span className="block mt-2" style={{ color: '#90EE90' }}>
              Aligned with 2024 Curriculum Review
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
            Complete 67-lesson curriculum that teaches grammar through personal 
            storytelling. Reduce teacher planning time by 75% while building 
            confident writers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-4xl font-bold mb-2" style={{ color: '#90EE90' }}>67</div>
              <div className="text-sm text-white/80">Structured Lessons</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-4xl font-bold mb-2" style={{ color: '#90EE90' }}>75%</div>
              <div className="text-sm text-white/80">Less Planning Time</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-4xl font-bold mb-2" style={{ color: '#90EE90' }}>20+</div>
              <div className="text-sm text-white/80">Years Classroom-Tested</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#application" className="inline-block bg-[var(--wrife-orange)] hover:opacity-90 text-white font-semibold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg">
              Apply for Free Pilot →
            </a>
            <a href="#video" className="inline-block bg-white hover:bg-gray-100 text-gray-900 font-semibold py-4 px-8 rounded-lg transition-all border-2 border-white">
              Watch Video (2 min)
            </a>
          </div>

          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-sm text-white/70 mb-4">Built by</p>
            <p className="text-lg font-semibold text-white">
              Michael Ankrah - Former Deputy Head Teacher - 20+ Years Primary Teaching
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,128C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  )
}
