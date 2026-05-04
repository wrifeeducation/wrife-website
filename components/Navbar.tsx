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
  const { user, getDashboardPath, signOut } = useAuth();

  const isLoggedIn = !!user;
  const dashboardPath = getDashboardPath();

  return (
    <nav
      className="w-full px-4 md:px-8 py-4 sticky top-0 z-50 shadow-soft"
      style={{ backgroundColor: "var(--wrife-blue)" }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href={isLoggedIn ? dashboardPath : "/"} className="flex items-center gap-2">
            <BookLogo size="md" />
            <span
              className="font-extrabold text-xl text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              WriFe
            </span>
          </Link>

          {isLoggedIn ? (
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href={dashboardPath}
                className="text-base font-medium text-white/80 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard?tab=lessons"
                className="text-base font-medium text-white/80 hover:text-white transition-colors"
              >
                Lessons
              </Link>
              <Link
                href="/dashboard/help"
                className="text-base font-medium text-white/80 hover:text-white transition-colors"
              >
                Help
              </Link>
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-6">
              <a href="#lessons" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                Lessons
              </a>
              <a href="#features" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                Pricing
              </a>
              <Link href="/contact" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                Contact
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/dashboard/account"
                className="text-base text-white/80 hover:text-white transition-colors"
                title="Account settings"
              >
                {user.display_name || user.email}
              </Link>
              <button
                onClick={() => signOut()}
                className="text-base font-medium text-white/80 hover:text-white transition-colors px-4 py-2"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/pupil/login"
                className="text-sm font-medium text-white/80 hover:text-white transition-colors px-3 py-2"
              >
                Pupil Login
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-white/80 hover:text-white transition-colors px-3 py-2"
              >
                Teacher Login
              </Link>
              <Link
                href="/signup"
                className="text-sm font-bold rounded-full px-5 py-2.5 transition-all hover:scale-105"
                style={{ backgroundColor: "var(--wrife-orange)", color: "white" }}
              >
                Start Free Trial
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors bg-white/20 border border-white/30"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="md:hidden mt-4 pt-4 border-t border-white/20 rounded-b-2xl"
          style={{ backgroundColor: "var(--wrife-blue-dark)" }}
        >
          {isLoggedIn ? (
            <div className="flex flex-col gap-1 pb-3">
              <Link href={dashboardPath} className="px-4 py-3 text-sm font-medium text-white hover:bg-white/10 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <Link href="/dashboard?tab=lessons" className="px-4 py-3 text-sm font-medium text-white hover:bg-white/10 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Lessons</Link>
              <Link href="/dashboard/help" className="px-4 py-3 text-sm font-medium text-white hover:bg-white/10 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Help</Link>
              <div className="border-t border-white/20 my-2 mx-4" />
              <div className="px-4 py-2 text-xs text-white/60">Signed in as {user.display_name || user.email}</div>
              <button
                onClick={() => { signOut(); setMobileMenuOpen(false); }}
                className="mx-4 px-4 py-3 text-sm font-medium rounded-lg bg-red-500/20 text-red-200 hover:bg-red-500/30 text-left"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1 pb-3">
              <a href="#lessons" className="px-4 py-3 text-sm font-medium text-white hover:bg-white/10 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Lessons</a>
              <a href="#features" className="px-4 py-3 text-sm font-medium text-white hover:bg-white/10 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#pricing" className="px-4 py-3 text-sm font-medium text-white hover:bg-white/10 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <Link href="/contact" className="px-4 py-3 text-sm font-medium text-white hover:bg-white/10 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              <div className="border-t border-white/20 my-2 mx-4" />
              <Link href="/pupil/login" className="px-4 py-3 text-sm font-medium text-white hover:bg-white/10 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Pupil Login</Link>
              <Link href="/login" className="px-4 py-3 text-sm font-medium text-white hover:bg-white/10 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Teacher Login</Link>
              <div className="px-4 pt-2">
                <Link
                  href="/signup"
                  className="block py-3 text-sm font-bold rounded-full text-white text-center"
                  style={{ backgroundColor: "var(--wrife-orange)" }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
