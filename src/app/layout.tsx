import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const poppins = localFont({
  src: [
    { path: "./fonts/poppins-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/poppins-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/poppins-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
});

const cormorant = localFont({
  src: [
    { path: "./fonts/cormorant-garamond-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-cormorant",
  display: "swap",
});

const caveat = localFont({
  src: [
    { path: "./fonts/caveat-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/caveat-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bakery Delight — Homemade Cakes, Happier Moments",
    template: "%s — Bakery Delight",
  },
  description:
    "Delicious homemade cakes, freshly baked in a home kitchen, with love — just for you.",
};

/** Shared decorative branch, referenced with <use href="#branch"> across the site. */
function BranchDecorations() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <symbol id="branch" viewBox="0 0 90 220">
        <path
          d="M62 8 C 40 55, 58 105, 38 160 C 30 185, 27 200, 30 214"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path d="M56 42 c -15 -1 -24 -10 -27 -25 c 15 1 24 10 27 25 Z" fill="currentColor" opacity="0.85" />
        <path d="M50 74 c 15 -1 24 -10 27 -25 c -15 1 -24 10 -27 25 Z" fill="currentColor" opacity="0.85" />
        <path d="M46 112 c -15 -1 -24 -10 -27 -25 c 15 1 24 10 27 25 Z" fill="currentColor" opacity="0.85" />
        <path d="M40 150 c 15 -1 24 -10 27 -25 c -15 1 -24 10 -27 25 Z" fill="currentColor" opacity="0.85" />
        <path d="M33 192 c -13 -1 -21 -9 -24 -22 c 13 1 21 9 24 22 Z" fill="currentColor" opacity="0.85" />
        <circle cx="62" cy="10" r="3.2" fill="currentColor" />
        <circle cx="24" cy="72" r="2" fill="currentColor" opacity="0.7" />
        <circle cx="66" cy="118" r="2" fill="currentColor" opacity="0.7" />
        <circle cx="18" cy="140" r="1.7" fill="currentColor" opacity="0.6" />
      </symbol>
    </svg>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${cormorant.variable} ${caveat.variable}`}
    >
      <body className="bg-cream-100 text-stone-800 antialiased">
        <BranchDecorations />
        {children}
      </body>
    </html>
  );
}
