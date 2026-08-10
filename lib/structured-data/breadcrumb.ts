import { baseInfo, baseUrl, buildCanonical } from "@/seo-configs/baseInfo";

// ─────────────────────────────────────────────────────────────────────────────
// BREADCRUMB SCHEMA — BreadcrumbList + ListItem
//
// Why a standalone breadcrumb builder?
//   blog-post.ts and product.ts include breadcrumbs inline when passed
//   BUT many page types need breadcrumbs without a dedicated schema builder
//   eg: /services/web-design, /about/team, /blog (listing), /categories/tech
//   This standalone builder handles those cases cleanly
//
// Enables:
//   • Breadcrumb trail shown directly in Google Search results URL line
//   • Replaces the raw URL with "Home > Blog > Post Title" in SERPs
//   • Significant CTR improvement — users see context before clicking
//   • AI navigation — LLMs use breadcrumbs to understand site hierarchy
//
// GOOGLE RULES:
//   • Must match the visible breadcrumb UI on the page
//   • Each item must have a real, crawlable URL
//   • Last item (current page) URL is optional but recommended
//   • Minimum 2 items (home + current page)
//
// Validator: https://search.google.com/test/rich-results
// Docs: https://schema.org/BreadcrumbList
// ─────────────────────────────────────────────────────────────────────────────

// ─── Types ────────────────────────────────────────────────────────────────────
export interface BreadcrumbItem {
  name: string;
  path: string; // Relative path — canonical URL is built from this
  // Last item = current page path
}

export interface BreadcrumbSchemaInput {
  // Current page path — used as the @id anchor
  currentPath: string;
  // Crumbs AFTER homepage — homepage is always prepended automatically
  // Order: left to right, shallowest to deepest
  // eg: for /blog/category/post-slug:
  //   [
  //     { name: "Blog", path: "/blog" },
  //     { name: "Category", path: "/blog/category" },
  //     { name: "Post Title", path: "/blog/category/post-slug" },
  //   ]
  items: BreadcrumbItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// buildBreadcrumbSchema
// Standalone — use when no other schema builder is handling breadcrumbs
// ─────────────────────────────────────────────────────────────────────────────
export function buildBreadcrumbSchema(input: BreadcrumbSchemaInput) {
  const { currentPath, items } = input;

  const canonicalUrl = buildCanonical(currentPath);

  // Homepage is always position 1 — never pass it in items[]
  const allItems: Array<{ position: number; name: string; item: string }> = [
    {
      position: 1,
      name: baseInfo.name,
      item: baseUrl,
    },
    ...items.map((crumb, index) => ({
      position: index + 2,
      name: crumb.name,
      item: buildCanonical(crumb.path),
    })),
  ];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}/#breadcrumb`,
        itemListElement: allItems.map((item) => ({
          "@type": "ListItem",
          position: item.position,
          name: item.name,
          item: item.item,
        })),
      },
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// buildBreadcrumbItems
// Utility — auto-generates breadcrumb items from a URL path
// Use for deeply nested routes where manual definition is tedious
//
// Input:  "/blog/technology/nextjs-seo-guide"
// Output: [
//   { name: "Blog",        path: "/blog" },
//   { name: "Technology",  path: "/blog/technology" },
//   { name: "Nextjs Seo Guide", path: "/blog/technology/nextjs-seo-guide" },
// ]
//
// NOTE: auto-generated names are title-cased from the slug segment
// For production, pass real content titles instead of relying on this
// Use this only as a fallback or for utility/category pages
// ─────────────────────────────────────────────────────────────────────────────
export function buildBreadcrumbItems(path: string): BreadcrumbItem[] {
  // Strip leading slash and split into segments
  const segments = path.replace(/^\//, "").split("/").filter(Boolean);

  return segments.map((segment, index) => {
    // Build cumulative path up to this segment
    const cumulativePath = "/" + segments.slice(0, index + 1).join("/");

    // Convert slug to readable name
    // "nextjs-seo-guide" → "Nextjs Seo Guide"
    const name = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return { name, path: cumulativePath };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// USAGE EXAMPLES
// ─────────────────────────────────────────────────────────────────────────────
//
// ── Simple 2-level page (/about) ─────────────────────────────────────────────
//
// import { buildBreadcrumbSchema } from "@/lib/structured-data/breadcrumb";
//
// const schema = buildBreadcrumbSchema({
//   currentPath: "/about",
//   items: [
//     { name: "About", path: "/about" },
//   ],
// });
//
// ─────────────────────────────────────────────────────────────────────────────
//
// ── 3-level nested page (/blog/technology) ────────────────────────────────────
//
// const schema = buildBreadcrumbSchema({
//   currentPath: "/blog/technology",
//   items: [
//     { name: "Blog", path: "/blog" },
//     { name: "Technology", path: "/blog/technology" },
//   ],
// });
//
// ─────────────────────────────────────────────────────────────────────────────
//
// ── Auto-generate from path (utility pages) ──────────────────────────────────
//
// import {
//   buildBreadcrumbSchema,
//   buildBreadcrumbItems,
// } from "@/lib/structured-data/breadcrumb";
//
// const path = "/blog/technology/nextjs-seo-guide";
//
// const schema = buildBreadcrumbSchema({
//   currentPath: path,
//   items: buildBreadcrumbItems(path),
// });
//
// ─────────────────────────────────────────────────────────────────────────────
//
// ── Inject in page component ──────────────────────────────────────────────────
//
// <script
//   type="application/ld+json"
//   dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
// />
//
// ─────────────────────────────────────────────────────────────────────────────
//
// ── Combine with another schema on the same page ──────────────────────────────
// Multiple <script type="application/ld+json"> tags on the same page are fine
// Google reads all of them independently
//
// <script
//   type="application/ld+json"
//   dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
// />
// <script
//   type="application/ld+json"
//   dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
// />
