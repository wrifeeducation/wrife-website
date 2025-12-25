'use client'

export default function CurriculumAlignment() {
  const alignments = [
    {
      recommendation: "Grammar should be taught systematically",
      wrife: "67 structured lessons with explicit progression from 2-word sentences to multi-paragraph writing",
      icon: "📖"
    },
    {
      recommendation: "Reduce unnecessary teacher workload",
      wrife: "Complete lesson packages requiring zero planning time—save 200-400 hours annually",
      icon: "⏱️"
    },
    {
      recommendation: "Embed assessment in learning",
      wrife: "8 assessment forms across 3 layers with automatic progress tracking and intervention alerts",
      icon: "✅"
    },
    {
      recommendation: "Evidence-based curriculum design",
      wrife: "20 years classroom refinement with proven results across diverse pupil populations",
      icon: "🔬"
    }
  ]

  return (
    <section className="py-16 md:py-24" style={{ background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4" style={{ backgroundColor: 'var(--wrife-green-soft)', color: '#2C5F2D' }}>
              Government Alignment
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Baloo 2', cursive" }}>
              Addressing the 2024 Curriculum Review
            </h2>
            <p className="text-xl text-gray-600 mt-4 max-w-3xl mx-auto">
              The Department for Education&apos;s review identified critical gaps. 
              WriFe addresses every recommendation.
            </p>
          </div>

          <div className="space-y-6 mb-12">
            {alignments.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="text-5xl">{item.icon}</div>
                  
                  <div className="flex-1">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm font-semibold mb-2" style={{ color: '#2C5F2D' }}>
                          Curriculum Review Says:
                        </div>
                        <p className="text-gray-700 italic">
                          &quot;{item.recommendation}&quot;
                        </p>
                      </div>
                      
                      <div>
                        <div className="text-sm font-semibold mb-2" style={{ color: 'var(--wrife-green)' }}>
                          WriFe Delivers:
                        </div>
                        <p className="text-gray-700">
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
              className="inline-block font-semibold py-3 px-8 rounded-lg transition-colors text-white"
              style={{ backgroundColor: 'var(--wrife-green)' }}
            >
              Download Full Comparison Document (PDF)
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
