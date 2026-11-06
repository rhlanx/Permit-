import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Naptown Permits | Annapolis Permit & Licensing Experts",
  description:
    "Naptown Permits helps small businesses in Annapolis and Anne Arundel County navigate permits, licenses, and compliance — step by step, in plain English.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa]">
      {/* Hero */}
      <section className="bg-[#1e3a5f] text-white py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            Permits Shouldn&apos;t Be This Hard
          </h1>
          <p className="text-lg md:text-xl text-white/80 leading-relaxed">
            Annapolis has over 67,000 businesses, and starting one means
            dealing with permits from the City, the County, AND the State —
            each with different forms, different offices, and different
            deadlines. We built Naptown Permits to cut through the maze.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="space-y-8 text-[#1a1a2e]">
          <div>
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-4">
              Our Story
            </h2>
            <p className="text-lg leading-relaxed text-gray-700">
              We started Naptown Permits after watching too many talented
              entrepreneurs in Annapolis and Anne Arundel County get bogged
              down in paperwork before they could even open their doors. A
              food truck owner spending weeks figuring out which health
              permits they needed. A salon owner driving back and forth
              between state and county offices. A contractor discovering —
              after the fact — that they needed a license they&apos;d never
              heard of.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-4">
              What We Do
            </h2>
            <p className="text-lg leading-relaxed text-gray-700">
              Naptown Permits is a document preparation service based right
              here in Annapolis, Maryland. We track every permit, license,
              and registration a small business might need across three
              levels of government — federal, state, and local — and
              translate the requirements into plain English.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-4">
              How It Works
            </h2>
            <p className="text-lg leading-relaxed text-gray-700">
              Answer a few simple questions about your business, and we
              generate a personalized permit roadmap showing exactly what you
              need, what it costs, where to apply, and how long it takes. No
              jargon, no runaround — just a clear checklist.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#c5a55a]">50+</div>
              <div className="text-gray-600 mt-2">
                Permit types tracked
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#c5a55a]">3</div>
              <div className="text-gray-600 mt-2">
                Levels of government, 1 simple checklist
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#c5a55a]">12</div>
              <div className="text-gray-600 mt-2">
                Business types supported
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer & CTA */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-gray-500 mb-8">
          Naptown Permits is a document preparation service. We do not
          provide legal advice. Permit requirements change — always verify
          with the issuing agency.
        </p>
        <Link
          href="/finder"
          className="inline-block bg-[#c5a55a] hover:bg-[#a88a3a] text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
        >
          Find My Permits
        </Link>
      </section>
    </main>
  );
}
