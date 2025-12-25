'use client'

import Image from 'next/image'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer style={{ backgroundColor: 'var(--wrife-text-main)' }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Image 
                  src="/mascots/pencil-reading.png" 
                  alt="WriFe mascot"
                  width={50}
                  height={60}
                />
                <h3 className="text-xl font-bold" style={{ color: 'var(--wrife-yellow)', fontFamily: "'Baloo 2', cursive" }}>
                  WriFe Education
                </h3>
              </div>
              <p className="text-gray-400 mb-4">
                Systematic writing curriculum for UK primary schools. Built by teachers, 
                tested for 20 years, aligned with 2024 Curriculum Review.
              </p>
              <div className="flex gap-4">
                <a href="https://www.linkedin.com/company/wrife" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[var(--wrife-yellow)]">
                  LinkedIn
                </a>
                <a href="https://twitter.com/WriFe_Education" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[var(--wrife-yellow)]">
                  Twitter
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#video" className="text-gray-400 hover:text-[var(--wrife-yellow)]">Watch Videos</a></li>
                <li><a href="#application" className="text-gray-400 hover:text-[var(--wrife-yellow)]">Apply for Pilot</a></li>
                <li><a href="https://wrife.co.uk" className="text-gray-400 hover:text-[var(--wrife-yellow)]">Main Website</a></li>
                <li><a href="https://wrife.co.uk/login" className="text-gray-400 hover:text-[var(--wrife-yellow)]">Teacher Login</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📧 pilot@wrife.co.uk</li>
                <li>📞 [Your Phone]</li>
                <li>🌐 wrife.co.uk</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © {currentYear} WriFe Education Ltd. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm">
                <a href="/privacy" className="text-gray-400 hover:text-[var(--wrife-yellow)]">Privacy Policy</a>
                <a href="/terms" className="text-gray-400 hover:text-[var(--wrife-yellow)]">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
