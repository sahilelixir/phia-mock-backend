import { Router } from "express";
import { config } from "../config.js";
import { simulatedLatency } from "../middleware/simulatedLatency.js";
import type { CatalogService } from "../services/catalogService.js";
import type { FeedSessionService } from "../services/feedSessionService.js";
import type { ApiEnvelope } from "../types/index.js";
import type { Product } from "../types/index.js";

export function feedRouter(catalog: CatalogService, feedSessions: FeedSessionService) {
  const router = Router();

  router.get(
    "/v1/feed/for-you",
    simulatedLatency(config.delays.feedMs),
    (req, res) => {
      const cursor = typeof req.query.cursor === "string" ? req.query.cursor : null;
      const sessionId = typeof req.query.session === "string" ? req.query.session : null;
      const limitParam =
        typeof req.query.limit === "string" ? Number.parseInt(req.query.limit, 10) : config.feedPageSize;
      const limit = Number.isFinite(limitParam) ? limitParam : config.feedPageSize;

      const page = feedSessions.getPage(sessionId, cursor, limit);

      // Feed is personalized per session — never cache at the edge.
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.setHeader("Pragma", "no-cache");

      const body: ApiEnvelope<Product[]> = {
        data: page.items,
        meta: {
          cursor,
          nextCursor: page.nextCursor,
          limit,
          total: page.total,
          hasMore: page.hasMore,
          sessionId: page.sessionId,
        },
        requestId: res.locals.requestId,
      };

      res.json(body);
    }
  );

  return router;
}
