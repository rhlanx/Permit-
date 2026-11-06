import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Map,
  FileCheck,
  Check,
  ChevronDown,
} from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Tell Us About Your Business",
    description:
      "Answer 4–5 simple questions about your business type, location, and setup. No jargon, no legalese.",
  },
  {
    icon: Map,
    title: "Get Your Permit Roadmap",
    description:
      "Instantly see every permit and license you need — organized by phase, with costs, timelines, and direct links.",
  },
  {
    icon: FileCheck,
    title: "We Handle the Paperwork",
    description:
      "Optional: we pre-fill your applications, submit them on your behalf, and track everything to completion.",
  },
];

const stats = [
  { value: "50+", label: "Permit types tracked" },
  { value: "3", label: "Levels of government, 1 simple checklist" },
  { value: "6–8", label: "Average permits per business" },
];

const pricingTiers = [
  {
    name: "Permit Roadmap",
    price: "$49",
    period: "one-time",
    description:
      "Personalized permit checklist with fees, timelines, and direct links",
    features: [
      "Every permit you need, listed in order",
      "Fees and timelines for each",
      "Direct links to apply",
      "Downloadable PDF checklist",
    ],
    cta: "Get Your Roadmap",
    href: "/finder",
    highlighted: true,
  },
  {
    name: "Roadmap + Form Prep",
    price: "$99",
    period: "one-time",
    description:
      "Everything above + we pre-fill all your application forms",
    features: [
      "Everything in Permit Roadmap",
      "Pre-filled application forms",
      "Document checklist per permit",
      "Email support",
    ],
    cta: "Get Started",
    href: "/contact",
    highlighted: false,
  },
  {
    name: "Full Service",
    price: "$149",
    period: "one-time",
    description:
      "Everything above + we submit applications and track status",
    features: [
      "Everything in Form Prep",
      "We submit applications for you",
      "Status tracking dashboard",
      "Phone + email support",
    ],
    cta: "Go Full Service",
    href: "/contact",
    highlighted: false,
  },
  {
    name: "Compliance Monitor",
    price: "$29",
    period: "/mo",
    description:
      "Renewal alerts, deadline tracking, regulation change updates",
    features: [
      "Renewal deadline alerts",
      "Regulation change updates",
      "Annual filing reminders",
      "Priority support",
    ],
    cta: "Subscribe",
    href: "/contact",
    highlighted: false,
  },
];

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative bg-[#1e3a5f] text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f] to-[#152a45]" />
        <div className="relative mx-auto max-w-5xl px-4 py-24 sm:py-32 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-balance">
            Stop Guessing.{" "}
            <span className="text-[#c5a55a]">Start Your Business.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto text-balance">
            Naptown Permits tells you exactly which permits and licenses you need
            in Annapolis — step by step, in plain English.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/finder"
              className="inline-flex items-center gap-2 rounded-lg bg-[#c5a55a] px-8 py-4 text-lg font-semibold text-[#1e3a5f] shadow-lg hover:bg-[#d4ba7a] transition-colors"
            >
              Find My Permits
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-1 text-white/70 hover:text-white transition-colors text-sm font-medium"
            >
              See How It Works
              <ChevronDown className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-3xl font-bold text-center text-[#1e3a5f] sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-3 text-center text-[#6b7280] max-w-xl mx-auto">
            Three simple steps from &ldquo;I have no idea&rdquo; to a complete
            permit plan.
          </p>
          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1e3a5f]/10">
                  <step.icon className="h-8 w-8 text-[#1e3a5f]" />
                </div>
                <div className="mt-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#c5a55a] text-sm font-bold text-white">
                  {i + 1}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-[#1e3a5f]">
                  {step.title}
                </h3>
                <p className="mt-2 text-[#6b7280] text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-[#f8f9fa] py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid gap-8 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="text-center rounded-xl bg-white p-8 shadow-sm"
              >
                <div className="text-4xl font-extrabold text-[#1e3a5f]">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-[#6b7280]">{stat.label}</div>
              </div>
            ))}
          </div>
          <blockquote className="mt-14 mx-auto max-w-2xl text-center">
            <p className="text-lg italic text-[#1e3a5f]/80 leading-relaxed">
              &ldquo;I spent 3 weeks trying to figure out what permits I needed
              for my food truck. Naptown Permits showed me in 2
              minutes.&rdquo;
            </p>
            <footer className="mt-3 text-xs text-[#6b7280]">
              — Example testimonial
            </footer>
          </blockquote>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold text-center text-[#1e3a5f] sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-3 text-center text-[#6b7280] max-w-xl mx-auto">
            Pick what you need. No hidden fees, no subscriptions required.
          </p>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-2xl border p-6 shadow-sm ${
                  tier.highlighted
                    ? "border-[#c5a55a] ring-2 ring-[#c5a55a]"
                    : "border-[#e5e7eb]"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#c5a55a] px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-[#1e3a5f]">
                  {tier.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-[#1e3a5f]">
                    {tier.price}
                  </span>
                  <span className="text-sm text-[#6b7280]">{tier.period}</span>
                </div>
                <p className="mt-3 text-sm text-[#6b7280] leading-relaxed">
                  {tier.description}
                </p>
                <ul className="mt-5 flex-1 space-y-2">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-[#1a1a2e]"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#c5a55a]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className={`mt-6 block rounded-lg py-3 text-center text-sm font-semibold transition-colors ${
                    tier.highlighted
                      ? "bg-[#c5a55a] text-white hover:bg-[#d4ba7a]"
                      : "bg-[#1e3a5f] text-white hover:bg-[#2a4f7f]"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#1e3a5f] py-16 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Ready to cut through the red tape?
          </h2>
          <p className="mt-3 text-white/70">
            Find out exactly what permits you need in less than 2 minutes.
          </p>
          <Link
            href="/finder"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#c5a55a] px-8 py-4 text-lg font-semibold text-[#1e3a5f] shadow-lg hover:bg-[#d4ba7a] transition-colors"
          >
            Find My Permits
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
