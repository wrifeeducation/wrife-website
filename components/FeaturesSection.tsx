import OwlMascot from "./mascots/OwlMascot";

const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: "67 Progressive Lessons",
    description: "A carefully structured curriculum that builds skills step-by-step, from personal narratives to published compositions.",
    color: "var(--wrife-blue)",
    bgColor: "var(--wrife-blue-soft)",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "AI-Powered Feedback",
    description: "Instant, personalised feedback helps pupils understand their strengths and areas for improvement.",
    color: "var(--wrife-orange)",
    bgColor: "var(--wrife-yellow-soft)",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    title: "Teacher Dashboard",
    description: "Track class progress, assign lessons, and review pupil work all in one place.",
    color: "var(--wrife-green)",
    bgColor: "var(--wrife-green-soft)",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
    ),
    title: "Interactive Practice",
    description: "Engaging activities and worksheets keep pupils motivated and practising their writing skills.",
    color: "var(--wrife-coral)",
    bgColor: "rgba(255, 111, 97, 0.1)",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Progress Tracking",
    description: "Visual progress reports help teachers and pupils celebrate achievements and identify growth areas.",
    color: "var(--wrife-blue)",
    bgColor: "var(--wrife-blue-soft)",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: "Class Management",
    description: "Easy-to-use tools for managing classes, adding pupils, and assigning lessons with class codes.",
    color: "var(--wrife-orange)",
    bgColor: "var(--wrife-yellow-soft)",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="w-full px-4 md:px-8 py-16 bg-[var(--wrife-bg)]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--wrife-text-main)] mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Everything You Need to Teach Writing
          </h2>
          <p className="text-[var(--wrife-text-muted)] text-lg max-w-2xl mx-auto">
            WriFe combines proven teaching methods with modern technology to make writing education effective and enjoyable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-soft border border-[var(--wrife-border)] hover:shadow-lg transition-shadow"
            >
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: feature.bgColor, color: feature.color }}
              >
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[var(--wrife-text-muted)]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-[var(--wrife-blue)] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <OwlMascot size="lg" />
          </div>
          <div className="text-center md:text-left text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              Ready to transform your writing lessons?
            </h3>
            <p className="text-white/80 mb-6">
              Join hundreds of teachers using WriFe to help their pupils become confident writers.
            </p>
            <a
              href="/signup"
              className="inline-block px-8 py-4 text-lg font-bold rounded-full shadow-soft hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'white', color: 'var(--wrife-blue)' }}
            >
              Start Your Free Trial
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
