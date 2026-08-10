import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { notifyIndexNow } from "@/lib/indexing/indexnow";

// ─────────────────────────────────────────────────────────────────────────────
// REVALIDATION + INDEXNOW WEBHOOK ENDPOINT
// POST /api/revalidate
//
// Purpose:
//   1. Revalidates Next.js ISR cache for the affected page/tag
//   2. Immediately pings IndexNow to notify Bing/Yandex of the change
//   Both happen in one request — one webhook call from your CMS does everything
//
// Security:
//   All requests must include a secret token in the Authorization header
//   Without this, anyone could trigger revalidation and spam IndexNow
//   Set REVALIDATION_SECRET in your environment variables
//
// SETUP:
//   1. Add to .env.local:
//        REVALIDATION_SECRET=your-secret-here
//        INDEXNOW_API_KEY=your-indexnow-key
//   2. In your CMS / deployment pipeline, POST to:
//        https://yoursite.com/api/revalidate
//      with headers:
//        Authorization: Bearer your-secret-here
//        Content-Type: application/json
//      with body: (see RevalidatePayload below)
//
// TRIGGER SOURCES:
//   • CMS webhook on content publish/update/delete
//   • GitHub Actions on deploy completion
//   • Manual curl for emergency cache busting
//   • Any HTTP client — Zapier, Make, n8n etc.
//
// curl example:
//   curl -X POST https://yoursite.com/api/revalidate \
//     -H "Authorization: Bearer your-secret" \
//     -H "Content-Type: application/json" \
//     -d '{"type":"path","path":"/blog/my-post","notify":true}'
// ─────────────────────────────────────────────────────────────────────────────

// ─── Payload types ────────────────────────────────────────────────────────────
interface RevalidateByPath {
  type: "path";
  // Single path or array of paths to revalidate
  // Relative paths: "/blog/my-post" or ["/blog/my-post", "/blog"]
  path: string | string[];
  // Whether to notify IndexNow after revalidation
  // Default: true
  notify?: boolean;
}

interface RevalidateByTag {
  type: "tag";
  // Next.js cache tag(s) to invalidate
  // Set tags via: fetch(url, { next: { tags: ["blog", "post-slug"] } })
  tag: string | string[];
  // Paths to notify IndexNow about
  // Tags don't map to URLs — provide paths explicitly
  paths?: string[];
  notify?: boolean;
}

interface RevalidateAll {
  type: "all";
  // Revalidates everything — use sparingly
  // Triggers a full site revalidation
  notify?: boolean;
  // Paths to notify IndexNow — required if notify: true
  paths?: string[];
}

type RevalidatePayload = RevalidateByPath | RevalidateByTag | RevalidateAll;

// ─── Response types ───────────────────────────────────────────────────────────
interface RevalidateResponse {
  success: boolean;
  revalidated: string[];
  notified: boolean;
  notifiedUrls?: number;
  error?: string;
  timestamp: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH CHECK
// ─────────────────────────────────────────────────────────────────────────────
function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.REVALIDATION_SECRET;

  if (!secret) {
    console.error(
      "[Revalidate] REVALIDATION_SECRET not set — " +
        "all revalidation requests will be rejected",
    );
    return false;
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;

  // Supports both "Bearer token" and raw "token" formats
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  return token === secret;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/revalidate
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  // ── Auth ───────────────────────────────────────────────────────────────────
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized — invalid or missing token",
        timestamp,
      },
      { status: 401 },
    );
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let payload: RevalidatePayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid JSON body",
        timestamp,
      },
      { status: 400 },
    );
  }

  // ── Validate payload ───────────────────────────────────────────────────────
  if (!payload.type) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing required field: "type" ("path" | "tag" | "all")',
        timestamp,
      },
      { status: 400 },
    );
  }

  const revalidated: string[] = [];
  let notifyPaths: string[] = [];
  const shouldNotify = payload.notify !== false; // default true

  try {
    // ── Revalidate by path ───────────────────────────────────────────────────
    if (payload.type === "path") {
      const paths = Array.isArray(payload.path) ? payload.path : [payload.path];

      for (const path of paths) {
        revalidatePath(path);
        revalidated.push(`path:${path}`);
        console.log(`[Revalidate] ✓ Path revalidated: ${path}`);
      }

      notifyPaths = paths;
    }

    // ── Revalidate by tag ────────────────────────────────────────────────────
    else if (payload.type === "tag") {
      const tags = Array.isArray(payload.tag) ? payload.tag : [payload.tag];

      for (const tag of tags) {
        revalidateTag(tag, "max");
        revalidated.push(`tag:${tag}`);
        console.log(`[Revalidate] ✓ Tag revalidated: ${tag}`);
      }

      // Tags don't map to URLs — use explicitly provided paths
      notifyPaths = payload.paths ?? [];
    }

    // ── Revalidate all ───────────────────────────────────────────────────────
    else if (payload.type === "all") {
      // Revalidates the entire site by invalidating the root path
      // Use sparingly — forces regeneration of all cached pages
      revalidatePath("/", "layout");
      revalidated.push("all:layout");
      console.log("[Revalidate] ✓ Full site revalidation triggered");

      notifyPaths = payload.paths ?? [];
    } else {
      return NextResponse.json(
        {
          success: false,
          error: `Unknown type: "${(payload as RevalidatePayload).type}"`,
          timestamp,
        },
        { status: 400 },
      );
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Revalidation failed";
    console.error(`[Revalidate] ✗ Error: ${message}`);

    return NextResponse.json(
      {
        success: false,
        revalidated,
        notified: false,
        error: message,
        timestamp,
      },
      { status: 500 },
    );
  }

  // ── IndexNow notification ──────────────────────────────────────────────────
  let notified = false;
  let notifiedUrls = 0;

  if (shouldNotify && notifyPaths.length > 0) {
    try {
      const result = await notifyIndexNow(notifyPaths);
      notified = result.success;
      notifiedUrls = result.urlsSubmitted;

      if (!result.success) {
        console.warn(
          `[Revalidate] IndexNow notification failed: ${result.error}`,
        );
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "IndexNow failed";
      console.warn(`[Revalidate] IndexNow error: ${message}`);
      // Don't fail the whole request if IndexNow fails
      // Revalidation succeeded — that's the primary goal
    }
  }

  // ── Success response ───────────────────────────────────────────────────────
  const response: RevalidateResponse = {
    success: true,
    revalidated,
    notified,
    ...(notifiedUrls > 0 && { notifiedUrls }),
    timestamp,
  };

  return NextResponse.json(response, { status: 200 });
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/revalidate — health check
// Useful to verify the endpoint is reachable without triggering revalidation
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Auth not required for health check
  // But we confirm the secret is configured
  const secretConfigured = !!process.env.REVALIDATION_SECRET;
  const indexNowConfigured = !!process.env.INDEXNOW_API_KEY;

  return NextResponse.json(
    {
      status: "ok",
      configured: {
        revalidationSecret: secretConfigured,
        indexNowKey: indexNowConfigured,
      },
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYLOAD EXAMPLES
// ─────────────────────────────────────────────────────────────────────────────
//
// ── Revalidate a single blog post + notify IndexNow ───────────────────────────
// {
//   "type": "path",
//   "path": "/blog/my-updated-post",
//   "notify": true
// }
//
// ── Revalidate multiple paths at once ─────────────────────────────────────────
// {
//   "type": "path",
//   "path": ["/blog/post-1", "/blog/post-2", "/blog"],
//   "notify": true
// }
//
// ── Revalidate by cache tag ────────────────────────────────────────────────────
// {
//   "type": "tag",
//   "tag": "blog-posts",
//   "paths": ["/blog"],
//   "notify": true
// }
//
// ── Revalidate multiple tags ───────────────────────────────────────────────────
// {
//   "type": "tag",
//   "tag": ["blog-posts", "featured"],
//   "paths": ["/blog", "/"],
//   "notify": true
// }
//
// ── Full site revalidation — emergency cache bust ─────────────────────────────
// {
//   "type": "all",
//   "notify": false
// }
//
// ── Revalidate without IndexNow (layout change, not content change) ────────────
// {
//   "type": "path",
//   "path": "/about",
//   "notify": false
// }
