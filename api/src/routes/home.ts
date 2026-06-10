import { Router } from "express";
import { config } from "../config.js";
import { httpCache } from "../middleware/httpCache.js";
import { simulatedLatency } from "../middleware/simulatedLatency.js";
import type { CatalogService } from "../services/catalogService.js";
import type { ApiEnvelope, BrandSpotlightDTO, EditorialEditDTO } from "../types/index.js";

export function homeRouter(catalog: CatalogService) {
  const router = Router();

  router.get(
    "/v1/home",
    simulatedLatency(config.delays.homeBundleMs),
    httpCache(config.cache.trendingSeconds, catalog.etag),
    (req, res) => {
      const shuffle = req.query.shuffle === "1";
      const body: ApiEnvelope<{
        trending: EditorialEditDTO[];
        brands: BrandSpotlightDTO[];
      }> = {
        data: {
          trending: catalog.getTrending(8, shuffle),
          brands: catalog.getBrands(12, shuffle),
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
    (req, res) => {
      const shuffle = req.query.shuffle === "1";
      const body: ApiEnvelope<EditorialEditDTO[]> = {
        data: catalog.getTrending(8, shuffle),
        requestId: res.locals.requestId,
      };
      res.json(body);
    }
  );

  router.get(
    "/v1/home/brands",
    simulatedLatency(config.delays.brandsMs),
    httpCache(config.cache.brandsSeconds, catalog.etag),
    (req, res) => {
      const shuffle = req.query.shuffle === "1";
      const body: ApiEnvelope<BrandSpotlightDTO[]> = {
        data: catalog.getBrands(12, shuffle),
        requestId: res.locals.requestId,
      };
      res.json(body);
    }
  );

  return router;
}
