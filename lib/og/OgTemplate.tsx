// lib/og/OgTemplate.tsx
import { baseInfo } from "@/seo-configs/baseInfo";

// ─────────────────────────────────────────────────────────────────────────────
// OG IMAGE TEMPLATE — shared brand component for all dynamic OG images
//
// Used by:
//   app/opengraph-image.tsx              → homepage
//   app/blog/[slug]/opengraph-image.tsx  → blog posts
//   app/products/[slug]/opengraph-image.tsx → products
//   ... any new route segment you add
//
// CONSTRAINTS (Satori renderer — not full CSS):
//   ✅ Flexbox (display: flex) only — no grid
//   ✅ Absolute positioning
//   ✅ Basic box model — padding, margin, border, borderRadius
//   ✅ Linear gradients
//   ✅ text, backgroundColor, color, opacity
//   ✅ backgroundImage with linear-gradient()
//   ✅ boxShadow, fontWeight, fontSize, lineHeight
//   ❌ CSS grid
//   ❌ overflow: hidden on text (use ellipsis carefully)
//   ❌ CSS variables (use raw values)
//   ❌ Tailwind className (use style prop only)
//   ❌ Animations
//   ❌ CSS calc() in some contexts
//
// FONTS:
//   Load font files in each opengraph-image.tsx using readFile()
//   Pass them via ImageResponse options.fonts[]
//   Only ttf/otf/woff supported — no woff2
//
// OUTPUT: 1200 × 630px PNG (standard OG size)
// ─────────────────────────────────────────────────────────────────────────────

// ─── Prop types ───────────────────────────────────────────────────────────────
export type OgVariant = "default" | "blog" | "product" | "listing";

export interface OgTemplateProps {
  // Content
  title: string;
  description?: string;
  // Optional metadata line shown below title
  // eg: "By John Doe  ·  5 min read" or "$99.00  ·  In Stock"
  meta?: string;
  // Top badge/tag label — eg: "Blog Post", "New Arrival", "Case Study"
  label?: string;
  // Layout variant — controls visual treatment per content type
  variant?: OgVariant;
  // Optional background image URL (absolute URL only)
  // If provided, renders as a dimmed background behind content
  backgroundImageUrl?: string;
}

// ─── Design tokens ────────────────────────────────────────────────────────────
// TODO: update these to match your brand palette
const tokens = {
  // Brand colors
  colorPrimary: "#000000", // Main brand color — used for accents
  colorBackground: "#ffffff", // Card/content background
  colorSurface: "#f5f5f5", // Subtle surface — used in some variants
  colorText: "#0a0a0a", // Primary text
  colorTextMuted: "#6b7280", // Secondary text — meta, labels
  colorBorder: "#e5e7eb", // Subtle borders

  // Variant accent colors — customize per content type
  accentBlog: "#2563eb", // Blue — blog posts
  accentProduct: "#16a34a", // Green — products
  accentListing: "#7c3aed", // Purple — listing pages
  accentDefault: "#000000", // Black — default / generic pages

  // Typography sizes (px — no units in Satori)
  fontSizeLabel: 18,
  fontSizeTitle: 56, // Main title — reduce for long titles
  fontSizeTitleLong: 40, // Auto-applied when title > 60 chars
  fontSizeDescription: 26,
  fontSizeMeta: 22,
  fontSizeBrand: 22,

  // Spacing
  padding: 72,
  gap: 16,
} as const;

// ─── Accent color per variant ─────────────────────────────────────────────────
function getAccent(variant: OgVariant): string {
  const map: Record<OgVariant, string> = {
    default: tokens.accentDefault,
    blog: tokens.accentBlog,
    product: tokens.accentProduct,
    listing: tokens.accentListing,
  };
  return map[variant];
}

// ─── Component ────────────────────────────────────────────────────────────────
export function OgTemplate({
  title,
  description,
  meta,
  label,
  variant = "default",
  backgroundImageUrl,
}: OgTemplateProps) {
  const accent = getAccent(variant);
  const titleFontSize =
    title.length > 60 ? tokens.fontSizeTitleLong : tokens.fontSizeTitle;

  return (
    // ── Root container ──────────────────────────────────────────────────────
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: tokens.colorBackground,
        position: "relative",
        overflow: "hidden",
        fontFamily: '"Inter", sans-serif', // Matches font loaded in image route
      }}
    >
      {/* ── Background image (optional) ──────────────────────────────────── */}
      {backgroundImageUrl && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            backgroundImage: `url(${backgroundImageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.12, // Subtle — content stays legible
          }}
        />
      )}

      {/* ── Accent bar — top edge ─────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "6px",
          backgroundColor: accent,
          display: "flex",
        }}
      />

      {/* ── Main content area ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: `${tokens.padding}px`,
          paddingTop: `${tokens.padding + 6}px`, // offset for accent bar
          height: "100%",
          position: "relative",
        }}
      >
        {/* ── Top section — label + title + description ─────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: `${tokens.gap}px`,
            flex: 1,
          }}
        >
          {/* Label / badge */}
          {label && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  backgroundColor: accent,
                  color: "#ffffff",
                  fontSize: `${tokens.fontSizeLabel}px`,
                  fontWeight: 600,
                  padding: "6px 16px",
                  borderRadius: "4px",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                {label}
              </div>
            </div>
          )}

          {/* Title */}
          <div
            style={{
              display: "flex",
              color: tokens.colorText,
              fontSize: `${titleFontSize}px`,
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: "-0.5px",
              maxWidth: "960px",
              // Clamp to 3 lines max
              overflow: "hidden",
              // Note: Satori does not support -webkit-line-clamp
              // Keep titles under ~120 chars to avoid overflow
            }}
          >
            {title}
          </div>

          {/* Description */}
          {description && (
            <div
              style={{
                display: "flex",
                color: tokens.colorTextMuted,
                fontSize: `${tokens.fontSizeDescription}px`,
                fontWeight: 400,
                lineHeight: 1.5,
                maxWidth: "880px",
                overflow: "hidden",
              }}
            >
              {/* Trim long descriptions */}
              {description.length > 120
                ? `${description.slice(0, 117)}...`
                : description}
            </div>
          )}
        </div>

        {/* ── Bottom section — meta + branding ──────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          {/* Meta line — reading time, price, author, date etc. */}
          {meta && (
            <div
              style={{
                display: "flex",
                color: tokens.colorTextMuted,
                fontSize: `${tokens.fontSizeMeta}px`,
                fontWeight: 400,
              }}
            >
              {meta}
            </div>
          )}

          {/* Brand lockup — always shown, anchored bottom right */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "12px",
              marginLeft: "auto",
            }}
          >
            {/* Brand logo — swap img src once you have the asset */}
            {/* Uncomment when /public/icon-96.png exists:
            <img
              src={`${baseUrl}/icon-96.png`}  // Must be absolute URL
              width={40}
              height={40}
              style={{ borderRadius: "8px" }}
            /> */}

            {/* Brand name text fallback */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <div
                style={{
                  display: "flex",
                  color: tokens.colorText,
                  fontSize: `${tokens.fontSizeBrand}px`,
                  fontWeight: 700,
                  letterSpacing: "-0.3px",
                }}
              >
                {baseInfo.name}
              </div>
              <div
                style={{
                  display: "flex",
                  color: tokens.colorTextMuted,
                  fontSize: "16px",
                  fontWeight: 400,
                }}
              >
                {/* TODO: replace with your domain */}
                {baseInfo.shortName.toLowerCase()}.com
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Decorative corner accent ──────────────────────────────────────── */}
      {/* Subtle geometric detail — remove if not on-brand */}
      <div
        style={{
          position: "absolute",
          bottom: "-40px",
          right: "-40px",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          backgroundColor: accent,
          opacity: 0.06,
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-80px",
          right: "-80px",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          backgroundColor: accent,
          opacity: 0.04,
          display: "flex",
        }}
      />
    </div>
  );
}
