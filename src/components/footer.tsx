import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="mt-auto bg-[#1e3a5f] text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg font-bold">
              Naptown<span className="text-[#c5a55a]"> Permits</span>
            </h3>
            <p className="mt-2 text-sm text-white/70">
              Stop guessing. Start your business.
            </p>
            <p className="mt-1 text-sm text-white/70">Annapolis, Maryland</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#c5a55a]">
              Quick Links
            </h4>
            <nav className="mt-3 flex flex-col gap-2">
              <Link href="/finder" className="text-sm text-white/70 hover:text-white transition-colors">
                Find My Permits
              </Link>
              <Link href="/about" className="text-sm text-white/70 hover:text-white transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="text-sm text-white/70 hover:text-white transition-colors">
                Contact
              </Link>
              <Link href="/resources" className="text-sm text-white/70 hover:text-white transition-colors">
                Resources
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#c5a55a]">
              Popular Permits
            </h4>
            <nav className="mt-3 flex flex-col gap-2">
              <Link href="/finder?type=restaurant" className="text-sm text-white/70 hover:text-white transition-colors">
                Restaurant Permits
              </Link>
              <Link href="/finder?type=food_truck" className="text-sm text-white/70 hover:text-white transition-colors">
                Food Truck Permits
              </Link>
              <Link href="/finder?type=salon" className="text-sm text-white/70 hover:text-white transition-colors">
                Salon Permits
              </Link>
              <Link href="/finder?type=retail" className="text-sm text-white/70 hover:text-white transition-colors">
                Retail Store Permits
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#c5a55a]">
              Services
            </h4>
            <nav className="mt-3 flex flex-col gap-2">
              <span className="text-sm text-white/70">Permit Roadmap — $49</span>
              <span className="text-sm text-white/70">Roadmap + Form Prep — $99</span>
              <span className="text-sm text-white/70">Full Service — $149</span>
              <span className="text-sm text-white/70">Compliance Monitor — $29/mo</span>
            </nav>
          </div>
        </div>

        <Separator className="my-8 bg-white/20" />

        <div className="flex flex-col items-center gap-3 text-center">
          <p className="max-w-2xl text-xs text-white/50 leading-relaxed">
            Naptown Permits is a document preparation service. We do not provide legal advice.
            Permit requirements change — always verify with the issuing agency.
          </p>
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Naptown Permits. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
