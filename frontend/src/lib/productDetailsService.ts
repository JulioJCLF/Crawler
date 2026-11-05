import fs from "fs";
import path from "path";
import { Product } from "@/types";
import { getProductsCatalog } from "@/lib/productsService";

export interface ExtractedProductDetails {
  description?: string;
  specs?: Record<string, string>;
  images?: string[];
  sku?: string;
}

const HTML_ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  aacute: "á",
  Aacute: "Á",
  agrave: "à",
  Agrave: "À",
  acirc: "â",
  Acirc: "Â",
  atilde: "ã",
  Atilde: "Ã",
  auml: "ä",
  Auml: "Ä",
  eacute: "é",
  Eacute: "É",
  egrave: "è",
  Egrave: "È",
  ecirc: "ê",
  Ecirc: "Ê",
  iacute: "í",
  Iacute: "Í",
  igrave: "ì",
  Igrave: "Ì",
  icirc: "î",
  Icirc: "Î",
  oacute: "ó",
  Oacute: "Ó",
  ograve: "ò",
  Ograve: "Ò",
  ocirc: "ô",
  Ocirc: "Ô",
  otilde: "õ",
  Otilde: "Õ",
  uacute: "ú",
  Uacute: "Ú",
  ugrave: "ù",
  Ugrave: "Ù",
  ucirc: "û",
  Ucirc: "Û",
  uuml: "ü",
  Uuml: "Ü",
  ccedil: "ç",
  Ccedil: "Ç",
  ntilde: "ñ",
  Ntilde: "Ñ",
  ordm: "º",
  ordf: "ª",
  deg: "°",
  ndash: "–",
  mdash: "—",
  ldquo: "“",
  rdquo: "”",
  lsquo: "‘",
  rsquo: "’",
  bull: "•",
  times: "×",
};

export function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&([a-zA-Z]+);/g, (full, name) => HTML_ENTITIES[name] ?? full);
}

export function sanitizeDetailText(rawHtmlOrText: string): string {
  const withoutTags = rawHtmlOrText
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  const decoded = decodeHtmlEntities(withoutTags);
  return decoded
    .replace(/https?:\/\/(?:www\.)?arsenalsports\.com[^\s)]*/gi, "")
    .replace(/\bArsenal\s+Sports\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseProductDetailsFromHtml(html: string): ExtractedProductDetails {
  const result: ExtractedProductDetails = {};

  // 1. Extract gallery images from <figure class="product-image">
  const images: string[] = [];
  const seenImages = new Set<string>();
  const figureRegex = /<figure\b[^>]*class="[^"]*\bproduct-image\b[^"]*"[^>]*>([\s\S]*?)<\/figure>/gi;
  let figMatch: RegExpExecArray | null;
  while ((figMatch = figureRegex.exec(html)) !== null) {
    const figContent = figMatch[1];
    const fancyboxMatch = figContent.match(/<a\b[^>]*class="[^"]*\bfancybox\b[^"]*"[^>]*href="([^"]+)"/i) ||
      figContent.match(/<a\b[^>]*href="([^"]+)"[^>]*class="[^"]*\bfancybox\b[^"]*"/i);
    const zoomMatch = figContent.match(/data-zoom-image="([^"]+)"/i);
    const srcMatch = figContent.match(/<img\b[^>]*src="([^"]+)"/i);

    let rawUrl = (fancyboxMatch?.[1] || zoomMatch?.[1] || srcMatch?.[1] || "").trim();
    if (!rawUrl) continue;
    if (!rawUrl.startsWith("http")) {
      rawUrl = `https://www.arsenalsports.com${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;
    }
    if (!seenImages.has(rawUrl)) {
      seenImages.add(rawUrl);
      images.push(rawUrl);
    }
  }
  if (images.length > 0) {
    result.images = images;
  }

  // 2. Extract structured description from #product-tab-description
  const descIdx = html.search(/id=["']product-tab-description["']/i);
  if (descIdx !== -1) {
    const afterDesc = html.slice(descIdx);
    const nextTabIdx = afterDesc.search(/id=["']product-tab-additional["']/i);
    const descSection = nextTabIdx !== -1 ? afterDesc.slice(0, nextTabIdx) : afterDesc.slice(0, 15000);

    const lines: string[] = [];
    const blockRegex = /<(p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi;
    let blockMatch: RegExpExecArray | null;
    while ((blockMatch = blockRegex.exec(descSection)) !== null) {
      const tag = blockMatch[1].toLowerCase();
      const text = sanitizeDetailText(blockMatch[2]);
      if (!text) continue;
      lines.push(tag === "li" ? `• ${text}` : text);
    }

    if (lines.length > 0) {
      result.description = lines.join("\n");
    }
  }

  // 3. Extract technical specifications from #product-tab-additional
  const addIdx = html.search(/id=["']product-tab-additional["']/i);
  if (addIdx !== -1) {
    const afterAdd = html.slice(addIdx);
    const tableEndIdx = afterAdd.search(/<\/table>/i);
    const tableSection = tableEndIdx !== -1 ? afterAdd.slice(0, tableEndIdx + 8) : afterAdd.slice(0, 15000);

    const specs: Record<string, string> = {};
    const seenKeys = new Set<string>();
    const rowRegex = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch: RegExpExecArray | null;
    while ((rowMatch = rowRegex.exec(tableSection)) !== null) {
      const rowContent = rowMatch[1];
      const thMatch = rowContent.match(/<th\b[^>]*>([\s\S]*?)<\/th>/i);
      const tdMatch = rowContent.match(/<td\b[^>]*>([\s\S]*?)<\/td>/i);
      if (!thMatch || !tdMatch) continue;

      const key = sanitizeDetailText(thMatch[1]);
      const val = sanitizeDetailText(tdMatch[1]);
      if (!key || !val) continue;

      const normKey = key.toLowerCase();
      if (seenKeys.has(normKey)) continue;
      seenKeys.add(normKey);

      specs[key] = val;
      if (normKey === "sku" && !result.sku) {
        result.sku = val;
      }
    }

    if (Object.keys(specs).length > 0) {
      result.specs = specs;
    }
  }

  return result;
}

// Persistent & In-Memory Cache for On-Demand Enriched Product Details
let inMemoryDetailsCache: Record<string, ExtractedProductDetails> | null = null;

function getDetailsCacheFilePath(): string {
  const dataDir = process.env.RAILWAY_VOLUME_MOUNT_PATH || process.env.DATA_DIR || path.join(process.cwd(), "data");
  return path.join(dataDir, "product-details-cache.json");
}

function loadDetailsCache(): Record<string, ExtractedProductDetails> {
  if (inMemoryDetailsCache) return inMemoryDetailsCache;
  try {
    const file = getDetailsCacheFilePath();
    if (fs.existsSync(file)) {
      inMemoryDetailsCache = JSON.parse(fs.readFileSync(file, "utf8"));
      return inMemoryDetailsCache!;
    }
  } catch {
    // Ignore read error
  }
  inMemoryDetailsCache = {};
  return inMemoryDetailsCache;
}

function saveDetailsToCache(productId: string, details: ExtractedProductDetails): void {
  const cache = loadDetailsCache();
  cache[productId] = details;
  try {
    const file = getDetailsCacheFilePath();
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(file, JSON.stringify(cache, null, 2), "utf8");
  } catch {
    // Ignore write error in read-only environments
  }
}

export async function getEnrichedProductById(idOrSku: string): Promise<Product | null> {
  const { snapshot } = await getProductsCatalog();
  const product =
    snapshot.products.find((p: Product) => p.id === idOrSku) ||
    snapshot.products.find((p: Product) => p.sku === idOrSku);

  if (!product) return null;

  const enriched: Product = { ...product };

  // 1. Check if product already has details from snapshot.json
  const hasSnapshotDetails = Boolean(
    enriched.description ||
      (enriched.specs && Object.keys(enriched.specs).length > 0) ||
      (enriched.images && enriched.images.length > 0)
  );

  if (hasSnapshotDetails) {
    if (!enriched.images || enriched.images.length === 0) {
      enriched.images = enriched.image ? [enriched.image] : [];
    }
    return enriched;
  }

  // 2. Check persistent details cache
  const cache = loadDetailsCache();
  const cached = cache[enriched.id];
  if (cached) {
    if (cached.description) enriched.description = cached.description;
    if (cached.specs) enriched.specs = cached.specs;
    if (cached.images && cached.images.length > 0) {
      enriched.images = cached.images;
    } else if (enriched.image) {
      enriched.images = [enriched.image];
    }
    if (!enriched.sku && cached.sku) enriched.sku = cached.sku;
    return enriched;
  }

  // 3. On-demand extraction from product.url if it points to the origin product page
  if (enriched.url && /^https?:\/\/(?:www\.)?arsenalsports\.com\/produto\//i.test(enriched.url)) {
    try {
      const response = await fetch(enriched.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; HuntingWorldCatalog/1.0)",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(7000),
      });
      if (response.ok) {
        const html = await response.text();
        const extracted = parseProductDetailsFromHtml(html);
        if (
          extracted.description ||
          (extracted.specs && Object.keys(extracted.specs).length > 0) ||
          (extracted.images && extracted.images.length > 0)
        ) {
          saveDetailsToCache(enriched.id, extracted);
          if (extracted.description) enriched.description = extracted.description;
          if (extracted.specs) enriched.specs = extracted.specs;
          if (extracted.images && extracted.images.length > 0) {
            enriched.images = extracted.images;
          }
          if (!enriched.sku && extracted.sku) enriched.sku = extracted.sku;
        }
      }
    } catch (err) {
      console.warn(`[productDetailsService] Falha ao buscar detalhes sob demanda para ${enriched.id}:`, err);
    }
  }

  if (!enriched.images || enriched.images.length === 0) {
    enriched.images = enriched.image ? [enriched.image] : [];
  }

  return enriched;
}
