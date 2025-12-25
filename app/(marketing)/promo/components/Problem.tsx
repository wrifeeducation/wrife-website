'use client'

import Image from 'next/image'

export default function Problem() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <Image 
                src="/mascots/face-worried.png" 
                alt="Worried face"
                width={80}
                height={80}
                className="drop-shadow-md"
              />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--wrife-text-main)' }}>
              The Problem with Current Writing Instruction
            </h2>
            <p className="text-xl mt-4" style={{ color: 'var(--wrife-text-muted)' }}>
              The 2024 Curriculum & Assessment Review identified critical gaps
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="rounded-xl p-8 border-2 hover:shadow-xl transition-shadow" style={{ backgroundColor: 'white', borderColor: 'var(--wrife-coral-soft)' }}>
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--wrife-text-main)' }}>Random Grammar Instruction</h3>
              <p style={{ color: 'var(--wrife-text-muted)' }}>
                Grammar taught in isolation with no clear progression. Pupils 
                learn rules but can&apos;t apply them in actual writing.
              </p>
            </div>

            <div className="rounded-xl p-8 border-2 hover:shadow-xl transition-shadow" style={{ backgroundColor: 'white', borderColor: 'var(--wrife-coral-soft)' }}>
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--wrife-text-main)' }}>Excessive Teacher Workload</h3>
              <p style={{ color: 'var(--wrife-text-muted)' }}>
                Teachers spend 5-10 hours weekly planning writing lessons—that&apos;s 
                200-400 hours annually per teacher.
              </p>
            </div>

            <div className="rounded-xl p-8 border-2 hover:shadow-xl transition-shadow" style={{ backgroundColor: 'white', borderColor: 'var(--wrife-coral-soft)' }}>
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--wrife-text-main)' }}>Assessment Comes Too Late</h3>
              <p style={{ color: 'var(--wrife-text-muted)' }}>
                End-of-unit tests arrive too late to inform teaching. Teachers 
                need real-time data to make intervention decisions.
              </p>
            </div>

            <div className="rounded-xl p-8 border-2 hover:shadow-xl transition-shadow" style={{ backgroundColor: 'white', borderColor: 'var(--wrife-coral-soft)' }}>
              <div className="text-4xl mb-4">📉</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--wrife-text-main)' }}>Poor Outcomes</h3>
              <p style={{ color: 'var(--wrife-text-muted)' }}>
                30%+ of pupils finish primary school below expected writing 
                standards despite years of instruction.
              </p>
            </div>
          </div>

          <div className="rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden" style={{ backgroundColor: 'var(--wrife-blue)' }}>
            <div className="absolute right-4 bottom-4 opacity-20">
              <Image 
                src="/mascots/face-happy.png" 
                alt="Happy face"
                width={120}
                height={120}
              />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4 relative z-10" style={{ fontFamily: "'Baloo 2', cursive" }}>
              WriFe Solves Every Single One
            </h3>
            <p className="text-lg text-white/90 mb-6 relative z-10">
              Systematic grammar progression – Complete lesson packages – 
              Built-in assessment – Proven outcomes
            </p>
            <a href="#video" className="inline-block font-semibold py-3 px-8 rounded-full hover:opacity-90 transition-colors relative z-10" style={{ backgroundColor: 'var(--wrife-orange)', color: 'white' }}>
              See How It Works
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
