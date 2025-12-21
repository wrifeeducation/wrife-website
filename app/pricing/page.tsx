'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  description: string;
  price: string;
  priceNote?: string;
  features: PlanFeature[];
  ctaText: string;
  ctaHref: string;
  highlighted?: boolean;
  badge?: string;
}

const plans: Plan[] = [
  {
    name: 'Free',
    description: 'Get started with core lesson materials',
    price: 'Free',
    priceNote: 'Forever',
    features: [
      { text: 'Teacher Guide for all 67 lessons', included: true },
      { text: 'Lesson Presentations', included: true },
      { text: 'Core Worksheets', included: true },
      { text: 'Support & Challenge Worksheets', included: false },
      { text: 'Progress Trackers', included: false },
      { text: 'Assessment Materials', included: false },
      { text: 'Interactive Practice Activities', included: false },
      { text: 'Class Management', included: false },
      { text: 'Pupil Assignments', included: false },
      { text: 'AI-Powered Assessment', included: false },
    ],
    ctaText: 'Get Started',
    ctaHref: '/auth',
  },
  {
    name: 'Standard Teacher',
    description: 'Full access to all lesson materials',
    price: '£4.99',
    priceNote: 'per month',
    features: [
      { text: 'Teacher Guide for all 67 lessons', included: true },
      { text: 'Lesson Presentations', included: true },
      { text: 'Core Worksheets', included: true },
      { text: 'Support & Challenge Worksheets', included: true },
      { text: 'Progress Trackers', included: true },
      { text: 'Assessment Materials', included: true },
      { text: 'Interactive Practice Activities', included: true },
      { text: 'Class Management', included: false },
      { text: 'Pupil Assignments', included: false },
      { text: 'AI-Powered Assessment', included: false },
    ],
    ctaText: 'Upgrade to Standard',
    ctaHref: 'mailto:hello@wrife.co.uk?subject=Upgrade%20to%20Standard%20Teacher',
  },
  {
    name: 'Full Teacher',
    description: 'Complete platform access for your classroom',
    price: '£9.99',
    priceNote: 'per month',
    highlighted: true,
    badge: 'Most Popular',
    features: [
      { text: 'Teacher Guide for all 67 lessons', included: true },
      { text: 'Lesson Presentations', included: true },
      { text: 'Core Worksheets', included: true },
      { text: 'Support & Challenge Worksheets', included: true },
      { text: 'Progress Trackers', included: true },
      { text: 'Assessment Materials', included: true },
      { text: 'Interactive Practice Activities', included: true },
      { text: 'Class Management', included: true },
      { text: 'Pupil Assignments', included: true },
      { text: 'AI-Powered Assessment', included: true },
    ],
    ctaText: 'Upgrade to Full',
    ctaHref: 'mailto:hello@wrife.co.uk?subject=Upgrade%20to%20Full%20Teacher',
  },
  {
    name: 'School License',
    description: 'Full access for your entire school',
    price: 'Custom',
    priceNote: 'Contact us',
    features: [
      { text: 'All Full Teacher features', included: true },
      { text: 'Unlimited teacher accounts', included: true },
      { text: 'School-wide analytics', included: true },
      { text: 'Priority support', included: true },
      { text: 'Custom onboarding', included: true },
      { text: 'Staff training sessions', included: true },
      { text: 'Curriculum alignment support', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Volume discounts', included: true },
      { text: 'Invoice billing', included: true },
    ],
    ctaText: 'Contact Sales',
    ctaHref: 'mailto:hello@wrife.co.uk?subject=School%20License%20Enquiry',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--wrife-bg)]">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--wrife-text-main)] mb-4">
            Choose the Right Plan for You
          </h1>
          <p className="text-lg text-[var(--wrife-text-muted)] max-w-2xl mx-auto">
            Whether you are just getting started or managing a whole school, we have a plan that fits your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col ${
                plan.highlighted
                  ? 'border-[var(--wrife-blue)] shadow-lg'
                  : 'border-[var(--wrife-border)]'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-block bg-[var(--wrife-blue)] text-white text-xs font-bold px-3 py-1 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-bold text-[var(--wrife-text-main)] mb-1">
                  {plan.name}
                </h2>
                <p className="text-sm text-[var(--wrife-text-muted)]">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold text-[var(--wrife-text-main)]">
                  {plan.price}
                </span>
                {plan.priceNote && (
                  <span className="text-sm text-[var(--wrife-text-muted)] ml-1">
                    {plan.priceNote}
                  </span>
                )}
              </div>

              <ul className="space-y-3 mb-6 flex-grow">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    {feature.included ? (
                      <span className="text-green-500 mt-0.5">✓</span>
                    ) : (
                      <span className="text-gray-300 mt-0.5">✗</span>
                    )}
                    <span
                      className={
                        feature.included
                          ? 'text-[var(--wrife-text-main)]'
                          : 'text-gray-400'
                      }
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className={`block w-full text-center py-3 px-4 rounded-full font-semibold text-sm transition ${
                  plan.highlighted
                    ? 'bg-[var(--wrife-blue)] text-white hover:opacity-90'
                    : 'bg-[var(--wrife-bg)] text-[var(--wrife-text-main)] border border-[var(--wrife-border)] hover:bg-gray-100'
                }`}
              >
                {plan.ctaText}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-2xl border border-[var(--wrife-border)] p-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-[var(--wrife-text-main)] mb-4">
              Questions? We are here to help.
            </h2>
            <p className="text-[var(--wrife-text-muted)] mb-6">
              Not sure which plan is right for you? Get in touch and we will help you find the perfect fit for your teaching needs.
            </p>
            <Link
              href="mailto:hello@wrife.co.uk?subject=Pricing%20Question"
              className="inline-block bg-[var(--wrife-yellow)] text-[var(--wrife-text-main)] font-bold py-3 px-8 rounded-full hover:opacity-90 transition"
            >
              Contact Us
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="text-[var(--wrife-blue)] font-semibold hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
