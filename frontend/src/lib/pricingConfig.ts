import { PricingConfig } from "@/types";

export const EXCHANGE_RATE = 5.50;

export const DEFAULT_CATEGORY_MARKUPS: Record<string, number> = {
  "replicas": 1.50,
  "pecas-internas": 1.50,
  "pecas-externas": 1.50,
  "pistolas": 1.50,
  "rifles-gas": 1.50,
  "sniper": 1.50,
  "magazines": 1.50,
  "bbs": 1.50,
  "gas": 1.50,
  "baterias": 1.50,
  "granadas": 1.50,
  "speedsoft": 1.50,
  "miras": 1.50,
  "vestuario": 1.50,
  "buckings": 1.50,
  "default": 1.50
};

// Margem padrão de +50% (mantido para compatibilidade retroativa)
export const CATEGORY_MARKUPS: Record<string, number> = DEFAULT_CATEGORY_MARKUPS;

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  exchangeRate: EXCHANGE_RATE,
  defaultMarkup: 1.50,
  categoryMarkups: DEFAULT_CATEGORY_MARKUPS,
  updatedAt: "2026-10-09T00:00:00.000Z",
  updatedBy: "padrão",
};

export const CATALOG_CATEGORIES_METADATA = [
  { slug: "replicas", label: "Réplicas" },
  { slug: "pecas-externas", label: "Peças Externas" },
  { slug: "pecas-internas", label: "Peças Internas" },
  { slug: "pistolas", label: "Peças para Pistolas" },
  { slug: "rifles-gas", label: "Peças para Rifles a Gás" },
  { slug: "sniper", label: "Peças para Sniper" },
  { slug: "magazines", label: "Magazines" },
  { slug: "bbs", label: "BBs" },
  { slug: "gas", label: "Gas / CO2 / HPA" },
  { slug: "baterias", label: "Baterias & Carregadores" },
  { slug: "granadas", label: "Granadas" },
  { slug: "speedsoft", label: "Speedsoft" },
  { slug: "miras", label: "Miras e Red Dots" },
  { slug: "vestuario", label: "Equipamento e Vestuário" },
  { slug: "buckings", label: "Buckings" },
];

export function markupToPercent(markup: number): number {
  if (typeof markup !== "number" || isNaN(markup)) return 50;
  return Math.round((markup - 1) * 100);
}

export function percentToMarkup(percent: number): number {
  if (typeof percent !== "number" || isNaN(percent)) return 1.50;
  return Number((1 + percent / 100).toFixed(4));
}

export function parseUsdPrice(priceStr: string | null | undefined): number {
  if (!priceStr) return 0;
  const cleaned = priceStr.trim().replace(/[^\d.,-]/g, "");
  if (!cleaned) return 0;

  // Se tiver ponto e vírgula (ex: 1.250,00 ou 1,250.00)
  if (cleaned.includes(".") && cleaned.includes(",")) {
    const lastDot = cleaned.lastIndexOf(".");
    const lastComma = cleaned.lastIndexOf(",");
    if (lastComma > lastDot) {
      // Formato brasileiro: 1.250,50
      const normalized = cleaned.replace(/\./g, "").replace(",", ".");
      return parseFloat(normalized) || 0;
    } else {
      // Formato internacional: 1,250.50
      const normalized = cleaned.replace(/,/g, "");
      return parseFloat(normalized) || 0;
    }
  }

  // Se tiver só vírgula: 210,00 -> 210.00
  if (cleaned.includes(",")) {
    const normalized = cleaned.replace(",", ".");
    return parseFloat(normalized) || 0;
  }

  // Se tiver só ponto ou apenas números: 18.50 -> 18.50
  return parseFloat(cleaned) || 0;
}

export function calculateBRLPrice(
  usdPriceStr: string | null | undefined,
  category: string,
  config?: PricingConfig | null
): {
  amount: number;
  formatted: string;
  usdAmount: number;
  exchangeRate: number;
  markup: number;
  marginPercent: number;
} | null {
  const usdAmount = parseUsdPrice(usdPriceStr);
  if (usdAmount <= 0) return null;

  const currentRate = (config && typeof config.exchangeRate === "number" && config.exchangeRate > 0)
    ? config.exchangeRate
    : EXCHANGE_RATE;

  const categoryMap = config?.categoryMarkups || CATEGORY_MARKUPS;
  const defaultMarkup = config?.defaultMarkup || CATEGORY_MARKUPS["default"] || 1.50;
  const markup = categoryMap[category] || defaultMarkup;
  
  // Fórmula: (USD * Cotação) * Margem (ex: +50% = * 1.50)
  const brlAmount = (usdAmount * currentRate) * markup;

  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(brlAmount);

  return {
    amount: brlAmount,
    formatted,
    usdAmount,
    exchangeRate: currentRate,
    markup,
    marginPercent: markupToPercent(markup),
  };
}
