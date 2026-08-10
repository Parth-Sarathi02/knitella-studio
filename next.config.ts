// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── React Compiler ───────────────────────────────────────────────────────
  // Automatically memoizes components — replaces manual useMemo/useCallback
  reactCompiler: true,

  // ─── Output ───────────────────────────────────────────────────────────────
  // Standalone output for optimal Docker/serverless deployments
  // Remove if deploying to Vercel (it handles this automatically)
  // output: "standalone",

  // ─── Images ───────────────────────────────────────────────────────────────
  images: {
    // Use AVIF first (smallest), fallback to WebP — massive LCP improvement
    formats: ["image/avif", "image/webp"],

    // Define all external image domains you'll use
    // Add your CDN / CMS image domains here
    remotePatterns: [
      // Example:
      // { protocol: "https", hostname: "cdn.yourdomain.com" },
      // { protocol: "https", hostname: "images.unsplash.com" },
    ],

    // Defines breakpoints for srcSet generation
    // Matches common device widths — don't add more than needed
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Serve images from your own domain (default)
    // Switch to a loader if using Cloudflare Images / Imgix / etc.
    loader: "default",

    // Cache optimized images for 60 seconds minimum, 1 year maximum
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
  },

  // ─── Headers ──────────────────────────────────────────────────────────────
  // Security + performance headers applied globally
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent MIME type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Clickjacking protection
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Stop referrer leaking on cross-origin navigation
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions policy — disable unused browser features
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Basic XSS protection for older browsers
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
      // ── Long-lived cache for all static assets ────────────────────────────
      // Next.js hashes these filenames so stale cache is never an issue
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // ── Cache public assets (images, fonts, icons) ────────────────────────
      {
        source: "/(.*)\\.(ico|png|jpg|jpeg|webp|avif|svg|woff2|woff|ttf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // ── Short cache for crawlable text files ──────────────────────────────
      {
        source:
          "/(sitemap.xml|robots.txt|llms.txt|llms-full.txt|manifest.json)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },

  // ─── Redirects ────────────────────────────────────────────────────────────
  // Add permanent redirects here — important for preserving SEO equity
  // when changing URL structure
  async redirects() {
    return [
      // Example: redirect old blog path to new one
      // {
      //   source: "/articles/:slug",
      //   destination: "/blog/:slug",
      //   permanent: true, // 308 — passes full link equity
      // },
    ];
  },

  // ─── Compiler options ─────────────────────────────────────────────────────
  compiler: {
    // Strip console.log in production — small but meaningful bundle reduction
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  // ─── Experimental ─────────────────────────────────────────────────────────
  experimental: {
    // Optimizes CSS delivery — reduces render-blocking stylesheets
    optimizeCss: true,

    // Preloads critical packages during build — faster cold starts
    optimizePackageImports: [
      // Add your heavy icon/ui libraries here so only used icons are bundled
      // "lucide-react",
      // "@radix-ui/react-icons",
    ],

    // PPR (Partial Pre-Rendering) — static shell + dynamic holes
    // Uncomment when your hosting supports it (Vercel supports it today)
    // ppr: true,
  },

  // ─── Logging ──────────────────────────────────────────────────────────────
  logging: {
    fetches: {
      // Shows fetch cache hits/misses during development
      fullUrl: process.env.NODE_ENV === "development",
    },
  },
};

export default nextConfig;
