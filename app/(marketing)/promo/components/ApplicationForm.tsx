'use client'

export default function ApplicationForm() {
  return (
    <section id="application" className="text-white py-16 md:py-24" style={{ background: 'linear-gradient(135deg, var(--wrife-green) 0%, #2C5F2D 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Baloo 2', cursive" }}>
              Apply for Free Pilot Programme
            </h2>
            <p className="text-xl text-white/90">
              Transform writing instruction in your school – Zero cost, just feedback
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold mb-2" style={{ color: '#90EE90' }}>10-20</div>
                <div className="text-sm text-white/80">Schools Selected</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2" style={{ color: '#90EE90' }}>10 min</div>
                <div className="text-sm text-white/80">Application Time</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2" style={{ color: '#90EE90' }}>5 days</div>
                <div className="text-sm text-white/80">Response Time</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Baloo 2', cursive" }}>
                Application Questions
              </h3>
              
              <div className="space-y-6 text-gray-700">
                <p className="text-sm">
                  The application form will collect:
                </p>
                <ul className="space-y-2 text-sm">
                  <li>• School name and contact details</li>
                  <li>• School size and year groups</li>
                  <li>• Current writing instruction challenges</li>
                  <li>• Why you want to pilot WriFe</li>
                  <li>• Technology setup</li>
                  <li>• Commitment confirmation</li>
                </ul>
                
                <div className="pt-6 border-t">
                  <a 
                    href="https://forms.google.com/YOUR_FORM_ID" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-white font-semibold py-3 px-8 rounded-lg transition-all transform hover:scale-105"
                    style={{ backgroundColor: 'var(--wrife-orange)' }}
                  >
                    Open Application Form →
                  </a>
                  <p className="text-xs text-gray-500 mt-3">
                    Form opens in new window – Takes approximately 10 minutes
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-white/80 mb-4">
              Questions before applying?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:pilot@wrife.co.uk" className="text-white hover:text-[#90EE90] underline">
                📧 pilot@wrife.co.uk
              </a>
              <a href="tel:+447000000000" className="text-white hover:text-[#90EE90] underline">
                📞 [Your Phone Number]
              </a>
            </div>
            <p className="text-sm text-white/60 mt-3">
              We respond within 24 hours during term time
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
