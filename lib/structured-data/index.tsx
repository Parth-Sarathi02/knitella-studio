// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURED DATA — unified export
// Import everything from here — never import from individual files directly
//
// import {
//   buildBlogPostSchema,
//   buildProductSchema,
//   buildFaqSchema,
//   ...
// } from "@/lib/structured-data";
// ─────────────────────────────────────────────────────────────────────────────

export {
  buildOrganizationSchema,
  type OrganizationSchemaOverrides,
} from "./organization";

export {
  buildWebPageSchema,
  type WebPageSchemaInput,
  type WebPageType,
} from "./webpage";

export {
  buildBlogPostSchema,
  type BlogPostSchemaInput,
  type BlogAuthor,
} from "./blog-post";

export {
  buildProductSchema,
  type ProductSchemaInput,
  type OfferAvailability,
  type OfferCondition,
} from "./product";

export {
  buildFaqSchema,
  buildFaqMetaDescription,
  type FaqSchemaInput,
  type FaqItem,
} from "./faq";

export {
  buildBreadcrumbSchema,
  buildBreadcrumbItems,
  type BreadcrumbSchemaInput,
  type BreadcrumbItem,
} from "./breadcrumb";

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA INJECTION HELPER
// Renders a <script type="application/ld+json"> tag
// Use this in any Server Component — no dangerouslySetInnerHTML boilerplate
//
// USAGE:
//   import { SchemaScript } from "@/lib/structured-data";
//
//   const schema = buildBlogPostSchema({ ... });
//   <SchemaScript schema={schema} />
//
// Multiple schemas on one page — just render multiple SchemaScript tags:
//   <SchemaScript schema={blogSchema} />
//   <SchemaScript schema={faqSchema} />
//   <SchemaScript schema={breadcrumbSchema} />
// ─────────────────────────────────────────────────────────────────────────────
export function SchemaScript({ schema }: { schema: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}
