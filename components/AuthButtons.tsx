"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

export default function AuthButtons() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, loading } = useAuth();

  const handleSignOut = async () => {
    setShowUserMenu(false);
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return <div className="h-10 w-20 bg-gray-100 rounded-full animate-pulse"></div>;
  }

  if (user) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-2 rounded-full border border-[var(--wrife-border)] bg-white px-4 py-1.5 text-sm font-semibold text-[var(--wrife-text-main)] hover:bg-[var(--wrife-bg)] transition"
        >
          <div className="h-6 w-6 rounded-full bg-[var(--wrife-blue-soft)] flex items-center justify-center text-xs font-bold text-[var(--wrife-blue)]">
            {user.display_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
          </div>
          <span className="hidden md:inline">{user.display_name || user.email?.split('@')[0]}</span>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-strong border border-[var(--wrife-border)] py-2 z-50">
            <div className="px-4 py-2 border-b border-[var(--wrife-border)]">
              <p className="text-xs font-semibold text-[var(--wrife-text-main)]">{user.email}</p>
              <p className="text-xs text-[var(--wrife-text-muted)] capitalize">{user.role}</p>
            </div>
            <Link href="/dashboard">
              <button className="w-full text-left px-4 py-2 text-sm text-[var(--wrife-text-main)] hover:bg-[var(--wrife-bg)] transition">
                Dashboard
              </button>
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-[var(--wrife-danger)] hover:bg-[var(--wrife-coral)]/10 transition"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="px-4 py-2 text-sm font-semibold rounded-full border transition-colors hover:bg-[var(--wrife-blue-soft)] min-h-[44px] flex items-center justify-center"
        style={{
          color: "var(--wrife-blue)",
          borderColor: "var(--wrife-blue)",
          backgroundColor: "transparent",
        }}
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className="hidden md:inline-flex px-4 py-2 text-sm font-medium rounded-full transition-colors hover:opacity-90 min-h-[44px] items-center justify-center shadow-soft hover:scale-[1.02] hover:shadow-strong"
        style={{
          backgroundColor: "var(--wrife-blue)",
          color: "white",
        }}
      >
        Get started
      </Link>
    </>
  );
}
