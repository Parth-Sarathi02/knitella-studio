// app/robots.ts
import type { MetadataRoute } from "next";
import { baseUrl } from "@/seo-configs/baseInfo";

// ─────────────────────────────────────────────────────────────────────────────
// ROBOTS.TXT — generated at /robots.txt
// Controls what crawlers can and cannot access
// Critical: wrong rules here can silently kill your entire SEO
// Test at: https://www.google.com/webmasters/tools/robots-testing-tool
// ─────────────────────────────────────────────────────────────────────────────

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ── Google ─────────────────────────────────────────────────────────────
      {
        userAgent: "Googlebot",
        allow: ["/"],
        disallow: [
          "/api/", // Never expose API routes to crawlers
          "/_next/", // Next.js internals
          "/admin/", // TODO: add any auth-protected routes
          "/dashboard/",
          "/private/",
          "/*.json$", // Raw JSON responses
        ],
      },

      // ── Google Image Bot ───────────────────────────────────────────────────
      {
        userAgent: "Googlebot-Image",
        allow: [
          "/",
          "/opengraph-image", // Allow OG image routes explicitly
          "/api/og/", // Allow OG image API routes
          "/*.png$",
          "/*.jpg$",
          "/*.jpeg$",
          "/*.webp$",
          "/*.avif$",
          "/*.svg$",
        ],
      },

      // ── Bing ───────────────────────────────────────────────────────────────
      {
        userAgent: "Bingbot",
        allow: ["/"],
        disallow: ["/api/", "/_next/", "/admin/", "/dashboard/", "/private/"],
      },

      // ── AI Crawlers — explicitly allowed ──────────────────────────────────
      // These power ChatGPT, Perplexity, Claude, Gemini search results
      // Blocking these = invisible in AI search. Don't block them.
      {
        userAgent: "GPTBot", // OpenAI / ChatGPT
        allow: ["/"],
        disallow: ["/api/", "/admin/", "/dashboard/", "/private/"],
      },
      {
        userAgent: "ClaudeBot", // Anthropic / Claude
        allow: ["/"],
        disallow: ["/api/", "/admin/", "/dashboard/", "/private/"],
      },
      {
        userAgent: "PerplexityBot", // Perplexity AI
        allow: ["/"],
        disallow: ["/api/", "/admin/", "/dashboard/", "/private/"],
      },
      {
        userAgent: "GoogleOther", // Google AI Overviews crawler
        allow: ["/"],
        disallow: ["/api/", "/admin/", "/dashboard/", "/private/"],
      },
      {
        userAgent: "Google-Extended", // Google Gemini training crawler
        allow: ["/"],
        // TODO: set disallow: ["/"] if you want to OPT OUT of Gemini training
        // while still appearing in AI Overviews
        disallow: ["/api/", "/admin/", "/dashboard/", "/private/"],
      },
      {
        userAgent: "Applebot", // Apple Siri / Spotlight
        allow: ["/"],
        disallow: ["/api/", "/admin/", "/dashboard/", "/private/"],
      },
      {
        userAgent: "cohere-ai", // Cohere AI
        allow: ["/"],
        disallow: ["/api/", "/admin/", "/dashboard/", "/private/"],
      },

      // ── Yandex ─────────────────────────────────────────────────────────────
      {
        userAgent: "Yandex",
        allow: ["/"],
        disallow: ["/api/", "/_next/", "/admin/", "/dashboard/", "/private/"],
      },

      // ── Aggressive / Low-value bots — blocked ─────────────────────────────
      // These consume bandwidth without contributing to rankings or AI search
      {
        userAgent: "AhrefsBot",
        disallow: ["/"],
      },
      {
        userAgent: "SemrushBot",
        disallow: ["/"],
      },
      {
        userAgent: "DotBot",
        disallow: ["/"],
      },
      {
        userAgent: "MJ12bot",
        disallow: ["/"],
      },
      {
        userAgent: "BLEXBot",
        disallow: ["/"],
      },

      // ── Default rule — all other crawlers ─────────────────────────────────
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/api/",
          "/_next/",
          "/admin/",
          "/dashboard/",
          "/private/",
          "/*.json$",
        ],
      },
    ],

    // ── Sitemap Locations ───────────────────────────────────────────────────
    // List ALL sitemap endpoints — crawlers use this as their index
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      // Uncomment as you add more content types:
      // `${baseUrl}/blog/sitemap.xml`,
      // `${baseUrl}/products/sitemap.xml`,
    ],

    // ── Crawl Delay ─────────────────────────────────────────────────────────
    // Note: Google ignores crawl-delay. Bing and Yandex respect it.
    // Only set this if you are on a low-resource server
    // crawlDelay: 1,
  };
}
