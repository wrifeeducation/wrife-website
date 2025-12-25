'use client'

import Image from 'next/image'

export default function CurriculumAlignment() {
  const alignments = [
    {
      recommendation: "Grammar should be taught systematically",
      wrife: "67 structured lessons with explicit progression from 2-word sentences to multi-paragraph writing",
      icon: "/mascots/colorblocks-pencil.png"
    },
    {
      recommendation: "Reduce unnecessary teacher workload",
      wrife: "Complete lesson packages requiring zero planning time—save 200-400 hours annually",
      icon: "/mascots/clipboard-icon.png"
    },
    {
      recommendation: "Embed assessment in learning",
      wrife: "8 assessment forms across 3 layers with automatic progress tracking and intervention alerts",
      icon: "/mascots/checklist-icon.png"
    },
    {
      recommendation: "Evidence-based curriculum design",
      wrife: "20 years classroom refinement with proven results across diverse pupil populations",
      icon: "/mascots/book-mascot.png"
    }
  ]

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4" style={{ backgroundColor: 'var(--wrife-yellow-soft)', color: 'var(--wrife-orange)' }}>
              Government Alignment
            </div>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--wrife-text-main)' }}>
              Addressing the 2024 Curriculum Review
            </h2>
            <p className="text-xl mt-4 max-w-3xl mx-auto" style={{ color: 'var(--wrife-text-muted)' }}>
              The Department for Education&apos;s review identified critical gaps. 
              WriFe addresses every recommendation.
            </p>
          </div>

          <div className="space-y-6 mb-12">
            {alignments.map((item, index) => (
              <div key={index} className="rounded-xl shadow-lg p-8 border-2" style={{ backgroundColor: 'white', borderColor: 'var(--wrife-border)' }}>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-shrink-0">
                    <Image 
                      src={item.icon}
                      alt=""
                      width={64}
                      height={64}
                      className="drop-shadow-md"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm font-semibold mb-2" style={{ color: 'var(--wrife-coral)' }}>
                          Curriculum Review Says:
                        </div>
                        <p className="italic" style={{ color: 'var(--wrife-text-muted)' }}>
                          &quot;{item.recommendation}&quot;
                        </p>
                      </div>
                      
                      <div>
                        <div className="text-sm font-semibold mb-2" style={{ color: 'var(--wrife-green)' }}>
                          WriFe Delivers:
                        </div>
                        <p style={{ color: 'var(--wrife-text-main)' }}>
                          {item.wrife}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <a 
              href="/WriFe_Curriculum_Review_Comparison.pdf" 
              target="_blank"
              className="inline-block font-semibold py-3 px-8 rounded-full transition-all hover:opacity-90 text-white"
              style={{ backgroundColor: 'var(--wrife-blue)' }}
            >
              Download Full Comparison Document (PDF)
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
