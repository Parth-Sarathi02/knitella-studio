# nextjs-seo — Production SEO Template

A Next.js template engineered for perfect Lighthouse scores, Google rich
results, and AI search visibility (GEO/AEO). Every file is pre-wired —
you fill in your content, not your architecture.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [First Things First — Fill These In](#first-things-first)
3. [Platform Registration](#platform-registration)
4. [Rendering Strategies](#rendering-strategies)
5. [Metadata Patterns](#metadata-patterns)
6. [Structured Data Patterns](#structured-data-patterns)
7. [Semantic HTML & Accessibility](#semantic-html--accessibility)
8. [Performance Rules](#performance-rules)
9. [AI Search Optimization](#ai-search-optimization)
10. [Indexing & Submission](#indexing--submission)
11. [Environment Variables](#environment-variables)
12. [File Reference](#file-reference)

---

## Quick Start

```bash
pnpm install
cp .env.example .env.local   # fill in your values
pnpm dev
```

---

## First Things First

Before writing a single page, fill in these two files in order.
Everything else in the template derives from them.

### Step 1 — `seo-configs/baseInfo.ts`

This is your single source of truth. Fill in every field.

```typescript
export const baseUrl = "https://www.yoursite.com";

export const baseInfo = {
  name: "Acme Corp",
  shortName: "Acme",
  legalName: "Acme Corporation Pvt. Ltd.",
  title: "Acme Corp — We Build Great Things",
  fullTitle: "Acme Corp — We Build Great Things",
  description: "Acme Corp builds...",   // 150–160 chars
  email: "hello@acme.com",
  phone: "+91 98765 43210",
  address: { ... },
  geo: { latitude: "28.6139", longitude: "77.2090" },
  social: { twitter: "@acmecorp", ... },
  keywords: ["acme", "your service", "your location"],
  foundingDate: "2020-01-01",
  areaServed: "India",
  locale: "en_IN",
  language: "en",
};
```

### Step 2 — `seo-configs/metadata.ts`

Update these fields only:

```typescript
verification: {
  google: "<YOUR_GSC_TOKEN>",       // from Google Search Console
},
category: "technology",             // your actual business category
```

### Step 3 — `public/llms.txt` and `public/llms-full.txt`

Replace every `<PLACEHOLDER>` with real content.
These files are how AI systems understand your site.

### Step 4 — Add your IndexNow key file

```bash
# Replace with your actual key from Bing Webmaster Tools
echo "your-indexnow-key" > public/your-indexnow-key.txt
```

### Step 5 — `lib/fonts.ts`

Swap Inter for your brand font if needed:

```typescript
// Current: Inter — change to your brand font
import { Inter } from "next/font/google";
```

Then wire it into `app/layout.tsx`:

```typescript
import { primaryFont, monoFont } from "@/lib/fonts";
<html className={`${primaryFont.variable} ${monoFont.variable} antialiased`}>
```

### Step 6 — `next.config.ts`

Add your image domains:

```typescript
remotePatterns: [
  { protocol: "https", hostname: "your-cdn.com" },
  { protocol: "https", hostname: "images.your-cms.com" },
],
```

---

## Platform Registration

Do all of these on day 1 of going live. Not optional.

### 🔴 Google Search Console
`https://search.google.com/search-console`

1. Add property → Domain type (covers all subdomains)
2. Verify via DNS TXT record
3. Submit sitemap: `https://yoursite.com/sitemap.xml`
4. Copy verification token → `seo-configs/metadata.ts` → `verification.google`
5. Check Index Coverage report after 48 hours

### 🔴 Bing Webmaster Tools
`https://www.bing.com/webmasters`

1. Add your site
2. Verify via XML file OR DNS
3. Go to Sitemaps → Submit `https://yoursite.com/sitemap.xml`
4. Go to IndexNow → Generate your API key
5. Download the key file → place in `/public/{key}.txt`
6. Add key to `.env.local` → `INDEXNOW_API_KEY=your-key`

### 🟡 Yandex Webmaster
`https://webmaster.yandex.com`

1. Add site → verify via meta tag or DNS
2. Submit sitemap
3. IndexNow covers Yandex automatically once Bing key is set up

### 🟡 Google Analytics or Umami
Pick one analytics provider:

**Option A — Umami (recommended, privacy-first, self-hosted)**
```typescript
// app/layout.tsx — add to <head>
<script
  defer
  src="https://your-umami.com/script.js"
  data-website-id="your-id"
/>
```

**Option B — Google Analytics 4**
```typescript
// app/layout.tsx — add to <head>
// Use next/third-parties for GA4 — auto-optimized loading
import { GoogleAnalytics } from "@next/third-parties/google";
<GoogleAnalytics gaId="G-XXXXXXXXXX" />
```

### 🟡 Google Rich Results Test
`https://search.google.com/test/rich-results`

Run this on every new page type before launching.
Validates your structured data is correct.

### 🟡 Schema Validator
`https://validator.schema.org`

Paste your JSON-LD output here to check for errors.

### 🟡 PageSpeed Insights
`https://pagespeed.web.dev`

Run on homepage and your most important page.
Target: 100 Performance, 100 SEO, 100 Accessibility, 100 Best Practices.

### 🟡 Cloudflare (if using)
Enable Crawler Hints in Cloudflare dashboard.
This adds automatic IndexNow support at the CDN level —
every cached page change is submitted automatically.

---

## Rendering Strategies

Choose the right strategy per page. Wrong choices destroy
performance scores and SEO simultaneously.

### Static (SSG) — default, use this for most pages

Pre-rendered at build time. Served from CDN. Fastest TTFB.
Best for: homepage, about, services, contact, blog posts (if content
is in repo or fetched at build time).

```typescript
// app/about/page.tsx
// No export needed — static is the default in Next.js App Router

export default function AboutPage() {
  return <main>...</main>;
}
```

Lock it explicitly to prevent accidental dynamic behavior:

```typescript
export const dynamic = "force-static";
```

---

### ISR (Incremental Static Regeneration) — for fresh content

Static page that regenerates in the background on a timer.
Best for: blog posts from CMS, product pages, pricing pages.
The user always gets a fast cached response — Next.js regenerates
in the background after the revalidation window expires.

```typescript
// app/blog/[slug]/page.tsx

// Regenerate this page at most once every 60 minutes
export const revalidate = 3600;

// Or revalidate on-demand via /api/revalidate (already wired up)
// Use this for CMS webhooks — instant update when content changes

export default async function BlogPostPage({ params }) {
  const post = await getPost(params.slug); // cached for 3600s
  return <article>...</article>;
}
```

For on-demand revalidation from your CMS:
```bash
curl -X POST https://yoursite.com/api/revalidate \
  -H "Authorization: Bearer your-secret" \
  -H "Content-Type: application/json" \
  -d '{"type":"path","path":"/blog/my-post","notify":true}'
```

---

### SSR (Server-Side Rendering) — use sparingly

Rendered on every request. Slower TTFB. Higher server cost.
Best for: pages that need real-time data, user-specific content,
live inventory, authenticated dashboards.

```typescript
// app/dashboard/page.tsx
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await fetchLiveData(); // fresh every request
  return <main>...</main>;
}
```

⚠️ Never use SSR for public SEO pages — it kills your TTFB
and Lighthouse performance score.

---

### CSR (Client-Side Rendering) — for interactive UI only

Never use for SEO-critical content. Crawlers see empty HTML.
Use only for content that appears AFTER user interaction:
search results, filtered views, user-specific widgets.

```typescript
"use client";

import { useState, useEffect } from "react";

export function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetch(`/api/search?q=${query}`)
      .then(r => r.json())
      .then(setResults);
  }, [query]);

  return <ul>{results.map(r => <li key={r.id}>{r.title}</li>)}</ul>;
}
```

The correct pattern for mixed pages:

```typescript
// app/products/page.tsx — SSG shell with CSR filter widget
export const dynamic = "force-static";

export default function ProductsPage() {
  return (
    <main>
      <h1>All Products</h1>
      {/* Static — indexed by crawlers */}
      <ProductGrid products={staticProducts} />
      {/* Dynamic — not indexed, loaded client-side */}
      <FilterWidget />
    </main>
  );
}
```

---

### Hybrid — PPR (Partial Pre-Rendering) — future-ready

Static shell + dynamic holes. Experimental in Next.js 15+.
Uncomment in `next.config.ts` when your host supports it.

```typescript
// next.config.ts
experimental: {
  ppr: true,
}

// app/products/[slug]/page.tsx
import { Suspense } from "react";

export default function ProductPage() {
  return (
    <main>
      {/* Static — pre-rendered */}
      <ProductInfo />
      {/* Dynamic — streamed in */}
      <Suspense fallback={<p>Loading stock...</p>}>
        <LiveStockLevel />
      </Suspense>
    </main>
  );
}
```

---

## Metadata Patterns

Always use the builder functions — never write raw Metadata objects.
Builders enforce canonical URLs, OG images, and robots rules
consistently across every page.

### Static page
```typescript
// app/about/page.tsx
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";

export const metadata = buildPageMetadata({
  title: "About Us",
  description: "Learn about our mission and team.",
  path: "/about",
  keywords: ["about us", "our team"],
});
```

### Dynamic page (blog post)
```typescript
// app/blog/[slug]/page.tsx
import { buildBlogMetadata } from "@/lib/seo/buildBlogMetadata";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  return buildBlogMetadata({
    title: post.title,
    description: post.excerpt,
    slug: post.slug,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    authorName: post.author.name,
    category: post.category,
    tags: post.tags,
    isDraft: post.status === "draft",
  });
}
```

### Product page
```typescript
import { buildProductMetadata } from "@/lib/seo/buildProductMetadata";

export async function generateMetadata({ params }) {
  const product = await getProduct((await params).slug);
  if (!product) return {};

  return buildProductMetadata({
    name: product.name,
    description: product.shortDescription,
    slug: product.slug,
    price: product.price,
    currency: "INR",
    availability: product.inStock ? "In Stock" : "Out of Stock",
    noIndex: product.status === "discontinued",
  });
}
```

### Listing / archive page
```typescript
import { buildListingMetadata } from "@/lib/seo/buildListingMetadata";

export async function generateMetadata({ searchParams }) {
  const { page } = await searchParams;

  return buildListingMetadata({
    title: "Blog",
    description: "Insights and tutorials from our team.",
    path: "/blog",
    type: "blog",
    currentPage: page ? parseInt(page) : 1,
    totalItems: 48,
    itemLabel: "articles",
  });
}
```

### noIndex rules — when to use them
```typescript
// Always noindex these:
noIndex: true  // paginated pages beyond page 1
noIndex: true  // search result pages
noIndex: true  // filtered/sorted listing views (?sort=price)
noIndex: true  // thank-you / confirmation pages
noIndex: true  // draft / unpublished content
noIndex: true  // duplicate variant pages (product color/size variants)
noIndex: true  // admin / dashboard pages
```

---

## Structured Data Patterns

Every public page needs at minimum:
1. A `WebPage` node (or its subtype)
2. A `BreadcrumbList` node (except homepage)

Content pages additionally need their type-specific schema.

### Every page — inject like this

```typescript
// In your page component (Server Component)
import { SchemaScript } from "@/lib/structured-data";
import { buildWebPageSchema } from "@/lib/structured-data";

const schema = buildWebPageSchema({
  title: "Page Title",
  description: "Page description.",
  path: "/your-page",
  type: "WebPage",
  breadcrumbs: [
    { name: "Your Page", path: "/your-page" },
  ],
});

return (
  <>
    <SchemaScript schema={schema} />
    {/* page content */}
  </>
);
```

### Multiple schemas on one page

```typescript
// Perfectly valid — Google reads all of them
<SchemaScript schema={productSchema} />
<SchemaScript schema={faqSchema} />
<SchemaScript schema={breadcrumbSchema} />
```

### Which schema builder to use per page type

| Page type | Builder | Schema output |
|---|---|---|
| Homepage | `buildWebPageSchema` | `WebPage` |
| About | `buildWebPageSchema` | `AboutPage` |
| Contact | `buildWebPageSchema` | `ContactPage` |
| Blog listing | `buildWebPageSchema` | `CollectionPage` |
| Blog post | `buildBlogPostSchema` | `BlogPosting` |
| Product listing | `buildWebPageSchema` | `CollectionPage` |
| Product detail | `buildProductSchema` | `Product + Offer` |
| FAQ page | `buildFaqSchema` | `FAQPage` |
| Any page with FAQs | `buildFaqSchema` | `Question` nodes |
| Any page with nav | `buildBreadcrumbSchema` | `BreadcrumbList` |

---

## Semantic HTML & Accessibility

These rules exist for three reasons simultaneously:
1. Accessibility (WCAG 2.1 Level AA)
2. SEO (crawlers use semantic signals for content understanding)
3. AI search (LLMs use semantic structure to chunk and cite content)

Never compromise on these. They are not optional.

### Document structure — one per page

```typescript
// ✅ Correct
<html lang="en">        // lang is set in layout.tsx — do not change
  <body>
    <a href="#main-content">Skip to main content</a>  // already in layout.tsx
    <header>            // site header — once per page
      <nav aria-label="Main navigation">
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/blog">Blog</Link></li>
        </ul>
      </nav>
    </header>
    <main id="main-content">   // skip-link target — already in layout.tsx
      {children}
    </main>
    <footer>            // site footer — once per page
      <nav aria-label="Footer navigation">...</nav>
    </footer>
  </body>
</html>

// ❌ Wrong
<div class="header">
  <div class="nav">...</div>
</div>
<div class="content">...</div>
```

### Heading hierarchy — strictly one H1 per page

```typescript
// ✅ Correct
<h1>Primary Keyword — Page Topic</h1>        // one per page
  <h2>Major Section</h2>                     // multiple allowed
    <h3>Subsection</h3>                      // multiple allowed
      <h4>Detail</h4>                        // use sparingly

// ❌ Wrong — skipping levels
<h1>Page Title</h1>
<h3>Section</h3>     // skipped h2 — breaks outline

// ❌ Wrong — multiple H1s
<h1>Page Title</h1>
<h1>Another Title</h1>   // never

// ❌ Wrong — heading for styling only
<h2 className="text-sm text-gray-400">Category</h2>   // use <p> or <span>
```

### Images — always use next/image

```typescript
// ✅ Correct
import Image from "next/image";

<Image
  src="/hero.webp"
  alt="Descriptive alt text explaining what the image shows"
  width={1200}
  height={630}
  priority              // add for above-the-fold images — critical for LCP
  sizes="(max-width: 768px) 100vw, 1200px"
/>

// ❌ Wrong
<img src="/hero.webp" />                    // no optimization
<Image src="/hero.webp" alt="" />           // empty alt — accessibility failure
<Image src="/hero.webp" alt="image" />      // meaningless alt
```

### Links — always descriptive

```typescript
// ✅ Correct
<Link href="/blog/seo-guide">
  Read our complete SEO guide
</Link>

<Link
  href="/products/headphones"
  aria-label="View Sony WH-1000XM5 headphones"
>
  View Product
</Link>

// ❌ Wrong — meaningless anchor text
<Link href="/blog/seo-guide">Click here</Link>
<Link href="/blog/seo-guide">Read more</Link>
<Link href="/blog/seo-guide">Learn more</Link>
```

### Lists — use semantic list elements

```typescript
// ✅ Correct — unordered list
<ul>
  <li>Feature one</li>
  <li>Feature two</li>
</ul>

// ✅ Correct — ordered steps
<ol>
  <li>First step</li>
  <li>Second step</li>
</ol>

// ✅ Correct — definition list (FAQs, key-value pairs)
<dl>
  <dt>Question text</dt>
  <dd>Answer text</dd>
</dl>

// ❌ Wrong
<div>
  <div>• Feature one</div>
  <div>• Feature two</div>
</div>
```

### ARIA — only when HTML semantics are not enough

```typescript
// ✅ Use aria-label when the visible text is not descriptive enough
<button aria-label="Close navigation menu">
  <XIcon />
</button>

// ✅ Use aria-labelledby to connect sections to their headings
<section aria-labelledby="features-heading">
  <h2 id="features-heading">Features</h2>
  ...
</section>

// ✅ Use aria-hidden on decorative elements
<span aria-hidden="true">→</span>

// ✅ Use aria-live for dynamic content updates
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// ❌ Never add ARIA to elements that already have semantics
<button role="button">Click</button>    // role="button" is redundant on <button>
<nav role="navigation">...</nav>        // role="navigation" is redundant on <nav>
```

### Forms — always labelled

```typescript
// ✅ Correct
<form>
  <label htmlFor="email">Email address</label>
  <input
    id="email"
    type="email"
    name="email"
    autoComplete="email"
    required
    aria-describedby="email-hint"
  />
  <p id="email-hint">We'll never share your email.</p>
</form>

// ❌ Wrong
<input type="email" placeholder="Email" />   // placeholder is not a label
```

### Interactive elements — keyboard accessible

```typescript
// ✅ Use <button> for actions, <Link> for navigation
<button onClick={handleSubmit}>Submit</button>
<Link href="/blog">Go to Blog</Link>

// ❌ Never use div/span for interactive elements
<div onClick={handleSubmit}>Submit</div>     // not keyboard accessible
<span onClick={() => router.push("/blog")}>Blog</span>  // not keyboard accessible
```

### Color and contrast

```
Minimum contrast ratios (WCAG AA):
  Normal text (<18px):        4.5:1
  Large text (≥18px bold):    3:1
  UI components & focus:      3:1

Check at: https://webaim.org/resources/contrastchecker/

Never convey information by color alone:
  ❌ "Required fields are shown in red"
  ✅ "Required fields are marked with *"
```

---

## Performance Rules

Target: 100/100/100/100 on PageSpeed Insights.
These rules are non-negotiable for that score.

### Images

```typescript
// 1. Always use next/image — never raw <img>
// 2. Always provide width and height — prevents CLS
// 3. Add priority to above-the-fold images — critical for LCP
// 4. Add sizes for responsive images — reduces bandwidth
// 5. Use descriptive alt text — accessibility + SEO

<Image
  src="/hero.jpg"
  alt="Hero image description"
  width={1200}
  height={600}
  priority                              // ← LCP image only
  sizes="(max-width: 640px) 100vw, (max-width: 1200px) 80vw, 1200px"
  quality={85}                          // default 75 — increase for hero images
/>

// For non-critical images — lazy load (default behavior, no prop needed)
<Image
  src="/card.jpg"
  alt="Card image"
  width={400}
  height={300}
  // no priority — lazy loaded automatically
/>
```

### Fonts

```typescript
// ✅ Always use next/font — self-hosted, zero layout shift
// Already configured in lib/fonts.ts

// ❌ Never do this — causes render-blocking, layout shift, privacy issues
import "@import url('https://fonts.googleapis.com/css2?family=Inter')"
```

### Third-party scripts

```typescript
// ✅ Use next/script with strategy
import Script from "next/script";

// afterInteractive — analytics, tag managers
<Script
  src="https://your-analytics.com/script.js"
  strategy="afterInteractive"
/>

// lazyOnload — chat widgets, social embeds
<Script
  src="https://your-widget.com/embed.js"
  strategy="lazyOnload"
/>

// ❌ Never add scripts to <head> directly — blocks rendering
<head>
  <script src="https://..."></script>
</head>
```

### Dynamic imports

```typescript
// ✅ Lazy load heavy components that are not above the fold
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("@/components/Chart"), {
  loading: () => <p>Loading chart...</p>,
  ssr: false,     // set false for browser-only libraries
});

const VideoPlayer = dynamic(() => import("@/components/VideoPlayer"), {
  ssr: false,
});
```

### CSS

```typescript
// ✅ Tailwind classes only — no runtime CSS-in-JS
// ✅ CSS Modules for complex component styles
// ✅ globals.css for base styles and CSS variables only

// ❌ Never use styled-components or emotion — they inject CSS at runtime
// ❌ Never import CSS files inside components — they become render-blocking
```

### Data fetching

```typescript
// ✅ Fetch in Server Components — zero client bundle impact
// ✅ Use Next.js fetch with cache options

// Static data — cached forever (until revalidation)
const data = await fetch(url, { cache: "force-cache" });

// ISR-style — revalidate on interval
const data = await fetch(url, { next: { revalidate: 3600 } });

// Tag-based revalidation — revalidate via /api/revalidate
const data = await fetch(url, { next: { tags: ["blog"] } });

// Always fresh — for SSR pages
const data = await fetch(url, { cache: "no-store" });

// ✅ Parallel fetching — never sequential
const [posts, products] = await Promise.all([
  fetchPosts(),
  fetchProducts(),
]);

// ❌ Sequential — each fetch blocks the next
const posts = await fetchPosts();
const products = await fetchProducts();
```

---

## AI Search Optimization

AI systems (ChatGPT, Perplexity, Claude, Gemini) are now significant
traffic sources. These rules maximize your citation rate.

### Content structure — BLUF (Bottom Line Up Front)

```
// ✅ AI-optimized structure — answer first
<h2>What is Next.js?</h2>
<p>
  Next.js is a React framework for building production web applications.
  It provides server-side rendering, static site generation, and
  incremental static regeneration out of the box.
</p>
<p>Additional context and examples follow...</p>

// ❌ Buried lead — AI won't cite this effectively
<h2>Introduction to Next.js</h2>
<p>In today's fast-paced world of web development, choosing the right
framework can make or break your project. Many developers have been
asking about various options... Next.js is a framework that...</p>
```

### Use question-based headings

```typescript
// ✅ AI extracts Q&A pairs from question headings + first paragraph
<h2>How does ISR work in Next.js?</h2>
<p>ISR (Incremental Static Regeneration) serves cached static pages
while regenerating them in the background after a set interval...</p>

// ❌ Generic section title — no extractable Q&A signal
<h2>ISR Overview</h2>
```

### Add FAQ sections to every content page

```typescript
// Even 3–4 FAQs dramatically increase AI citation rate
// Pair visible FAQ content with FAQPage schema
// Use buildFaqSchema() with isSectionOnly: true

const faqSchema = buildFaqSchema({
  path: "/blog/your-post",
  isSectionOnly: true,
  items: [
    {
      question: "What is the main takeaway from this article?",
      answer: "Complete, standalone answer — not 'read the article above'",
    },
  ],
});
```

### Keep `public/llms.txt` current

Update it every time you add a major page, service, or product.
AI crawlers check this file to understand your site structure.

### Allow AI bots in robots.ts

All major AI crawlers are already allowed in `app/robots.ts`.
Never add them to the disallow list unless you have a specific legal reason.

---

## Indexing & Submission

### After every deploy

```bash
pnpm submit-sitemap
```

This script:
1. Fetches your live `sitemap.xml`
2. Submits all URLs to IndexNow (Bing, Yandex, Naver, Seznam)
3. Pings Bing Webmaster Tools with your sitemap URL
4. Prints a full report

### After content updates (CMS webhook)

Wire your CMS to POST to `/api/revalidate` on publish:

```bash
# Single page update
curl -X POST https://yoursite.com/api/revalidate \
  -H "Authorization: Bearer $REVALIDATION_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"type":"path","path":"/blog/updated-post","notify":true}'

# Multiple pages
curl -X POST https://yoursite.com/api/revalidate \
  -H "Authorization: Bearer $REVALIDATION_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"type":"path","path":["/blog/post","/blog"],"notify":true}'
```

### For Google specifically

Google does not support IndexNow. For fast Google indexing:

1. **Primary**: Your `sitemap.xml` is always live — Google crawls it
2. **On launch**: Submit sitemap manually in Google Search Console
3. **Urgent pages**: Use "Request Indexing" in GSC URL Inspection tool
4. **After large updates**: Ping GSC via their API (advanced)

---

## Environment Variables

Create `.env.local` with:

```bash
# ── Required ──────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=https://www.yoursite.com

# ── IndexNow ─────────────────────────────────────────────────────────────────
# Get from: https://www.bing.com/webmasters → IndexNow
INDEXNOW_API_KEY=your-indexnow-key-here

# ── Revalidation webhook ──────────────────────────────────────────────────────
# Generate a strong secret: openssl rand -base64 32
REVALIDATION_SECRET=your-revalidation-secret-here

# ── Bing Webmaster API (for submit-sitemap script) ────────────────────────────
# Get from: https://www.bing.com/webmasters/api
BING_WEBMASTER_API_KEY=your-bing-api-key-here

# ── CMS (add when you wire up a CMS) ─────────────────────────────────────────
# CMS_API_URL=https://your-cms.io/api
# CMS_API_TOKEN=your-cms-token
```

Add to `package.json`:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "submit-sitemap": "node --experimental-strip-types scripts/submit-sitemap.ts"
}
```

---

## File Reference

```
nextjs-seo/
│
├── seo-configs/
│   ├── baseInfo.ts          ← START HERE — fill in your site info
│   └── metadata.ts          ← Root metadata + root structured data
│
├── lib/
│   ├── fonts.ts             ← Website fonts via next/font
│   │
│   ├── og/
│   │   └── OgTemplate.tsx   ← Shared OG image brand component
│   │
│   ├── seo/
│   │   ├── buildPageMetadata.ts     ← Static pages metadata
│   │   ├── buildBlogMetadata.ts     ← Blog post metadata
│   │   ├── buildProductMetadata.ts  ← Product page metadata
│   │   └── buildListingMetadata.ts  ← Listing/archive metadata
│   │
│   ├── structured-data/
│   │   ├── index.ts         ← Unified export + SchemaScript component
│   │   ├── organization.ts  ← Organization/LocalBusiness schema
│   │   ├── webpage.ts       ← WebPage schema (all page types)
│   │   ├── blog-post.ts     ← BlogPosting schema
│   │   ├── product.ts       ← Product + Offer schema
│   │   ├── faq.ts           ← FAQPage + Question schema
│   │   └── breadcrumb.ts    ← BreadcrumbList schema
│   │
│   └── indexing/
│       └── indexnow.ts      ← IndexNow submission utility
│
├── app/
│   ├── layout.tsx           ← Root layout — fonts, structured data, skip link
│   ├── page.tsx             ← Homepage
│   ├── not-found.tsx        ← 404 page
│   ├── robots.ts            ← /robots.txt — crawler rules + AI bot rules
│   ├── sitemap.ts           ← /sitemap.xml — add your pages here
│   ├── manifest.ts          ← /manifest.json — PWA config
│   ├── opengraph-image.tsx  ← Homepage OG image — static
│   │
│   ├── blog/[slug]/
│   │   └── opengraph-image.tsx  ← Dynamic blog post OG image
│   │
│   └── api/revalidate/
│       └── route.ts         ← Webhook — revalidates cache + pings IndexNow
│
├── public/
│   ├── llms.txt             ← AI site index — fill in your content
│   ├── llms-full.txt        ← Extended AI content map — fill in your content
│   └── {indexnow-key}.txt   ← Create this: echo "key" > public/key.txt
│
└── scripts/
    └── submit-sitemap.ts    ← Run after deploy: pnpm submit-sitemap
```

---

## Pre-Launch Checklist

```
CONFIGURATION
□  baseInfo.ts — all fields filled in
□  metadata.ts — GSC verification token added
□  next.config.ts — image domains added
□  lib/fonts.ts — brand font selected
□  .env.local — all required vars set

ASSETS
□  /public/favicon.ico
□  /public/icon.svg
□  /public/icon-192.png
□  /public/icon-512.png
□  /public/apple-icon.png
□  /public/{indexnow-key}.txt
□  /public/opengraph-image.png (or let app/opengraph-image.tsx generate it)
□  /public/fonts/ — if using local fonts

CONTENT
□  public/llms.txt — all placeholders replaced
□  public/llms-full.txt — all placeholders replaced
□  app/sitemap.ts — all static routes added

PLATFORM REGISTRATION
□  Google Search Console — verified + sitemap submitted
□  Bing Webmaster Tools — verified + sitemap submitted + IndexNow key set
□  Yandex Webmaster — verified + sitemap submitted

VALIDATION
□  https://search.google.com/test/rich-results — homepage passes
□  https://validator.schema.org — no errors
□  https://pagespeed.web.dev — 100/100/100/100
□  https://www.opengraph.xyz — OG image renders correctly
□  https://cards-dev.twitter.com/validator — Twitter card correct
□  Keyboard navigation — tab through entire homepage without mouse
□  Screen reader — VoiceOver/NVDA through homepage

POST-LAUNCH
□  pnpm submit-sitemap — run after first deploy
□  Google Search Console — check Index Coverage after 48 hours
□  Google Search Console — check Rich Results after 72 hours
□  PageSpeed Insights — recheck after all assets are live
```
