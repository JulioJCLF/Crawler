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
  source?: "crawler" | "manual";
  fixedBrlPrice?: number;
  status?: "active" | "hidden";
  hiddenAt?: string;
  hiddenReason?: string;
  updatedAt?: string;
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

export interface CustomProductInput {
  name: string;
  sku?: string;
  category: string;
  categoryLabel?: string;
  price?: string | null; // Ex: "USD 120.00"
  fixedBrlPrice?: number; // Ex: 450.00
  image?: string | null;
  url?: string;
  status?: "active" | "hidden";
  description?: string;
  specs?: Record<string, string>;
  images?: string[];
}

export interface HiddenProductEntry {
  id: string;
  name?: string;
  hiddenAt: string;
  reason?: string;
  source?: "crawler" | "manual";
}

export interface AdminProductListResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  stats: {
    totalActive: number;
    totalHidden: number;
    totalManual: number;
    totalCatalog: number;
  };
}

export type UserRole = "master" | "dolar_operator";

export interface AuthUser {
  username: string;
  email: string;
  role: UserRole;
  updatedAt?: string;
}

export interface PasswordResetToken {
  code: string;
  username: string;
  expiresAt: number;
}

export type RaffleStatus = "active" | "paused" | "awaiting_draw" | "completed" | "drawn" | "cancelled";
export type QuotaStatus = "available" | "reserved" | "paid";

export interface QuotaEntry {
  number: string; // "01".."100" ou "001".."1000"
  status: QuotaStatus;
  customerName?: string;
  customerPhone?: string;
  buyerName?: string;
  buyerPhone?: string;
  reservedAt?: string;
  paidAt?: string;
  sellerId?: string; // "matheus" | "alexandre"
}

export interface FederalDrawResult {
  contestNumber: string;
  drawDate: string;
  firstPrize: string;
  secondPrize?: string;
  thirdPrize?: string;
  fourthPrize?: string;
  fifthPrize?: string;
  winningQuota: string;
  prizeOrigin: "1º Prêmio" | "2º Prêmio" | "3º Prêmio" | "4º Prêmio" | "5º Prêmio";
  winner: {
    name: string;
    phone: string;
    quota: string;
  };
  drawnAt: string;
}

export interface Raffle {
  id: string;
  title: string;
  description?: string;
  image: string;
  images?: string[];
  pricePerQuota: number;
  totalQuotas: 100 | 1000;
  status: RaffleStatus;
  drawDate?: string;
  federalLotteryContest?: string;
  drawResults?: FederalDrawResult;
  federalLotteryDraw?: any;
  winnerQuota?: string;
  winnerName?: string;
  drawnAt?: string;
  stats?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRaffleInput {
  title: string;
  description?: string;
  image: string;
  images?: string[];
  pricePerQuota: number;
  totalQuotas: 100 | 1000;
  drawDate?: string;
  federalLotteryContest?: string;
}

export interface RaffleStats {
  totalQuotas: number;
  paidCount: number;
  reservedCount: number;
  availableCount: number;
  percentPaid: number;
  totalRevenue: number;
}

