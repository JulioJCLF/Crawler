import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import type { Product, Snapshot, CategorySummary } from "./types.js";

export async function loadSnapshot(path: string): Promise<Snapshot | null> {
  try {
    const data = await readFile(path, "utf8");
    return JSON.parse(data) as Snapshot;
  } catch {
    return null;
  }
}

export async function saveSnapshot(path: string, snapshot: Snapshot): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(snapshot, null, 2));
}

export function applyChangeTracking(currentProducts: Product[], previousSnapshot: Snapshot | null, now: string) {
  const oldById = new Map<string, Product>();
  
  if (previousSnapshot) {
    for (const p of previousSnapshot.products) {
      oldById.set(p.id, p);
    }
  }

  for (const p of currentProducts) {
    const old = oldById.get(p.id);
    
    // Maintain firstSeen
    p.firstSeen = old?.firstSeen || now;
    
    // Preserve sku if already known
    p.sku = p.sku || old?.sku;
    
    // Initialize or copy price history
    p.priceHistory = old?.priceHistory || [];
    
    if (!old) {
      p.changeType = "new";
      p.priceChangedAt = now;
      if (p.price) {
        p.priceHistory.push({ date: now, price: p.price });
      }
      continue;
    }

    const precoAntes = old.price;
    const precoAgora = p.price;

    if (precoAntes === precoAgora) {
      // sem mudanca: preserva rastreamento anterior
      if (old.priceChangedAt) p.priceChangedAt = old.priceChangedAt;
      if (old.changeType) p.changeType = old.changeType;
      if (old.previousPrice) p.previousPrice = old.previousPrice;
    } else if (!precoAntes && precoAgora) {
      // voltou ao estoque ou ganhou preco
      p.changeType = "restock"; // ou "ganhou_preco"
      p.priceChangedAt = now;
      p.previousPrice = null;
      p.priceHistory.push({ date: now, price: precoAgora });
    } else if (precoAntes && !precoAgora) {
      // ficou sem preco (sob consulta / saiu)
      p.changeType = "sob_consulta";
      p.priceChangedAt = now;
      p.previousPrice = precoAntes;
      p.priceHistory.push({ date: now, price: null });
    } else {
      // preco mudou
      p.changeType = "price_change";
      p.priceChangedAt = now;
      p.previousPrice = precoAntes;
      p.priceHistory.push({ date: now, price: precoAgora });
    }
  }
}
