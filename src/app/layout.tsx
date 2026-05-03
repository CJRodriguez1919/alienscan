import type { Metadata } from "next";
import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AlienScan — modern UFO sightings explorer",
  description:
    "Search, map, and find patterns in 100,000+ UFO sighting reports from the NUFORC database.",
  openGraph: {
    title: "AlienScan",
    description:
      "Modern, searchable interface over a century of UFO sightings.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AlienScan",
    description: "100,000+ UFO sightings, on a map you can actually use.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${interTight.variable} ${jetbrains.variable} flex min-h-screen flex-col`}
      >
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
