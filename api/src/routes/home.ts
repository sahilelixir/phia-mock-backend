import { Router } from "express";
import { config } from "../config.js";
import { httpCache } from "../middleware/httpCache.js";
import { simulatedLatency } from "../middleware/simulatedLatency.js";
import type { CatalogService } from "../services/catalogService.js";
import type { ApiEnvelope } from "../types/index.js";

export function homeRouter(catalog: CatalogService) {
  const router = Router();

  router.get(
    "/v1/home",
    simulatedLatency(config.delays.homeBundleMs),
    httpCache(config.cache.trendingSeconds, catalog.etag),
    (_req, res) => {
      const body: ApiEnvelope<{
        trending: ReturnType<CatalogService["getTrending"]>;
        brands: ReturnType<CatalogService["getBrands"]>;
      }> = {
        data: {
          trending: catalog.getTrending(),
          brands: catalog.getBrands(),
        },
        requestId: res.locals.requestId,
      };
      res.json(body);
    }
  );

  router.get(
    "/v1/home/trending",
    simulatedLatency(config.delays.trendingMs),
    httpCache(config.cache.trendingSeconds, catalog.etag),
    (_req, res) => {
      const body: ApiEnvelope<ReturnType<CatalogService["getTrending"]>> = {
        data: catalog.getTrending(),
        requestId: res.locals.requestId,
      };
      res.json(body);
    }
  );

  router.get(
    "/v1/home/brands",
    simulatedLatency(config.delays.brandsMs),
    httpCache(config.cache.brandsSeconds, catalog.etag),
    (_req, res) => {
      const body: ApiEnvelope<ReturnType<CatalogService["getBrands"]>> = {
        data: catalog.getBrands(),
        requestId: res.locals.requestId,
      };
      res.json(body);
    }
  );

  return router;
}
