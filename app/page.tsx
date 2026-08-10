import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";
import { buildWebPageSchema } from "@/lib/structured-data/webpage";
// import { buildFaqSchema } from "@/lib/structured-data/faq";
import { SchemaScript } from "@/lib/structured-data";
import { baseInfo } from "@/seo-configs/baseInfo";

// ─────────────────────────────────────────────────────────────────────────────
// RENDERING STRATEGY
// ─────────────────────────────────────────────────────────────────────────────
// Static generation — homepage is pre-rendered at build time
// This is the default for pages with no dynamic data
// Fastest possible TTFB — served from CDN edge
//
// To opt into ISR (revalidate on interval):
//   export const revalidate = 3600; // revalidate every 1 hour
//
// To opt into SSR (render on every request):
//   export const dynamic = "force-dynamic";
//
// For most homepages: keep it static.
export const dynamic = "force-static";

// ─────────────────────────────────────────────────────────────────────────────
// METADATA
// Merged with rootMetadata from layout.tsx
// Only define what's different from the root — Next.js merges the rest
// ─────────────────────────────────────────────────────────────────────────────
export const metadata: Metadata = buildPageMetadata({
  title: baseInfo.title,
  description: baseInfo.description,
  path: "/",
  keywords: baseInfo.keywords,
  // Homepage uses the static opengraph-image.tsx — no override needed
});

// ─────────────────────────────────────────────────────────────────────────────
// HOMEPAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const Home: React.FC = () => {
  // ── Structured data ────────────────────────────────────────────────────────
  // WebPage schema — connects this page to the site graph
  // Organization + WebSite schemas are already injected in layout.tsx
  const webPageSchema = buildWebPageSchema({
    title: baseInfo.fullTitle,
    description: baseInfo.description,
    path: "/",
    type: "WebPage",
    breadcrumbs: [], // No breadcrumbs on homepage
  });

  // ── FAQ schema — optional ──────────────────────────────────────────────────
  // Add if your homepage has a visible FAQ section
  // Remove if not — never add hidden/invisible FAQ content for schema only
  // Google will penalize hidden structured data that doesn't match page content
  // const faqSchema = buildFaqSchema({
  //   path: "/",
  //   isSectionOnly: true,
  //   items: [
  //     // TODO: replace with your actual homepage FAQs
  //     // Keep answers complete — no "click here for more"
  //     // {
  //     //   question: "What does <COMPANY_NAME> do?",
  //     //   answer:
  //     //     "<COMPANY_NAME> provides <SERVICE> for <TARGET_AUDIENCE>. " +
  //     //     "<COMPLETE_ANSWER_IN_2-3_SENTENCES>",
  //     // },
  //     // {
  //     //   question: "How do I get started?",
  //     //   answer:
  //     //     "Getting started is simple. <COMPLETE_ONBOARDING_EXPLANATION>",
  //     // },
  //   ],
  // });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Structured data injection ──────────────────────────────────────
          SchemaScript renders <script type="application/ld+json">
          Place before page content — crawlers read top-down             */}
      <SchemaScript schema={webPageSchema} />

      {/* Only inject FAQ schema if you have actual FAQ items above       */}
      {/* <SchemaScript schema={faqSchema} /> */}

      {/* ── Page content ───────────────────────────────────────────────────
          SEO CONTENT STRUCTURE — follow this pattern on every page:

          1. H1 — one per page, contains primary keyword
             Do not skip H1. Do not use H1 more than once.

          2. Lead paragraph — answers the primary intent immediately
             BLUF: Bottom Line Up Front
             AI systems and featured snippets pull from the first paragraph

          3. Supporting sections — H2 headings with keyword-rich text
             Each H2 should target a secondary keyword or user question

          4. FAQ section — if applicable
             Use question-based H3s: "How does X work?" not "Features"

          5. CTA — clear, single call to action
             Internal links help crawlers navigate your site graph        */}

      <main
        id="home"
        className="w-full min-h-screen flex flex-col justify-center items-center"
      >
        {/* ── Hero section ────────────────────────────────────────────────
            TODO: replace with your actual hero content

            PERFORMANCE NOTES:
            • Use next/image for hero images — never raw <img>
            • Add priority prop to above-the-fold images — eliminates LCP
            • Avoid loading spinners or skeleton screens above the fold
            • Font must be loaded via lib/fonts.ts — never @import in CSS  */}

        <section aria-labelledby="hero-heading">
          {/* H1 — primary keyword target */}
          <h1 id="hero-heading">
            {/* TODO: replace with keyword-rich headline */}
            {baseInfo.title}
          </h1>

          {/* Lead paragraph — BLUF, AI citation target */}
          <p>
            {/* TODO: replace with your actual description */}
            {baseInfo.description}
          </p>

          {/* Primary CTA */}
          {/* TODO: replace href with your actual CTA target */}
          <a href="/contact" aria-label={`Contact ${baseInfo.name}`}>
            Get Started
          </a>
        </section>

        {/* ── Features / Services section ──────────────────────────────────
            TODO: add your actual features/services

            SEMANTIC HTML NOTES:
            • Use <section> with aria-labelledby for each major section
            • Use <article> for self-contained content blocks
            • Use <ul>/<ol> for lists — not divs
            • Use <figure>/<figcaption> for images with captions           */}

        {/* ── FAQ section ──────────────────────────────────────────────────
            Only add if you have real FAQs to show
            Must be VISIBLE on the page — not hidden
            Uncomment SchemaScript above when you add this               */}
        {/*
        <section aria-labelledby="faq-heading">
          <h2 id="faq-heading">Frequently Asked Questions</h2>
          <dl>
            <div>
              <dt>
                <h3>What does {baseInfo.name} do?</h3>
              </dt>
              <dd>
                <p>{baseInfo.description}</p>
              </dd>
            </div>
          </dl>
        </section>
        */}
      </main>
    </>
  );
};

export default Home;
