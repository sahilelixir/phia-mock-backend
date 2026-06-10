import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = (req.header("x-request-id") ?? randomUUID()).slice(0, 64);
  res.locals.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
}
