"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth-context";
import BookLogo from "./mascots/BookLogo";

const AuthButtons = dynamic(() => import("./AuthButtons"), {
  ssr: false,
  loading: () => <div className="h-10 w-20 bg-gray-100 rounded-full animate-pulse"></div>,
});

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getDashboardPath } = useAuth();

  return (
    <nav className="w-full px-4 md:px-8 py-4 bg-[var(--wrife-bg)] border-b border-[var(--wrife-border)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <BookLogo size="md" />
            <span 
              className="font-extrabold text-xl text-[var(--wrife-text-main)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              WriFe
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#lessons"
              className="text-sm font-medium text-[var(--wrife-text-muted)] hover:text-[var(--wrife-blue)] transition-colors"
            >
              Lessons
            </a>
            <a
              href="#features"
              className="text-sm font-medium text-[var(--wrife-text-muted)] hover:text-[var(--wrife-blue)] transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-[var(--wrife-text-muted)] hover:text-[var(--wrife-blue)] transition-colors"
            >
              Pricing
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--wrife-text-main)] hover:text-[var(--wrife-blue)] transition-colors px-4 py-2"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-bold text-white bg-[var(--wrife-orange)] hover:opacity-90 transition-opacity px-5 py-2.5 rounded-full shadow-soft"
            >
              Start Free Trial
            </Link>
          </div>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors bg-white border border-[var(--wrife-border)]"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg
              className="w-6 h-6 text-[var(--wrife-text-main)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
        <div className="md:hidden mt-4 pt-4 border-t border-[var(--wrife-border)]">
          <div className="flex flex-col gap-2">
            <a
              href="#lessons"
              className="px-4 py-3 text-sm font-medium rounded-lg bg-white text-[var(--wrife-text-main)] hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Lessons
            </a>
            <a
              href="#features"
              className="px-4 py-3 text-sm font-medium rounded-lg bg-white text-[var(--wrife-text-main)] hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#pricing"
              className="px-4 py-3 text-sm font-medium rounded-lg bg-white text-[var(--wrife-text-main)] hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </a>
            <Link
              href="/login"
              className="px-4 py-3 text-sm font-medium rounded-lg bg-white text-[var(--wrife-text-main)] hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-3 text-sm font-bold rounded-full bg-[var(--wrife-orange)] text-white text-center mt-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
