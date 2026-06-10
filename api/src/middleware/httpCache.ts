import { createHash } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export function httpCache(maxAgeSeconds: number, catalogETag: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Cache-Control", `private, max-age=${maxAgeSeconds}, stale-while-revalidate=60`);
    res.setHeader("ETag", catalogETag);

    const ifNoneMatch = req.header("if-none-match");
    if (ifNoneMatch === catalogETag) {
      res.status(304).end();
      return;
    }

    next();
  };
}

export function weakETag(payload: unknown): string {
  const hash = createHash("sha1").update(JSON.stringify(payload)).digest("hex");
  return `W/"${hash}"`;
}
