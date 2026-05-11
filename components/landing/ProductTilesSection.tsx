import Image from "next/image";
import Link from "next/link";

const tiles = [
  {
    title: "Teacher Dashboard",
    description:
      "Lesson plans, model texts, teaching notes, class progress tracking, and assignment tools — all in one place for every one of the 67 lessons.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    color: "var(--wrife-blue)",
    bgColor: "var(--wrife-blue-soft)",
    href: "/login",
    cta: "Sign in →",
    mascot: "/mascots/pencil-reading.png",
    external: false,
  },
  {
    title: "Lesson Presentations",
    description:
      "Ready-made slides for every lesson — just click and teach. Perfect for whole-class instruction on any interactive whiteboard.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: "var(--wrife-orange)",
    bgColor: "var(--wrife-yellow-soft)",
    href: "/login",
    cta: "Sign in →",
    mascot: null,
    external: false,
  },
  {
    title: "Interactive Practice",
    description:
      "Gamified grammar games across 61 lessons — drag-and-drop, matching, and writing tasks with instant feedback. Pupils earn badges and climb worlds.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "var(--wrife-green)",
    bgColor: "var(--wrife-green-soft)",
    href: "https://practice.wrife.co.uk",
    cta: "Try it →",
    mascot: "/mascots/pencil-waving.png",
    external: true,
  },
  {
    title: "Writing Practice Studio",
    description:
      "Structured sentence-level writing practice using the WriFe formula engine, chain building, and AI-assessed writing tasks with progress tracking.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
    color: "var(--wrife-coral)",
    bgColor: "var(--wrife-coral-soft)",
    href: "https://pwp-studio.wrife.co.uk",
    cta: "Try it →",
    mascot: null,
    external: true,
  },
];

export default function ProductTilesSection() {
  return (
    <section id="features" className="w-full px-4 md:px-8 py-16 bg-[var(--wrife-bg)]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2
            className="text-3xl md:text-4xl font-extrabold text-[var(--wrife-text-main)] mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Everything in one place
          </h2>
          <p className="text-lg text-[var(--wrife-text-muted)] max-w-2xl mx-auto">
            WriFe gives teachers a complete toolkit and pupils an engaging place to practise.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tiles.map((tile) => (
            <Link
              key={tile.title}
              href={tile.href}
              target={tile.external ? "_blank" : undefined}
              rel={tile.external ? "noopener noreferrer" : undefined}
              className="group bg-white rounded-2xl border border-[var(--wrife-border)] shadow-card hover:shadow-soft transition-all hover:-translate-y-1 overflow-hidden flex flex-col"
            >
              {/* Coloured header */}
              <div
                className="px-5 pt-6 pb-4 flex items-start justify-between gap-3"
                style={{ backgroundColor: tile.bgColor }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: tile.color, color: "white" }}
                >
                  {tile.icon}
                </div>
                {tile.mascot && (
                  <Image
                    src={tile.mascot}
                    alt=""
                    width={56}
                    height={64}
                    className="object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                )}
              </div>

              {/* Body */}
              <div className="px-5 py-4 flex-1">
                <h3
                  className="text-lg font-bold text-[var(--wrife-text-main)] mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {tile.title}
                </h3>
                <p className="text-sm text-[var(--wrife-text-muted)] leading-relaxed">
                  {tile.description}
                </p>
              </div>

              {/* Footer */}
              <div className="px-5 pb-5">
                <span
                  className="text-sm font-semibold group-hover:underline"
                  style={{ color: tile.color }}
                >
                  {tile.cta}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
