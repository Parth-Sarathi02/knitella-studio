# Knitella Studio — Next.js Edition

This is the full-stack Next.js (App Router) rebuild of the Knitella Studio storefront, migrated from the previous Vite + React SPA. Same brand, same Supabase backend, same admin panel — rebuilt for real SEO (server-rendered pages, sitemap, structured data) and running on React 19 / Next.js 16.

## What changed from the Vite version

- **Routing**: real Next.js routes instead of a hash-based router (`#/shop/bouquets` → `/shop/bouquets`). Every product and category now has a real, crawlable URL.
- **Rendering**: the homepage, shop pages, and product pages are Server Components that fetch from Supabase at build time (SSG) and revalidate hourly (ISR) — so pages load fast and Google sees full content immediately, not just after JavaScript runs.
- **SEO**: unique page titles/descriptions per product and category, Open Graph tags, a dynamic `sitemap.xml`, `robots.txt` (with `/admin` blocked from indexing), and JSON-LD structured data (Organization on every page, Product schema — including price — on product pages, which is what can get you rich results in Google search).
- **Fonts**: switched from a Google Fonts `<link>` tag to `next/font`, which self-hosts and preloads the fonts for better performance and no external request.
- **Bug fix**: the original code used classes like `font-600` and `font-700` everywhere, which aren't real Tailwind classes — Tailwind silently ignores unrecognized class names instead of erroring, so headings across the whole site have been rendering at default weight this whole time. Fixed to real classes (`font-semibold`, `font-bold`) throughout.
- **Icons**: the `Instagram` icon was removed from the installed version of `lucide-react` (brand icons were dropped from the library); replaced with `AtSign` where it was used for the @handle link.
- Cart, checkout flow, admin login, and the full admin dashboard (orders/products/categories) all work exactly as before — same Supabase tables, same RLS, same auth.

## Setup

1. `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in your real values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
   ```
   These are the same Supabase project/keys you were already using — nothing changes on the Supabase side.
3. `npm run dev` and open `http://localhost:3000`.

## Deploying

Same as before: push to GitHub, connect/redeploy on Vercel. Set the three environment variables above in Vercel's Project Settings → Environment Variables (the `NEXT_PUBLIC_SITE_URL` one should be your real production URL, since it feeds the sitemap and Open Graph tags).

Because product/category pages are statically generated, adding a new product in the admin panel won't appear on its category page instantly — it'll appear within an hour (ISR revalidation), or immediately after your next deploy. If you add products often and want them live immediately, this revalidate window (currently `3600` seconds) can be lowered — search the codebase for `export const revalidate` in the page files.

## Known trade-off worth knowing about

Images are rendered with plain `<img>` tags rather than `next/image`. Next's optimized `<Image>` component requires listing every external image domain in advance (`next.config.ts`), which doesn't work well here since product images can be uploaded from any URL via the admin panel. If you'd like, this can be tightened later by restricting product image uploads to a single known host (e.g. your Supabase Storage bucket) and switching to `next/image` for meaningfully faster image loading.

## Project structure

```
src/
  app/
    (store)/          → homepage, shop, product pages (share Header/Footer/Cart)
    admin/             → admin login + dashboard (no header/footer, noindex)
    layout.tsx         → root layout, fonts, default metadata
    sitemap.ts         → dynamic sitemap (all products + categories)
    robots.ts          → robots.txt
  components/          → all UI components (ported from the Vite version)
  lib/                 → types, Supabase clients, cart/auth context, formatting
```
