// app/sitemap.ts
import type { MetadataRoute } from "next";
import { baseUrl } from "@/seo-configs/baseInfo";

// ─────────────────────────────────────────────────────────────────────────────
// ROOT SITEMAP — served at /sitemap.xml
// This is the INDEX sitemap — it lists URLs for all static/known pages
// For large dynamic content (blogs, products), add their own sitemap files:
//   app/blog/sitemap.ts       → /blog/sitemap.xml
//   app/products/sitemap.ts   → /products/sitemap.xml
// Then register those in app/robots.ts → sitemap array
//
// Priority guide (Google treats all equally but Bing uses it):
//   1.0 → Homepage only
//   0.9 → Core business pages (about, services, contact)
//   0.8 → Important content hubs (blog index, product listing)
//   0.7 → Product / service detail pages
//   0.6 → Blog posts, articles
//   0.4 → Supporting pages (FAQ, terms, privacy)
//   0.1 → Utility pages (sitemap page, search results)
//
// changeFrequency guide:
//   "always"  → Real-time data (avoid — signals instability)
//   "hourly"  → Live scores, stock tickers
//   "daily"   → News, active blogs
//   "weekly"  → Product catalogs, updated content
//   "monthly" → Service pages, about pages
//   "yearly"  → Legal pages, foundational content
//   "never"   → Archived content
// ─────────────────────────────────────────────────────────────────────────────

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Build timestamp ────────────────────────────────────────────────────────
  // Used as lastModified for static pages
  // For dynamic pages, use the actual content's updatedAt date
  const now = new Date();

  // ── Static pages ───────────────────────────────────────────────────────────
  // Add every static route in your app here
  // These are pre-rendered at build time — no data fetching needed
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1.0,
    },
    // ── Core pages ────────────────────────────────────────────────────────
    // TODO: uncomment and add your actual static routes
    // {
    //   url: `${baseUrl}/about`,
    //   lastModified: now,
    //   changeFrequency: "monthly",
    //   priority: 0.9,
    // },
    // {
    //   url: `${baseUrl}/services`,
    //   lastModified: now,
    //   changeFrequency: "monthly",
    //   priority: 0.9,
    // },
    // {
    //   url: `${baseUrl}/contact`,
    //   lastModified: now,
    //   changeFrequency: "monthly",
    //   priority: 0.9,
    // },
    // ── Content hubs ──────────────────────────────────────────────────────
    // {
    //   url: `${baseUrl}/blog`,
    //   lastModified: now,
    //   changeFrequency: "daily",
    //   priority: 0.8,
    // },
    // {
    //   url: `${baseUrl}/products`,
    //   lastModified: now,
    //   changeFrequency: "weekly",
    //   priority: 0.8,
    // },
    // ── Supporting pages ──────────────────────────────────────────────────
    // {
    //   url: `${baseUrl}/faq`,
    //   lastModified: now,
    //   changeFrequency: "monthly",
    //   priority: 0.4,
    // },
    // {
    //   url: `${baseUrl}/privacy-policy`,
    //   lastModified: now,
    //   changeFrequency: "yearly",
    //   priority: 0.3,
    // },
    // {
    //   url: `${baseUrl}/terms-of-service`,
    //   lastModified: now,
    //   changeFrequency: "yearly",
    //   priority: 0.3,
    // },
  ];

  // ── Dynamic pages ──────────────────────────────────────────────────────────
  // Fetch from your data source and merge here
  // For large datasets (500+ pages), move them to their own sitemap file
  // and use generateSitemaps() to split at 50k URLs per file
  //
  // Example pattern — replace with your actual data fetching:
  //
  // const posts = await fetchAllPosts(); // your CMS/DB call
  // const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
  //   url: `${baseUrl}/blog/${post.slug}`,
  //   lastModified: new Date(post.updatedAt),
  //   changeFrequency: "weekly",
  //   priority: 0.6,
  // }));
  //
  // const products = await fetchAllProducts();
  // const productPages: MetadataRoute.Sitemap = products.map((product) => ({
  //   url: `${baseUrl}/products/${product.slug}`,
  //   lastModified: new Date(product.updatedAt),
  //   changeFrequency: "weekly",
  //   priority: 0.7,
  // }));

  // ── Merge and return ───────────────────────────────────────────────────────
  return [
    ...staticPages,
    // ...blogPages,
    // ...productPages,
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// LARGE SITE PATTERN — generateSitemaps()
// Use this when a single content type exceeds 50,000 URLs
// Google's hard limit is 50k URLs per sitemap file
//
// Step 1: Add this to app/blog/sitemap.ts (create the file)
// Step 2: Register /blog/sitemap.xml in robots.ts
//
// import type { MetadataRoute } from "next";
// import { baseUrl } from "@/seo-configs/baseInfo";
//
// const URLS_PER_SITEMAP = 50000;
//
// export async function generateSitemaps() {
//   const totalPosts = await fetchPostCount();
//   const count = Math.ceil(totalPosts / URLS_PER_SITEMAP);
//   return Array.from({ length: count }, (_, i) => ({ id: i }));
// }
//
// export default async function sitemap({
//   id,
// }: {
//   id: number;
// }): Promise<MetadataRoute.Sitemap> {
//   const start = id * URLS_PER_SITEMAP;
//   const posts = await fetchPosts({ offset: start, limit: URLS_PER_SITEMAP });
//   return posts.map((post) => ({
//     url: `${baseUrl}/blog/${post.slug}`,
//     lastModified: new Date(post.updatedAt),
//     changeFrequency: "weekly" as const,
//     priority: 0.6,
//   }));
// }
// ─────────────────────────────────────────────────────────────────────────────
