export interface Product {
  id: string;
  sku?: string;
  name: string;
  url: string;
  price: string | null;
  image: string | null;
  category: string;
  categoryLabel: string;
  firstSeen?: string;
  priceChangedAt?: string;
  changeType?: "restock" | "sob_consulta" | "price_change" | "new";
  previousPrice?: string | null;
  priceHistory?: PricePoint[];
  description?: string;
  specs?: Record<string, string>;
  images?: string[];
}

export interface PricePoint {
  date: string;
  price: string | null;
}

export interface CategorySummary {
  slug: string;
  label: string;
  count: number;
}

export interface Snapshot {
  updatedAt: string;
  count: number;
  categories: CategorySummary[];
  products: Product[];
}
