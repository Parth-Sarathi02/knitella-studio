import { baseUrl, buildCanonical } from "@/seo-configs/baseInfo";

// ─────────────────────────────────────────────────────────────────────────────
// FAQ SCHEMA — FAQPage + Question + Answer
// One of the highest ROI structured data types available
//
// Enables:
//   • FAQ rich results — questions expand directly in Google Search SERP
//   • Doubles your SERP real estate without a higher ranking
//   • AI citation — LLMs love Q&A pairs, they extract them reliably
//   • Voice search answers — Google Assistant, Siri pull from FAQPage schema
//   • Featured snippet eligibility for individual Q&A pairs
//
// IMPORTANT GOOGLE RULES:
//   • Each answer must be the FULL answer — not "click here to read more"
//   • Answers can contain links but the core answer must be in the text
//   • Max ~10 FAQs per page for rich result display (more is fine for AI)
//   • Do NOT use for ads, promotional content, or off-topic questions
//   • Answers should match what's visibly on the page
//
// USAGE PATTERN:
//   • Add to any page that has a visible FAQ section
//   • Add to blog posts that answer a primary question
//   • Add to product pages for common product questions
//   • Add to service pages for pricing / process questions
//
// Validator: https://search.google.com/test/rich-results
// Docs: https://schema.org/FAQPage
// ─────────────────────────────────────────────────────────────────────────────

// ─── Types ────────────────────────────────────────────────────────────────────
export interface FaqItem {
  question: string; // Full question text — use natural language
  // eg: "How long does shipping take?" not "Shipping time?"
  answer: string; // Full answer — can include HTML but plain text preferred
  // Max ~2500 chars — Google may truncate longer answers
}

export interface FaqSchemaInput {
  // The page this FAQ lives on
  path: string; // Relative path eg: "/faq" or "/products/headphones"
  items: FaqItem[]; // The Q&A pairs
  // Optional — if the FAQ is a section within a larger page
  // rather than the entire page being an FAQ
  isSectionOnly?: boolean; // true → use Question nodes only, not FAQPage wrapper
}

// ─────────────────────────────────────────────────────────────────────────────
// buildFaqSchema
// ─────────────────────────────────────────────────────────────────────────────
export function buildFaqSchema(input: FaqSchemaInput) {
  const { path, items, isSectionOnly = false } = input;

  const canonicalUrl = buildCanonical(path);

  // ── Build Question nodes ───────────────────────────────────────────────────
  const questionNodes = items.map((item, index) => ({
    "@type": "Question",
    "@id": `${canonicalUrl}/#faq-q${index + 1}`,
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  }));

  // ── Section only — just the Question nodes, no FAQPage wrapper ────────────
  // Use when FAQ is one section of a larger page (eg: a product page)
  // and the page already has its own primary schema type (Product, Article)
  if (isSectionOnly) {
    return {
      "@context": "https://schema.org",
      "@graph": questionNodes,
    };
  }

  // ── Full FAQPage — use when the primary purpose of the page is FAQs ───────
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}/#faqpage`,
        url: canonicalUrl,
        isPartOf: {
          "@id": `${baseUrl}/#website`,
        },
        mainEntity: questionNodes,
      },
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// buildFaqMetaDescription
// Utility — generates a meta description from FAQ items
// Useful for FAQ pages that don't have a manually written description
// Takes the first question and truncates the answer to fit
// ─────────────────────────────────────────────────────────────────────────────
export function buildFaqMetaDescription(items: FaqItem[]): string {
  if (items.length === 0) return "";

  const first = items[0];
  const answerPreview =
    first.answer.length > 100
      ? `${first.answer.slice(0, 97)}...`
      : first.answer;

  return `${first.question} ${answerPreview}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// USAGE EXAMPLES
// ─────────────────────────────────────────────────────────────────────────────
//
// ── Dedicated FAQ page (/faq) ─────────────────────────────────────────────────
//
// import { buildFaqSchema } from "@/lib/structured-data/faq";
//
// const schema = buildFaqSchema({
//   path: "/faq",
//   items: [
//     {
//       question: "How long does shipping take?",
//       answer:
//         "Standard shipping takes 5–7 business days across India. Express shipping " +
//         "(2–3 business days) is available for an additional fee at checkout. " +
//         "International orders typically arrive within 10–14 business days.",
//     },
//     {
//       question: "What is your return policy?",
//       answer:
//         "We offer a 30-day no-questions-asked return policy on all products. " +
//         "Items must be in original condition with packaging intact. " +
//         "Initiate a return from your account dashboard or contact support@yoursite.com.",
//     },
//     {
//       question: "Do you offer bulk or wholesale pricing?",
//       answer:
//         "Yes, we offer tiered pricing for orders of 10 units or more. " +
//         "Contact our sales team at sales@yoursite.com for a custom quote.",
//     },
//   ],
// });
//
// <script
//   type="application/ld+json"
//   dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
// />
//
// ─────────────────────────────────────────────────────────────────────────────
//
// ── FAQ section inside a product page ────────────────────────────────────────
// When a product page has a FAQ section, use isSectionOnly: true
// This avoids conflicting with the Product schema's @type
//
// const faqSchema = buildFaqSchema({
//   path: "/products/wireless-headphones",
//   isSectionOnly: true,
//   items: [
//     {
//       question: "Are these headphones compatible with iPhone?",
//       answer:
//         "Yes, these headphones are compatible with all Bluetooth-enabled devices " +
//         "including iPhone, Android, and Windows. They also support wired connection " +
//         "via the included 3.5mm cable.",
//     },
//     {
//       question: "What is the battery life?",
//       answer:
//         "The headphones offer up to 40 hours of playback on a single charge " +
//         "with ANC off, or 30 hours with ANC enabled. A 10-minute quick charge " +
//         "provides up to 3 hours of playback.",
//     },
//   ],
// });
//
// // Inject ALONGSIDE your product schema — both go on the same page
// <script
//   type="application/ld+json"
//   dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
// />
// <script
//   type="application/ld+json"
//   dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
// />
//
// ─────────────────────────────────────────────────────────────────────────────
//
// ── FAQ section inside a blog post ───────────────────────────────────────────
//
// const faqSchema = buildFaqSchema({
//   path: "/blog/nextjs-seo-guide",
//   isSectionOnly: true,
//   items: [
//     {
//       question: "Does Next.js automatically handle SEO?",
//       answer:
//         "Next.js handles several SEO fundamentals automatically including " +
//         "server-side rendering, code splitting, and image optimization. " +
//         "However, metadata, structured data, sitemaps, and robots.txt " +
//         "still require manual implementation.",
//     },
//   ],
// });
