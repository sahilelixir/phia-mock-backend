import { readFileSync } from "node:fs";
import { config } from "../config.js";
import type {
  BrandSpotlightDTO,
  EditorialEditDTO,
  Product,
} from "../types/index.js";

const EDIT_TITLE_OVERRIDES: Record<string, string> = {
  "everyday-essentials": "Everyday Edit",
  "spring-luxury-desires": "Luxury Desires",
  "spring-break-dresses": "Dress Season",
  "the-bag-carries": "Bag Edit",
  "holiday-in-the-sun": "Sun Holiday",
  "the-work-tote": "Work Tote",
  "beauty-essentials": "Beauty Edit",
  "polo-ralph-lauren": "Polo Edit",
};

const BADGE_ROTATION: Array<BrandSpotlightDTO["badge"]> = [
  "hot",
  null,
  "sale",
  "amountOff",
  null,
  "hot",
  "sale",
  null,
];

function prettyTitle(slug: string): string {
  return slug
    .split("-")
    .slice(0, 3)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function editorialSlug(source: string | undefined, productId: string): string | null {
  if (!source?.includes("editorials/")) return null;
  return source.split("/").pop() ?? productId;
}

export class CatalogService {
  private readonly products: Product[];
  private readonly trending: EditorialEditDTO[];
  private readonly brands: BrandSpotlightDTO[];
  private readonly catalogETag: string;

  constructor(catalogPath = config.catalogPath) {
    const raw = readFileSync(catalogPath, "utf8");
    this.products = JSON.parse(raw) as Product[];
    this.catalogETag = `"catalog-${this.products.length}-${raw.length}"`;
    this.trending = this.buildTrending(8);
    this.brands = this.buildBrands(12);
  }

  get etag(): string {
    return this.catalogETag;
  }

  get totalProducts(): number {
    return this.products.length;
  }

  getTrending(limit = 8): EditorialEditDTO[] {
    return this.trending.slice(0, limit);
  }

  getBrands(limit = 12): BrandSpotlightDTO[] {
    return this.brands.slice(0, limit);
  }

  getFeedPage(cursor: string | null, limit: number): {
    items: Product[];
    offset: number;
    hasMore: boolean;
    nextCursor: string | null;
  } {
    const offset = cursor ? Number.parseInt(cursor, 10) : 0;
    const safeOffset = Number.isFinite(offset) && offset >= 0 ? offset : 0;
    const safeLimit = Math.min(Math.max(limit, 1), config.feedMaxPageSize);
    const end = Math.min(safeOffset + safeLimit, this.products.length);
    const items = this.products.slice(safeOffset, end);
    const hasMore = end < this.products.length;

    return {
      items,
      offset: safeOffset,
      hasMore,
      nextCursor: hasMore ? String(end) : null,
    };
  }

  private buildTrending(limit: number): EditorialEditDTO[] {
    const grouped = new Map<string, Product[]>();

    for (const product of this.products) {
      const slug = editorialSlug(product.source, product.id);
      if (!slug) continue;
      const bucket = grouped.get(slug) ?? [];
      bucket.push(product);
      grouped.set(slug, bucket);
    }

    return [...grouped.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, limit)
      .map(([slug, items]) => ({
        id: slug,
        title: EDIT_TITLE_OVERRIDES[slug] ?? prettyTitle(slug),
        itemCount: items.length,
        imageURLs: items.slice(0, 3).map((p) => p.imageURL),
      }))
      .filter((edit) => edit.imageURLs.length > 0);
  }

  private buildBrands(limit: number): BrandSpotlightDTO[] {
    const byBrand = new Map<string, Product[]>();

    for (const product of this.products) {
      const bucket = byBrand.get(product.brand) ?? [];
      bucket.push(product);
      byBrand.set(product.brand, bucket);
    }

    return [...byBrand.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, limit)
      .map(([name, items], index) => {
        const badge = BADGE_ROTATION[index % BADGE_ROTATION.length];
        return {
          id: name,
          name,
          imageURL: items[0]?.imageURL ?? null,
          badge,
          badgeValue: badge === "amountOff" ? 30 : undefined,
        };
      });
  }
}
