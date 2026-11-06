"use client";

import { useState } from "react";
import Link from "next/link";

const businessTypes = [
  { id: "food_truck", name: "Food Truck" },
  { id: "restaurant", name: "Restaurant / Cafe" },
  { id: "hvac", name: "HVAC Contractor" },
  { id: "salon", name: "Hair / Beauty Salon" },
  { id: "home_improvement", name: "Home Improvement Contractor" },
  { id: "bnb", name: "Bed & Breakfast / Short-Term Rental" },
  { id: "retail", name: "Retail Store" },
  { id: "pet_services", name: "Pet Services" },
  { id: "photography", name: "Photography Business" },
  { id: "massage", name: "Massage Therapy" },
  { id: "landscaping", name: "Landscaping" },
  { id: "handyman", name: "Handyman" },
];

const pricingTiers = [
  { id: "roadmap", label: "Permit Roadmap — $49", description: "Personalized permit checklist" },
  { id: "form_prep", label: "Roadmap + Form Prep — $99", description: "Checklist + pre-filled applications" },
  { id: "full_service", label: "Full Service — $149", description: "We submit and track everything" },
  { id: "compliance", label: "Compliance Monitor — $29/mo", description: "Renewal alerts and deadline tracking" },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    business_type: "",
    service_tier: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 max-w-lg w-full text-center">
          <div className="text-5xl mb-4">&#10003;</div>
          <h1 className="text-2xl font-bold text-[#1e3a5f] mb-3">
            Thanks for reaching out!
          </h1>
          <p className="text-gray-600 mb-6">
            We&apos;ll get back to you within one business day. In the
            meantime, try our free permit finder.
          </p>
          <Link
            href="/finder"
            className="inline-block bg-[#c5a55a] hover:bg-[#a88a3a] text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Find My Permits
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa]">
      <section className="bg-[#1e3a5f] text-white py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Get Started</h1>
          <p className="text-white/80 text-lg">
            Tell us about your business and we&apos;ll take it from here.
          </p>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 py-12">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm p-6 md:p-8 space-y-6"
        >
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#c5a55a] focus:border-transparent"
              placeholder="Jane Smith"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#c5a55a] focus:border-transparent"
              placeholder="jane@example.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#c5a55a] focus:border-transparent"
              placeholder="(410) 555-0123"
            />
          </div>

          {/* Business Type */}
          <div>
            <label htmlFor="business_type" className="block text-sm font-medium text-gray-700 mb-1">
              Business Type
            </label>
            <select
              id="business_type"
              value={form.business_type}
              onChange={(e) => update("business_type", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#c5a55a] focus:border-transparent bg-white"
            >
              <option value="">Select your business type</option>
              {businessTypes.map((bt) => (
                <option key={bt.id} value={bt.id}>
                  {bt.name}
                </option>
              ))}
              <option value="other">Other</option>
            </select>
          </div>

          {/* Service Tier */}
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-3">
              Which service are you interested in?
            </legend>
            <div className="space-y-3">
              {pricingTiers.map((tier) => (
                <label
                  key={tier.id}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    form.service_tier === tier.id
                      ? "border-[#c5a55a] bg-[#c5a55a]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="service_tier"
                    value={tier.id}
                    checked={form.service_tier === tier.id}
                    onChange={(e) => update("service_tier", e.target.value)}
                    className="mt-0.5 accent-[#c5a55a]"
                  />
                  <div>
                    <div className="font-medium text-[#1a1a2e]">{tier.label}</div>
                    <div className="text-sm text-gray-500">{tier.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Tell us more about your business
            </label>
            <textarea
              id="message"
              rows={4}
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#c5a55a] focus:border-transparent resize-y"
              placeholder="What are you planning? Any questions we can help with?"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c5a55a] hover:bg-[#a88a3a] disabled:opacity-60 text-white font-semibold py-4 rounded-lg text-lg transition-colors"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6 max-w-md mx-auto">
          Naptown Permits is a document preparation service. We do not
          provide legal advice. Permit requirements change — always verify
          with the issuing agency.
        </p>
      </section>
    </main>
  );
}
