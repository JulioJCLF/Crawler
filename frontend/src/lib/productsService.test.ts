import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getProductsCatalog,
  _clearProductsMemoryCacheForTesting,
  _setProductsMemoryCacheForTesting,
} from "./productsService";
import { Snapshot } from "@/types";

const mockSnapshot: Snapshot = {
  updatedAt: "2026-10-12T00:00:00.000Z",
  count: 2,
  categories: [
    { slug: "replicas", label: "Réplicas", count: 1 },
    { slug: "bbs", label: "BBs", count: 1 },
  ],
  products: [
    {
      id: "1",
      name: "Rifle Airsoft M4",
      url: "https://example.com/1",
      price: "USD 200,00",
      image: null,
      category: "replicas",
      categoryLabel: "Réplicas",
    },
    {
      id: "2",
      name: "BBs 0.20g",
      url: "https://example.com/2",
      price: "USD 15,00",
      image: null,
      category: "bbs",
      categoryLabel: "BBs",
    },
  ],
};

describe("productsService - Cache server-side de produtos", () => {
  beforeEach(() => {
    _clearProductsMemoryCacheForTesting();
    vi.restoreAllMocks();
  });

  it("retorna dados diretamente do cache em memória quando válido", async () => {
    _setProductsMemoryCacheForTesting(mockSnapshot);

    const result = await getProductsCatalog(false);
    expect(result.source).toBe("memory");
    expect(result.snapshot.count).toBe(2);
    expect(result.snapshot.products[0].name).toBe("Rifle Airsoft M4");
  });

  it("busca remotamente quando cache está vazio e atualiza a memória", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSnapshot,
    } as any);

    const result = await getProductsCatalog(false);
    expect(result.source).toBe("github");
    expect(result.snapshot.count).toBe(2);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Próxima chamada deve vir da memória (sem novo fetch)
    const secondCall = await getProductsCatalog(false);
    expect(secondCall.source).toBe("memory");
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("força atualização quando forceRefresh for true", async () => {
    _setProductsMemoryCacheForTesting(mockSnapshot);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ...mockSnapshot,
        count: 5,
      }),
    } as any);

    const result = await getProductsCatalog(true);
    expect(result.source).toBe("github");
    expect(result.snapshot.count).toBe(5);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("utiliza cache antigo (stale) se busca remota falhar", async () => {
    _setProductsMemoryCacheForTesting(mockSnapshot);

    // Mock falha no fetch
    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error"));

    const result = await getProductsCatalog(true);
    expect(result.source).toBe("stale-memory");
    expect(result.snapshot.count).toBe(2);
  });
});
