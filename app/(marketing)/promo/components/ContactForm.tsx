'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    school: '',
    message: ''
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      setStatus('success')
      setFormData({ name: '', email: '', school: '', message: '' })
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="text-5xl mb-4">✉️</div>
        <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--wrife-text-main)' }}>
          Message Sent!
        </h3>
        <p style={{ color: 'var(--wrife-text-muted)' }}>
          Thank you for your interest. We&apos;ll get back to you within 24 hours.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-6 text-sm underline"
          style={{ color: 'var(--wrife-blue)' }}
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
      <h3 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--wrife-text-main)' }}>
        Get in Touch
      </h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: 'var(--wrife-text-main)' }}>
            Your Name *
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-colors"
            style={{ borderColor: 'var(--wrife-border)' }}
            placeholder="John Smith"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: 'var(--wrife-text-main)' }}>
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-colors"
            style={{ borderColor: 'var(--wrife-border)' }}
            placeholder="john@school.sch.uk"
          />
        </div>

        <div>
          <label htmlFor="school" className="block text-sm font-medium mb-1" style={{ color: 'var(--wrife-text-main)' }}>
            School Name *
          </label>
          <input
            type="text"
            id="school"
            required
            value={formData.school}
            onChange={(e) => setFormData(prev => ({ ...prev, school: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-colors"
            style={{ borderColor: 'var(--wrife-border)' }}
            placeholder="Riverside Primary School"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1" style={{ color: 'var(--wrife-text-main)' }}>
            Message *
          </label>
          <textarea
            id="message"
            required
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-colors resize-none"
            style={{ borderColor: 'var(--wrife-border)' }}
            placeholder="Tell us about your school and your interest in WriFe..."
          />
        </div>

        {status === 'error' && (
          <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--wrife-coral-soft)', color: 'var(--wrife-coral)' }}>
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-3 px-6 rounded-full font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: 'var(--wrife-orange)' }}
        >
          {status === 'loading' ? 'Sending...' : 'Send Message'}
        </button>
      </div>

      <p className="text-xs mt-4 text-center" style={{ color: 'var(--wrife-text-muted)' }}>
        We respond within 24 hours during term time
      </p>
    </form>
  )
}
