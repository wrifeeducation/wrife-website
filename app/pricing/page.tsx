'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/auth-context';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  monthlyPriceId?: string;
  yearlyPriceId?: string;
  features: PlanFeature[];
  ctaText: string;
  highlighted?: boolean;
  badge?: string;
  isContact?: boolean;
  isFree?: boolean;
}

const plans: Plan[] = [
  {
    name: 'Free',
    description: 'Get started with core lesson materials',
    monthlyPrice: 'Free',
    yearlyPrice: 'Free',
    isFree: true,
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
  },
  {
    name: 'Standard Teacher',
    description: 'Full access to materials and class management',
    monthlyPrice: '£4.99',
    yearlyPrice: '£49',
    monthlyPriceId: 'price_1ShALzD9ASFBLfAZQlGx5PMv',
    yearlyPriceId: 'price_1ShAM0D9ASFBLfAZCGGiwZC3',
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
      { text: 'AI-Powered Assessment', included: false },
    ],
    ctaText: 'Upgrade to Standard',
  },
  {
    name: 'Full Teacher',
    description: 'Complete platform access for your classroom',
    monthlyPrice: '£9.99',
    yearlyPrice: '£99',
    monthlyPriceId: 'price_1ShAM0D9ASFBLfAZNoW2rRWR',
    yearlyPriceId: 'price_1ShAM0D9ASFBLfAZtwT4EY9i',
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
  },
  {
    name: 'School License',
    description: 'Full access for your entire school',
    monthlyPrice: 'Custom',
    yearlyPrice: 'Custom',
    isContact: true,
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
  },
];

export default function PricingPage() {
  const { user, loading } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const handleCheckout = async (plan: Plan) => {
    if (plan.isFree) {
      window.location.href = '/signup';
      return;
    }

    if (plan.isContact) {
      window.location.href = 'mailto:hello@wrife.co.uk?subject=School%20License%20Enquiry';
      return;
    }

    if (!user) {
      window.location.href = '/login?redirect=/pricing';
      return;
    }

    const priceId = billingPeriod === 'monthly' ? plan.monthlyPriceId : plan.yearlyPriceId;
    
    if (!priceId) {
      alert('This plan is not yet available for purchase. Please contact us.');
      return;
    }

    setCheckoutLoading(plan.name);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Portal error:', error);
      alert('Failed to open subscription management. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--wrife-bg)]">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--wrife-text-main)] mb-4">
            Choose the Right Plan for You
          </h1>
          <p className="text-lg text-[var(--wrife-text-muted)] max-w-2xl mx-auto mb-8">
            Whether you are just getting started or managing a whole school, we have a plan that fits your needs.
          </p>

          <div className="inline-flex items-center gap-4 bg-white rounded-full p-1 border border-[var(--wrife-border)]">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-full font-medium text-sm transition ${
                billingPeriod === 'monthly'
                  ? 'bg-[var(--wrife-blue)] text-white'
                  : 'text-[var(--wrife-text-muted)] hover:text-[var(--wrife-text-main)]'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-full font-medium text-sm transition ${
                billingPeriod === 'yearly'
                  ? 'bg-[var(--wrife-blue)] text-white'
                  : 'text-[var(--wrife-text-muted)] hover:text-[var(--wrife-text-main)]'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
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
                  {billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                </span>
                {!plan.isFree && !plan.isContact && (
                  <span className="text-sm text-[var(--wrife-text-muted)] ml-1">
                    /{billingPeriod === 'monthly' ? 'month' : 'year'}
                  </span>
                )}
                {plan.isFree && (
                  <span className="text-sm text-[var(--wrife-text-muted)] ml-1">
                    Forever
                  </span>
                )}
                {plan.isContact && (
                  <span className="text-sm text-[var(--wrife-text-muted)] ml-1">
                    Contact us
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

              <button
                onClick={() => handleCheckout(plan)}
                disabled={checkoutLoading === plan.name}
                className={`block w-full text-center py-3 px-4 rounded-full font-semibold text-sm transition disabled:opacity-50 ${
                  plan.highlighted
                    ? 'bg-[var(--wrife-blue)] text-white hover:opacity-90'
                    : plan.isFree
                    ? 'bg-[var(--wrife-bg)] text-[var(--wrife-text-main)] border border-[var(--wrife-border)] hover:bg-gray-100'
                    : 'bg-[var(--wrife-blue)] text-white hover:opacity-90'
                }`}
              >
                {checkoutLoading === plan.name ? 'Loading...' : plan.ctaText}
              </button>
            </div>
          ))}
        </div>

        {user && user.membership_tier !== 'free' && (
          <div className="mt-8 text-center">
            <button
              onClick={handleManageSubscription}
              className="text-[var(--wrife-blue)] font-semibold hover:underline"
            >
              Manage Your Subscription
            </button>
          </div>
        )}

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
