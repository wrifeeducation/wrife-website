import Link from "next/link";

export default function Navbar() {
  return (
    <nav
      className="w-full px-4 md:px-8 py-4 flex items-center justify-between"
      style={{
        backgroundColor: "var(--wrife-bg)",
        borderBottom: "1px solid var(--wrife-border)",
      }}
    >
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "var(--wrife-blue-soft)" }}
          >
            <span
              className="text-xl font-bold"
              style={{ color: "var(--wrife-blue)" }}
            >
              W
            </span>
          </div>
          <div className="flex flex-col">
            <span
              className="font-bold text-lg leading-tight"
              style={{ color: "var(--wrife-text-main)" }}
            >
              WriFe
            </span>
            <span
              className="text-xs leading-tight"
              style={{ color: "var(--wrife-text-muted)" }}
            >
              Writing for Everyone
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/curriculum"
            className="text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: "var(--wrife-text-main)" }}
          >
            Curriculum
          </Link>
          <Link
            href="/teacher-area"
            className="text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: "var(--wrife-text-main)" }}
          >
            Teacher Area
          </Link>
          <Link
            href="/interactive-practice"
            className="text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: "var(--wrife-text-main)" }}
          >
            Interactive Practice
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="hidden md:inline-flex px-4 py-2 text-sm font-medium rounded-lg border transition-colors hover:opacity-80"
          style={{
            color: "var(--wrife-blue)",
            borderColor: "var(--wrife-blue)",
            backgroundColor: "transparent",
          }}
        >
          Log in
        </Link>
        <Link
          href="/get-started"
          className="px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:opacity-90"
          style={{
            backgroundColor: "var(--wrife-blue)",
            color: "white",
          }}
        >
          Get started
        </Link>
      </div>
    </nav>
  );
}
