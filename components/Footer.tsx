'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="w-full px-4 md:px-8 py-6 mt-auto"
      style={{ 
        backgroundColor: 'var(--wrife-bg)',
        borderTop: '1px solid var(--wrife-border)'
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ backgroundColor: 'var(--wrife-blue-soft)' }}
          >
            <span className="text-xs font-bold" style={{ color: 'var(--wrife-blue)' }}>W</span>
          </div>
          <span className="text-sm" style={{ color: 'var(--wrife-text-muted)' }}>
            © {currentYear} WriFe. All rights reserved.
          </span>
        </div>

        <div className="flex items-center gap-6">
          <Link 
            href="/privacy" 
            className="text-xs transition-colors hover:text-[var(--wrife-blue)]"
            style={{ color: 'var(--wrife-text-muted)' }}
          >
            Privacy
          </Link>
          <Link 
            href="/terms" 
            className="text-xs transition-colors hover:text-[var(--wrife-blue)]"
            style={{ color: 'var(--wrife-text-muted)' }}
          >
            Terms
          </Link>
          <Link 
            href="/admin/login" 
            className="text-xs transition-colors hover:text-[var(--wrife-blue)]"
            style={{ color: 'var(--wrife-text-muted)' }}
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
