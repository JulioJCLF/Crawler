export interface Product {
  id: string;
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

export interface PricingConfig {
  exchangeRate: number; // Ex: 5.50
  defaultMarkup: number; // Ex: 1.50 (+50%)
  categoryMarkups: Record<string, number>; // Ex: { "replicas": 1.50, ... }
  updatedAt?: string;
  updatedBy?: string;
}

export interface CalculatedPrice {
  amount: number;
  formatted: string;
  usdAmount: number;
  exchangeRate: number;
  markup: number;
  marginPercent: number;
}
