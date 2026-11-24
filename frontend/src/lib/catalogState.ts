export interface CatalogState {
  page: number;
  search: string;
  category: string | null;
  weight: string | null;
  vestCategory: string | null;
  brand: string | null;
  priceRange: string | null;
  sortOrder: string;
}

export const DEFAULT_CATALOG_STATE: CatalogState = {
  page: 1,
  search: "",
  category: null,
  weight: null,
  vestCategory: null,
  brand: null,
  priceRange: null,
  sortOrder: "recent",
};

export const CATALOG_STORAGE_KEY = "hunting_catalog_state";
export const CATALOG_SCROLL_KEY = "hunting_catalog_scroll_y";

/**
 * Converte o estado do catálogo em Query String para a URL.
 * Omitimos valores padrão para manter URLs limpas.
 */
export function serializeCatalogState(state: CatalogState): string {
  const params = new URLSearchParams();
  if (state.page > 1) {
    params.set("page", String(state.page));
  }
  if (state.search && state.search.trim()) {
    params.set("q", state.search.trim());
  }
  if (state.category) {
    params.set("cat", state.category);
  }
  if (state.weight) {
    params.set("weight", state.weight);
  }
  if (state.vestCategory) {
    params.set("vest", state.vestCategory);
  }
  if (state.brand) {
    params.set("brand", state.brand);
  }
  if (state.priceRange) {
    params.set("price", state.priceRange);
  }
  if (state.sortOrder && state.sortOrder !== "recent") {
    params.set("sort", state.sortOrder);
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Faz o parse da Query String da URL para obter o estado parcial do catálogo.
 */
export function parseCatalogState(searchQuery: string): Partial<CatalogState> {
  const cleanQuery = searchQuery.startsWith("?") ? searchQuery.slice(1) : searchQuery;
  if (!cleanQuery) return {};

  const params = new URLSearchParams(cleanQuery);
  const result: Partial<CatalogState> = {};

  const pageStr = params.get("page");
  if (pageStr) {
    const pageNum = parseInt(pageStr, 10);
    if (!isNaN(pageNum) && pageNum > 0) {
      result.page = pageNum;
    }
  }

  const q = params.get("q");
  if (q !== null && q.trim()) {
    result.search = q.trim();
  }

  const cat = params.get("cat");
  if (cat !== null && cat.trim()) {
    result.category = cat.trim();
  }

  const weight = params.get("weight");
  if (weight !== null && weight.trim()) {
    result.weight = weight.trim();
  }

  const vest = params.get("vest");
  if (vest !== null && vest.trim()) {
    result.vestCategory = vest.trim();
  }

  const brand = params.get("brand");
  if (brand !== null && brand.trim()) {
    result.brand = brand.trim();
  }

  const price = params.get("price");
  if (price !== null && price.trim()) {
    result.priceRange = price.trim();
  }

  const sort = params.get("sort");
  if (sort !== null && sort.trim()) {
    result.sortOrder = sort.trim();
  }

  return result;
}

/**
 * Salva o estado atual no sessionStorage para restaurar caso o usuário retorne.
 */
export function saveCatalogStateToStorage(state: CatalogState): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Tratamento silencioso caso quota seja excedida ou bloqueada
  }
}

/**
 * Recupera o último estado salvo no sessionStorage.
 */
export function loadCatalogStateFromStorage(): Partial<CatalogState> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CATALOG_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Limpa o estado armazenado no sessionStorage.
 */
export function clearCatalogStateFromStorage(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(CATALOG_STORAGE_KEY);
  } catch {
    // Ignora
  }
}

/**
 * Salva a posição de rolagem (scrollY) antes de navegar para um produto.
 */
export function saveCatalogScroll(y: number): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CATALOG_SCROLL_KEY, String(Math.round(y)));
  } catch {
    // Ignora
  }
}

/**
 * Obtém e limpa a posição de rolagem salva.
 */
export function getAndClearCatalogScroll(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CATALOG_SCROLL_KEY);
    if (raw !== null) {
      sessionStorage.removeItem(CATALOG_SCROLL_KEY);
      const parsed = parseInt(raw, 10);
      return !isNaN(parsed) && parsed >= 0 ? parsed : null;
    }
  } catch {
    // Ignora
  }
  return null;
}
