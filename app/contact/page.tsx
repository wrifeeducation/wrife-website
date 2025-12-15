'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const subjects = [
    'General Enquiry',
    'Pricing & Plans',
    'Technical Support',
    'Partnership Opportunity',
    'Feedback & Suggestions',
    'Other',
  ];

  function validateForm() {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Please enter your name';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject) {
      newErrors.subject = 'Please select a subject';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please enter your message';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    setSuccess(true);
    setLoading(false);
  }

  function copyEmail() {
    navigator.clipboard.writeText('info@wrife.co.uk');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }

  if (success) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-[var(--wrife-bg)] via-white to-[var(--wrife-blue-soft)] flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-10 text-center animate-fade-in">
              <div className="mb-6">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-4 animate-bounce-once">
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-[var(--wrife-text-main)] mb-3">Message Sent!</h2>
              <p className="text-[var(--wrife-text-muted)] mb-8">
                Thank you for reaching out. We'll get back to you within 24-48 hours.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/"
                  className="inline-block rounded-full bg-[var(--wrife-blue)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
                >
                  Back to Home
                </Link>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setFormData({ name: '', email: '', subject: '', message: '' });
                  }}
                  className="text-sm text-[var(--wrife-text-muted)] hover:text-[var(--wrife-blue)] transition"
                >
                  Send another message
                </button>
              </div>
            </div>
          </div>
        </div>
        <style jsx>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes bounce-once {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }
          .animate-bounce-once {
            animation: bounce-once 0.5s ease-out;
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[var(--wrife-bg)] via-white to-[var(--wrife-blue-soft)]">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--wrife-text-main)] mb-4">
              Get in Touch
            </h1>
            <p className="text-lg text-[var(--wrife-text-muted)] max-w-2xl mx-auto">
              Have a question about WriFe? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-3">
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 md:p-10">
                <h2 className="text-xl font-bold text-[var(--wrife-text-main)] mb-6">Send us a message</h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
                        Your Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl border bg-white/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent focus:bg-white ${
                          errors.name ? 'border-red-300 bg-red-50/50' : 'border-[var(--wrife-border)]'
                        }`}
                        placeholder="John Smith"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl border bg-white/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent focus:bg-white ${
                          errors.email ? 'border-red-300 bg-red-50/50' : 'border-[var(--wrife-border)]'
                        }`}
                        placeholder="john@school.edu"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border bg-white/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent focus:bg-white ${
                        errors.subject ? 'border-red-300 bg-red-50/50' : 'border-[var(--wrife-border)]'
                      }`}
                    >
                      <option value="">Select a subject...</option>
                      {subjects.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-[var(--wrife-text-main)] mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className={`w-full px-4 py-3 rounded-xl border bg-white/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--wrife-blue)] focus:border-transparent focus:bg-white resize-none ${
                        errors.message ? 'border-red-300 bg-red-50/50' : 'border-[var(--wrife-border)]'
                      }`}
                      placeholder="Tell us how we can help..."
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-[var(--wrife-blue)] px-6 py-4 text-base font-semibold text-white shadow-lg hover:shadow-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
                <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-4">Email Us Directly</h3>
                <p className="text-sm text-[var(--wrife-text-muted)] mb-4">
                  Prefer email? Reach out to us directly and we'll get back to you within 24-48 hours.
                </p>
                <div className="flex items-center gap-3 p-4 bg-[var(--wrife-blue-soft)] rounded-xl">
                  <div className="flex-1">
                    <p className="text-xs text-[var(--wrife-text-muted)] mb-1">Email Address</p>
                    <a 
                      href="mailto:info@wrife.co.uk" 
                      className="text-[var(--wrife-blue)] font-semibold hover:underline"
                    >
                      info@wrife.co.uk
                    </a>
                  </div>
                  <button
                    onClick={copyEmail}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-[var(--wrife-blue)] hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    {copied ? (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copy
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
                <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-4">Response Time</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--wrife-text-main)]">24-48 Hours</p>
                      <p className="text-sm text-[var(--wrife-text-muted)]">We aim to respond to all enquiries within two business days</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--wrife-blue-soft)] flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-[var(--wrife-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--wrife-text-main)]">Priority Support</p>
                      <p className="text-sm text-[var(--wrife-text-muted)]">School subscribers receive faster response times</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[var(--wrife-blue)] to-[var(--wrife-blue)]/80 rounded-3xl shadow-xl p-8 text-white">
                <h3 className="text-lg font-bold mb-3">Ready to transform writing education?</h3>
                <p className="text-white/80 text-sm mb-4">
                  Join hundreds of schools already using WriFe to improve pupil writing outcomes.
                </p>
                <Link
                  href="/signup"
                  className="inline-block w-full text-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--wrife-blue)] hover:bg-gray-100 transition"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
