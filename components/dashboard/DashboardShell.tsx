"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

type TabKey = 'overview' | 'classes' | 'lessons' | 'pwp' | 'dwp' | 'pupils' | 'assignments';

interface NavItem {
  key: TabKey;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    key: 'overview', label: 'Overview', href: '/dashboard',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  },
  {
    key: 'classes', label: 'My Classes', href: '/dashboard?tab=classes',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
  {
    key: 'lessons', label: 'Lessons', href: '/dashboard?tab=lessons',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  },
  {
    key: 'pwp', label: 'PWP Studio', href: '/dashboard?tab=pwp',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  },
  {
    key: 'dwp', label: 'DWP', href: '/dashboard?tab=dwp',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  },
  {
    key: 'pupils', label: 'Pupils', href: '/dashboard?tab=pupils',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  },
  {
    key: 'assignments', label: 'Assignments', href: '/dashboard?tab=assignments',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const activeTab = (searchParams?.get('tab') ?? 'overview') as TabKey;
  const { user, signOut } = useAuth();
  const router = useRouter();

  const initials = user?.display_name
    ? user.display_name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : (user?.email?.charAt(0)?.toUpperCase() ?? 'T');

  async function handleSignOut() {
    await signOut();
    router.push('/login');
  }

  const activeItem = NAV_ITEMS.find((n) => n.key === activeTab) ?? NAV_ITEMS[0];

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--wrife-bg)" }}>

      {/* ── Left sidebar ── */}
      <aside
        className="hidden lg:flex w-48 flex-shrink-0 flex-col h-full"
        style={{ backgroundColor: "var(--wrife-blue)" }}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/">
            <span
              className="text-white font-extrabold text-xl leading-none"
              style={{ fontFamily: "var(--font-display)" }}
            >
              WriFe
            </span>
          </Link>
          <p className="text-white/40 text-xs mt-1">Teacher Dashboard</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = item.key === activeTab;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <span
                  className={`flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                    isActive ? 'border-white/50 bg-white/15' : 'border-white/20'
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + sign-out */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <div className="flex items-center gap-2 px-3 py-1.5">
            <div
              className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: "var(--wrife-orange)", color: "white" }}
            >
              {initials}
            </div>
            <span className="text-white/55 text-xs truncate">{user?.display_name ?? user?.email}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/45 hover:text-white hover:bg-white/10 w-full text-sm transition-all"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Right side ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Top bar */}
        <header
          className="flex-shrink-0 h-14 bg-white flex items-center justify-between px-6"
          style={{ borderBottom: "1px solid var(--wrife-border)" }}
        >
          {/* Mobile: logo */}
          <Link href="/" className="lg:hidden">
            <span
              className="font-extrabold text-lg"
              style={{ fontFamily: "var(--font-display)", color: "var(--wrife-blue)" }}
            >
              WriFe
            </span>
          </Link>

          {/* Desktop: page title */}
          <div className="hidden lg:flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--wrife-text-main)" }}>
            {activeItem.label}
          </div>

          {/* Right: user info */}
          <div className="flex items-center gap-3 ml-auto lg:ml-0">
            <span className="hidden sm:block text-sm" style={{ color: "var(--wrife-text-muted)" }}>
              {user?.email}
            </span>
            <Link
              href="/dashboard/account"
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold hover:opacity-80 transition-opacity"
              style={{ backgroundColor: "var(--wrife-blue)", color: "white" }}
              title="Account settings"
            >
              {initials}
            </Link>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
