import { CheerioCrawler, log } from 'crawlee';
import { CATEGORIES, MAX_PAGES, PAGE_PARAM, isValidProduct, cleanProductName, enforceCategory, CATEGORY_WEIGHTS, extractSku, resolveCategoryLabel } from './config.js';
import type { Product, Snapshot } from './types.js';

export interface ExtractedProductDetails {
  description?: string;
  specs?: Record<string, string>;
  images?: string[];
  sku?: string;
}

function sanitizeDetailText(text: string): string {
  return text
    .replace(/https?:\/\/(?:www\.)?arsenalsports\.com[^\s)]*/gi, '')
    .replace(/\bArsenal\s+Sports\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractProductDetails($: any): ExtractedProductDetails {
  const result: ExtractedProductDetails = {};

  // 1. Extract gallery images (1 best-resolution URL per figure.product-image)
  const images: string[] = [];
  const seenImages = new Set<string>();
  $('figure.product-image').each((_: number, fig: unknown) => {
    let rawUrl =
      $(fig).find('a.fancybox').attr('href') ||
      $(fig).find('img').attr('data-zoom-image') ||
      $(fig).find('img').attr('src') ||
      '';
    rawUrl = rawUrl.trim();
    if (!rawUrl) return;
    if (!rawUrl.startsWith('http')) {
      rawUrl = `https://www.arsenalsports.com${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
    }
    if (!seenImages.has(rawUrl)) {
      seenImages.add(rawUrl);
      images.push(rawUrl);
    }
  });
  if (images.length > 0) {
    result.images = images;
  }

  // 2. Extract structured description from #product-tab-description
  const descContainer = $('#product-tab-description');
  if (descContainer.length > 0) {
    const lines: string[] = [];
    const blocks = descContainer.find('p, li');
    if (blocks.length > 0) {
      blocks.each((_: number, el: unknown) => {
        const tag = (el as { tagName?: string }).tagName?.toLowerCase();
        const text = sanitizeDetailText($(el).text());
        if (!text) return;
        lines.push(tag === 'li' ? `• ${text}` : text);
      });
    } else {
      const fallbackText = sanitizeDetailText(descContainer.text());
      if (fallbackText) lines.push(fallbackText);
    }
    if (lines.length > 0) {
      result.description = lines.join('\n');
    }
  }

  // 3. Extract technical specifications from #product-tab-additional
  const specs: Record<string, string> = {};
  const seenSpecKeys = new Set<string>();
  $('#product-tab-additional table tr').each((_: number, tr: unknown) => {
    const rawKey = sanitizeDetailText($(tr).find('th').first().text());
    const rawVal = sanitizeDetailText($(tr).find('td').first().text());
    if (!rawKey || !rawVal) return;

    const normalizedKey = rawKey.toLowerCase();
    if (seenSpecKeys.has(normalizedKey)) return;
    seenSpecKeys.add(normalizedKey);

    specs[rawKey] = rawVal;
    if (normalizedKey === 'sku' && !result.sku) {
      result.sku = rawVal;
    }
  });
  if (Object.keys(specs).length > 0) {
    result.specs = specs;
  }

  return result;
}

export interface RunCrawlerOptions {
  previousSnapshot?: Snapshot | null;
  maxDetailPages?: number;
}

export async function runCrawler(options: RunCrawlerOptions = {}): Promise<Product[]> {
  const productsMap = new Map<string, Product>();
  const maxDetailPages = options.maxDetailPages ?? Number(process.env.MAX_DETAIL_PAGES ?? 50);
  const oldById = new Map<string, Product>();
  if (options.previousSnapshot) {
    for (const p of options.previousSnapshot.products) {
      oldById.set(p.id, p);
    }
  }

  const crawler = new CheerioCrawler({
    minConcurrency: 2,
    maxConcurrency: 10,
    maxRequestRetries: 3,
    requestHandlerTimeoutSecs: 30,
    
    async requestHandler({ $, request, log }) {
      if (request.userData.type === 'DETAIL') {
        const productId = request.userData.productId as string;
        const product = productsMap.get(productId);
        if (!product) return;

        const details = extractProductDetails($);
        if (details.description) product.description = details.description;
        if (details.specs) product.specs = details.specs;
        if (details.images && details.images.length > 0) {
          product.images = details.images;
          if (!product.image) product.image = details.images[0];
        }
        if (!product.sku && details.sku) {
          product.sku = details.sku;
        }
        return;
      }

      const originalCatSlug = request.userData.catSlug as string;
      const catLabel = request.userData.catLabel as string;
      const currentPage = request.userData.page as number;
      const baseUrl = request.userData.baseUrl as string;

      let foundOnPage = 0;
      let validOnPage = 0;

      $('a[href*="/produto/"]').each((_, el) => {
        const href = $(el).attr("href") || "";
        const m = href.match(/\/produto\/.*?-(\d+)\.html/);
        if (!m) return;
        const id = m[1];
        
        foundOnPage++;

        const card = $(el).closest(".product, .product-wrap, div, li, article");
        const sku = extractSku(card.text()) || extractSku($(el).text());

        const rawTitle = ($(el).attr("title") || $(el).text() || "").trim().replace(/\s+/g, " ");
        if (!rawTitle) return;

        // Apply our filter to exclude useless items
        if (!isValidProduct(rawTitle)) {
          return;
        }

        const title = cleanProductName(rawTitle);
        if (!title) return;

        const { categorySlug: enforcedCatSlug, weight: newWeight } = enforceCategory(title, originalCatSlug);
        const enforcedCatLabel = resolveCategoryLabel(enforcedCatSlug);
        validOnPage++;

        // If product already found, check if new category has higher priority
        if (productsMap.has(id)) {
          const existing = productsMap.get(id)!;
          if (!existing.sku && sku) {
            existing.sku = sku;
          }
          // We can't know the exact weight it was originally stored with unless we recalculate it or store it, 
          // but we can just use the config weight as a fallback, or better, we can re-evaluate it.
          // Wait, since we are doing dynamic weights, we should probably evaluate existing again?
          // No, let's just use the default CATEGORY_WEIGHTS as the base, unless the newWeight is > that.
          // Since existing might have been a forced gun (100) or just a regular part.
          // Let's re-run enforceCategory on the existing name just to be safe, or simply use `enforceCategory(existing.name, existing.category).weight`.
          const { weight: existingWeight } = enforceCategory(existing.name, existing.category);
          
          if (newWeight > existingWeight) {
            existing.category = enforcedCatSlug;
            existing.categoryLabel = enforcedCatLabel;
          }
          return;
        }

        const priceMatch = card.text().match(/USD\s*([\d.,]+)/);

        let img =
          card.find('img[src*="/produtos/"]').first().attr("src") ||
          $(el).find("img").first().attr("src") ||
          null;
        
        if (img && !img.startsWith("http")) {
          img = `https://www.arsenalsports.com${img}`;
        }

        productsMap.set(id, {
          id,
          sku,
          name: title,
          url: href.startsWith("http") ? href : `https://www.arsenalsports.com${href}`,
          price: priceMatch ? `USD ${priceMatch[1]}` : null,
          image: img,
          category: enforcedCatSlug,
          categoryLabel: enforcedCatLabel,
        });
      });

      log.info(`[${originalCatSlug}] page ${currentPage}: found ${foundOnPage} items, ${validOnPage} valid.`);

      // Pagination
      if (foundOnPage > 0 && currentPage < MAX_PAGES) {
        const nextPage = currentPage + 1;
        const sep = baseUrl.includes("?") ? "&" : "?";
        const nextUrl = `${baseUrl}${sep}${PAGE_PARAM}=${nextPage}`;
        
        await crawler.addRequests([{
          url: nextUrl,
          userData: { ...request.userData, page: nextPage }
        }]);
      }
    },
    
    failedRequestHandler({ request, log }) {
      log.error(`Request ${request.url} failed too many times.`);
    }
  });

  // Prepare initial requests (Page 1 of each category)
  const initialRequests = CATEGORIES.map(cat => ({
    url: cat.url,
    userData: {
      catSlug: cat.slug,
      catLabel: cat.label,
      baseUrl: cat.url,
      page: 1
    }
  }));

  log.info(`Starting crawl for ${initialRequests.length} categories...`);
  await crawler.run(initialRequests);
  log.info(`Crawl finished. Extracted ${productsMap.size} unique products.`);

  if (maxDetailPages > 0) {
    const candidates = [...productsMap.values()]
      .filter((p) => {
        const old = oldById.get(p.id);
        return !(old?.description && old?.specs && Object.keys(old.specs).length > 0);
      })
      .sort((a, b) => {
        const aHasPrice = a.price ? 1 : 0;
        const bHasPrice = b.price ? 1 : 0;
        if (aHasPrice !== bHasPrice) return bHasPrice - aHasPrice;
        const aIsReplica = a.category === 'replicas' ? 1 : 0;
        const bIsReplica = b.category === 'replicas' ? 1 : 0;
        return bIsReplica - aIsReplica;
      })
      .slice(0, maxDetailPages);

    if (candidates.length > 0) {
      log.info(`Enriching detail pages for ${candidates.length} products (maxDetailPages=${maxDetailPages})...`);
      await crawler.run(
        candidates.map((p) => ({
          url: p.url,
          uniqueKey: `detail:${p.id}`,
          userData: {
            type: 'DETAIL',
            productId: p.id,
          },
        }))
      );
    }
  }

  return [...productsMap.values()];
}
