// ─────────────────────────────────────────────────────────────────────────────
// SITEMAP SUBMISSION SCRIPT
// Run after deployment to notify search engines of your sitemap
// and submit all URLs to IndexNow
//
// USAGE:
//   pnpm submit-sitemap
//   node --experimental-strip-types scripts/submit-sitemap.ts
//
// Add to package.json scripts:
//   "submit-sitemap": "node --experimental-strip-types scripts/submit-sitemap.ts"
//
// Run after deployment:
//   In CI/CD pipeline (GitHub Actions etc.) add a step after deploy:
//     - run: pnpm submit-sitemap
//       env:
//         NEXT_PUBLIC_SITE_URL: ${{ secrets.SITE_URL }}
//         INDEXNOW_API_KEY: ${{ secrets.INDEXNOW_API_KEY }}
//         BING_WEBMASTER_API_KEY: ${{ secrets.BING_WEBMASTER_API_KEY }}
//
// WHAT THIS SCRIPT DOES:
//   1. Fetches your live sitemap.xml
//   2. Parses all URLs from it
//   3. Submits all URLs to IndexNow (Bing, Yandex, Naver, Seznam)
//   4. Pings Bing Webmaster Tools sitemap endpoint
//   5. Prints a summary report
//
// WHAT THIS DOES NOT DO:
//   • Does not submit to Google — Google discovers via sitemap.xml automatically
//   • For urgent Google indexing: use Google Search Console "Request Indexing"
// ─────────────────────────────────────────────────────────────────────────────

// Load env from .env.local when running locally
// In CI/CD, env vars are injected directly
import { config } from "node:process";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? "";
const INDEXNOW_API_KEY = process.env.INDEXNOW_API_KEY ?? "";
const BING_API_KEY = process.env.BING_WEBMASTER_API_KEY ?? "";

// ─── Logger ───────────────────────────────────────────────────────────────────
const log = {
  info: (msg: string) => console.log(`  \x1b[36mℹ\x1b[0m  ${msg}`),
  success: (msg: string) => console.log(`  \x1b[32m✓\x1b[0m  ${msg}`),
  warn: (msg: string) => console.log(`  \x1b[33m⚠\x1b[0m  ${msg}`),
  error: (msg: string) => console.log(`  \x1b[31m✗\x1b[0m  ${msg}`),
  divider: () => console.log("\x1b[90m" + "─".repeat(60) + "\x1b[0m"),
  heading: (msg: string) => console.log(`\n\x1b[1m${msg}\x1b[0m`),
};

// ─────────────────────────────────────────────────────────────────────────────
// fetchSitemap
// Fetches and parses your sitemap.xml
// Returns array of all <loc> URLs
// ─────────────────────────────────────────────────────────────────────────────
async function fetchSitemap(sitemapUrl: string): Promise<string[]> {
  log.info(`Fetching sitemap: ${sitemapUrl}`);

  const response = await fetch(sitemapUrl, {
    headers: {
      "User-Agent": "SitemapSubmitter/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch sitemap: ${response.status} ${response.statusText}`,
    );
  }

  const xml = await response.text();

  // ── Check if this is a sitemap index ───────────────────────────────────────
  // Sitemap index contains <sitemapindex> with nested <sitemap> entries
  // Each nested sitemap needs to be fetched and parsed separately
  if (xml.includes("<sitemapindex")) {
    log.info("Detected sitemap index — fetching nested sitemaps...");
    return fetchSitemapIndex(xml, sitemapUrl);
  }

  // ── Regular sitemap — extract <loc> URLs ──────────────────────────────────
  return extractUrlsFromSitemap(xml);
}

// ─────────────────────────────────────────────────────────────────────────────
// fetchSitemapIndex
// Handles sitemap index files — recursively fetches each child sitemap
// ─────────────────────────────────────────────────────────────────────────────
async function fetchSitemapIndex(
  xml: string,
  baseUrl: string,
): Promise<string[]> {
  // Extract nested sitemap URLs from index
  const sitemapMatches = xml.match(/<loc>(.*?)<\/loc>/g) ?? [];
  const sitemapUrls = sitemapMatches.map((match) =>
    match.replace(/<\/?loc>/g, "").trim(),
  );

  log.info(`Found ${sitemapUrls.length} nested sitemaps`);

  const allUrls: string[] = [];

  for (const sitemapUrl of sitemapUrls) {
    try {
      const response = await fetch(sitemapUrl);
      if (!response.ok) {
        log.warn(`Failed to fetch nested sitemap: ${sitemapUrl}`);
        continue;
      }
      const xml = await response.text();
      const urls = extractUrlsFromSitemap(xml);
      allUrls.push(...urls);
      log.info(`  → ${sitemapUrl}: ${urls.length} URLs`);
    } catch (error) {
      log.warn(`Error fetching nested sitemap ${sitemapUrl}: error: ${error}`);
    }
  }

  return allUrls;
}

// ─────────────────────────────────────────────────────────────────────────────
// extractUrlsFromSitemap
// Parses <loc> tags from a sitemap XML string
// ─────────────────────────────────────────────────────────────────────────────
function extractUrlsFromSitemap(xml: string): string[] {
  const locMatches = xml.match(/<loc>(.*?)<\/loc>/g) ?? [];
  return locMatches
    .map((match) => match.replace(/<\/?loc>/g, "").trim())
    .filter((url) => url.startsWith("http"));
}

// ─────────────────────────────────────────────────────────────────────────────
// submitToIndexNow
// Submits all sitemap URLs to IndexNow in batches
// ─────────────────────────────────────────────────────────────────────────────
async function submitToIndexNow(urls: string[]): Promise<{
  success: boolean;
  submitted: number;
  failed: number;
}> {
  if (!INDEXNOW_API_KEY) {
    log.warn("INDEXNOW_API_KEY not set — skipping IndexNow submission");
    return { success: false, submitted: 0, failed: 0 };
  }

  const BATCH_SIZE = 1000;
  const hostname = new URL(SITE_URL).hostname;
  let submitted = 0;
  let failed = 0;

  const batches: string[][] = [];
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    batches.push(urls.slice(i, i + BATCH_SIZE));
  }

  log.info(`Submitting ${urls.length} URLs in ${batches.length} batch(es)...`);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];

    try {
      const response = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          host: hostname,
          key: INDEXNOW_API_KEY,
          keyLocation: `${SITE_URL}/${INDEXNOW_API_KEY}.txt`,
          urlList: batch,
        }),
      });

      if (response.status === 200 || response.status === 202) {
        submitted += batch.length;
        log.success(
          `Batch ${i + 1}/${batches.length}: ${batch.length} URLs submitted`,
        );
      } else {
        failed += batch.length;
        log.error(
          `Batch ${i + 1}/${batches.length}: Failed with status ${response.status}`,
        );

        // 403 = key file not found — stop immediately, no point retrying
        if (response.status === 403) {
          log.error(
            `Key verification failed. Check that ${SITE_URL}/${INDEXNOW_API_KEY}.txt exists`,
          );
          break;
        }
      }
    } catch (error) {
      failed += batch.length;
      log.error(
        `Batch ${i + 1}/${batches.length}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    // Delay between batches
    if (i < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return {
    success: failed === 0,
    submitted,
    failed,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// pingBingSitemap
// Notifies Bing Webmaster Tools of your sitemap location
// This is separate from IndexNow — it registers the sitemap itself
// ─────────────────────────────────────────────────────────────────────────────
async function pingBingSitemap(sitemapUrl: string): Promise<boolean> {
  if (!BING_API_KEY) {
    log.warn(
      "BING_WEBMASTER_API_KEY not set — skipping Bing sitemap ping\n" +
        "         Get your key at: https://www.bing.com/webmasters/api",
    );
    return false;
  }

  try {
    const hostname = new URL(SITE_URL).hostname;
    const endpoint =
      `https://ssl.bing.com/webmaster/api.svc/json/SubmitSitemap` +
      `?apikey=${BING_API_KEY}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        siteUrl: `https://${hostname}`,
        sitemap: sitemapUrl,
      }),
    });

    if (response.ok) {
      log.success(`Bing sitemap ping successful: ${sitemapUrl}`);
      return true;
    } else {
      log.warn(`Bing sitemap ping returned: ${response.status}`);
      return false;
    }
  } catch (error) {
    log.warn(
      `Bing sitemap ping failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// validateConfig
// Checks required env vars before running
// ─────────────────────────────────────────────────────────────────────────────
function validateConfig(): boolean {
  let valid = true;

  if (!SITE_URL) {
    log.error("NEXT_PUBLIC_SITE_URL or SITE_URL not set in environment");
    valid = false;
  }

  try {
    if (SITE_URL) new URL(SITE_URL);
  } catch {
    log.error(`Invalid SITE_URL: "${SITE_URL}"`);
    valid = false;
  }

  if (!INDEXNOW_API_KEY) {
    log.warn("INDEXNOW_API_KEY not set — IndexNow submission will be skipped");
  }

  return valid;
}

// ─────────────────────────────────────────────────────────────────────────────
// main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n\x1b[1m\x1b[36m  Sitemap Submission Script\x1b[0m");
  log.divider();

  // ── Validate config ────────────────────────────────────────────────────────
  if (!validateConfig()) {
    log.error("Configuration invalid — aborting");
    process.exit(1);
  }

  const sitemapUrl = `${SITE_URL}/sitemap.xml`;
  const startTime = Date.now();

  // ── Step 1: Fetch sitemap ──────────────────────────────────────────────────
  log.heading("Step 1 — Fetching sitemap");
  log.divider();

  let urls: string[] = [];

  try {
    urls = await fetchSitemap(sitemapUrl);
    log.success(`Found ${urls.length} URLs in sitemap`);
  } catch (error) {
    log.error(
      `Failed to fetch sitemap: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    log.info(
      "Make sure your site is deployed and accessible before running this script",
    );
    process.exit(1);
  }

  if (urls.length === 0) {
    log.warn("No URLs found in sitemap — nothing to submit");
    process.exit(0);
  }

  // ── Step 2: IndexNow submission ────────────────────────────────────────────
  log.heading("Step 2 — IndexNow submission (Bing, Yandex, Naver, Seznam)");
  log.divider();

  const indexNowResult = await submitToIndexNow(urls);

  // ── Step 3: Bing sitemap ping ──────────────────────────────────────────────
  log.heading("Step 3 — Bing Webmaster Tools sitemap ping");
  log.divider();

  await pingBingSitemap(sitemapUrl);

  // ── Step 4: Summary ───────────────────────────────────────────────────────
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  log.heading("Summary");
  log.divider();

  log.info(`Site URL:          ${SITE_URL}`);
  log.info(`Sitemap:           ${sitemapUrl}`);
  log.info(`Total URLs:        ${urls.length}`);
  log.info(
    `IndexNow:          ${indexNowResult.submitted} submitted, ${indexNowResult.failed} failed`,
  );
  log.info(`Time elapsed:      ${elapsed}s`);

  log.divider();

  // ── Google reminder ───────────────────────────────────────────────────────
  console.log("\n  \x1b[33m⚠  Google does not support IndexNow.\x1b[0m");
  console.log(
    "     For Google indexing, submit your sitemap manually at:\n" +
      `     \x1b[36mhttps://search.google.com/search-console\x1b[0m\n`,
  );

  // ── Platform registration reminder ───────────────────────────────────────
  console.log("  \x1b[90mPlatform registration checklist:\x1b[0m");
  console.log(
    "  □  Google Search Console  → https://search.google.com/search-console",
  );
  console.log("  □  Bing Webmaster Tools   → https://www.bing.com/webmasters");
  console.log("  □  Yandex Webmaster       → https://webmaster.yandex.com");
  console.log(
    "  □  IndexNow key file      → Ensure /{key}.txt exists in /public/\n",
  );

  process.exit(indexNowResult.failed > 0 ? 1 : 0);
}

// ─────────────────────────────────────────────────────────────────────────────
main().catch((error) => {
  console.error("\n  Fatal error:", error);
  process.exit(1);
});
