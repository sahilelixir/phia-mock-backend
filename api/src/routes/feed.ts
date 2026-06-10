import { Router } from "express";
import { config } from "../config.js";
import { simulatedLatency } from "../middleware/simulatedLatency.js";
import type { CatalogService } from "../services/catalogService.js";
import type { ApiEnvelope } from "../types/index.js";
import type { Product } from "../types/index.js";

export function feedRouter(catalog: CatalogService) {
  const router = Router();

  router.get(
    "/v1/feed/for-you",
    simulatedLatency(config.delays.feedMs),
    (req, res) => {
      const cursor = typeof req.query.cursor === "string" ? req.query.cursor : null;
      const limitParam = typeof req.query.limit === "string" ? Number.parseInt(req.query.limit, 10) : config.feedPageSize;
      const limit = Number.isFinite(limitParam) ? limitParam : config.feedPageSize;

      const page = catalog.getFeedPage(cursor, limit);

      res.setHeader("Cache-Control", `private, max-age=${config.cache.feedSeconds}`);

      const body: ApiEnvelope<Product[]> = {
        data: page.items,
        meta: {
          cursor: cursor,
          nextCursor: page.nextCursor,
          limit,
          total: catalog.totalProducts,
          hasMore: page.hasMore,
        },
        requestId: res.locals.requestId,
      };

      res.json(body);
    }
  );

  return router;
}
