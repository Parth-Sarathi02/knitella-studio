import type { Metadata } from "next";
import {
  baseInfo,
  baseUrl,
  buildCanonical,
  buildOgImageUrl,
  buildTitle,
} from "@/seo-configs/baseInfo";

// ─────────────────────────────────────────────────────────────────────────────
// BUILD PAGE METADATA — static pages
// Use this for every non-dynamic page:
//   /about, /contact, /services, /faq, /privacy-policy, etc.
//
// For dynamic pages use the dedicated builders:
//   buildBlogMetadata    → app/blog/[slug]/page.tsx
//   buildProductMetadata → app/products/[slug]/page.tsx
//   buildListingMetadata → app/blog/page.tsx, app/products/page.tsx
//
// USAGE:
//   import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";
//   export const metadata = buildPageMetadata({ ... });
//
// Or async (when you need to fetch data for metadata):
//   export async function generateMetadata(): Promise<Metadata> {
//     return buildPageMetadata({ ... });
//   }
// ─────────────────────────────────────────────────────────────────────────────

// ─── Input ────────────────────────────────────────────────────────────────────
export interface PageMetadataInput {
  // Required
  title: string; // Page-specific title — template wraps it: "Title | Brand"
  description: string; // 150–160 chars — include primary keyword naturally

  // Required — used for canonical URL and OG image path
  path: string; // Relative path eg: "/about"

  // Optional
  keywords?: readonly string[]; // Page-specific keywords — merged with global keywords
  ogImagePath?: string; // Override OG image path — defaults to page's opengraph-image
  ogImageAlt?: string; // Alt text for OG image

  // Indexing control
  // Defaults: index=true, follow=true
  // Set noIndex=true for: paginated pages beyond page 2, search results,
  // filtered views, thank-you pages, admin pages
  noIndex?: boolean;
  noFollow?: boolean;

  // Canonical override
  // Use when this page's content also lives at another URL
  // eg: a page accessible via both /services and /our-services
  canonicalUrl?: string;

  // Open Graph type
  // "website" for most pages — use "article" only for blog posts
  ogType?: "website" | "article";

  // Locale override — defaults to baseInfo.locale
  locale?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// buildPageMetadata
// ─────────────────────────────────────────────────────────────────────────────
export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const {
    title,
    description,
    path,
    keywords,
    ogImagePath,
    ogImageAlt,
    noIndex = false,
    noFollow = false,
    canonicalUrl,
    ogType = "website",
    locale,
  } = input;

  const canonical = canonicalUrl ?? buildCanonical(path);

  // OG image — use explicit override, else use page's co-located OG image
  // Falls back to root OG image if page has no opengraph-image.tsx
  const ogImage = ogImagePath
    ? `${baseUrl}${ogImagePath}`
    : buildOgImageUrl(path);

  const ogAlt = ogImageAlt ?? title;

  // Merge page keywords with global brand keywords
  // Page-specific keywords come first — more relevant to the page
  const mergedKeywords = [...(keywords ?? []), ...baseInfo.keywords];

  return {
    // ── Title ──────────────────────────────────────────────────────────────
    // Uses the template from rootMetadata: "Page Title | Brand Name"
    title,

    // ── Description ────────────────────────────────────────────────────────
    description,

    // ── Keywords ───────────────────────────────────────────────────────────
    keywords: mergedKeywords,

    // ── Canonical ──────────────────────────────────────────────────────────
    // Every page MUST have a canonical — prevents duplicate content issues
    // This is the single most important technical SEO tag after title/description
    alternates: {
      canonical,
    },

    // ── Robots ─────────────────────────────────────────────────────────────
    robots: {
      index: !noIndex,
      follow: !noFollow,
      googleBot: {
        index: !noIndex,
        follow: !noFollow,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    // ── Open Graph ─────────────────────────────────────────────────────────
    openGraph: {
      type: ogType,
      locale: locale ?? baseInfo.locale,
      url: canonical,
      siteName: baseInfo.name,
      title: buildTitle(title),
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogAlt,
          type: "image/png",
        },
      ],
    },

    // ── Twitter / X ────────────────────────────────────────────────────────
    twitter: {
      card: "summary_large_image",
      site: baseInfo.social.twitter,
      creator: baseInfo.social.twitter,
      title: buildTitle(title),
      description,
      images: [
        {
          url: ogImage,
          alt: ogAlt,
        },
      ],
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// USAGE EXAMPLES
// ─────────────────────────────────────────────────────────────────────────────
//
// ── Static export (most common) ───────────────────────────────────────────────
//
// app/about/page.tsx
//
// import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";
//
// export const metadata = buildPageMetadata({
//   title: "About Us",
//   description: "Learn about our mission, team, and the values that drive us.",
//   path: "/about",
//   keywords: ["about us", "our team", "company mission"],
// });
//
// ─────────────────────────────────────────────────────────────────────────────
//
// ── Contact page ──────────────────────────────────────────────────────────────
//
// export const metadata = buildPageMetadata({
//   title: "Contact Us",
//   description: "Get in touch with our team. We respond within 24 hours.",
//   path: "/contact",
//   keywords: ["contact", "get in touch", "support"],
// });
//
// ─────────────────────────────────────────────────────────────────────────────
//
// ── Noindexed page ────────────────────────────────────────────────────────────
// Use for thank-you pages, search results, paginated pages beyond page 2
//
// export const metadata = buildPageMetadata({
//   title: "Thank You",
//   description: "Thank you for your message. We'll be in touch shortly.",
//   path: "/thank-you",
//   noIndex: true,
// });
//
// ─────────────────────────────────────────────────────────────────────────────
//
// ── Page with custom canonical ────────────────────────────────────────────────
// Use when this page's content also lives at another URL
//
// export const metadata = buildPageMetadata({
//   title: "Web Design Services",
//   description: "Professional web design services for businesses of all sizes.",
//   path: "/services/web-design",
//   canonicalUrl: "https://www.yoursite.com/services/web-design",
// });
