import {
  baseInfo,
  baseUrl,
  buildCanonical,
  buildOgImageUrl,
} from "@/seo-configs/baseInfo";

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT SCHEMA — Product + Offer + AggregateRating
// Used on every individual product / service detail page
//
// Enables:
//   • Product rich results — price, availability, rating shown in Google Search
//   • Google Shopping integration
//   • Merchant Center eligibility
//   • AI product citation with structured price + availability data
//
// IMPORTANT GOOGLE RULES FOR PRODUCT RICH RESULTS:
//   • price is REQUIRED inside Offer for rich results
//   • priceCurrency must be ISO 4217 eg: "INR", "USD", "EUR"
//   • availability must use schema.org URL values (see OfferAvailability below)
//   • images array must have at least one image
//   • AggregateRating.ratingCount must be > 0 if included
//
// Validator: https://search.google.com/test/rich-results
// Docs: https://schema.org/Product
// ─────────────────────────────────────────────────────────────────────────────

// ─── Offer availability values ────────────────────────────────────────────────
export type OfferAvailability =
  | "https://schema.org/InStock"
  | "https://schema.org/OutOfStock"
  | "https://schema.org/PreOrder"
  | "https://schema.org/BackOrder"
  | "https://schema.org/Discontinued"
  | "https://schema.org/LimitedAvailability"
  | "https://schema.org/OnlineOnly"
  | "https://schema.org/InStoreOnly";

// ─── Offer condition values ───────────────────────────────────────────────────
export type OfferCondition =
  | "https://schema.org/NewCondition"
  | "https://schema.org/UsedCondition"
  | "https://schema.org/RefurbishedCondition";

// ─── Input ────────────────────────────────────────────────────────────────────
export interface ProductSchemaInput {
  // Required
  name: string;
  description: string;
  slug: string; // Used to build canonical URL

  // Images — at least one required for rich results
  images: Array<{
    url: string; // Absolute URL
    alt?: string;
    width?: number;
    height?: number;
  }>;

  // Offer — required for price rich results
  offer: {
    price: number;
    currency: string; // ISO 4217: "INR", "USD", "EUR", "GBP"
    availability: OfferAvailability;
    condition?: OfferCondition;
    // Date until which the price is valid — important for Google Shopping
    priceValidUntil?: string; // ISO 8601 date: "2025-12-31"
    // URL where the product can be purchased
    url?: string;
    // Seller — defaults to your Organization
    sellerName?: string;
  };

  // Optional
  sku?: string; // Stock keeping unit
  gtin?: string; // GTIN-8/12/13/14 barcode — strengthens product entity
  mpn?: string; // Manufacturer part number
  brand?: string; // Brand name — defaults to baseInfo.name
  category?: string; // Product category eg: "Electronics > Phones"
  color?: string;
  material?: string;
  weight?: string; // eg: "1.5 kg"
  datePublished?: string; // When the product was listed — ISO 8601

  // Aggregate rating — only include if you have real reviews
  // NEVER fake these — Google manual action risk
  aggregateRating?: {
    ratingValue: number; // Average rating eg: 4.5
    reviewCount: number; // Total number of reviews — must be > 0
    bestRating?: number; // Maximum possible rating — defaults to 5
    worstRating?: number; // Minimum possible rating — defaults to 1
  };

  // Individual reviews — optional, shown as review snippets
  reviews?: Array<{
    author: string;
    datePublished: string; // ISO 8601
    reviewBody: string;
    ratingValue: number;
    bestRating?: number;
  }>;

  // Breadcrumbs — recommended
  breadcrumbs?: Array<{
    name: string;
    path: string;
  }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// buildProductSchema
// ─────────────────────────────────────────────────────────────────────────────
export function buildProductSchema(input: ProductSchemaInput) {
  const {
    name,
    description,
    slug,
    images,
    offer,
    sku,
    gtin,
    mpn,
    brand,
    category,
    color,
    material,
    weight,
    datePublished,
    aggregateRating,
    reviews,
    breadcrumbs,
  } = input;

  const canonicalUrl = buildCanonical(`/products/${slug}`);
  const ogImageUrl = images[0]?.url ?? buildOgImageUrl(`/products/${slug}`);
  const now = new Date().toISOString();

  return {
    "@context": "https://schema.org",
    "@graph": [
      // ── Product node ──────────────────────────────────────────────────────
      {
        "@type": "Product",
        "@id": `${canonicalUrl}/#product`,
        name,
        description,
        url: canonicalUrl,

        // ── Identifiers ───────────────────────────────────────────────────────
        // More identifiers = stronger product entity signal for Google Shopping
        ...(sku && { sku }),
        ...(gtin && { gtin }),
        ...(mpn && { mpn }),

        // ── Brand ─────────────────────────────────────────────────────────────
        brand: {
          "@type": "Brand",
          name: brand ?? baseInfo.name,
        },

        // ── Category ──────────────────────────────────────────────────────────
        ...(category && { category }),

        // ── Physical attributes ───────────────────────────────────────────────
        ...(color && { color }),
        ...(material && { material }),
        ...(weight && {
          weight: {
            "@type": "QuantitativeValue",
            name: weight,
          },
        }),

        // ── Images ────────────────────────────────────────────────────────────
        // First image = primary, rest go in array
        // Google requires at least 1 image for rich results
        image: images.map((img) => ({
          "@type": "ImageObject",
          url: img.url,
          ...(img.alt && { caption: img.alt }),
          ...(img.width && { width: img.width }),
          ...(img.height && { height: img.height }),
        })),

        // ── Date listed ───────────────────────────────────────────────────────
        ...(datePublished && { datePublished }),

        // ── Offer ─────────────────────────────────────────────────────────────
        // Offer is REQUIRED to show price in Google rich results
        offers: {
          "@type": "Offer",
          "@id": `${canonicalUrl}/#offer`,
          url: offer.url ?? canonicalUrl,
          price: offer.price.toFixed(2),
          priceCurrency: offer.currency,
          availability: offer.availability,
          itemCondition: offer.condition ?? "https://schema.org/NewCondition",
          ...(offer.priceValidUntil && {
            priceValidUntil: offer.priceValidUntil,
          }),
          seller: {
            "@type": "Organization",
            "@id": `${baseUrl}/#business`,
            name: offer.sellerName ?? baseInfo.name,
          },
        },

        // ── Aggregate Rating ──────────────────────────────────────────────────
        // Only include if you have REAL reviews
        // Faking these risks a Google manual action penalty
        ...(aggregateRating && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: aggregateRating.ratingValue.toFixed(1),
            reviewCount: aggregateRating.reviewCount,
            bestRating: aggregateRating.bestRating ?? 5,
            worstRating: aggregateRating.worstRating ?? 1,
          },
        }),

        // ── Reviews ───────────────────────────────────────────────────────────
        ...(reviews &&
          reviews.length > 0 && {
            review: reviews.map((review) => ({
              "@type": "Review",
              author: {
                "@type": "Person",
                name: review.author,
              },
              datePublished: review.datePublished,
              reviewBody: review.reviewBody,
              reviewRating: {
                "@type": "Rating",
                ratingValue: review.ratingValue,
                bestRating: review.bestRating ?? 5,
              },
            })),
          }),

        // ── Relationships ─────────────────────────────────────────────────────
        isRelatedTo: {
          "@id": `${baseUrl}/#business`,
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
      {
        "@type": "ItemPage",
        "@id": `${canonicalUrl}/#webpage`,
        url: canonicalUrl,
        name,
        description,
        inLanguage: baseInfo.language,
        isPartOf: { "@id": `${baseUrl}/#website` },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: ogImageUrl,
          width: 1200,
          height: 630,
        },
        dateModified: now,
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
                  name: "Products",
                  item: buildCanonical("/products"),
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
// app/products/[slug]/page.tsx
//
// import { buildProductSchema } from "@/lib/structured-data/product";
//
// const schema = buildProductSchema({
//   name: "Wireless Noise Cancelling Headphones",
//   description: "Premium over-ear headphones with 40hr battery life.",
//   slug: "wireless-nc-headphones",
//   images: [
//     {
//       url: "https://mysite.com/products/headphones-main.jpg",
//       alt: "Wireless Noise Cancelling Headphones — Front View",
//       width: 1200,
//       height: 1200,
//     },
//   ],
//   offer: {
//     price: 4999,
//     currency: "INR",
//     availability: "https://schema.org/InStock",
//     priceValidUntil: "2025-12-31",
//   },
//   sku: "WH-NC-001",
//   brand: "Acme Audio",
//   category: "Electronics > Audio > Headphones",
//   aggregateRating: {
//     ratingValue: 4.7,
//     reviewCount: 128,
//   },
//   breadcrumbs: [
//     { name: "Products", path: "/products" },
//     { name: "Headphones", path: "/products/headphones" },
//     { name: "Wireless NC Headphones", path: "/products/wireless-nc-headphones" },
//   ],
// });
//
// <script
//   type="application/ld+json"
//   dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
// />
