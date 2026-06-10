import { Router } from "express";
import type { CatalogService } from "../services/catalogService.js";

export function healthRouter(catalog: CatalogService) {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      products: catalog.totalProducts,
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}
