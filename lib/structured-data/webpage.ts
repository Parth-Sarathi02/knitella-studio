import {
  baseInfo,
  baseUrl,
  buildCanonical,
  buildOgImageUrl,
} from "@/seo-configs/baseInfo";

// ─────────────────────────────────────────────────────────────────────────────
// WEBPAGE SCHEMA
// Every single page on your site should have a WebPage node
// It connects the page to your WebSite and Organization entities
// creating a complete knowledge graph Google can reason about
//
// Specialized subtypes used per content type:
//   WebPage        → generic / static pages (about, contact, home)
//   BlogPosting    → handled in blog-post.ts (extends WebPage)
//   ProductPage    → handled in product.ts (extends WebPage)
//   FAQPage        → handled in faq.ts (extends WebPage)
//   CollectionPage → listing pages (blog index, product listing)
//   AboutPage      → about page
//   ContactPage    → contact page
//
// Validator: https://validator.schema.org
// ─────────────────────────────────────────────────────────────────────────────

// ─── Web page types ───────────────────────────────────────────────────────────
export type WebPageType =
  | "WebPage"
  | "AboutPage"
  | "ContactPage"
  | "CollectionPage"
  | "SearchResultsPage"
  | "FAQPage"
  | "ItemPage";

// ─── Input ────────────────────────────────────────────────────────────────────
export interface WebPageSchemaInput {
  // Required
  title: string;
  description: string;
  path: string; // Relative path eg: "/about" — canonical is built from this

  // Optional
  type?: WebPageType; // Defaults to "WebPage"
  datePublished?: string; // ISO 8601 eg: "2024-01-15T10:00:00Z"
  dateModified?: string; // ISO 8601 — defaults to now if not provided
  breadcrumbs?: Array<{
    name: string;
    path: string;
  }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// buildWebPageSchema
// Use this on every static page — about, contact, services, faq, etc.
// For dynamic content types use their dedicated builders instead
// ─────────────────────────────────────────────────────────────────────────────
export function buildWebPageSchema(input: WebPageSchemaInput) {
  const {
    title,
    description,
    path,
    type = "WebPage",
    datePublished,
    dateModified,
    breadcrumbs,
  } = input;

  const canonicalUrl = buildCanonical(path);
  const ogImageUrl = buildOgImageUrl(path);
  const now = new Date().toISOString();

  return {
    "@context": "https://schema.org",
    "@graph": [
      // ── WebPage node ───────────────────────────────────────────────────────
      {
        "@type": type,
        "@id": `${canonicalUrl}/#webpage`,
        url: canonicalUrl,
        name: title,
        description,
        inLanguage: baseInfo.language,

        // ── Relationships — connects page into your site graph ───────────────
        isPartOf: {
          "@id": `${baseUrl}/#website`,
        },
        about: {
          "@id": `${baseUrl}/#business`,
        },
        publisher: {
          "@id": `${baseUrl}/#business`,
        },

        // ── Dates ─────────────────────────────────────────────────────────────
        ...(datePublished && { datePublished }),
        dateModified: dateModified ?? now,

        // ── Image ─────────────────────────────────────────────────────────────
        // Points to the page's OG image — connects visual asset to page entity
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: ogImageUrl,
          width: 1200,
          height: 630,
        },

        // ── Breadcrumbs ───────────────────────────────────────────────────────
        // Only included when breadcrumbs are provided
        // Enables breadcrumb rich results in Google Search
        ...(breadcrumbs &&
          breadcrumbs.length > 0 && {
            breadcrumb: {
              "@id": `${canonicalUrl}/#breadcrumb`,
            },
          }),
      },

      // ── BreadcrumbList node ────────────────────────────────────────────────
      // Separate node so it can be referenced independently
      ...(breadcrumbs && breadcrumbs.length > 0
        ? [
            {
              "@type": "BreadcrumbList",
              "@id": `${canonicalUrl}/#breadcrumb`,
              itemListElement: [
                // Always start with homepage
                {
                  "@type": "ListItem",
                  position: 1,
                  name: baseInfo.name,
                  item: baseUrl,
                },
                // Then the provided breadcrumbs
                ...breadcrumbs.map((crumb, index) => ({
                  "@type": "ListItem",
                  position: index + 2,
                  name: crumb.name,
                  item: buildCanonical(crumb.path),
                })),
              ],
            },
          ]
        : []),
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// USAGE EXAMPLES
// ─────────────────────────────────────────────────────────────────────────────
//
// ── About page ────────────────────────────────────────────────────────────────
// const schema = buildWebPageSchema({
//   title: "About Us | Acme Corp",
//   description: "Learn about our mission, team, and values.",
//   path: "/about",
//   type: "AboutPage",
//   dateModified: "2024-06-01T00:00:00Z",
//   breadcrumbs: [{ name: "About", path: "/about" }],
// });
//
// ── Contact page ──────────────────────────────────────────────────────────────
// const schema = buildWebPageSchema({
//   title: "Contact Us | Acme Corp",
//   description: "Get in touch with our team.",
//   path: "/contact",
//   type: "ContactPage",
//   breadcrumbs: [{ name: "Contact", path: "/contact" }],
// });
//
// ── Inject in page component ──────────────────────────────────────────────────
// const schema = buildWebPageSchema({ ... });
// <script
//   type="application/ld+json"
//   dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
// />
