import path from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

const toInt = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  port: toInt(process.env.PORT, 3000),
  nodeEnv: process.env.NODE_ENV ?? "development",

  /** Default page size for feed — matches typical mobile grid batches. */
  feedPageSize: toInt(process.env.FEED_PAGE_SIZE, 24),
  feedMaxPageSize: 48,

  /** Simulated network latency (ms). Tune to match Phia's sluggish feel in demos. */
  delays: {
    trendingMs: toInt(process.env.DELAY_TRENDING_MS, 900),
    brandsMs: toInt(process.env.DELAY_BRANDS_MS, 700),
    feedMs: toInt(process.env.DELAY_FEED_MS, 1100),
    homeBundleMs: toInt(process.env.DELAY_HOME_BUNDLE_MS, 1200),
    jitterMs: toInt(process.env.DELAY_JITTER_MS, 400),
  },

  /** HTTP cache hints — client can revalidate with ETag. */
  cache: {
    trendingSeconds: toInt(process.env.CACHE_TRENDING_SEC, 120),
    brandsSeconds: toInt(process.env.CACHE_BRANDS_SEC, 120),
    feedSeconds: toInt(process.env.CACHE_FEED_SEC, 30),
  },

  catalogPath:
    process.env.CATALOG_PATH ??
    path.join(moduleDir, "../data/products.json"),
};
