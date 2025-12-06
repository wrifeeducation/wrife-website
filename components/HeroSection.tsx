import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      className="w-full px-4 md:px-8 py-12 md:py-20"
      style={{ backgroundColor: "var(--wrife-bg)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 text-center lg:text-left">
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6"
              style={{ color: "var(--wrife-text-main)" }}
            >
              A Complete 67-Lesson System for Teaching Writing
            </h1>
            <p
              className="text-base md:text-lg leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0"
              style={{ color: "var(--wrife-text-muted)" }}
            >
              WriFe provides primary school teachers with a systematic, proven
              curriculum that transforms writing instruction. From personal
              stories to published compositions, every lesson builds on the
              last.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/lessons"
                className="px-6 py-3 text-base font-medium rounded-lg transition-all hover:opacity-90 hover:shadow-lg"
                style={{
                  backgroundColor: "var(--wrife-blue)",
                  color: "white",
                }}
              >
                Explore the Lessons
              </Link>
              <Link
                href="/how-it-works"
                className="px-6 py-3 text-base font-medium rounded-lg border-2 transition-all hover:opacity-80"
                style={{
                  backgroundColor: "white",
                  color: "var(--wrife-blue)",
                  borderColor: "var(--wrife-blue)",
                }}
              >
                See How It Works
              </Link>
            </div>
          </div>

          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <div
              className="w-full aspect-[4/3] rounded-2xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, var(--wrife-blue-soft) 0%, var(--wrife-yellow) 100%)",
                boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
              }}
              role="img"
              aria-label="Illustration showing teachers and students engaged in writing activities"
            >
              <span
                className="text-lg font-medium"
                style={{ color: "var(--wrife-text-muted)" }}
              >
                Illustration Placeholder
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
