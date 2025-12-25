'use client'

export default function Problem() {
  return (
    <section className="bg-gray-50 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Baloo 2', cursive" }}>
              The Problem with Current Writing Instruction
            </h2>
            <p className="text-xl text-gray-600 mt-4">
              The 2024 Curriculum & Assessment Review identified critical gaps
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Random Grammar Instruction</h3>
              <p className="text-gray-600">
                Grammar taught in isolation with no clear progression. Pupils 
                learn rules but can&apos;t apply them in actual writing.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Excessive Teacher Workload</h3>
              <p className="text-gray-600">
                Teachers spend 5-10 hours weekly planning writing lessons—that&apos;s 
                200-400 hours annually per teacher.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Assessment Comes Too Late</h3>
              <p className="text-gray-600">
                End-of-unit tests arrive too late to inform teaching. Teachers 
                need real-time data to make intervention decisions.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📉</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Poor Outcomes</h3>
              <p className="text-gray-600">
                30%+ of pupils finish primary school below expected writing 
                standards despite years of instruction.
              </p>
            </div>
          </div>

          <div className="rounded-2xl p-8 md:p-12 text-center text-white" style={{ backgroundColor: 'var(--wrife-green)' }}>
            <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ fontFamily: "'Baloo 2', cursive" }}>
              WriFe Solves Every Single One
            </h3>
            <p className="text-lg text-white/90 mb-6">
              Systematic grammar progression – Complete lesson packages – 
              Built-in assessment – Proven outcomes
            </p>
            <a href="#video" className="inline-block bg-white text-gray-900 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
              See How It Works
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
