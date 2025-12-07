"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav
      className="w-full px-4 md:px-8 py-4"
      style={{
        backgroundColor: "var(--wrife-bg)",
        borderBottom: "1px solid var(--wrife-border)",
      }}
    >
      <div className="flex items-center justify-between">
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
              href="/dashboard"
              className="text-sm transition-colors hover:opacity-70"
              style={{ color: "var(--wrife-text-muted)" }}
            >
              Dashboard
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
            className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors hover:opacity-80 min-h-[44px] flex items-center justify-center"
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
            className="hidden md:inline-flex px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:opacity-90 min-h-[44px] items-center justify-center"
            style={{
              backgroundColor: "var(--wrife-blue)",
              color: "white",
            }}
          >
            Get started
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors hover:opacity-80"
            style={{
              backgroundColor: "var(--wrife-surface)",
              border: "1px solid var(--wrife-border)",
            }}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: "var(--wrife-text-main)" }}
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="md:hidden mt-4 pt-4"
          style={{ borderTop: "1px solid var(--wrife-border)" }}
        >
          <div className="flex flex-col gap-2">
            <Link
              href="/curriculum"
              className="px-4 py-3 text-sm font-medium rounded-lg transition-colors hover:opacity-80 min-h-[44px] flex items-center"
              style={{
                color: "var(--wrife-text-main)",
                backgroundColor: "var(--wrife-surface)",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Curriculum
            </Link>
            <Link
              href="/teacher-area"
              className="px-4 py-3 text-sm font-medium rounded-lg transition-colors hover:opacity-80 min-h-[44px] flex items-center"
              style={{
                color: "var(--wrife-text-main)",
                backgroundColor: "var(--wrife-surface)",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Teacher Area
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-3 text-sm rounded-lg transition-colors hover:opacity-80 min-h-[44px] flex items-center"
              style={{
                color: "var(--wrife-text-muted)",
                backgroundColor: "var(--wrife-surface)",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/interactive-practice"
              className="px-4 py-3 text-sm font-medium rounded-lg transition-colors hover:opacity-80 min-h-[44px] flex items-center"
              style={{
                color: "var(--wrife-text-main)",
                backgroundColor: "var(--wrife-surface)",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Interactive Practice
            </Link>
            <Link
              href="/get-started"
              className="px-4 py-3 text-sm font-medium rounded-lg transition-colors hover:opacity-90 min-h-[44px] flex items-center justify-center mt-2"
              style={{
                backgroundColor: "var(--wrife-blue)",
                color: "white",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Get started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
