import { randomUUID } from "node:crypto";
import type { Product } from "../types/index.js";

interface FeedSession {
  /** Shuffled indices into the master catalog. */
  order: number[];
  createdAt: number;
}

const SESSION_TTL_MS = 30 * 60 * 1000;

export class FeedSessionService {
  private readonly sessions = new Map<string, FeedSession>();

  constructor(private readonly products: Product[]) {}

  getPage(sessionId: string | null, cursor: string | null, limit: number) {
    this.pruneExpired();

    const offset = cursor ? Number.parseInt(cursor, 10) : 0;
    const safeOffset = Number.isFinite(offset) && offset >= 0 ? offset : 0;
    const safeLimit = Math.min(Math.max(limit, 1), 48);

    const session = this.resolveSession(sessionId);
    const slice = session.order.slice(safeOffset, safeOffset + safeLimit);
    const items = slice.map((index) => this.products[index]);
    const end = safeOffset + slice.length;
    const hasMore = end < session.order.length;

    return {
      sessionId: session.id,
      items,
      offset: safeOffset,
      hasMore,
      nextCursor: hasMore ? String(end) : null,
      total: session.order.length,
    };
  }

  private resolveSession(sessionId: string | null): { id: string; order: number[] } {
    if (sessionId) {
      const existing = this.sessions.get(sessionId);
      if (existing) {
        return { id: sessionId, order: existing.order };
      }
    }

    const id = randomUUID();
    const order = shuffleIndices(this.products.length);
    this.sessions.set(id, { order, createdAt: Date.now() });
    return { id, order };
  }

  private pruneExpired() {
    const now = Date.now();
    for (const [id, session] of this.sessions) {
      if (now - session.createdAt > SESSION_TTL_MS) {
        this.sessions.delete(id);
      }
    }
  }
}

function shuffleIndices(length: number): number[] {
  const order = Array.from({ length }, (_, index) => index);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
