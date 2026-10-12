/**
 * Utilitários para busca inteligente, normalização de texto e tolerância a erros.
 */

// Mapeamento de termos de busca frequentes com erros comuns de digitação
export const COMMON_TYPO_SYNONYMS: Record<string, string> = {
  glok: "glock",
  gloc: "glock",
  "m-4": "m4",
  "m 4": "m4",
  ak47: "ak",
  "ak-47": "ak",
  hopup: "hop up",
  "hop-up": "hop up",
  reddot: "red dot",
  "red-dot": "red dot",
  greengas: "green gas",
  "green-gas": "green gas",
  supressor: "silencer",
  silenciador: "silencer",
  lanterna: "flashlight",
  miras: "sight",
  luneta: "scope",
  carregador: "magazine",
  pente: "magazine",
  municao: "bbs",
  bolinhas: "bbs",
  esferas: "bbs",
};

export const QUICK_SEARCH_SUGGESTIONS = [
  { label: "M4", query: "m4" },
  { label: "Glock", query: "glock" },
  { label: "AK", query: "ak" },
  { label: "Sniper", query: "sniper" },
  { label: "Red Dot", query: "red dot" },
  { label: "Green Gas", query: "green gas" },
  { label: "BBs 0.25g", query: "0.25g" },
  { label: "Hop-Up", query: "hop up" },
  { label: "Magazine", query: "magazine" },
  { label: "Colete", query: "vest" },
];

export interface PriceRangeOption {
  id: string;
  label: string;
  min: number;
  max: number;
}

export const PRICE_RANGES: PriceRangeOption[] = [
  { id: "ate-150", label: "Até R$ 150", min: 0, max: 150 },
  { id: "150-500", label: "R$ 150 a R$ 500", min: 150, max: 500 },
  { id: "500-1500", label: "R$ 500 a R$ 1.500", min: 500, max: 1500 },
  { id: "1500-3000", label: "R$ 1.500 a R$ 3.000", min: 1500, max: 3000 },
  { id: "acima-3000", label: "Acima de R$ 3.000", min: 3000, max: Infinity },
];

/**
 * Remove acentos, caracteres diacríticos e normaliza para minúsculas.
 * Ex: "Ópticos & Peças" -> "opticos & pecas"
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Normaliza a string de busca e aplica sinônimos/correções comuns.
 */
export function preprocessSearchTokens(query: string): string[] {
  const normalized = normalizeText(query);
  if (!normalized) return [];

  // Quebra por espaços e pontuações irrelevantes
  const rawWords = normalized.split(/[\s,+/]+/);
  const processedTokens: string[] = [];

  for (const word of rawWords) {
    if (!word) continue;
    const synonym = COMMON_TYPO_SYNONYMS[word] || word;
    // Se o sinônimo tiver mais de uma palavra (ex: "hop up"), inclui as partes
    for (const part of synonym.split(/\s+/)) {
      if (part && !processedTokens.includes(part)) {
        processedTokens.push(part);
      }
    }
  }

  return processedTokens;
}

/**
 * Verifica se o nome do produto corresponde à consulta de busca:
 * - Todas as palavras do token de busca devem estar presentes no título do produto (busca AND).
 * - A ordem das palavras é irrelevante ("m4 red dot" encontra "Red Dot Sight for M4").
 * - Acentuação e maiúsculas são ignoradas.
 */
export function matchesSmartSearch(productName: string, query: string): boolean {
  if (!query || !query.trim()) return true;
  const tokens = preprocessSearchTokens(query);
  if (tokens.length === 0) return true;

  const normalizedName = normalizeText(productName);

  // Cada token precisa estar presente no texto normalizado do produto
  return tokens.every((token) => normalizedName.includes(token));
}

/**
 * Verifica se um valor monetário em reais calculado está dentro da faixa selecionada.
 */
export function matchesPriceRange(
  brlAmount: number | null | undefined,
  rangeId: string | null | undefined
): boolean {
  if (!rangeId) return true;
  if (typeof brlAmount !== "number" || isNaN(brlAmount) || brlAmount <= 0) return false;

  const range = PRICE_RANGES.find((r) => r.id === rangeId);
  if (!range) return true;

  return brlAmount >= range.min && brlAmount <= range.max;
}
