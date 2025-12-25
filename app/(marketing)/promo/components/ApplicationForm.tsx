'use client'

import Image from 'next/image'
import ContactForm from './ContactForm'

export default function ApplicationForm() {
  return (
    <section id="application" className="py-16 md:py-24 text-white relative overflow-hidden" style={{ backgroundColor: 'var(--wrife-blue)' }}>
      <div className="absolute right-0 bottom-0 opacity-10">
        <Image 
          src="/mascots/pencil-celebrating.png" 
          alt=""
          width={300}
          height={350}
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <Image 
                src="/mascots/pencil-celebrating.png" 
                alt="Celebrating pencil mascot"
                width={120}
                height={140}
                className="drop-shadow-lg"
              />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Baloo 2', cursive" }}>
              Apply for Free Pilot Programme
            </h2>
            <p className="text-xl text-white/90">
              Transform writing instruction in your school – Zero cost, just feedback
            </p>
          </div>

          <div className="backdrop-blur-sm rounded-2xl p-8 mb-12" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--wrife-yellow)' }}>10-20</div>
                <div className="text-sm text-white/80">Schools Selected</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--wrife-yellow)' }}>10 min</div>
                <div className="text-sm text-white/80">Application Time</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--wrife-yellow)' }}>5 days</div>
                <div className="text-sm text-white/80">Response Time</div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden p-8">
              <h3 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--wrife-text-main)' }}>
                Apply via Google Form
              </h3>
              
              <div className="space-y-6" style={{ color: 'var(--wrife-text-muted)' }}>
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
                
                <div className="pt-6 border-t" style={{ borderColor: 'var(--wrife-border)' }}>
                  <a 
                    href="https://forms.google.com/YOUR_FORM_ID" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-white font-semibold py-3 px-8 rounded-full transition-all transform hover:scale-105"
                    style={{ backgroundColor: 'var(--wrife-orange)' }}
                  >
                    Open Application Form →
                  </a>
                  <p className="text-xs mt-3" style={{ color: 'var(--wrife-text-muted)' }}>
                    Form opens in new window – Takes approximately 10 minutes
                  </p>
                </div>
              </div>
            </div>

            <ContactForm />
          </div>

          <div className="mt-12 text-center">
            <p className="text-white/80 mb-4">
              Questions before applying?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:hello@wrife.co.uk" className="text-white hover:text-[var(--wrife-yellow)] underline">
                📧 hello@wrife.co.uk
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
