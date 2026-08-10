// lib/fonts.ts
// ─────────────────────────────────────────────────────────────────────────────
// WEBSITE FONTS — managed via next/font
// Self-hosted automatically by Next.js — zero external requests at runtime
// Zero layout shift — font is preloaded and size-adjusted
//
// Usage in layout.tsx:
//   import { primaryFont, monoFont } from "@/lib/fonts";
//   <html className={`${primaryFont.variable} ${monoFont.variable}`}>
//
// Usage in Tailwind (globals.css):
//   font-family: var(--font-primary);
//   or via Tailwind v4: font-sans → mapped to --font-primary
//
// To swap fonts — change the import and function call only
// Everything else (variable names, Tailwind config) stays the same
// ─────────────────────────────────────────────────────────────────────────────

import { Geist } from "next/font/google";

export const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});
