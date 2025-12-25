'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "Is WriFe aligned with the National Curriculum?",
      answer: "Yes. WriFe teaches all National Curriculum grammar objectives systematically across Years 2-6. We provide detailed NC mapping showing which lessons cover which objectives."
    },
    {
      question: "How is WriFe different from other writing programmes?",
      answer: "Three key differences: (1) Practice-first architecture: Every lesson reinforces previous learning, (2) Mastery-based progression: Pupils advance when ready, not by calendar, (3) Grammar through storytelling: Not isolated exercises, but meaningful personal writing."
    },
    {
      question: "What if my school doesn't have 1:1 devices?",
      answer: "WriFe works with any technology setup. The platform is optimized for shared device use, and all materials can be printed for offline use. Many lessons work perfectly well with traditional teaching methods."
    },
    {
      question: "How much time does WriFe save teachers?",
      answer: "Teachers currently spend 5-10 hours weekly planning writing lessons. WriFe provides complete lesson packages, reducing planning to near zero. Over a school year, that's 200-400 hours saved per teacher."
    },
    {
      question: "What support do pilot schools receive?",
      answer: "Pilot schools receive 2-hour training, weekly check-ins first term, dedicated support line (email + phone during school hours), and access to our resource library and video tutorials."
    },
    {
      question: "What happens after the pilot ends?",
      answer: "You'll receive a comprehensive evidence report with your school's results. You can then decide whether to continue with WriFe at our early adopter pricing (discounted rate for pilot schools)."
    },
    {
      question: "Can we start mid-year?",
      answer: "The pilot is designed for January 2026 start, but WriFe's mastery-based approach means pupils can start at any point and progress at their own pace."
    },
    {
      question: "What year groups does WriFe cover?",
      answer: "WriFe covers Years 2-6 (ages 6-10), though progression is based on mastery rather than age. A Year 3 pupil who's ready can move faster; a Year 5 pupil with gaps can start earlier."
    }
  ]

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Image 
                src="/mascots/pencil-thinking.png" 
                alt="Thinking pencil"
                width={100}
                height={120}
                className="drop-shadow-md"
              />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--wrife-text-main)' }}>
              Frequently Asked Questions
            </h2>
            <p className="text-xl mt-4" style={{ color: 'var(--wrife-text-muted)' }}>
              Everything you need to know about the WriFe pilot programme
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border-2 overflow-hidden" style={{ borderColor: 'var(--wrife-border)' }}>
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center transition-colors"
                  style={{ backgroundColor: openIndex === index ? 'var(--wrife-blue-soft)' : 'white' }}
                >
                  <span className="font-semibold pr-4" style={{ color: 'var(--wrife-text-main)' }}>{faq.question}</span>
                  <svg
                    className={`w-5 h-5 transition-transform flex-shrink-0 ${
                      openIndex === index ? 'transform rotate-180' : ''
                    }`}
                    style={{ color: 'var(--wrife-blue)' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-5">
                    <p style={{ color: 'var(--wrife-text-muted)' }}>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center rounded-xl shadow-lg p-8 border-2" style={{ backgroundColor: 'white', borderColor: 'var(--wrife-border)' }}>
            <div className="flex justify-center mb-4">
              <Image 
                src="/mascots/face-thumbsup.png" 
                alt="Thumbs up"
                width={60}
                height={60}
              />
            </div>
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--wrife-text-main)' }}>
              Still Have Questions?
            </h3>
            <p className="mb-6" style={{ color: 'var(--wrife-text-muted)' }}>
              We&apos;re happy to answer any questions about the pilot programme or WriFe in general.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:pilot@wrife.co.uk" className="inline-block text-white font-semibold py-3 px-8 rounded-full transition-all hover:opacity-90" style={{ backgroundColor: 'var(--wrife-orange)' }}>
                Email Us
              </a>
              <a href="tel:+447359196342" className="inline-block font-semibold py-3 px-8 rounded-full transition-all border-2" style={{ color: 'var(--wrife-blue)', borderColor: 'var(--wrife-blue)' }}>
                Call Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
