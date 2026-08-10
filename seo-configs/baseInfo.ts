// seo-configs/baseInfo.ts

// ─────────────────────────────────────────────────────────────────────────────
// SITE BASE INFO — fill this out before anything else
// Every SEO file, metadata builder, and structured data schema reads from here
// ─────────────────────────────────────────────────────────────────────────────

// Your production URL — no trailing slash, no path
// eg: "https://www.mysite.com"
export const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "<YOUR_PRODUCTION_URL>";

// ─── Business Type ────────────────────────────────────────────────────────────
// Controls which Schema.org type is used in structured data
// Options: "LocalBusiness" | "Organization" | "Person" | "Store" | "Restaurant"
// See: https://schema.org/LocalBusiness for the full hierarchy
export const businessType = "LocalBusiness" as const;

// ─── Core Info ────────────────────────────────────────────────────────────────
export const baseInfo = {
  // Brand
  name: "<COMPANY_NAME>",
  shortName: "<SHORT_NAME>", // Used in manifest, breadcrumbs
  legalName: "<LEGAL_COMPANY_NAME>", // Used in Organization schema

  // Page titles
  // title    → used for the homepage <title> tag
  // fullTitle → used in OG/Twitter + structured data
  title: "<COMPANY_NAME> — <TAGLINE>",
  fullTitle: "<COMPANY_NAME> — <TAGLINE>",

  // Meta description — 150–160 chars, include primary keyword naturally
  description: "<COMPANY_DESCRIPTION>",

  // ── Contact ────────────────────────────────────────────────────────────────
  email: "",
  phone: "", // Include country code: "+91 98765 43210"

  // ── Address ────────────────────────────────────────────────────────────────
  // Used in LocalBusiness schema — leave blank strings if not applicable
  address: {
    streetAddress: "",
    addressLocality: "", // City
    addressRegion: "", // State / Province
    postalCode: "",
    addressCountry: "", // ISO 3166-1 alpha-2: "IN", "US", "GB"
  },

  // ── Assets ─────────────────────────────────────────────────────────────────
  // All paths are absolute using baseUrl
  // Recommended: host on same domain, not a CDN, for crawlability
  logo: `${baseUrl}/assets/logo.webp`, // Min 112x112px, square
  ogImage: `${baseUrl}/opengraph-image.png`, // 1200x630px — homepage static OG

  // ── Geo Coordinates ────────────────────────────────────────────────────────
  // Used in LocalBusiness schema — helps Google Maps + local pack ranking
  // Get from: https://www.latlong.net
  geo: {
    latitude: "", // eg: "28.6139"
    longitude: "", // eg: "77.2090"
  },

  // ── Operating Hours ────────────────────────────────────────────────────────
  // Used in LocalBusiness schema
  // Format: https://schema.org/openingHours
  openingHours: [
    // "Mo-Fr 09:00-18:00",
    // "Sa 10:00-14:00",
  ],

  // ── Social Profiles ────────────────────────────────────────────────────────
  // Used in sameAs property of Organization/LocalBusiness schema
  // Twitter handle used separately for Twitter card meta
  social: {
    twitter: "@<twitter_handle>", // With @
    twitterUrl: "", // "https://twitter.com/handle"
    facebook: "", // Full URL
    instagram: "", // Full URL
    linkedin: "", // Full URL
    youtube: "", // Full URL
    github: "", // Full URL
  },

  // ── Business Details ───────────────────────────────────────────────────────
  foundingDate: "", // "YYYY-MM-DD"
  areaServed: "", // Country or region name: "India", "United States"
  priceRange: "", // "$" | "$$" | "$$$" | "$$$$" — for LocalBusiness. Leave empty if not a business page.

  // ── Keywords ───────────────────────────────────────────────────────────────
  // Primary keyword set — used in root metadata
  // Keep to 8–12 highly relevant terms — not a dumping ground
  // Include: brand name, core service, location (if local), primary use cases
  keywords: [
    "<primary-keyword>",
    "<secondary-keyword>",
    "<brand-name>",
    // ...
  ],

  // ── Locale ─────────────────────────────────────────────────────────────────
  locale: "en_IN", // OG locale format: language_TERRITORY
  language: "en", // HTML lang attribute
  // For multi-language sites, see README.md → i18n section
} as const;

// ─── Derived helpers ──────────────────────────────────────────────────────────
// Pre-built values consumed by metadata builders and structured data
// You never need to edit below this line

// sameAs array — all non-empty social URLs, used in schema
export const sameAsUrls = Object.values(baseInfo.social).filter((v) =>
  v.startsWith("https://"),
);

// Canonical URL builder — always returns clean URLs, no trailing slash
export const buildCanonical = (path: string = ""): string => {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${clean === "/" ? "" : clean}`;
};

// OG image absolute URL builder — for dynamic OG image routes
export const buildOgImageUrl = (path: string = ""): string => {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${clean}/opengraph-image`;
};

// Page title builder — applies the template: "Page Name | Brand"
export const buildTitle = (pageTitle?: string): string => {
  if (!pageTitle) return baseInfo.fullTitle;
  return `${pageTitle} | ${baseInfo.name}`;
};

// typesafe optional object builder
export const optional = <T extends object>(
  condition: unknown,
  obj: T,
): Partial<T> => (Boolean(condition) ? obj : {});
