'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

const YEAR_GROUPS = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'];

export default function SchoolRegisterPage() {
  const [form, setForm] = useState({
    school_name: '',
    contact_name: '',
    email: '',
    phone: '',
    website: '',
    num_pupils: '',
    num_teachers: '',
    year_groups: [] as string[],
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function toggleYearGroup(yg: string) {
    setForm(prev => ({
      ...prev,
      year_groups: prev.year_groups.includes(yg)
        ? prev.year_groups.filter(y => y !== yg)
        : [...prev.year_groups, yg],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/school-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Network error — please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[var(--wrife-bg)] py-12">
        <div className="mx-auto max-w-2xl px-4">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--wrife-blue)] text-white text-3xl mb-4 shadow-soft">
              🏫
            </div>
            <h1 className="text-3xl font-extrabold text-[var(--wrife-text-main)] mb-3">
              Register Your School
            </h1>
            <p className="text-[var(--wrife-text-muted)] max-w-lg mx-auto leading-relaxed">
              Get your school set up on WriFe. Fill in the form below and we'll be in touch within 1–2 working days to create your account.
            </p>
          </div>

          {submitted ? (
            <div className="bg-white rounded-2xl border border-green-200 p-8 text-center shadow-soft">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-xl font-bold text-[var(--wrife-text-main)] mb-2">Thank you!</h2>
              <p className="text-[var(--wrife-text-muted)] mb-6">
                Your registration has been received. We'll review it and be in touch at <strong>{form.email}</strong> within 1–2 working days.
              </p>
              <Link
                href="/"
                className="inline-block rounded-full bg-[var(--wrife-blue)] px-8 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
              >
                Back to Home
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[var(--wrife-border)] p-6 sm:p-8 shadow-soft">
              {error && (
                <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* School details */}
                <div>
                  <h3 className="text-sm font-bold text-[var(--wrife-text-main)] uppercase tracking-wide mb-3">
                    School Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                        School Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.school_name}
                        onChange={e => setForm(p => ({ ...p, school_name: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent"
                        placeholder="St Mary's Primary School"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                          Number of Pupils
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={form.num_pupils}
                          onChange={e => setForm(p => ({ ...p, num_pupils: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                          placeholder="e.g. 240"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                          Number of Teachers
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={form.num_teachers}
                          onChange={e => setForm(p => ({ ...p, num_teachers: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                          placeholder="e.g. 12"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
                        Year Groups Using WriFe
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {YEAR_GROUPS.map(yg => (
                          <button
                            key={yg}
                            type="button"
                            onClick={() => toggleYearGroup(yg)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                              form.year_groups.includes(yg)
                                ? 'bg-[var(--wrife-blue)] text-white border-[var(--wrife-blue)]'
                                : 'bg-white text-[var(--wrife-text-muted)] border-[var(--wrife-border)] hover:border-[var(--wrife-blue)]'
                            }`}
                          >
                            {yg}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                        School Website
                      </label>
                      <input
                        type="url"
                        value={form.website}
                        onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                        placeholder="https://stmarys.co.uk"
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-[var(--wrife-border)]" />

                {/* Contact details */}
                <div>
                  <h3 className="text-sm font-bold text-[var(--wrife-text-main)] uppercase tracking-wide mb-3">
                    Your Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.contact_name}
                        onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                        placeholder="Jane Smith"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                          placeholder="jane@stmarys.co.uk"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)]"
                          placeholder="01234 567890"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-[var(--wrife-border)]" />

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-1">
                    Anything else you'd like us to know?
                  </label>
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--wrife-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] resize-none"
                    placeholder="e.g. We're particularly interested in the writing practice app, or we have a specific start date in mind…"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full bg-[var(--wrife-blue)] py-3 text-sm font-bold text-white hover:opacity-90 transition disabled:opacity-50 shadow-soft"
                >
                  {submitting ? 'Sending…' : 'Submit Registration'}
                </button>

                <p className="text-xs text-center text-[var(--wrife-text-muted)]">
                  We'll be in touch within 1–2 working days. No payment is required at this stage.
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
