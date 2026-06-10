export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  currency: string;
  imageURL: string;
  source?: string;
}

export interface EditorialEditDTO {
  id: string;
  title: string;
  itemCount: number;
  imageURLs: string[];
}

export interface BrandSpotlightDTO {
  id: string;
  name: string;
  imageURL: string | null;
  badge: "hot" | "sale" | "amountOff" | null;
  badgeValue?: number;
}

export interface PageMeta {
  cursor: string | null;
  nextCursor: string | null;
  limit: number;
  total: number;
  hasMore: boolean;
  sessionId: string;
}

export interface ApiEnvelope<T> {
  data: T;
  meta?: PageMeta;
  requestId: string;
}
