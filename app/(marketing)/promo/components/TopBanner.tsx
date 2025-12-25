'use client'

export default function TopBanner() {
  return (
    <div className="w-full py-3 px-4 text-center text-white sticky top-0 z-50 shadow-md" style={{ backgroundColor: 'var(--wrife-blue)' }}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <span className="text-lg sm:text-xl font-bold" style={{ fontFamily: "'Baloo 2', cursive" }}>
          WRIFE - Writing For Everyone
        </span>
        <a 
          href="#application" 
          className="inline-block text-sm font-semibold py-1.5 px-4 rounded-full transition-all hover:scale-105"
          style={{ backgroundColor: 'var(--wrife-orange)', color: 'white' }}
        >
          Join The Pilot
        </a>
      </div>
    </div>
  )
}
