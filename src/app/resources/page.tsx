import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Resources | Naptown Permits — Annapolis Business Guides",
  description:
    "Free guides to permits and licenses for small businesses in Annapolis and Anne Arundel County.",
};

const articles = [
  {
    title: "How to Start a Food Truck in Annapolis",
    description:
      "Everything you need to know about mobile food service licenses, commissary requirements, and where you can park.",
    icon: "🚚",
  },
  {
    title: "Complete Guide to Restaurant Permits in Anne Arundel County",
    description:
      "From health inspections to liquor licenses — a step-by-step walkthrough for opening a restaurant.",
    icon: "🍔",
  },
  {
    title: "HVAC Contractor Licensing in Maryland",
    description:
      "EPA 608 certification, state HVACR license tiers, county trade licenses, and insurance requirements.",
    icon: "🔧",
  },
  {
    title: "Opening a Salon in Annapolis: Step by Step",
    description:
      "Cosmetology board requirements, establishment licenses, and zoning — everything before you pick up the scissors.",
    icon: "💇",
  },
  {
    title: "Short-Term Rental & B&B Permits Guide",
    description:
      "Airbnb, VRBO, and traditional B&B licensing in Anne Arundel County, including Historic District rules.",
    icon: "🛏️",
  },
  {
    title: "Home Improvement Contractor Requirements",
    description:
      "MHIC licensing, guaranty fund fees, building permits, and what the $500 threshold means for handymen.",
    icon: "🏠",
  },
];

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa]">
      <section className="bg-[#1e3a5f] text-white py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Resources</h1>
          <p className="text-white/80 text-lg">
            Free guides to help you navigate permits and licensing in
            Annapolis and Anne Arundel County.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          {articles.map((article) => (
            <div
              key={article.title}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 relative overflow-hidden"
            >
              <span className="absolute top-4 right-4 bg-[#c5a55a]/10 text-[#a88a3a] text-xs font-semibold px-2.5 py-1 rounded-full">
                Coming Soon
              </span>
              <div className="text-3xl mb-3">{article.icon}</div>
              <h2 className="text-lg font-bold text-[#1e3a5f] mb-2 pr-20">
                {article.title}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {article.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-3">
            Can&apos;t wait for the guides?
          </h2>
          <p className="text-gray-600 mb-6">
            Use our Permit Finder to get a personalized roadmap for your
            business right now — it only takes 2 minutes.
          </p>
          <Link
            href="/finder"
            className="inline-block bg-[#c5a55a] hover:bg-[#a88a3a] text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Find My Permits
          </Link>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 pb-8">
        <p className="text-xs text-gray-400 text-center">
          Naptown Permits is a document preparation service. We do not
          provide legal advice. Permit requirements change — always verify
          with the issuing agency.
        </p>
      </div>
    </main>
  );
}
