import { describe, it, expect } from "vitest";
import {
  calculateBRLPrice,
  parseUsdPrice,
  markupToPercent,
  percentToMarkup,
  DEFAULT_PRICING_CONFIG,
} from "./pricingConfig";

describe("pricingConfig - Funções de Precificação e Margem", () => {
  it("converte strings de preço em dólar para número float", () => {
    expect(parseUsdPrice("USD 210,00")).toBe(210);
    expect(parseUsdPrice("USD 18.50")).toBe(18.5);
    expect(parseUsdPrice("$ 1.250,90")).toBe(1250.9);
    expect(parseUsdPrice(null)).toBe(0);
    expect(parseUsdPrice("")).toBe(0);
  });

  it("calcula preço em BRL com configuração padrão (câmbio 5.50 e margem 50%)", () => {
    // 100 USD * 5.50 * 1.50 = 825 BRL
    const result = calculateBRLPrice("USD 100,00", "replicas");
    expect(result).not.toBeNull();
    expect(result?.amount).toBe(825);
    expect(result?.exchangeRate).toBe(5.50);
    expect(result?.markup).toBe(1.50);
    expect(result?.marginPercent).toBe(50);
    expect(result?.formatted).toContain("825,00");
  });

  it("calcula preço em BRL com cotação customizada", () => {
    const customConfig = {
      ...DEFAULT_PRICING_CONFIG,
      exchangeRate: 6.00,
      defaultMarkup: 1.50,
      categoryMarkups: { replicas: 1.50 },
    };

    // 100 USD * 6.00 * 1.50 = 900 BRL
    const result = calculateBRLPrice("USD 100,00", "replicas", customConfig);
    expect(result).not.toBeNull();
    expect(result?.amount).toBe(900);
    expect(result?.exchangeRate).toBe(6.00);
    expect(result?.formatted).toContain("900,00");
  });

  it("calcula preço com margem customizada por categoria", () => {
    const customConfig = {
      ...DEFAULT_PRICING_CONFIG,
      exchangeRate: 5.00,
      defaultMarkup: 1.50,
      categoryMarkups: {
        "replicas": 1.60, // 60%
        "bbs": 1.30,      // 30%
      },
    };

    // Réplicas: 100 * 5.00 * 1.60 = 800 BRL
    const replica = calculateBRLPrice("USD 100,00", "replicas", customConfig);
    expect(replica?.amount).toBe(800);
    expect(replica?.marginPercent).toBe(60);

    // BBs: 10 * 5.00 * 1.30 = 65 BRL
    const bbs = calculateBRLPrice("USD 10,00", "bbs", customConfig);
    expect(bbs?.amount).toBe(65);
    expect(bbs?.marginPercent).toBe(30);
  });

  it("utiliza fallback para categoria não listada", () => {
    const customConfig = {
      ...DEFAULT_PRICING_CONFIG,
      exchangeRate: 5.00,
      defaultMarkup: 1.40, // 40%
      categoryMarkups: {},
    };

    const result = calculateBRLPrice("USD 50,00", "categoria-desconhecida", customConfig);
    // 50 * 5.00 * 1.40 = 350 BRL
    expect(result?.amount).toBe(350);
    expect(result?.marginPercent).toBe(40);
  });

  it("retorna null para itens sem preço ou sob consulta", () => {
    expect(calculateBRLPrice(null, "replicas")).toBeNull();
    expect(calculateBRLPrice("", "replicas")).toBeNull();
    expect(calculateBRLPrice("Sob Consulta", "replicas")).toBeNull();
  });

  it("converte entre multiplicador e porcentagem corretamente", () => {
    expect(markupToPercent(1.50)).toBe(50);
    expect(markupToPercent(1.35)).toBe(35);
    expect(markupToPercent(2.00)).toBe(100);

    expect(percentToMarkup(50)).toBe(1.5);
    expect(percentToMarkup(35)).toBe(1.35);
    expect(percentToMarkup(100)).toBe(2.0);
  });
});
