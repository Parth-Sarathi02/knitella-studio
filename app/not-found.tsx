import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";
import { baseInfo } from "@/seo-configs/baseInfo";

// 404 PAGE
//
// SEO NOTES:
//   • Next.js automatically returns HTTP 404 status for this page
//   • noIndex: true — 404 pages must never be indexed
//   • noFollow: false — we still want crawlers to follow links OUT of 404
//     so they can discover your valid pages
//   • Keep the page lightweight — fast 404s signal a healthy site to crawlers
//   • Include navigation back to valid pages — helps crawlers AND users
//   • Do NOT include the 404 page in your sitemap
//
// PERF NOTES:
//   • No data fetching — fully static
//   • No images — keeps it fast
//   • Minimal JS — this page loads under any network condition

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = buildPageMetadata({
  title: "Page Not Found",
  description:
    `The page you are looking for does not exist or has been moved. ` +
    `Return to ${baseInfo.name} homepage to find what you need.`,
  path: "/404",
  noIndex: true,
  noFollow: false,
});

// NOT FOUND COMPONENT
const NotFound: React.FC = () => {
  return (
    <main
      id="not-found"
      // role="main" is implicit on <main> — aria-labelledby connects
      // this landmark to its heading for screen readers
      aria-labelledby="not-found-heading"
      className="w-full min-h-screen flex flex-col justify-center items-center px-4"
    >
      {/* ── Status indicator ───────────────────────────────────────────────
          aria-hidden — decorative number, heading carries the meaning    */}
      <p
        aria-hidden="true"
        className="text-8xl font-bold text-gray-200 select-none"
      >
        404
      </p>

      {/* ── Heading ────────────────────────────────────────────────────────
          H1 — one per page, clearly describes the error state
          Crawlers read this to understand the page purpose              */}
      <h1
        id="not-found-heading"
        className="mt-4 text-2xl font-bold text-gray-900"
      >
        Page not found
      </h1>

      {/* ── Description ────────────────────────────────────────────────────
          Helpful, not technical — users and crawlers both read this     */}
      <p className="mt-2 text-gray-500 text-center max-w-md">
        The page you are looking for does not exist, has been moved, or is
        temporarily unavailable.
      </p>

      {/* ── Navigation ─────────────────────────────────────────────────────
          Internal links on 404 page serve two purposes:
          1. Help users find what they need
          2. Give crawlers valid URLs to follow out of the dead end
          Keep these to your most important pages only                   */}
      <nav
        aria-label="Return navigation"
        className="mt-8 flex flex-col sm:flex-row items-center gap-4"
      >
        {/* Primary CTA — back to homepage */}
        <Link
          href="/"
          className="px-6 py-3 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
          // Descriptive aria-label — "Home" alone is ambiguous for screen readers
          aria-label={`Return to ${baseInfo.name} homepage`}
        >
          Back to Home
        </Link>

        {/* Secondary links — TODO: update to your actual key pages */}
        {/* <Link
          href="/blog"
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:border-gray-400 transition-colors"
        >
          Browse Blog
        </Link>

        <Link
          href="/contact"
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:border-gray-400 transition-colors"
        >
          Contact Us
        </Link> */}
      </nav>

      {/* ── Search suggestion ──────────────────────────────────────────────
          Uncomment if your site has a search page                       */}
      {/* <p className="mt-6 text-sm text-gray-400">
        Looking for something specific?{" "}
        <Link
          href="/search"
          className="text-black underline underline-offset-2 hover:no-underline"
        >
          Try searching
        </Link>
      </p> */}
    </main>
  );
};

export default NotFound;
