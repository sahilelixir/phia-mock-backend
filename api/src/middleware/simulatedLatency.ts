import type { NextFunction, Request, Response } from "express";
import { config } from "../config.js";

function jitter(baseMs: number): number {
  if (config.delays.jitterMs <= 0) return baseMs;
  const spread = Math.floor(Math.random() * config.delays.jitterMs);
  return baseMs + spread;
}

export function simulatedLatency(baseMs: number) {
  return async (_req: Request, _res: Response, next: NextFunction) => {
    if (baseMs <= 0) {
      next();
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, jitter(baseMs)));
    next();
  };
}
