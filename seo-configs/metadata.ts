// seo-configs/metadata.ts
import type { Metadata } from "next";
import {
  baseInfo,
  baseUrl,
  buildCanonical,
  businessType,
  sameAsUrls,
  optional,
} from "./baseInfo";

// ─────────────────────────────────────────────────────────────────────────────
// ROOT METADATA
// Applied to every page via app/layout.tsx
// Page-level metadata MERGES with this — it does not fully override it
// Docs: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
// ─────────────────────────────────────────────────────────────────────────────
export const rootMetadata: Metadata = {
  // ── Base URL ───────────────────────────────────────────────────────────────
  // Critical — all relative OG image paths are resolved against this
  metadataBase: new URL(baseUrl),

  // ── Title ─────────────────────────────────────────────────────────────────
  // default   → used when a page does not define its own title
  // template  → wraps page-level titles: "Page Title | Brand Name"
  // absolute  → pages can use this to fully override the template
  title: {
    default: baseInfo.fullTitle,
    template: `%s | ${baseInfo.name}`,
    // absolute: baseInfo.fullTitle, // uncomment to lock the root title
  },

  // ── Core Meta ─────────────────────────────────────────────────────────────
  description: baseInfo.description,
  keywords: [...baseInfo.keywords],
  authors: [{ name: baseInfo.name, url: baseUrl }],
  creator: baseInfo.name,
  publisher: baseInfo.name,
  generator: "Next.js",

  // ── Canonical ─────────────────────────────────────────────────────────────
  // Root canonical points to homepage
  // Each page must define its OWN canonical via buildPageMetadata etc.
  alternates: {
    canonical: buildCanonical("/"),
    // Uncomment for multi-language sites:
    // languages: {
    //   "en-US": buildCanonical("/en"),
    //   "hi-IN": buildCanonical("/hi"),
    // },
  },

  // ── Format Detection ──────────────────────────────────────────────────────
  // Prevents iOS/Android from auto-linking phone numbers, emails, addresses
  // This stops unintended layout shifts and style overrides
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // ── Open Graph ────────────────────────────────────────────────────────────
  openGraph: {
    type: "website",
    locale: baseInfo.locale,
    url: baseUrl,
    siteName: baseInfo.name,
    title: baseInfo.fullTitle,
    description: baseInfo.description,
    images: [
      {
        url: baseInfo.ogImage,
        width: 1200,
        height: 630,
        alt: baseInfo.fullTitle,
        type: "image/png",
      },
    ],
  },

  // ── Twitter / X ───────────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    site: baseInfo.social.twitter,
    creator: baseInfo.social.twitter,
    title: baseInfo.fullTitle,
    description: baseInfo.description,
    images: [
      {
        url: baseInfo.ogImage,
        width: 1200,
        height: 630,
        alt: baseInfo.fullTitle,
      },
    ],
  },

  // ── Robots ────────────────────────────────────────────────────────────────
  // Root: index everything, follow all links
  // Individual pages can override this (e.g. /dashboard → noindex)
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-image-preview": "large", // Show large image previews in results
      "max-snippet": -1, // No limit on text snippet length
      "max-video-preview": -1, // No limit on video preview length
    },
  },

  // ── Icons ─────────────────────────────────────────────────────────────────
  // favicon.ico is auto-detected from app/favicon.ico
  // Add more sizes for full cross-platform support
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" }, // TODO: add /public/icon.svg
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180" }, // TODO: add /public/apple-icon.png
    ],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg" }, // TODO: add safari pin
    ],
  },

  // ── Manifest ──────────────────────────────────────────────────────────────
  // Points to app/manifest.ts — generated automatically
  manifest: "/manifest.json",

  // ── Verification ──────────────────────────────────────────────────────────
  // Add your verification tokens after registering on each platform
  // See README.md → Platform Registration for instructions
  verification: {
    google: "<GOOGLE_SEARCH_CONSOLE_VERIFICATION_TOKEN>", // TODO
    // yandex: "<YANDEX_WEBMASTER_TOKEN>",                  // TODO
    // bing is handled via BingSiteAuth.xml in /public/     // TODO
    // other: { "baidu-site-verification": "<TOKEN>" },     // TODO if targeting China
  },

  // ── App Links (optional) ──────────────────────────────────────────────────
  // Uncomment if you have a mobile app to deep-link from search results
  // appLinks: {
  //   ios: { url: "myapp://", app_store_id: "123456" },
  //   android: { package: "com.myapp", app_name: baseInfo.name },
  // },

  // ── Category ──────────────────────────────────────────────────────────────
  // Helps search engines classify your site
  // TODO: update to reflect your niche
  // Examples: "technology", "e-commerce", "health", "finance", "education"
  category: "technology",
};

// ─────────────────────────────────────────────────────────────────────────────
// ROOT STRUCTURED DATA
// Injected once in app/layout.tsx as <script type="application/ld+json">
// This is the global identity layer — WHO you are, not what each page is about
// ─────────────────────────────────────────────────────────────────────────────
export const rootStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    // ── Organization / Business ─────────────────────────────────────────────
    // Switch "@type" to "Organization" if you are not a local business
    {
      "@type": businessType,
      "@id": `${baseUrl}/#business`,
      name: baseInfo.name,
      legalName: baseInfo.legalName,
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        "@id": `${baseUrl}/#logo`,
        url: baseInfo.logo,
        contentUrl: baseInfo.logo,
        width: 512,
        height: 512,
        caption: baseInfo.name,
      },
      image: baseInfo.ogImage,
      description: baseInfo.description,
      telephone: baseInfo.phone,
      email: baseInfo.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: baseInfo.address.streetAddress,
        addressLocality: baseInfo.address.addressLocality,
        addressRegion: baseInfo.address.addressRegion,
        postalCode: baseInfo.address.postalCode,
        addressCountry: baseInfo.address.addressCountry,
      },

      // Geo helps Google Local Pack ranking
      ...optional(baseInfo.geo?.latitude && baseInfo.geo?.longitude, {
        geo: {
          "@type": "GeoCoordinates",
          latitude: baseInfo.geo!.latitude,
          longitude: baseInfo.geo!.longitude,
        },
      }),
      // Opening hours only included if defined
      ...optional(baseInfo.openingHours?.length, {
        openingHours: baseInfo.openingHours,
      }),

      ...optional(baseInfo.priceRange, {
        priceRange: baseInfo.priceRange,
      }),

      ...optional(baseInfo.areaServed, {
        areaServed: {
          "@type": "Country",
          name: baseInfo.areaServed,
        },
      }),

      ...optional(baseInfo.foundingDate, {
        foundingDate: baseInfo.foundingDate,
      }),

      // All social profile URLs — signals entity authority to Google
      sameAs: sameAsUrls,
    },

    // ── WebSite ─────────────────────────────────────────────────────────────
    // Enables the Sitelinks Search Box in Google results
    // potentialAction → tells Google your site has internal search
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      url: baseUrl,
      name: baseInfo.name,
      description: baseInfo.description,
      inLanguage: baseInfo.language,
      publisher: {
        "@id": `${baseUrl}/#business`,
      },
      // TODO: update the search path to match your site's search route
      // Remove potentialAction entirely if your site has no search
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${baseUrl}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },

    // ── WebPage (Homepage) ──────────────────────────────────────────────────
    // Each page will define its own WebPage schema via structured-data builders
    // This is just the homepage entry in the root graph
    {
      "@type": "WebPage",
      "@id": `${baseUrl}/#homepage`,
      url: baseUrl,
      name: baseInfo.fullTitle,
      description: baseInfo.description,
      inLanguage: baseInfo.language,
      isPartOf: { "@id": `${baseUrl}/#website` },
      about: { "@id": `${baseUrl}/#business` },
      dateModified: new Date().toISOString(),
    },
  ],
};
