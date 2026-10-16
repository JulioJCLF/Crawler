import fs from "fs";
import path from "path";
import {
  Product,
  Snapshot,
  CategorySummary,
  CustomProductInput,
  HiddenProductEntry,
  AdminProductListResponse,
} from "@/types";
import { CATALOG_CATEGORIES_METADATA } from "@/lib/pricingConfig";

let customDataDirForTesting: string | null = null;

export function setDataDirForTesting(dir: string | null) {
  customDataDirForTesting = dir;
  inMemoryCustomProducts = null;
  inMemoryHiddenProducts = null;
}

function getDataDir(): string {
  if (customDataDirForTesting) return customDataDirForTesting;
  return process.env.DATA_DIR || path.join(process.cwd(), "data");
}

function getCustomProductsFile(): string {
  return path.join(getDataDir(), "custom-products.json");
}

function getHiddenProductsFile(): string {
  return path.join(getDataDir(), "hidden-products.json");
}

// Cache em memória para operações rápidas
let inMemoryCustomProducts: Product[] | null = null;
let inMemoryHiddenProducts: Record<string, HiddenProductEntry> | null = null;


function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
    } catch {
      // Ignora erro se já existir ou ambiente somente-leitura
    }
  }
}

function saveAtomic(filePath: string, data: any): void {
  ensureDirectoryExists(path.dirname(filePath));
  const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).slice(2, 6)}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tempPath, filePath);
}

export function resolveCategoryLabel(slug: string): string {
  const found = CATALOG_CATEGORIES_METADATA.find((c) => c.slug === slug);
  if (found) return found.label;
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Lê o mapa de produtos ocultados (IDs bloqueados) do disco.
 */
export function getHiddenProducts(): Record<string, HiddenProductEntry> {
  if (inMemoryHiddenProducts) {
    return inMemoryHiddenProducts;
  }

  try {
    ensureDirectoryExists(getDataDir());
    const hiddenFile = getHiddenProductsFile();
    if (fs.existsSync(hiddenFile)) {
      const content = fs.readFileSync(hiddenFile, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === "object") {
        inMemoryHiddenProducts = parsed;
        return inMemoryHiddenProducts!;
      }
    }
  } catch (err) {
    console.warn("[catalogService] Erro ao carregar hidden-products.json:", err);
  }

  inMemoryHiddenProducts = {};
  return inMemoryHiddenProducts;
}

/**
 * Salva o mapa de produtos ocultados de forma atômica.
 */
export function saveHiddenProducts(map: Record<string, HiddenProductEntry>): void {
  inMemoryHiddenProducts = map;
  try {
    saveAtomic(getHiddenProductsFile(), map);
  } catch (err) {
    console.error("[catalogService] Falha ao persistir hidden-products.json:", err);
  }
}

/**
 * Lê os produtos criados manualmente pelo administrador.
 */
export function getCustomProducts(): Product[] {
  if (inMemoryCustomProducts) {
    return inMemoryCustomProducts;
  }

  try {
    ensureDirectoryExists(getDataDir());
    const customFile = getCustomProductsFile();
    if (fs.existsSync(customFile)) {
      const content = fs.readFileSync(customFile, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        inMemoryCustomProducts = parsed;
        return inMemoryCustomProducts!;
      }
    }
  } catch (err) {
    console.warn("[catalogService] Erro ao carregar custom-products.json:", err);
  }

  inMemoryCustomProducts = [];
  return inMemoryCustomProducts;
}

/**
 * Salva a lista de produtos criados manualmente de forma atômica.
 */
export function saveCustomProducts(products: Product[]): void {
  inMemoryCustomProducts = products;
  try {
    saveAtomic(getCustomProductsFile(), products);
  } catch (err) {
    console.error("[catalogService] Falha ao persistir custom-products.json:", err);
  }
}

/**
 * Oculta um produto (remove da vitrine pública).
 */
export function hideProduct(
  id: string,
  name?: string,
  reason?: string,
  source: "crawler" | "manual" = "crawler"
): { success: boolean; error?: string } {
  if (!id || typeof id !== "string") {
    return { success: false, error: "ID de produto inválido." };
  }

  const hidden = { ...getHiddenProducts() };
  hidden[id] = {
    id,
    name: name || `Produto ${id}`,
    hiddenAt: new Date().toISOString(),
    reason: reason || "Ocultado pelo administrador",
    source,
  };

  saveHiddenProducts(hidden);
  return { success: true };
}

/**
 * Restaura um produto ocultado (volta a aparecer na vitrine).
 */
export function unhideProduct(id: string): { success: boolean; error?: string } {
  if (!id || typeof id !== "string") {
    return { success: false, error: "ID de produto inválido." };
  }

  const hidden = { ...getHiddenProducts() };
  if (!hidden[id]) {
    return { success: false, error: "Produto não consta na lista de itens ocultos." };
  }

  delete hidden[id];
  saveHiddenProducts(hidden);
  return { success: true };
}

/**
 * Cria um novo produto manual na loja.
 */
export function createCustomProduct(
  input: CustomProductInput
): { success: boolean; product?: Product; error?: string } {
  if (!input.name || !input.name.trim()) {
    return { success: false, error: "O nome do produto é obrigatório." };
  }

  if (!input.category || !input.category.trim()) {
    return { success: false, error: "A categoria é obrigatória." };
  }

  const hasUsdPrice = Boolean(input.price && input.price.trim());
  const hasFixedBrl = typeof input.fixedBrlPrice === "number" && input.fixedBrlPrice > 0;

  if (!hasUsdPrice && !hasFixedBrl) {
    return {
      success: false,
      error: "Informe ao menos um valor: Preço em Dólar (USD) ou Preço Fixo em Reais (R$).",
    };
  }

  const now = new Date().toISOString();
  const id = `manual-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const label = input.categoryLabel || resolveCategoryLabel(input.category);

  const newProduct: Product = {
    id,
    name: input.name.trim(),
    category: input.category.trim(),
    categoryLabel: label,
    price: input.price ? input.price.trim() : null,
    fixedBrlPrice: hasFixedBrl ? Number(input.fixedBrlPrice) : undefined,
    image: input.image ? input.image.trim() : null,
    url: input.url ? input.url.trim() : "",
    source: "manual",
    status: input.status || "active",
    changeType: "new",
    firstSeen: now,
    updatedAt: now,
  };

  const list = [newProduct, ...getCustomProducts()];
  saveCustomProducts(list);

  return { success: true, product: newProduct };
}

/**
 * Atualiza um produto manual existente.
 */
export function updateCustomProduct(
  id: string,
  updates: Partial<CustomProductInput>
): { success: boolean; product?: Product; error?: string } {
  if (!id) return { success: false, error: "ID é obrigatório." };

  const list = getCustomProducts();
  const index = list.findIndex((p) => p.id === id);

  if (index === -1) {
    return { success: false, error: "Produto manual não encontrado." };
  }

  const existing = list[index];
  const label = updates.category
    ? updates.categoryLabel || resolveCategoryLabel(updates.category)
    : existing.categoryLabel;

  const updated: Product = {
    ...existing,
    ...(updates.name ? { name: updates.name.trim() } : {}),
    ...(updates.category ? { category: updates.category.trim(), categoryLabel: label } : {}),
    ...(updates.price !== undefined ? { price: updates.price ? updates.price.trim() : null } : {}),
    ...(updates.fixedBrlPrice !== undefined
      ? { fixedBrlPrice: updates.fixedBrlPrice > 0 ? Number(updates.fixedBrlPrice) : undefined }
      : {}),
    ...(updates.image !== undefined ? { image: updates.image ? updates.image.trim() : null } : {}),
    ...(updates.url !== undefined ? { url: updates.url ? updates.url.trim() : "" } : {}),
    ...(updates.status ? { status: updates.status } : {}),
    updatedAt: new Date().toISOString(),
  };

  const newList = [...list];
  newList[index] = updated;
  saveCustomProducts(newList);

  return { success: true, product: updated };
}

/**
 * Exclui permanentemente um produto manual.
 */
export function deleteCustomProduct(id: string): { success: boolean; error?: string } {
  if (!id) return { success: false, error: "ID é obrigatório." };

  const list = getCustomProducts();
  const filtered = list.filter((p) => p.id !== id);

  if (filtered.length === list.length) {
    return { success: false, error: "Produto manual não encontrado para exclusão." };
  }

  saveCustomProducts(filtered);

  // Se estiver também nos ocultos, limpa
  const hidden = { ...getHiddenProducts() };
  if (hidden[id]) {
    delete hidden[id];
    saveHiddenProducts(hidden);
  }

  return { success: true };
}

/**
 * Constrói o catálogo unificado (híbrido):
 * Snapshot Base (-) Produtos Ocultos (+) Produtos Manuais Ativos.
 */
export function buildUnifiedSnapshot(baseSnapshot: Snapshot): Snapshot {
  const hidden = getHiddenProducts();
  const custom = getCustomProducts();

  // 1. Filtra produtos base do crawler que não estão ocultados
  const activeCrawlerProducts = (baseSnapshot.products || []).filter(
    (p) => !hidden[p.id]
  );

  // 2. Filtra produtos manuais ativos (não ocultados e status !== "hidden")
  const activeCustomProducts = custom.filter(
    (p) => !hidden[p.id] && p.status !== "hidden"
  );

  // 3. Junta produtos mantendo manuais no topo/destaque
  const unifiedProducts = [...activeCustomProducts, ...activeCrawlerProducts];

  // 4. Recalcula categorias com contagens atualizadas
  const categoryCountMap = new Map<string, number>();
  for (const p of unifiedProducts) {
    categoryCountMap.set(p.category, (categoryCountMap.get(p.category) || 0) + 1);
  }

  const updatedCategories: CategorySummary[] = (baseSnapshot.categories || []).map((cat) => ({
    ...cat,
    count: categoryCountMap.get(cat.slug) || 0,
  }));

  // Adiciona categorias extras que existam em manuais mas não estavam no snapshot base
  for (const [slug, count] of categoryCountMap.entries()) {
    if (!updatedCategories.some((c) => c.slug === slug)) {
      updatedCategories.push({
        slug,
        label: resolveCategoryLabel(slug),
        count,
      });
    }
  }

  const isProductsUnchanged =
    activeCustomProducts.length === 0 &&
    activeCrawlerProducts.length === (baseSnapshot.products || []).length;
  const finalCount =
    isProductsUnchanged && typeof baseSnapshot.count === "number"
      ? baseSnapshot.count
      : unifiedProducts.length;

  return {
    updatedAt: baseSnapshot.updatedAt || new Date().toISOString(),
    count: finalCount,
    categories: updatedCategories,
    products: unifiedProducts,
  };
}

export interface AdminCatalogFilterOptions {
  query?: string;
  category?: string;
  status?: "all" | "active" | "hidden" | "manual";
  page?: number;
  limit?: number;
}

/**
 * Retorna o catálogo formatado para o painel de administração com paginação e métricas.
 */
export function getAdminCatalog(
  baseSnapshot: Snapshot,
  options: AdminCatalogFilterOptions = {}
): AdminProductListResponse {
  const hidden = getHiddenProducts();
  const custom = getCustomProducts();

  // Mapeia os manuais para o formato completo
  const formattedCustom: Product[] = custom.map((p) => {
    const isHidden = Boolean(hidden[p.id]) || p.status === "hidden";
    return {
      ...p,
      source: "manual" as const,
      status: isHidden ? ("hidden" as const) : ("active" as const),
      hiddenAt: hidden[p.id]?.hiddenAt,
      hiddenReason: hidden[p.id]?.reason,
    };
  });

  // Mapeia os produtos do crawler
  const formattedCrawler: Product[] = (baseSnapshot.products || []).map((p) => {
    const isHidden = Boolean(hidden[p.id]);
    return {
      ...p,
      source: "crawler" as const,
      status: isHidden ? ("hidden" as const) : ("active" as const),
      hiddenAt: hidden[p.id]?.hiddenAt,
      hiddenReason: hidden[p.id]?.reason,
    };
  });

  // Junta todos (manuais primeiro)
  const allProducts = [...formattedCustom, ...formattedCrawler];

  // Métricas globais
  let totalActive = 0;
  let totalHidden = 0;
  let totalManual = formattedCustom.length;

  for (const p of allProducts) {
    if (p.status === "hidden") {
      totalHidden++;
    } else {
      totalActive++;
    }
  }

  // Aplicação dos filtros
  const { query, category, status = "all", page = 1, limit = 25 } = options;

  let filtered = allProducts;

  if (status === "active") {
    filtered = filtered.filter((p) => p.status === "active");
  } else if (status === "hidden") {
    filtered = filtered.filter((p) => p.status === "hidden");
  } else if (status === "manual") {
    filtered = filtered.filter((p) => p.source === "manual");
  }

  if (category && category !== "all") {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.categoryLabel && p.categoryLabel.toLowerCase().includes(q))
    );
  }

  const total = filtered.length;
  const safeLimit = Math.max(1, Math.min(100, limit));
  const totalPages = Math.ceil(total / safeLimit) || 1;
  const safePage = Math.max(1, Math.min(page, totalPages));

  const startIndex = (safePage - 1) * safeLimit;
  const paginated = filtered.slice(startIndex, startIndex + safeLimit);

  return {
    products: paginated,
    total,
    page: safePage,
    totalPages,
    limit: safeLimit,
    stats: {
      totalActive,
      totalHidden,
      totalManual,
      totalCatalog: allProducts.length,
    },
  };
}

/**
 * Limpa caches em memória para testes unitários.
 */
export function _clearCatalogMemoryCacheForTesting(): void {
  inMemoryCustomProducts = null;
  inMemoryHiddenProducts = null;
}

/**
 * Redefine o estado de custom e hidden para vazio (útil para testes).
 */
export function resetCatalogForTesting(): void {
  saveHiddenProducts({});
  saveCustomProducts([]);
  _clearCatalogMemoryCacheForTesting();
}

