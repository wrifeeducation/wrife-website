'use client';

import Link from 'next/link';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  description?: string;
}

export default function UpgradeModal({ isOpen, onClose, feature, description }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="text-center mb-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--wrife-yellow)]/20 mb-4">
            <span className="text-3xl">🔓</span>
          </div>
          <h2 className="text-xl font-bold text-[var(--wrife-text-main)] mb-2">
            Upgrade to Unlock
          </h2>
          <p className="text-sm text-[var(--wrife-text-muted)]">
            <strong>{feature}</strong> is a premium feature available with a Full Teacher membership.
          </p>
          {description && (
            <p className="text-sm text-[var(--wrife-text-muted)] mt-2">
              {description}
            </p>
          )}
        </div>

        <div className="bg-[var(--wrife-bg)] rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-sm text-[var(--wrife-text-main)] mb-2">Full Teacher includes:</h3>
          <ul className="text-sm text-[var(--wrife-text-muted)] space-y-1">
            <li>Create unlimited classes</li>
            <li>Add and manage pupils</li>
            <li>Assign lessons and activities</li>
            <li>AI-powered writing assessment</li>
            <li>Track pupil progress</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-full border border-[var(--wrife-border)] text-sm font-semibold text-[var(--wrife-text-muted)] hover:bg-[var(--wrife-bg)] transition"
          >
            Maybe Later
          </button>
          <Link
            href="/pricing"
            className="flex-1 px-4 py-2 rounded-full bg-[var(--wrife-blue)] text-white text-sm font-semibold text-center hover:opacity-90 transition"
          >
            View Plans
          </Link>
        </div>
      </div>
    </div>
  );
}
