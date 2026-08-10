import type { Metadata } from "next";
import {
  baseInfo,
  baseUrl,
  buildCanonical,
  buildOgImageUrl,
  buildTitle,
} from "@/seo-configs/baseInfo";

// ─────────────────────────────────────────────────────────────────────────────
// BUILD BLOG METADATA — individual blog post pages
// Use in app/blog/[slug]/page.tsx via generateMetadata()
//
// Why a dedicated builder for blogs?
//   • Blog posts need og:type = "article" not "website"
//   • Article-specific OG tags: published_time, modified_time, author, section
//   • Twitter needs article:author
//   • Canonical must be exact — syndicated content risk is high for blogs
//   • noIndex pattern for drafts needs to be explicit
//
// USAGE:
//   export async function generateMetadata(
//     { params }: { params: Promise<{ slug: string }> }
//   ): Promise<Metadata> {
//     const { slug } = await params;
//     const post = await getPost(slug);
//     if (!post) return {};
//     return buildBlogMetadata({ ... });
//   }
// ─────────────────────────────────────────────────────────────────────────────

// ─── Input ────────────────────────────────────────────────────────────────────
export interface BlogMetadataInput {
  // Required
  title: string;
  description: string; // 150–160 chars — first sentence of the post works well
  slug: string; // Used to build canonical URL: /blog/{slug}

  // Dates — ISO 8601
  datePublished: string; // Required for article rich results
  dateModified?: string; // Defaults to datePublished if not provided

  // Author
  authorName: string;
  authorUrl?: string; // Relative path to author page eg: "/authors/jane-doe"

  // Optional
  category?: string; // Maps to article:section OG tag
  tags?: string[]; // Maps to article:tag OG tags + keywords meta
  coverImageUrl?: string; // Absolute URL — overrides auto-generated OG image
  coverImageAlt?: string;

  // Draft control
  // Set isDraft: true for unpublished posts — adds noindex
  isDraft?: boolean;

  // Canonical override
  // Use when post is syndicated from another source
  canonicalUrl?: string;

  // Locale override
  locale?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// buildBlogMetadata
// ─────────────────────────────────────────────────────────────────────────────
export function buildBlogMetadata(input: BlogMetadataInput): Metadata {
  const {
    title,
    description,
    slug,
    datePublished,
    dateModified,
    authorName,
    authorUrl,
    category,
    tags,
    coverImageUrl,
    coverImageAlt,
    isDraft = false,
    canonicalUrl,
    locale,
  } = input;

  const canonical = canonicalUrl ?? buildCanonical(`/blog/${slug}`);

  // OG image — use cover image if provided, else use generated OG image
  const ogImage = coverImageUrl ?? buildOgImageUrl(`/blog/${slug}`);
  const ogAlt = coverImageAlt ?? title;

  // Merge post tags with global keywords
  const mergedKeywords = [
    ...(tags ?? []),
    ...(category ? [category] : []),
    ...baseInfo.keywords,
  ];

  // Author URL — absolute if provided
  const absoluteAuthorUrl = authorUrl ? `${baseUrl}${authorUrl}` : undefined;

  return {
    // ── Title ──────────────────────────────────────────────────────────────
    title,

    // ── Description ────────────────────────────────────────────────────────
    description,

    // ── Keywords ───────────────────────────────────────────────────────────
    keywords: mergedKeywords,

    // ── Author ─────────────────────────────────────────────────────────────
    authors: [
      {
        name: authorName,
        ...(absoluteAuthorUrl && { url: absoluteAuthorUrl }),
      },
    ],

    // ── Canonical ──────────────────────────────────────────────────────────
    alternates: {
      canonical,
    },

    // ── Robots ─────────────────────────────────────────────────────────────
    // Draft posts are noindexed — published posts are fully indexed
    robots: {
      index: !isDraft,
      follow: !isDraft,
      googleBot: {
        index: !isDraft,
        follow: !isDraft,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    // ── Open Graph — Article type ───────────────────────────────────────────
    // og:type = "article" unlocks article-specific meta tags
    // These are read by Facebook, LinkedIn, and other social scrapers
    openGraph: {
      type: "article",
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

      // ── Article-specific OG tags ─────────────────────────────────────────
      // These are not part of Next.js Metadata type directly
      // but Next.js passes them through as-is for og:type = "article"
      publishedTime: datePublished,
      modifiedTime: dateModified ?? datePublished,
      authors: absoluteAuthorUrl ? [absoluteAuthorUrl] : [baseUrl],
      ...(category && { section: category }),
      ...(tags && tags.length > 0 && { tags }),
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
// USAGE EXAMPLE
// ─────────────────────────────────────────────────────────────────────────────
//
// app/blog/[slug]/page.tsx
//
// import { buildBlogMetadata } from "@/lib/seo/buildBlogMetadata";
// import { buildBlogPostSchema } from "@/lib/structured-data";
// import { SchemaScript } from "@/lib/structured-data";
//
// // ── Metadata ────────────────────────────────────────────────────────────────
// export async function generateMetadata({
//   params,
// }: {
//   params: Promise<{ slug: string }>;
// }): Promise<Metadata> {
//   const { slug } = await params;
//
//   // TODO: replace with your actual data fetching
//   const post = await getPost(slug);
//
//   // Return empty object for unknown slugs — Next.js falls back to root metadata
//   if (!post) return {};
//
//   return buildBlogMetadata({
//     title: post.title,
//     description: post.excerpt,
//     slug: post.slug,
//     datePublished: post.publishedAt,
//     dateModified: post.updatedAt,
//     authorName: post.author.name,
//     authorUrl: `/authors/${post.author.slug}`,
//     category: post.category,
//     tags: post.tags,
//     coverImageUrl: post.coverImage?.url,
//     coverImageAlt: post.coverImage?.alt,
//     isDraft: post.status === "draft",
//   });
// }
//
// // ── Page component ───────────────────────────────────────────────────────────
// export default async function BlogPostPage({
//   params,
// }: {
//   params: Promise<{ slug: string }>;
// }) {
//   const { slug } = await params;
//   const post = await getPost(slug);
//   if (!post) notFound();
//
//   const schema = buildBlogPostSchema({
//     title: post.title,
//     description: post.excerpt,
//     slug: post.slug,
//     datePublished: post.publishedAt,
//     dateModified: post.updatedAt,
//     author: {
//       name: post.author.name,
//       url: `/authors/${post.author.slug}`,
//     },
//     category: post.category,
//     tags: post.tags,
//     breadcrumbs: [
//       { name: "Blog", path: "/blog" },
//       { name: post.title, path: `/blog/${post.slug}` },
//     ],
//   });
//
//   return (
//     <article>
//       <SchemaScript schema={schema} />
//       {/* your post content */}
//     </article>
//   );
// }
