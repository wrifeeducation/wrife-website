'use client'

import Image from 'next/image'

export default function PilotDetails() {
  const whatYouReceive = [
    "Complete platform access (all 67 lessons)",
    "All lesson materials: presentations, worksheets, activities",
    "2-hour teacher training session",
    "Weekly check-ins and support (first term)",
    "Dedicated support line (email + phone during school hours)",
    "Progress tracking dashboard with automated alerts",
    "Complete assessment package for each lesson",
    "Access to resource library and video tutorials"
  ]

  const whatWeAsk = [
    {
      title: "Pre/post writing assessments",
      detail: "Validated instruments, approximately 45-60 minutes per pupil across term"
    },
    {
      title: "Teacher feedback surveys",
      detail: "Three surveys (10 minutes each) spaced across pilot period"
    },
    {
      title: "Planning time logs",
      detail: "5 minutes weekly to track time savings"
    },
    {
      title: "End-of-pilot interview",
      detail: "30-minute conversation with Michael or team member"
    },
    {
      title: "Commitment to full pilot",
      detail: "Minimum one full term of implementation"
    }
  ]

  const timeline = [
    {
      date: "December 2025",
      title: "Applications & Selection",
      items: ["Applications open", "School selection", "Confirmation"],
      badge: null
    },
    {
      date: "January 2026",
      title: "Launch",
      items: ["Teacher training (2 hours)", "Pre-assessment", "Pilot begins: Lessons 1-10"],
      badge: "/mascots/foundation-badge.png"
    },
    {
      date: "Feb-March 2026",
      title: "Mid-Point",
      items: ["Lessons 11-25", "Mid-point survey", "Ongoing support"],
      badge: "/mascots/application-badge.png"
    },
    {
      date: "April-June 2026",
      title: "Completion",
      items: ["Lessons 26-40+", "Post-assessment", "Final surveys"],
      badge: "/mascots/mastery-badge.png"
    },
    {
      date: "July 2026",
      title: "Results & Next Steps",
      items: ["Evidence report", "Subscription decisions", "Early adopter pricing"],
      badge: "/mascots/achievement-badge.png"
    }
  ]

  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--wrife-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--wrife-text-main)' }}>
              Free Pilot Programme
            </h2>
            <p className="text-xl mt-4" style={{ color: 'var(--wrife-text-muted)' }}>
              January-June 2026 – 10-20 UK Primary Schools
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h3 className="flex items-center gap-3 mb-6 text-2xl font-bold" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--wrife-text-main)' }}>
                <Image src="/mascots/face-happy.png" alt="" width={40} height={40} />
                <span>What You Receive</span>
              </h3>
              
              <div className="space-y-4">
                {whatYouReceive.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="rounded-full p-1 mt-1" style={{ backgroundColor: 'var(--wrife-green-soft)' }}>
                      <svg className="w-4 h-4" style={{ color: 'var(--wrife-green)' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <p style={{ color: 'var(--wrife-text-main)' }}>{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: 'var(--wrife-yellow-soft)' }}>
                <p className="font-bold text-lg mb-2" style={{ color: 'var(--wrife-orange)' }}>
                  Total Value: £5,000-6,000
                </p>
                <p style={{ color: 'var(--wrife-text-main)' }}>
                  Your Cost: £0 (Completely Free)
                </p>
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-3 mb-6 text-2xl font-bold" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--wrife-text-main)' }}>
                <Image src="/mascots/clipboard-icon.png" alt="" width={40} height={40} />
                <span>What We&apos;re Asking</span>
              </h3>
              
              <div className="space-y-4">
                {whatWeAsk.map((item, index) => (
                  <div key={index} className="border-l-4 pl-4" style={{ borderColor: 'var(--wrife-blue)' }}>
                    <p className="font-semibold mb-1" style={{ color: 'var(--wrife-text-main)' }}>{item.title}</p>
                    <p className="text-sm" style={{ color: 'var(--wrife-text-muted)' }}>{item.detail}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--wrife-blue-soft)' }}>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--wrife-blue)' }}>
                  Total Time Commitment:
                </p>
                <p className="text-sm" style={{ color: 'var(--wrife-text-muted)' }}>
                  ~3-4 hours across entire pilot period (minimal compared to 200+ hours saved in planning time)
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 rounded-xl shadow-lg p-8 border-2" style={{ backgroundColor: 'white', borderColor: 'var(--wrife-border)' }}>
            <h3 className="mb-6 text-2xl font-bold" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--wrife-text-main)' }}>Ideal Pilot Schools</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="font-semibold mb-3" style={{ color: 'var(--wrife-green)' }}>We&apos;re Looking For:</p>
                <ul className="space-y-2">
                  {[
                    "2+ form entry (200+ pupils for meaningful data)",
                    "Currently facing writing instruction challenges",
                    "Engaged leadership willing to provide feedback",
                    "Technology infrastructure (shared devices acceptable)",
                    "Commitment to full implementation"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span style={{ color: 'var(--wrife-green)' }}>✓</span>
                      <span style={{ color: 'var(--wrife-text-main)' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <p className="font-semibold mb-3" style={{ color: 'var(--wrife-text-muted)' }}>Not Required:</p>
                <ul className="space-y-2">
                  {[
                    "Outstanding Ofsted rating",
                    "1:1 device ratio",
                    "Previous EdTech experience",
                    "Perfect conditions"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span style={{ color: 'var(--wrife-text-muted)' }}>✗</span>
                      <span style={{ color: 'var(--wrife-text-muted)' }}>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm mt-3 italic" style={{ color: 'var(--wrife-text-muted)' }}>
                  Real schools with real challenges welcome!
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h3 className="mb-8 text-center text-2xl font-bold" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--wrife-text-main)' }}>
              Pilot Timeline & Learning Journey
            </h3>
            
            <div className="relative">
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1" style={{ backgroundColor: 'var(--wrife-blue-soft)' }}></div>
              
              <div className="space-y-8">
                {timeline.map((phase, index) => (
                  <div key={index} className="relative">
                    <div className={`flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                      <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8'}`}>
                        <div className="bg-white rounded-lg shadow-md p-6 border-2" style={{ borderColor: 'var(--wrife-blue-soft)' }}>
                          <div className="flex items-center gap-3 mb-2" style={{ justifyContent: index % 2 === 0 ? 'flex-end' : 'flex-start' }}>
                            {phase.badge && (
                              <Image 
                                src={phase.badge}
                                alt=""
                                width={48}
                                height={48}
                                className="drop-shadow-sm"
                              />
                            )}
                            <div>
                              <div className="text-sm font-semibold" style={{ color: 'var(--wrife-blue)' }}>{phase.date}</div>
                              <div className="font-bold text-lg" style={{ color: 'var(--wrife-text-main)' }}>{phase.title}</div>
                            </div>
                          </div>
                          <ul className={`space-y-1 text-sm ${index % 2 === 0 ? 'md:text-right' : ''}`} style={{ color: 'var(--wrife-text-muted)' }}>
                            {phase.items.map((item, i) => (
                              <li key={i}>→ {item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full border-4 border-white shadow-lg items-center justify-center" style={{ backgroundColor: 'var(--wrife-blue)' }}>
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                      
                      <div className="hidden md:block w-5/12"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
