import fs from "fs";
import path from "path";
import { PricingConfig } from "@/types";
import { DEFAULT_PRICING_CONFIG } from "./pricingConfig";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const CONFIG_FILE = path.join(DATA_DIR, "pricing-config.json");

let memoryCache: PricingConfig | null = null;

function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
    } catch {
      // Ignore if directory exists or in read-only environment
    }
  }
}

export function getPricingConfig(): PricingConfig {
  if (memoryCache) {
    return memoryCache;
  }

  try {
    ensureDirectoryExists(DATA_DIR);

    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed.exchangeRate === "number") {
        memoryCache = {
          exchangeRate: parsed.exchangeRate > 0 ? parsed.exchangeRate : DEFAULT_PRICING_CONFIG.exchangeRate,
          defaultMarkup: parsed.defaultMarkup > 0 ? parsed.defaultMarkup : DEFAULT_PRICING_CONFIG.defaultMarkup,
          categoryMarkups: {
            ...DEFAULT_PRICING_CONFIG.categoryMarkups,
            ...(parsed.categoryMarkups || {})
          },
          updatedAt: parsed.updatedAt || new Date().toISOString(),
          updatedBy: parsed.updatedBy || "sistema",
        };
        return memoryCache;
      }
    }
  } catch (err) {
    console.warn("[pricingService] Falha ao ler arquivo de configuração de precificação:", err);
  }

  // Se não existir ou falhar, salva a configuração padrão inicial
  memoryCache = { ...DEFAULT_PRICING_CONFIG };
  try {
    saveToDisk(memoryCache);
  } catch {
    // Continua com in-memory
  }

  return memoryCache;
}

function saveToDisk(config: PricingConfig): void {
  ensureDirectoryExists(DATA_DIR);
  const tempFile = `${CONFIG_FILE}.${Date.now()}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(config, null, 2), "utf-8");
  fs.renameSync(tempFile, CONFIG_FILE);
}

export function updatePricingConfig(
  updates: Partial<PricingConfig>,
  updatedBy: string = "admin"
): { success: boolean; config: PricingConfig; error?: string } {
  const current = getPricingConfig();

  // Validações de integridade
  if (updates.exchangeRate !== undefined) {
    const rate = Number(updates.exchangeRate);
    if (isNaN(rate) || rate <= 0) {
      return { success: false, config: current, error: "A cotação do dólar deve ser um número maior que zero." };
    }
  }

  if (updates.defaultMarkup !== undefined) {
    const markup = Number(updates.defaultMarkup);
    if (isNaN(markup) || markup <= 0) {
      return { success: false, config: current, error: "A margem padrão deve ser um número maior que zero." };
    }
  }

  if (updates.categoryMarkups !== undefined) {
    if (typeof updates.categoryMarkups !== "object" || updates.categoryMarkups === null) {
      return { success: false, config: current, error: "O mapa de margens por categoria é inválido." };
    }

    for (const [key, value] of Object.entries(updates.categoryMarkups)) {
      const numVal = Number(value);
      if (isNaN(numVal) || numVal <= 0) {
        return {
          success: false,
          config: current,
          error: `A margem para a categoria '${key}' deve ser um número maior que zero.`
        };
      }
    }
  }

  const updatedConfig: PricingConfig = {
    exchangeRate: updates.exchangeRate !== undefined ? Number(updates.exchangeRate) : current.exchangeRate,
    defaultMarkup: updates.defaultMarkup !== undefined ? Number(updates.defaultMarkup) : current.defaultMarkup,
    categoryMarkups: {
      ...current.categoryMarkups,
      ...(updates.categoryMarkups || {})
    },
    updatedAt: new Date().toISOString(),
    updatedBy,
  };

  try {
    saveToDisk(updatedConfig);
  } catch (err: any) {
    console.error("[pricingService] Erro ao persistir configuração no disco:", err);
  }

  memoryCache = updatedConfig;
  return { success: true, config: updatedConfig };
}

export function resetPricingConfig(updatedBy: string = "admin"): PricingConfig {
  const resetConfig: PricingConfig = {
    ...DEFAULT_PRICING_CONFIG,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };

  try {
    saveToDisk(resetConfig);
  } catch (err) {
    console.error("[pricingService] Erro ao redefinir configuração:", err);
  }

  memoryCache = resetConfig;
  return resetConfig;
}

/** Limpa cache de memória (útil para testes unitários) */
export function _clearMemoryCacheForTesting(): void {
  memoryCache = null;
}
