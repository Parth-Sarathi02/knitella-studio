import {
  baseInfo,
  baseUrl,
  businessType,
  sameAsUrls,
  optional,
} from "@/seo-configs/baseInfo";

// ─────────────────────────────────────────────────────────────────────────────
// ORGANIZATION / LOCAL BUSINESS SCHEMA
// Tells search engines and LLMs exactly who you are as an entity
//
// Used in:
//   seo-configs/metadata.ts  → root structured data (already wired)
//   Any page that needs to re-assert business identity
//
// Validator: https://validator.schema.org
// Rich results: https://search.google.com/test/rich-results
// ─────────────────────────────────────────────────────────────────────────────

// ─── Types ────────────────────────────────────────────────────────────────────
export interface OrganizationSchemaOverrides {
  // Override specific fields per page if needed
  // eg: a location-specific page might override areaServed
  name?: string;
  description?: string;
  areaServed?: string;
  url?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// buildOrganizationSchema
// Builds the Organization / LocalBusiness schema node
// Called from page-level structured data when you need to include
// the business identity node alongside page-specific schema
// ─────────────────────────────────────────────────────────────────────────────
export function buildOrganizationSchema(
  overrides: OrganizationSchemaOverrides = {},
) {
  return {
    "@type": businessType,
    "@id": `${baseUrl}/#business`,
    name: overrides.name ?? baseInfo.name,
    legalName: baseInfo.legalName,
    url: overrides.url ?? baseUrl,
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
    description: overrides.description ?? baseInfo.description,

    // ── Contact ──────────────────────────────────────────────────────────────
    ...optional(baseInfo.phone, { telephone: baseInfo.phone }),
    ...optional(baseInfo.email, { email: baseInfo.email }),

    // ── Address ──────────────────────────────────────────────────────────────

    ...optional(baseInfo.address.streetAddress, {
      address: {
        "@type": "PostalAddress",
        streetAddress: baseInfo.address.streetAddress,
        addressLocality: baseInfo.address.addressLocality,
        addressRegion: baseInfo.address.addressRegion,
        postalCode: baseInfo.address.postalCode,
        addressCountry: baseInfo.address.addressCountry,
      },
    }),

    // ── Geo ───────────────────────────────────────────────────────────────────
    ...optional(baseInfo.geo.latitude, {
      geo: {
        "@type": "GeoCoordinates",
        latitude: baseInfo.geo.latitude,
        longitude: baseInfo.geo.longitude,
      },
    }),

    // ── Hours ─────────────────────────────────────────────────────────────────
    ...(baseInfo.openingHours.length > 0 && {
      openingHours: baseInfo.openingHours,
    }),

    // ── Business details ──────────────────────────────────────────────────────
    ...optional(baseInfo.priceRange, { priceRange: baseInfo.priceRange }),
    ...optional(baseInfo.foundingDate, { foundingDate: baseInfo.foundingDate }),
    ...optional(baseInfo.areaServed, {
      areaServed: {
        "@type": "Country",
        name: overrides.areaServed ?? baseInfo.areaServed,
      },
    }),

    // ── Social profiles ───────────────────────────────────────────────────────
    // sameAs is the strongest entity disambiguation signal
    // The more authoritative profiles listed, the stronger the entity signal
    ...(sameAsUrls.length > 0 && { sameAs: sameAsUrls }),
  };
}
