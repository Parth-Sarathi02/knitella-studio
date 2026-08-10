import type { Metadata } from "next";
import {
  baseInfo,
  baseUrl,
  buildCanonical,
  buildOgImageUrl,
  buildTitle,
} from "@/seo-configs/baseInfo";

// ─────────────────────────────────────────────────────────────────────────────
// BUILD LISTING METADATA — archive, index, and listing pages
// Use for:
//   /blog                    → blog index
//   /blog/category/tech      → category archive
//   /products                → product listing
//   /products/category/shoes → product category
//   /authors/jane-doe        → author archive
//   /tags/nextjs             → tag archive
//
// Why a dedicated builder for listings?
//   • Pagination handling — pages beyond page 1 need noindex or rel=prev/next
//   • Category/tag archives are high duplicate-content risk
//   • Listing descriptions follow a different pattern than content pages
//   • CollectionPage schema type is specific to listings
//   • Total count in description ("Browse 48 articles") improves CTR
//
// USAGE:
//   export async function generateMetadata({
//     params, searchParams
//   }): Promise<Metadata> {
//     return buildListingMetadata({ ... });
//   }
// ─────────────────────────────────────────────────────────────────────────────

// ─── Listing types ────────────────────────────────────────────────────────────
export type ListingType =
  | "blog" // Blog index or category
  | "products" // Product listing or category
  | "authors" // Author archive
  | "tags" // Tag archive
  | "search" // Search results — always noindex
  | "custom"; // Any other listing type

// ─── Input ────────────────────────────────────────────────────────────────────
export interface ListingMetadataInput {
  // Required
  title: string;
  description: string;
  path: string; // Base path WITHOUT pagination eg: "/blog"

  // Optional
  type?: ListingType; // Controls noindex defaults for certain types
  keywords?: string[];

  // Pagination
  // Pass these when the listing is paginated
  currentPage?: number; // 1-based — page 1 = no pagination suffix
  totalPages?: number;

  // Filtering / sorting
  // Filtered/sorted views should be noindexed to avoid duplicate content
  // eg: /products?sort=price or /blog?category=tech&tag=nextjs
  isFiltered?: boolean; // true → noindex

  // Item count — shown in description for better CTR
  // eg: "Browse 48 articles about web development"
  totalItems?: number;
  itemLabel?: string; // eg: "articles", "products", "authors"

  // OG image override
  ogImagePath?: string;

  // Canonical override
  canonicalUrl?: string;

  // Explicit index control — overrides all automatic noindex logic
  forceIndex?: boolean;
  forceNoIndex?: boolean;

  // Locale override
  locale?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// shouldNoIndex
// Determines if a listing page should be noindexed
// based on type, pagination, and filter state
// ─────────────────────────────────────────────────────────────────────────────
function shouldNoIndex(input: ListingMetadataInput): boolean {
  const { type, currentPage, isFiltered, forceIndex, forceNoIndex } = input;

  // Explicit overrides win
  if (forceIndex) return false;
  if (forceNoIndex) return true;

  // Search results always noindex
  if (type === "search") return true;

  // Filtered/sorted views noindex — duplicate content risk
  if (isFiltered) return true;

  // Paginated pages beyond page 1 noindex
  // Rationale: page 2+ have lower quality signals, thin content
  // and dilute link equity from the main listing page
  // Google can still crawl them via sitemap
  if (currentPage && currentPage > 1) return true;

  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// buildListingDescription
// Enriches description with item count if provided
// ─────────────────────────────────────────────────────────────────────────────
function buildListingDescription(input: ListingMetadataInput): string {
  const { description, totalItems, itemLabel = "items", currentPage } = input;

  // Paginated page — add page context
  if (currentPage && currentPage > 1) {
    return `${description} — Page ${currentPage}.`;
  }

  // Has item count — prepend to description
  if (totalItems !== undefined && totalItems > 0) {
    return `Browse ${totalItems} ${itemLabel}. ${description}`;
  }

  return description;
}

// ─────────────────────────────────────────────────────────────────────────────
// buildPaginatedTitle
// Adds page number suffix to title for paginated pages
// "Blog" → "Blog — Page 3"
// ─────────────────────────────────────────────────────────────────────────────
function buildPaginatedTitle(title: string, currentPage?: number): string {
  if (!currentPage || currentPage === 1) return title;
  return `${title} — Page ${currentPage}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// buildListingMetadata
// ─────────────────────────────────────────────────────────────────────────────
export function buildListingMetadata(input: ListingMetadataInput): Metadata {
  const {
    title,
    path,
    keywords,
    currentPage,
    ogImagePath,
    canonicalUrl,
    locale,
  } = input;

  // ── Canonical ──────────────────────────────────────────────────────────────
  // Paginated pages: canonical always points to page 1 (the base path)
  // This consolidates link equity to the main listing page
  const canonical = canonicalUrl ?? buildCanonical(path);

  // ── Titles and descriptions ────────────────────────────────────────────────
  const paginatedTitle = buildPaginatedTitle(title, currentPage);
  const enrichedDescription = buildListingDescription(input);

  // ── OG image ───────────────────────────────────────────────────────────────
  const ogImage = ogImagePath
    ? `${baseUrl}${ogImagePath}`
    : buildOgImageUrl(path);

  // ── Index decision ─────────────────────────────────────────────────────────
  const noIndex = shouldNoIndex(input);

  // ── Keywords ───────────────────────────────────────────────────────────────
  const mergedKeywords = [...(keywords ?? []), ...baseInfo.keywords];

  return {
    // ── Title ──────────────────────────────────────────────────────────────
    title: paginatedTitle,

    // ── Description ────────────────────────────────────────────────────────
    description: enrichedDescription,

    // ── Keywords ───────────────────────────────────────────────────────────
    keywords: mergedKeywords,

    // ── Canonical ──────────────────────────────────────────────────────────
    // Always points to page 1 for paginated listing pages
    alternates: {
      canonical,
    },

    // ── Robots ─────────────────────────────────────────────────────────────
    robots: {
      index: !noIndex,
      follow: true, // Always follow — even noindexed listing pages
      // contain links we want crawled
      googleBot: {
        index: !noIndex,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    // ── Open Graph ─────────────────────────────────────────────────────────
    openGraph: {
      type: "website",
      locale: locale ?? baseInfo.locale,
      url: canonical,
      siteName: baseInfo.name,
      title: buildTitle(paginatedTitle),
      description: enrichedDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: paginatedTitle,
          type: "image/png",
        },
      ],
    },

    // ── Twitter / X ────────────────────────────────────────────────────────
    twitter: {
      card: "summary_large_image",
      site: baseInfo.social.twitter,
      creator: baseInfo.social.twitter,
      title: buildTitle(paginatedTitle),
      description: enrichedDescription,
      images: [
        {
          url: ogImage,
          alt: paginatedTitle,
        },
      ],
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// USAGE EXAMPLES
// ─────────────────────────────────────────────────────────────────────────────
//
// ── Blog index (/blog) ────────────────────────────────────────────────────────
//
// import { buildListingMetadata } from "@/lib/seo/buildListingMetadata";
//
// export async function generateMetadata({
//   searchParams,
// }: {
//   searchParams: Promise<{ page?: string }>;
// }): Promise<Metadata> {
//   const { page } = await searchParams;
//   const currentPage = page ? parseInt(page) : 1;
//   const { totalPosts } = await getBlogStats();
//
//   return buildListingMetadata({
//     title: "Blog",
//     description: "Insights, tutorials, and updates from our team.",
//     path: "/blog",
//     type: "blog",
//     currentPage,
//     totalItems: totalPosts,
//     itemLabel: "articles",
//     keywords: ["blog", "articles", "tutorials"],
//   });
// }
//
// ─────────────────────────────────────────────────────────────────────────────
//
// ── Blog category archive (/blog/category/technology) ────────────────────────
//
// export async function generateMetadata({
//   params,
// }: {
//   params: Promise<{ category: string }>;
// }): Promise<Metadata> {
//   const { category } = await params;
//   const cat = await getCategory(category);
//   if (!cat) return {};
//
//   return buildListingMetadata({
//     title: `${cat.name} Articles`,
//     description: cat.description,
//     path: `/blog/category/${category}`,
//     type: "blog",
//     totalItems: cat.postCount,
//     itemLabel: "articles",
//     keywords: [cat.name, "articles", "tutorials"],
//   });
// }
//
// ─────────────────────────────────────────────────────────────────────────────
//
// ── Product listing with filters (/products?sort=price) ──────────────────────
// Filtered views are automatically noindexed
//
// export async function generateMetadata({
//   searchParams,
// }: {
//   searchParams: Promise<{ sort?: string; filter?: string; page?: string }>;
// }): Promise<Metadata> {
//   const { sort, filter, page } = await searchParams;
//   const currentPage = page ? parseInt(page) : 1;
//   const isFiltered = !!(sort || filter);
//
//   return buildListingMetadata({
//     title: "All Products",
//     description: "Browse our complete collection of products.",
//     path: "/products",
//     type: "products",
//     currentPage,
//     isFiltered,
//     totalItems: 128,
//     itemLabel: "products",
//   });
// }
//
// ─────────────────────────────────────────────────────────────────────────────
//
// ── Search results (/search?q=nextjs) — always noindexed ─────────────────────
//
// export async function generateMetadata({
//   searchParams,
// }: {
//   searchParams: Promise<{ q?: string }>;
// }): Promise<Metadata> {
//   const { q } = await searchParams;
//
//   return buildListingMetadata({
//     title: q ? `Search results for "${q}"` : "Search",
//     description: q
//       ? `Showing search results for "${q}"`
//       : "Search our site for articles, products, and more.",
//     path: "/search",
//     type: "search",   // auto-noindexed
//   });
// }
