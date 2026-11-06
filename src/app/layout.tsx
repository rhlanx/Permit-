import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Naptown Permits — Stop Guessing. Start Your Business.",
    template: "%s | Naptown Permits",
  },
  description:
    "Find out exactly which permits and licenses you need to start your business in Annapolis and Anne Arundel County, Maryland. Step-by-step, in plain English.",
  keywords: [
    "Annapolis permits",
    "Anne Arundel County business license",
    "Maryland business permits",
    "food truck permit Annapolis",
    "restaurant permit Maryland",
    "small business permits",
  ],
  openGraph: {
    title: "Naptown Permits — Stop Guessing. Start Your Business.",
    description:
      "Find out exactly which permits and licenses you need to start your business in Annapolis, MD.",
    type: "website",
    locale: "en_US",
    siteName: "Naptown Permits",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased bg-[#f8f9fa] text-[#1a1a2e]">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
