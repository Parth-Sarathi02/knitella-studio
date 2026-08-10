// lib/indexing/indexnow.ts
import { baseUrl } from "@/seo-configs/baseInfo";

// ─────────────────────────────────────────────────────────────────────────────
// INDEXNOW — instant indexing for Bing, Yandex, Naver, Seznam
//
// What IndexNow does:
//   You publish or update a page → you call notifyIndexNow() → Bing, Yandex,
//   Naver, and Seznam are instantly notified → they crawl and index within
//   minutes instead of days or weeks
//
// What IndexNow does NOT do:
//   • Does not notify Google — Google does not support IndexNow (as of 2026)
//   • Does not guarantee indexing — it notifies, crawling is still up to the engine
//   • Does not replace sitemaps — keep your sitemap for Google discovery
//
// For Google:
//   • Primary: XML sitemap (already set up in app/sitemap.ts)
//   • Secondary: Google Search Console manual "Request Indexing" for urgent pages
//   • The Google Indexing API is officially only for Job Postings + Livestreams
//
// SETUP (required before this works):
//   1. Generate your key at https://www.bing.com/webmasters/
//      OR generate any random UUID: https://www.uuidgenerator.net/
//   2. Add to .env.local:
//        INDEXNOW_API_KEY=your-key-here
//   3. Create /public/{your-key}.txt with just the key as content:
//        echo "your-key-here" > public/your-key-here.txt
//   4. Verify at https://www.bing.com/indexnow
//
// Docs: https://www.indexnow.org/documentation
// ─────────────────────────────────────────────────────────────────────────────

// ─── IndexNow endpoint ────────────────────────────────────────────────────────
// Submitting to api.indexnow.org distributes to ALL participating engines
// simultaneously — Bing, Yandex, Naver, Seznam with one request
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface IndexNowResult {
  success: boolean;
  urlsSubmitted: number;
  error?: string;
  statusCode?: number;
}

export interface IndexNowBatchResult {
  success: boolean;
  totalUrls: number;
  successfulBatches: number;
  failedBatches: number;
  errors: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// notifyIndexNow
// Notify IndexNow of a single URL or a batch of URLs
//
// Single URL: notifyIndexNow("/blog/my-new-post")
// Multiple:   notifyIndexNow(["/blog/post-1", "/blog/post-2"])
//
// Called automatically from:
//   app/api/revalidate/route.ts → on CMS webhook
//   scripts/submit-sitemap.ts  → on deploy
// ─────────────────────────────────────────────────────────────────────────────
export async function notifyIndexNow(
  paths: string | string[],
): Promise<IndexNowResult> {
  // ── Key check ─────────────────────────────────────────────────────────────
  const apiKey = process.env.INDEXNOW_API_KEY;

  if (!apiKey) {
    console.warn(
      "[IndexNow] INDEXNOW_API_KEY not set in environment variables.\n" +
        "         See lib/indexing/indexnow.ts setup instructions.",
    );
    return {
      success: false,
      urlsSubmitted: 0,
      error: "INDEXNOW_API_KEY environment variable not set",
    };
  }

  // ── Normalize paths to absolute URLs ─────────────────────────────────────
  const rawPaths = Array.isArray(paths) ? paths : [paths];

  const urls = rawPaths.map((path) => {
    // Already absolute URL — use as-is
    if (path.startsWith("http")) return path;
    // Relative path — prepend baseUrl
    const clean = path.startsWith("/") ? path : `/${path}`;
    return `${baseUrl}${clean}`;
  });

  // ── Validate URLs ─────────────────────────────────────────────────────────
  const validUrls = urls.filter((url) => {
    try {
      const parsed = new URL(url);
      // Must match your domain — don't submit external URLs
      return parsed.hostname === new URL(baseUrl).hostname;
    } catch {
      console.warn(`[IndexNow] Invalid URL skipped: ${url}`);
      return false;
    }
  });

  if (validUrls.length === 0) {
    return {
      success: false,
      urlsSubmitted: 0,
      error: "No valid URLs to submit",
    };
  }

  // ── Single URL — GET request (simpler, same result) ───────────────────────
  if (validUrls.length === 1) {
    return submitSingleUrl(validUrls[0], apiKey);
  }

  // ── Batch URLs — POST request ─────────────────────────────────────────────
  return submitBatchUrls(validUrls, apiKey);
}

// ─────────────────────────────────────────────────────────────────────────────
// submitSingleUrl — GET method
// ─────────────────────────────────────────────────────────────────────────────
async function submitSingleUrl(
  url: string,
  apiKey: string,
): Promise<IndexNowResult> {
  try {
    const endpoint = new URL(INDEXNOW_ENDPOINT);
    endpoint.searchParams.set("url", url);
    endpoint.searchParams.set("key", apiKey);

    const response = await fetch(endpoint.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });

    return handleIndexNowResponse(response, 1);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[IndexNow] Single URL submission failed: ${message}`);
    return {
      success: false,
      urlsSubmitted: 0,
      error: message,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// submitBatchUrls — POST method
// IndexNow batch limit: 10,000 URLs per request
// We chunk at 1,000 to stay well within limits and avoid timeouts
// ─────────────────────────────────────────────────────────────────────────────
async function submitBatchUrls(
  urls: string[],
  apiKey: string,
): Promise<IndexNowResult> {
  const CHUNK_SIZE = 1000;
  const chunks: string[][] = [];

  for (let i = 0; i < urls.length; i += CHUNK_SIZE) {
    chunks.push(urls.slice(i, i + CHUNK_SIZE));
  }

  let totalSubmitted = 0;
  const errors: string[] = [];

  for (const chunk of chunks) {
    try {
      const response = await fetch(INDEXNOW_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          host: new URL(baseUrl).hostname,
          key: apiKey,
          // Key location — must match the file in /public/
          keyLocation: `${baseUrl}/${apiKey}.txt`,
          urlList: chunk,
        }),
      });

      const result = await handleIndexNowResponse(response, chunk.length);

      if (result.success) {
        totalSubmitted += result.urlsSubmitted;
      } else {
        errors.push(result.error ?? "Unknown batch error");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      errors.push(message);
      console.error(`[IndexNow] Batch submission failed: ${message}`);
    }
  }

  return {
    success: errors.length === 0,
    urlsSubmitted: totalSubmitted,
    error: errors.length > 0 ? errors.join("; ") : undefined,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// handleIndexNowResponse
// Interprets IndexNow API response codes
// ─────────────────────────────────────────────────────────────────────────────
async function handleIndexNowResponse(
  response: Response,
  urlCount: number,
): Promise<IndexNowResult> {
  // IndexNow response codes:
  //   200 → OK — URL submitted successfully
  //   202 → Accepted — URL received, will be processed
  //   400 → Bad request — invalid format
  //   403 → Forbidden — key not valid or key file not found
  //   422 → Unprocessable — URLs don't belong to the host
  //   429 → Too many requests — slow down

  if (response.status === 200 || response.status === 202) {
    console.log(
      `[IndexNow] ✓ Submitted ${urlCount} URL${urlCount > 1 ? "s" : ""} successfully`,
    );
    return {
      success: true,
      urlsSubmitted: urlCount,
      statusCode: response.status,
    };
  }

  const errorMessages: Record<number, string> = {
    400: "Bad request — check URL format",
    403: "Forbidden — verify your API key and key file in /public/",
    422: "Unprocessable — URLs must belong to your domain",
    429: "Rate limited — too many requests, slow down",
  };

  const error =
    errorMessages[response.status] ??
    `Unexpected status code: ${response.status}`;

  console.error(`[IndexNow] ✗ Submission failed: ${error}`);

  return {
    success: false,
    urlsSubmitted: 0,
    error,
    statusCode: response.status,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// notifyIndexNowBatch
// Higher-level wrapper for submitting large URL sets
// Returns detailed per-batch results
// Used by scripts/submit-sitemap.ts for full-site submissions
// ─────────────────────────────────────────────────────────────────────────────
export async function notifyIndexNowBatch(
  paths: string[],
): Promise<IndexNowBatchResult> {
  const BATCH_SIZE = 1000;
  const batches: string[][] = [];

  for (let i = 0; i < paths.length; i += BATCH_SIZE) {
    batches.push(paths.slice(i, i + BATCH_SIZE));
  }

  let successfulBatches = 0;
  let failedBatches = 0;
  const errors: string[] = [];

  for (let i = 0; i < batches.length; i++) {
    console.log(
      `[IndexNow] Submitting batch ${i + 1}/${batches.length} ` +
        `(${batches[i].length} URLs)...`,
    );

    const result = await notifyIndexNow(batches[i]);

    if (result.success) {
      successfulBatches++;
    } else {
      failedBatches++;
      if (result.error) errors.push(result.error);
    }

    // Small delay between batches — avoids rate limiting
    if (i < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return {
    success: failedBatches === 0,
    totalUrls: paths.length,
    successfulBatches,
    failedBatches,
    errors,
  };
}
