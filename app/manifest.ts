// app/manifest.ts
import type { MetadataRoute } from "next";
import { baseInfo } from "@/seo-configs/baseInfo";

// ─────────────────────────────────────────────────────────────────────────────
// WEB APP MANIFEST — served at /manifest.json
// Controls how your site behaves when added to home screen (PWA)
// Also read by Google for rich install experiences in search results
//
// Required assets to add to /public/:
//   icon-192.png   → 192x192px — Android home screen
//   icon-512.png   → 512x512px — Android splash screen
//   icon-180.png   → 180x180px — Apple touch icon
//   icon-96.png    → 96x96px  — Favicon fallback
//   icon.svg       → Scalable — modern browsers, pinned tabs
//
// Generate all sizes from one SVG at: https://realfavicongenerator.net
// Validate manifest at: https://manifest-validator.appspot.com
// ─────────────────────────────────────────────────────────────────────────────

export default function manifest(): MetadataRoute.Manifest {
  return {
    // ── Identity ──────────────────────────────────────────────────────────────
    name: baseInfo.name,
    short_name: baseInfo.shortName,
    description: baseInfo.description,

    // ── Start URL ─────────────────────────────────────────────────────────────
    // Where the app opens when launched from home screen
    // Add utm params to track PWA installs in analytics
    start_url: "/?utm_source=pwa&utm_medium=homescreen",
    id: "/",

    // ── Display ───────────────────────────────────────────────────────────────
    // "standalone"       → Looks like a native app, no browser UI
    // "minimal-ui"       → Minimal browser controls shown
    // "fullscreen"       → True fullscreen, no browser UI at all
    // "browser"          → Regular browser tab (defeats the purpose)
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "browser"],

    // ── Orientation ───────────────────────────────────────────────────────────
    // "portrait"  → Lock to portrait
    // "landscape" → Lock to landscape
    // "any"       → Follow device orientation
    orientation: "portrait",

    // ── Colors ────────────────────────────────────────────────────────────────
    // theme_color      → Browser toolbar color on Android Chrome
    //                    Must match <meta name="theme-color"> in layout.tsx
    // background_color → Splash screen background before app loads
    // TODO: update both to match your brand palette
    theme_color: "#ffffff",
    background_color: "#ffffff",

    // ── Scope ─────────────────────────────────────────────────────────────────
    // Defines which URLs are "inside" the PWA
    // Navigation outside scope opens in browser
    scope: "/",

    // ── Icons ─────────────────────────────────────────────────────────────────
    // Provide multiple sizes — OS picks the best fit
    // "purpose: maskable" → icon safe for adaptive icon shapes (Android)
    // "purpose: any"      → standard icon usage
    icons: [
      {
        src: "/icon-96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],

    // ── Screenshots ───────────────────────────────────────────────────────────
    // Shown in browser's PWA install prompt — improves install conversion
    // TODO: add actual screenshots of your app to /public/screenshots/
    // "wide"    → desktop screenshot (1280x720 minimum)
    // "narrow"  → mobile screenshot (750x1334 minimum)
    screenshots: [
      // {
      //   src: "/screenshots/desktop.png",
      //   sizes: "1280x720",
      //   type: "image/png",
      //   form_factor: "wide",
      //   label: `${baseInfo.name} — Desktop`,
      // },
      // {
      //   src: "/screenshots/mobile.png",
      //   sizes: "750x1334",
      //   type: "image/png",
      //   form_factor: "narrow",
      //   label: `${baseInfo.name} — Mobile`,
      // },
    ],

    // ── Shortcuts ─────────────────────────────────────────────────────────────
    // Deep-link shortcuts shown on long-press of home screen icon (Android)
    // Keep to 4 max — OS may truncate beyond that
    // TODO: update with your actual key routes
    shortcuts: [
      // {
      //   name: "Blog",
      //   short_name: "Blog",
      //   description: "Read our latest articles",
      //   url: "/blog?utm_source=pwa&utm_medium=shortcut",
      //   icons: [{ src: "/icon-96.png", sizes: "96x96" }],
      // },
      // {
      //   name: "Contact",
      //   short_name: "Contact",
      //   description: "Get in touch with us",
      //   url: "/contact?utm_source=pwa&utm_medium=shortcut",
      //   icons: [{ src: "/icon-96.png", sizes: "96x96" }],
      // },
    ],

    // ── Categories ────────────────────────────────────────────────────────────
    // Used by app stores and browser install prompts for classification
    // Full list: https://github.com/nicholasstephan/web-app-categories
    // TODO: update to match your niche
    categories: ["business"],

    // ── Language ──────────────────────────────────────────────────────────────
    lang: baseInfo.language,
    dir: "ltr",

    // ── Prefer Related Applications ───────────────────────────────────────────
    // false → prefer PWA over native app (recommended unless you have a native app)
    prefer_related_applications: false,

    // ── Related Applications ──────────────────────────────────────────────────
    // Uncomment if you have a native iOS/Android app
    // related_applications: [
    //   {
    //     platform: "play",
    //     url: "https://play.google.com/store/apps/details?id=com.yourapp",
    //     id: "com.yourapp",
    //   },
    //   {
    //     platform: "itunes",
    //     url: "https://apps.apple.com/app/yourapp/id123456789",
    //   },
    // ],
  };
}
