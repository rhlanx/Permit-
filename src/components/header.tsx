"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/finder", label: "Find Permits" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e5e7eb] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <span className="text-xl font-bold text-[#1e3a5f]">
            Naptown<span className="text-[#c5a55a]"> Permits</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-[#1e3a5f] rounded-lg transition-colors hover:bg-[#1e3a5f]/5"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/finder"
            className="ml-2 inline-flex h-9 items-center rounded-lg bg-[#c5a55a] px-4 text-sm font-medium text-white transition-colors hover:bg-[#a88a3a]"
          >
            Find My Permits
          </Link>
        </nav>

        <button
          className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-[#1e3a5f] hover:bg-[#1e3a5f]/5"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[#e5e7eb] bg-white">
          <nav className="flex flex-col px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2.5 text-sm font-medium text-[#1e3a5f] rounded-lg transition-colors hover:bg-[#1e3a5f]/5"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/finder"
              className="mt-2 inline-flex h-10 items-center justify-center rounded-lg bg-[#c5a55a] px-4 text-sm font-medium text-white transition-colors hover:bg-[#a88a3a]"
              onClick={() => setMobileOpen(false)}
            >
              Find My Permits
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
