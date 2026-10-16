import fs from "fs";
import path from "path";
import { Snapshot } from "@/types";
import { buildUnifiedSnapshot } from "./catalogService";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const CACHE_FILE = path.join(DATA_DIR, "snapshot-cache.json");

// Caminhos locais alternativos para leitura offline (desenvolvimento / contêiner)
const LOCAL_BACKEND_SNAPSHOT = path.join(process.cwd(), "..", "backend", "snapshot.json");
const LOCAL_FRONTEND_SNAPSHOT = path.join(process.cwd(), "snapshot.json");

const GITHUB_RAW_SNAPSHOT_URL =
  process.env.SNAPSHOT_SOURCE_URL ||
  "https://raw.githubusercontent.com/JulioJCLF/crawler/main/backend/snapshot.json";

// Tempo de vida do cache em memória: 30 minutos (1800 segundos)
const CACHE_TTL_MS = 30 * 60 * 1000;

interface CacheState {
  data: Snapshot | null;
  fetchedAt: number;
  source: "memory" | "disk" | "local-file" | "github";
}

let inMemoryCache: CacheState = {
  data: null,
  fetchedAt: 0,
  source: "memory",
};

function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
    } catch {
      // Ignora se não puder criar
    }
  }
}

/**
 * Tenta ler o snapshot salvo em disco (cache prévio ou arquivo local).
 */
function readFromDiskCache(): Snapshot | null {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("[productsService] Erro ao ler CACHE_FILE:", err);
  }

  // Tenta ler do snapshot local do backend se disponível
  try {
    if (fs.existsSync(LOCAL_BACKEND_SNAPSHOT)) {
      const raw = fs.readFileSync(LOCAL_BACKEND_SNAPSHOT, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.products)) {
        return parsed;
      }
    }
  } catch {
    // Ignora
  }

  // Tenta snapshot local do frontend
  try {
    if (fs.existsSync(LOCAL_FRONTEND_SNAPSHOT)) {
      const raw = fs.readFileSync(LOCAL_FRONTEND_SNAPSHOT, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.products)) {
        return parsed;
      }
    }
  } catch {
    // Ignora
  }

  return null;
}

/**
 * Salva o snapshot em disco de forma atômica no volume/data.
 */
function saveToDiskCache(data: Snapshot): void {
  try {
    ensureDirectoryExists(DATA_DIR);
    const tempPath = `${CACHE_FILE}.${Date.now()}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data), "utf-8");
    fs.renameSync(tempPath, CACHE_FILE);
  } catch (err) {
    console.warn("[productsService] Falha ao persistir snapshot no disco:", err);
  }
}

/**
 * Busca o snapshot mais recente do GitHub Raw com timeout.
 */
async function fetchFromRemote(timeoutMs: number = 8000): Promise<Snapshot | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(GITHUB_RAW_SNAPSHOT_URL, {
      signal: controller.signal,
      headers: {
        "Accept": "application/json",
        "User-Agent": "HuntingWorld-Catalogue-Server/1.0",
      },
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      console.warn(`[productsService] GitHub Raw respondeu com status ${res.status}`);
      return null;
    }

    const json = await res.json();
    if (json && Array.isArray(json.products) && json.products.length > 0) {
      return json as Snapshot;
    }
    return null;
  } catch (err: any) {
    if (err.name === "AbortError") {
      console.warn("[productsService] Timeout ao buscar snapshot do GitHub Raw.");
    } else {
      console.warn("[productsService] Erro ao conectar com GitHub Raw:", err.message);
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
/**
 * Obtém o snapshot base bruto (do crawler / GitHub / disco).
 */
export async function getBaseProductsSnapshot(forceRefresh: boolean = false): Promise<{
  snapshot: Snapshot;
  source: string;
  cachedAt: number;
}> {
  const now = Date.now();
  const isMemoryValid =
    !forceRefresh &&
    inMemoryCache.data !== null &&
    now - inMemoryCache.fetchedAt < CACHE_TTL_MS;

  if (isMemoryValid && inMemoryCache.data) {
    return {
      snapshot: inMemoryCache.data,
      source: "memory",
      cachedAt: inMemoryCache.fetchedAt,
    };
  }

  // Tenta buscar da fonte remota (GitHub)
  const remoteData = await fetchFromRemote();
  if (remoteData) {
    inMemoryCache = {
      data: remoteData,
      fetchedAt: now,
      source: "github",
    };
    saveToDiskCache(remoteData);
    return {
      snapshot: remoteData,
      source: "github",
      cachedAt: now,
    };
  }

  // Fallback: se remoto falhar, tenta usar o que está no cache em memória (mesmo antigo)
  if (inMemoryCache.data) {
    return {
      snapshot: inMemoryCache.data,
      source: "stale-memory",
      cachedAt: inMemoryCache.fetchedAt,
    };
  }

  // Fallback 2: tenta carregar do disco/volume persistente
  const diskData = readFromDiskCache();
  if (diskData) {
    inMemoryCache = {
      data: diskData,
      fetchedAt: now,
      source: "disk",
    };
    return {
      snapshot: diskData,
      source: "disk",
      cachedAt: now,
    };
  }

  // Fallback 3: snapshot mínimo de emergência
  const fallbackEmpty: Snapshot = {
    updatedAt: new Date().toISOString(),
    count: 0,
    categories: [],
    products: [],
  };

  return {
    snapshot: fallbackEmpty,
    source: "empty-fallback",
    cachedAt: now,
  };
}

/**
 * Retorna o catálogo unificado de produtos (híbrido):
 * Snapshot base filtrado com remoção dos produtos ocultos e adição dos manuais.
 */
export async function getProductsCatalog(forceRefresh: boolean = false): Promise<{
  snapshot: Snapshot;
  source: string;
  cachedAt: number;
}> {
  const base = await getBaseProductsSnapshot(forceRefresh);
  const unified = buildUnifiedSnapshot(base.snapshot);

  return {
    snapshot: unified,
    source: base.source,
    cachedAt: base.cachedAt,
  };
}

/** Invalida o cache em memória para forçar releitura */
export function invalidateProductsMemoryCache(): void {
  inMemoryCache = {
    data: null,
    fetchedAt: 0,
    source: "memory",
  };
}

/** Limpa cache de memória (usado para testes unitários) */
export function _clearProductsMemoryCacheForTesting(): void {
  inMemoryCache = {
    data: null,
    fetchedAt: 0,
    source: "memory",
  };
}

/** Define cache de memória mockado para testes */
export function _setProductsMemoryCacheForTesting(data: Snapshot): void {
  inMemoryCache = {
    data,
    fetchedAt: Date.now(),
    source: "memory",
  };
}

