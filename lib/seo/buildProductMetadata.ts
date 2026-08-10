import type { Metadata } from "next";
import {
  baseInfo,
  buildCanonical,
  buildOgImageUrl,
  buildTitle,
} from "@/seo-configs/baseInfo";

// ─────────────────────────────────────────────────────────────────────────────
// BUILD PRODUCT METADATA — individual product / service pages
// Use in app/products/[slug]/page.tsx via generateMetadata()
//
// Why a dedicated builder for products?
//   • Product titles follow a different pattern: "Product Name — Price | Brand"
//   • Descriptions should include price, availability, key specs
//   • OG images are product photos not generated templates (usually)
//   • Product pages need og:type = "website" (not "article")
//     There is no og:type = "product" in the standard spec
//     Facebook has their own product tags but they are commerce-specific
//   • Availability + price in description improves CTR from SERPs
//   • noIndex for out-of-stock / discontinued products is a common pattern
//
// USAGE:
//   export async function generateMetadata(
//     { params }: { params: Promise<{ slug: string }> }
//   ): Promise<Metadata> {
//     const { slug } = await params;
//     const product = await getProduct(slug);
//     if (!product) return {};
//     return buildProductMetadata({ ... });
//   }
// ─────────────────────────────────────────────────────────────────────────────

// ─── Availability label ───────────────────────────────────────────────────────
// Human-readable availability strings for meta descriptions
export type ProductAvailabilityLabel =
  | "In Stock"
  | "Out of Stock"
  | "Pre-Order"
  | "Limited Stock"
  | "Back Order"
  | "Discontinued";

// ─── Input ────────────────────────────────────────────────────────────────────
export interface ProductMetadataInput {
  // Required
  name: string;
  description: string; // Core product description — 150–160 chars
  slug: string; // Used to build canonical: /products/{slug}

  // Pricing
  price?: number;
  currency?: string; // ISO 4217: "INR", "USD", "EUR"
  availability?: ProductAvailabilityLabel;

  // Optional
  brand?: string;
  category?: string;
  sku?: string;
  keywords?: string[];

  // Images
  // First image used as OG image — should be clean product shot
  // Minimum 1200x630px for OG, but square (1200x1200) is better for product
  // Next.js will use the opengraph-image.tsx fallback if not provided
  primaryImageUrl?: string;
  primaryImageAlt?: string;

  // Index control
  // noIndex common cases:
  //   • Discontinued products
  //   • Out of stock with no restock date
  //   • Duplicate variant pages (color/size variants)
  noIndex?: boolean;

  // Canonical override
  // Use for product variants that should point to the main product page
  // eg: /products/shirt-red → canonical: /products/shirt
  canonicalUrl?: string;

  // Locale override
  locale?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// formatPrice
// Formats price with currency symbol for use in meta descriptions
// ─────────────────────────────────────────────────────────────────────────────
function formatPrice(price: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency} ${price}`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// buildProductDescription
// Enriches the base description with price and availability signals
// These appear in Google Search snippets — improves CTR
// ─────────────────────────────────────────────────────────────────────────────
function buildProductDescription(input: ProductMetadataInput): string {
  const { description, price, currency = "INR", availability } = input;

  const parts: string[] = [description];

  if (price !== undefined) {
    parts.push(`Price: ${formatPrice(price, currency)}.`);
  }

  if (availability) {
    parts.push(`${availability}.`);
  }

  return parts.join(" ");
}

// ─────────────────────────────────────────────────────────────────────────────
// buildProductTitle
// Product title pattern: "Product Name | Brand"
// Optionally includes price signal: "Product Name — ₹4,999 | Brand"
// Including price in title improves CTR for commercial queries
// ─────────────────────────────────────────────────────────────────────────────
function buildProductTitle(input: ProductMetadataInput): string {
  const { name, price, currency = "INR" } = input;

  if (price !== undefined) {
    return `${name} — ${formatPrice(price, currency)}`;
  }

  return name;
}

// ─────────────────────────────────────────────────────────────────────────────
// buildProductMetadata
// ─────────────────────────────────────────────────────────────────────────────
export function buildProductMetadata(input: ProductMetadataInput): Metadata {
  const {
    name,
    slug,
    brand,
    category,
    sku,
    keywords,
    primaryImageUrl,
    primaryImageAlt,
    noIndex = false,
    canonicalUrl,
    locale,
  } = input;

  const canonical = canonicalUrl ?? buildCanonical(`/products/${slug}`);

  // OG image — product photo takes priority over generated OG image
  // Generated OG image is the fallback (shows product name + price template)
  const ogImage = primaryImageUrl ?? buildOgImageUrl(`/products/${slug}`);
  const ogAlt = primaryImageAlt ?? name;

  // Build enriched title and description
  const productTitle = buildProductTitle(input);
  const productDescription = buildProductDescription(input);

  // Merge keywords
  const mergedKeywords = [
    ...(keywords ?? []),
    name,
    ...(brand ? [brand] : []),
    ...(category ? [category] : []),
    ...(sku ? [sku] : []),
    ...baseInfo.keywords,
  ];

  return {
    // ── Title ──────────────────────────────────────────────────────────────
    // Uses template: "Product Name — ₹4,999 | Brand Name"
    title: productTitle,

    // ── Description ────────────────────────────────────────────────────────
    // Enriched with price + availability — shown in Google Search snippets
    description: productDescription,

    // ── Keywords ───────────────────────────────────────────────────────────
    keywords: mergedKeywords,

    // ── Canonical ──────────────────────────────────────────────────────────
    // Critical for product variants — all variants point to main product
    alternates: {
      canonical,
    },

    // ── Robots ─────────────────────────────────────────────────────────────
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-image-preview": "large",
        "max-snippet": -1,
        // Allow video preview for product demo videos
        "max-video-preview": -1,
      },
    },

    // ── Open Graph ─────────────────────────────────────────────────────────
    openGraph: {
      type: "website",
      locale: locale ?? baseInfo.locale,
      url: canonical,
      siteName: baseInfo.name,
      title: buildTitle(productTitle),
      description: productDescription,
      images: [
        {
          url: ogImage,
          // Product images are ideally square (1200x1200)
          // but OG spec requires 1200x630 minimum
          // If your product images are square, set both to 1200
          width: 1200,
          height: 630,
          alt: ogAlt,
          type: primaryImageUrl ? "image/jpeg" : "image/png",
        },
      ],
    },

    // ── Twitter / X ────────────────────────────────────────────────────────
    twitter: {
      card: "summary_large_image",
      site: baseInfo.social.twitter,
      creator: baseInfo.social.twitter,
      title: buildTitle(productTitle),
      description: productDescription,
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
// app/products/[slug]/page.tsx
//
// import { buildProductMetadata } from "@/lib/seo/buildProductMetadata";
// import { buildProductSchema, buildFaqSchema, SchemaScript } from "@/lib/structured-data";
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
//   const product = await getProduct(slug);
//   if (!product) return {};
//
//   return buildProductMetadata({
//     name: product.name,
//     description: product.shortDescription,
//     slug: product.slug,
//     price: product.price,
//     currency: "INR",
//     availability: product.inStock ? "In Stock" : "Out of Stock",
//     brand: product.brand,
//     category: product.category,
//     sku: product.sku,
//     primaryImageUrl: product.images[0]?.url,
//     primaryImageAlt: product.images[0]?.alt,
//     // noIndex discontinued or permanently out of stock products
//     noIndex: product.status === "discontinued",
//     keywords: [product.name, product.brand, product.category],
//   });
// }
//
// // ── Page component ───────────────────────────────────────────────────────────
// export default async function ProductPage({
//   params,
// }: {
//   params: Promise<{ slug: string }>;
// }) {
//   const { slug } = await params;
//   const product = await getProduct(slug);
//   if (!product) notFound();
//
//   const productSchema = buildProductSchema({
//     name: product.name,
//     description: product.shortDescription,
//     slug: product.slug,
//     images: product.images,
//     offer: {
//       price: product.price,
//       currency: "INR",
//       availability: product.inStock
//         ? "https://schema.org/InStock"
//         : "https://schema.org/OutOfStock",
//     },
//     sku: product.sku,
//     brand: product.brand,
//     aggregateRating: product.rating
//       ? {
//           ratingValue: product.rating.average,
//           reviewCount: product.rating.count,
//         }
//       : undefined,
//     breadcrumbs: [
//       { name: "Products", path: "/products" },
//       { name: product.category, path: `/products/${product.categorySlug}` },
//       { name: product.name, path: `/products/${product.slug}` },
//     ],
//   });
//
//   // FAQ section schema — inject alongside product schema
//   const faqSchema = product.faqs?.length
//     ? buildFaqSchema({
//         path: `/products/${product.slug}`,
//         isSectionOnly: true,
//         items: product.faqs,
//       })
//     : null;
//
//   return (
//     <main>
//       <SchemaScript schema={productSchema} />
//       {faqSchema && <SchemaScript schema={faqSchema} />}
//       {/* your product content */}
//     </main>
//   );
// }
