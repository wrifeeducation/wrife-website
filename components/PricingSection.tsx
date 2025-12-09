import Link from "next/link";

const plans = [
  {
    name: "Free Trial",
    price: "£0",
    period: "14 days",
    description: "Try WriFe with your class",
    features: [
      "Access to first 10 lessons",
      "1 class (up to 30 pupils)",
      "Basic AI feedback",
      "Teacher dashboard",
      "Email support",
    ],
    cta: "Start Free Trial",
    href: "/signup",
    featured: false,
    bgColor: "bg-white",
    buttonColor: "bg-[var(--wrife-blue)] text-white",
  },
  {
    name: "Basic",
    price: "£49",
    period: "per year",
    description: "For individual teachers",
    features: [
      "All 67 lessons",
      "Up to 3 classes",
      "Full AI feedback",
      "Progress tracking",
      "Priority support",
      "Printable worksheets",
    ],
    cta: "Get Started",
    href: "/signup?plan=basic",
    featured: true,
    bgColor: "bg-[var(--wrife-blue)]",
    buttonColor: "bg-white text-[var(--wrife-blue)]",
  },
  {
    name: "School",
    price: "Custom",
    period: "per school",
    description: "For whole schools",
    features: [
      "Unlimited teachers",
      "Unlimited classes",
      "School admin dashboard",
      "Custom branding",
      "Training & onboarding",
      "Dedicated support",
    ],
    cta: "Contact Us",
    href: "/contact",
    featured: false,
    bgColor: "bg-white",
    buttonColor: "bg-[var(--wrife-orange)] text-white",
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="w-full px-4 md:px-8 py-16 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--wrife-text-main)] mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Simple, Affordable Pricing
          </h2>
          <p className="text-[var(--wrife-text-muted)] text-lg max-w-2xl mx-auto">
            Start free and upgrade when you're ready. No hidden fees, no surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`${plan.bgColor} rounded-2xl p-6 ${
                plan.featured 
                  ? 'shadow-xl ring-4 ring-[var(--wrife-blue)]/20 scale-105 text-white' 
                  : 'shadow-soft border border-[var(--wrife-border)]'
              }`}
            >
              <div className="mb-6">
                <h3 className={`text-lg font-bold mb-1 ${plan.featured ? 'text-white' : 'text-[var(--wrife-text-main)]'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${plan.featured ? 'text-white/70' : 'text-[var(--wrife-text-muted)]'}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span className={`text-4xl font-bold ${plan.featured ? 'text-white' : 'text-[var(--wrife-text-main)]'}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ${plan.featured ? 'text-white/70' : 'text-[var(--wrife-text-muted)]'}`}>
                  {' '}{plan.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <svg 
                      className={`w-5 h-5 flex-shrink-0 ${plan.featured ? 'text-green-300' : 'text-[var(--wrife-green)]'}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={plan.featured ? 'text-white/90' : 'text-[var(--wrife-text-main)]'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block w-full py-3 text-center font-bold rounded-full ${plan.buttonColor} hover:opacity-90 transition-opacity`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
