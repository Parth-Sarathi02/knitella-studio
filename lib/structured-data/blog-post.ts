import {
  baseInfo,
  baseUrl,
  buildCanonical,
  buildOgImageUrl,
} from "@/seo-configs/baseInfo";

// ─────────────────────────────────────────────────────────────────────────────
// BLOG POST SCHEMA — BlogPosting + Article
// Used on every individual blog post / article page
//
// Why both BlogPosting and Article?
//   BlogPosting extends Article which extends CreativeWork
//   Using BlogPosting gives Google the most specific type signal
//   while inheriting all Article rich result eligibility
//
// Enables:
//   • Article rich results in Google Search
//   • Author entity recognition
//   • Publication date display in results
//   • Top Stories eligibility (with AMP or good CWV scores)
//   • AI citation with author + date provenance signals
//
// Validator: https://search.google.com/test/rich-results
// Docs: https://schema.org/BlogPosting
// ─────────────────────────────────────────────────────────────────────────────

// ─── Author type ──────────────────────────────────────────────────────────────
export interface BlogAuthor {
  name: string;
  url?: string; // Author's profile page on your site eg: "/authors/jane-doe"
  image?: string; // Absolute URL to author headshot
  jobTitle?: string; // eg: "Senior Engineer", "Editor"
  description?: string; // Short author bio
  sameAs?: string[]; // Author's social profiles — strengthens entity signal
  // eg: ["https://twitter.com/handle", "https://linkedin.com/in/..."]
}

// ─── Input ────────────────────────────────────────────────────────────────────
export interface BlogPostSchemaInput {
  // Required
  title: string;
  description: string; // Used as articleBody summary — 150–300 chars ideal
  slug: string; // Used to build canonical URL
  datePublished: string; // ISO 8601 — never change after publishing
  author: BlogAuthor;

  // Optional
  dateModified?: string; // ISO 8601 — update every time content changes
  coverImageUrl?: string; // Absolute URL — becomes primaryImage in schema
  coverImageAlt?: string;
  category?: string; // eg: "Technology", "Marketing"
  tags?: string[]; // Article keywords — maps to schema keywords field
  readingTimeMinutes?: number;
  wordCount?: number;

  // Breadcrumbs — recommended for blog posts
  // Typically: Home > Blog > Post Title
  breadcrumbs?: Array<{
    name: string;
    path: string;
  }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// buildBlogPostSchema
// ─────────────────────────────────────────────────────────────────────────────
export function buildBlogPostSchema(input: BlogPostSchemaInput) {
  const {
    title,
    description,
    slug,
    datePublished,
    dateModified,
    author,
    coverImageUrl,
    coverImageAlt,
    category,
    tags,
    readingTimeMinutes,
    wordCount,
    breadcrumbs,
  } = input;

  const canonicalUrl = buildCanonical(`/blog/${slug}`);
  const ogImageUrl = coverImageUrl ?? buildOgImageUrl(`/blog/${slug}`);
  const now = new Date().toISOString();

  return {
    "@context": "https://schema.org",
    "@graph": [
      // ── BlogPosting node ───────────────────────────────────────────────────
      {
        "@type": "BlogPosting",
        "@id": `${canonicalUrl}/#blogposting`,
        url: canonicalUrl,

        // ── Content ───────────────────────────────────────────────────────────
        headline: title, // Max 110 chars for Google rich results
        description,
        ...(tags && tags.length > 0 && { keywords: tags.join(", ") }),
        ...(category && { articleSection: category }),
        ...(wordCount && { wordCount }),
        ...(readingTimeMinutes && {
          // ISO 8601 duration format: PT5M = 5 minutes
          timeRequired: `PT${readingTimeMinutes}M`,
        }),
        inLanguage: baseInfo.language,

        // ── Dates ─────────────────────────────────────────────────────────────
        // datePublished MUST stay the same after first publish
        // changing it can cause Google to treat the post as new/duplicate
        datePublished,
        dateModified: dateModified ?? datePublished ?? now,

        // ── Image ─────────────────────────────────────────────────────────────
        // Required for Article rich results — must be present
        image: {
          "@type": "ImageObject",
          "@id": `${canonicalUrl}/#primaryimage`,
          url: ogImageUrl,
          contentUrl: ogImageUrl,
          width: 1200,
          height: 630,
          ...(coverImageAlt && { caption: coverImageAlt }),
        },
        thumbnailUrl: ogImageUrl,

        // ── Author ────────────────────────────────────────────────────────────
        // Person entity — helps Google attribute authorship
        // Strong author entities improve E-E-A-T signals
        author: {
          "@type": "Person",
          "@id": author.url
            ? `${baseUrl}${author.url}/#person`
            : `${baseUrl}/#author-${author.name.toLowerCase().replace(/\s+/g, "-")}`,
          name: author.name,
          ...(author.url && { url: buildCanonical(author.url) }),
          ...(author.image && {
            image: {
              "@type": "ImageObject",
              url: author.image,
            },
          }),
          ...(author.jobTitle && { jobTitle: author.jobTitle }),
          ...(author.description && { description: author.description }),
          ...(author.sameAs &&
            author.sameAs.length > 0 && { sameAs: author.sameAs }),
        },

        // ── Publisher ─────────────────────────────────────────────────────────
        // Points back to your Organization node — connects the content graph
        publisher: {
          "@id": `${baseUrl}/#business`,
        },

        // ── Relationships ─────────────────────────────────────────────────────
        isPartOf: {
          "@id": `${baseUrl}/#website`,
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${canonicalUrl}/#webpage`,
        },

        // ── Breadcrumb reference ──────────────────────────────────────────────
        ...(breadcrumbs &&
          breadcrumbs.length > 0 && {
            breadcrumb: {
              "@id": `${canonicalUrl}/#breadcrumb`,
            },
          }),
      },

      // ── WebPage node ──────────────────────────────────────────────────────
      // Every page needs a WebPage node — connects post to site graph
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}/#webpage`,
        url: canonicalUrl,
        name: title,
        description,
        inLanguage: baseInfo.language,
        isPartOf: { "@id": `${baseUrl}/#website` },
        primaryImageOfPage: {
          "@id": `${canonicalUrl}/#primaryimage`,
        },
        datePublished,
        dateModified: dateModified ?? datePublished ?? now,
      },

      // ── BreadcrumbList node ───────────────────────────────────────────────
      ...(breadcrumbs && breadcrumbs.length > 0
        ? [
            {
              "@type": "BreadcrumbList",
              "@id": `${canonicalUrl}/#breadcrumb`,
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: baseInfo.name,
                  item: baseUrl,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Blog",
                  item: buildCanonical("/blog"),
                },
                ...breadcrumbs.map((crumb, index) => ({
                  "@type": "ListItem",
                  position: index + 3,
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
// USAGE EXAMPLE
// ─────────────────────────────────────────────────────────────────────────────
//
// app/blog/[slug]/page.tsx
//
// import { buildBlogPostSchema } from "@/lib/structured-data/blog-post";
//
// const schema = buildBlogPostSchema({
//   title: "How to Build a Next.js SEO Template",
//   description: "A step-by-step guide to building a production-ready SEO template.",
//   slug: "nextjs-seo-template",
//   datePublished: "2024-01-15T10:00:00Z",
//   dateModified: "2024-06-01T10:00:00Z",
//   author: {
//     name: "Jane Doe",
//     url: "/authors/jane-doe",
//     jobTitle: "Senior Engineer",
//     sameAs: [
//       "https://twitter.com/janedoe",
//       "https://github.com/janedoe",
//     ],
//   },
//   category: "Engineering",
//   tags: ["Next.js", "SEO", "TypeScript"],
//   readingTimeMinutes: 8,
//   wordCount: 2400,
//   breadcrumbs: [
//     { name: "How to Build a Next.js SEO Template", path: "/blog/nextjs-seo-template" },
//   ],
// });
//
// // Inject in page component:
// <script
//   type="application/ld+json"
//   dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
// />
