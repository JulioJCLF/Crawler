import { describe, it, expect, beforeEach } from "vitest";
import {
  getPricingConfig,
  updatePricingConfig,
  resetPricingConfig,
  _clearMemoryCacheForTesting,
} from "./pricingService";

describe("pricingService - Gerenciamento e Persistência de Precificação", () => {
  beforeEach(() => {
    _clearMemoryCacheForTesting();
  });

  it("retorna configuração de precificação com valores padrão iniciais", () => {
    const config = getPricingConfig();
    expect(config).toBeDefined();
    expect(config.exchangeRate).toBeGreaterThan(0);
    expect(config.defaultMarkup).toBeGreaterThanOrEqual(1);
    expect(config.categoryMarkups).toBeDefined();
  });

  it("atualiza a cotação do dólar e persiste alteração", () => {
    const result = updatePricingConfig({ exchangeRate: 5.75 }, "admin-teste");
    expect(result.success).toBe(true);
    expect(result.config.exchangeRate).toBe(5.75);
    expect(result.config.updatedBy).toBe("admin-teste");

    // Próxima chamada a getPricingConfig deve refletir o valor atualizado
    const current = getPricingConfig();
    expect(current.exchangeRate).toBe(5.75);
  });

  it("atualiza margem específica de categoria", () => {
    const result = updatePricingConfig(
      {
        categoryMarkups: {
          replicas: 1.65,
        },
      },
      "admin-teste"
    );

    expect(result.success).toBe(true);
    expect(result.config.categoryMarkups.replicas).toBe(1.65);
  });

  it("rejeita cotação de dólar negativa ou zero", () => {
    const result = updatePricingConfig({ exchangeRate: -2.5 });
    expect(result.success).toBe(false);
    expect(result.error).toContain("maior que zero");
  });

  it("rejeita margem padrão inválida", () => {
    const result = updatePricingConfig({ defaultMarkup: 0 });
    expect(result.success).toBe(false);
    expect(result.error).toContain("maior que zero");
  });

  it("redefine configurações para os padrões do sistema", () => {
    updatePricingConfig({ exchangeRate: 7.20 });
    const reset = resetPricingConfig("admin-reset");
    expect(reset.exchangeRate).toBe(5.50);
    expect(reset.updatedBy).toBe("admin-reset");
  });
});
