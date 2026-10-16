import { describe, it, expect, beforeEach, afterAll } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import {
  createCustomProduct,
  updateCustomProduct,
  deleteCustomProduct,
  hideProduct,
  unhideProduct,
  getHiddenProducts,
  getCustomProducts,
  buildUnifiedSnapshot,
  getAdminCatalog,
  resetCatalogForTesting,
  setDataDirForTesting,
} from "./catalogService";
import { Snapshot, Product } from "@/types";

const TEST_DATA_DIR = path.join(
  os.tmpdir(),
  `crawler-catalog-test-${process.pid}-${Date.now()}`
);

const mockSnapshot: Snapshot = {
  updatedAt: "2026-10-16T12:00:00.000Z",
  count: 3,
  categories: [
    { slug: "replicas", label: "Réplicas", count: 2 },
    { slug: "magazines", label: "Magazines", count: 1 },
  ],
  products: [
    {
      id: "101",
      name: "Rifle M4 Cyma AEG",
      url: "https://arsenalsports.com/item/101",
      price: "USD 180,00",
      image: "https://arsenalsports.com/img/101.jpg",
      category: "replicas",
      categoryLabel: "Réplicas",
    },
    {
      id: "102",
      name: "Pistola Glock G17 GBB",
      url: "https://arsenalsports.com/item/102",
      price: "USD 120,00",
      image: "https://arsenalsports.com/img/102.jpg",
      category: "replicas",
      categoryLabel: "Réplicas",
    },
    {
      id: "103",
      name: "Magazine Mid-Cap 140 BBs",
      url: "https://arsenalsports.com/item/103",
      price: "USD 15,00",
      image: "https://arsenalsports.com/img/103.jpg",
      category: "magazines",
      categoryLabel: "Magazines",
    },
  ],
};

describe("catalogService - Gestão visual de produtos e Catálogo Híbrido", () => {
  beforeEach(() => {
    setDataDirForTesting(TEST_DATA_DIR);
    resetCatalogForTesting();
  });

  afterAll(() => {
    resetCatalogForTesting();
    setDataDirForTesting(null);
    try {
      fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
    } catch {
      // Ignora erro de limpeza
    }
  });

  it("cria um novo produto manual com ID único e salva com sucesso", () => {
    const res = createCustomProduct({
      name: "Rifle Exclusivo Hunting World",
      category: "replicas",
      price: "USD 250.00",
      fixedBrlPrice: 1699.9,
      image: "https://exemplo.com/rifle.jpg",
    });

    expect(res.success).toBe(true);
    expect(res.product).toBeDefined();
    expect(res.product?.id).toMatch(/^manual-/);
    expect(res.product?.name).toBe("Rifle Exclusivo Hunting World");
    expect(res.product?.categoryLabel).toBe("Réplicas");
    expect(res.product?.source).toBe("manual");
    expect(res.product?.fixedBrlPrice).toBe(1699.9);

    const custom = getCustomProducts();
    expect(custom.length).toBe(1);
    expect(custom[0].id).toBe(res.product?.id);
  });

  it("rejeita produto sem nome ou sem preço", () => {
    const noName = createCustomProduct({
      name: "",
      category: "replicas",
      price: "USD 100",
    });
    expect(noName.success).toBe(false);
    expect(noName.error).toContain("nome do produto é obrigatório");

    const noPrice = createCustomProduct({
      name: "Item Teste",
      category: "replicas",
    });
    expect(noPrice.success).toBe(false);
    expect(noPrice.error).toContain("Informe ao menos um valor");
  });

  it("oculta produto da vitrine e permite restaurá-lo", () => {
    const hideRes = hideProduct("101", "Rifle M4 Cyma AEG", "Fora de estoque");
    expect(hideRes.success).toBe(true);

    let hidden = getHiddenProducts();
    expect(hidden["101"]).toBeDefined();
    expect(hidden["101"].name).toBe("Rifle M4 Cyma AEG");
    expect(hidden["101"].reason).toBe("Fora de estoque");

    // Restaura
    const unhideRes = unhideProduct("101");
    expect(unhideRes.success).toBe(true);

    hidden = getHiddenProducts();
    expect(hidden["101"]).toBeUndefined();
  });

  it("buildUnifiedSnapshot remove ocultados e injeta manuais atualizando contagens", () => {
    // 1. Cadastra manual
    const createRes = createCustomProduct({
      name: "BBs Biodegradáveis 0.28g Hunting",
      category: "bbs",
      fixedBrlPrice: 120.0,
    });
    expect(createRes.success).toBe(true);

    // 2. Oculta o item 102 da réplica
    hideProduct("102", "Pistola Glock G17 GBB");

    const unified = buildUnifiedSnapshot(mockSnapshot);

    // Itens esperados:
    // - 1 manual (bbs)
    // - 101 (replicas)
    // - 103 (magazines)
    // 102 deve ter sido excluído!
    expect(unified.count).toBe(3);
    const ids = unified.products.map((p) => p.id);
    expect(ids).toContain(createRes.product!.id);
    expect(ids).toContain("101");
    expect(ids).toContain("103");
    expect(ids).not.toContain("102");

    // Verifica contagem por categoria
    const replicasCat = unified.categories.find((c) => c.slug === "replicas");
    expect(replicasCat?.count).toBe(1); // 101 ativo, 102 ocultado

    const bbsCat = unified.categories.find((c) => c.slug === "bbs");
    expect(bbsCat).toBeDefined();
    expect(bbsCat?.count).toBe(1);
  });

  it("permite atualizar e excluir produtos manuais", () => {
    const created = createCustomProduct({
      name: "Item Original",
      category: "magazines",
      price: "USD 20.00",
    }).product!;

    // Atualiza nome e preço
    const updated = updateCustomProduct(created.id, {
      name: "Item Nome Novo",
      fixedBrlPrice: 150.0,
    });
    expect(updated.success).toBe(true);
    expect(updated.product?.name).toBe("Item Nome Novo");
    expect(updated.product?.fixedBrlPrice).toBe(150.0);

    // Exclui
    const deleted = deleteCustomProduct(created.id);
    expect(deleted.success).toBe(true);
    expect(getCustomProducts().length).toBe(0);
  });

  it("getAdminCatalog retorna métricas precisas e suporta filtros de status e busca", () => {
    createCustomProduct({
      name: "Produto Manual Especial",
      category: "replicas",
      fixedBrlPrice: 990.0,
    });

    hideProduct("103", "Magazine Mid-Cap 140 BBs", "Item com defeito");

    const adminCatalog = getAdminCatalog(mockSnapshot, { status: "all" });

    // Total: 3 do mockSnapshot + 1 manual = 4
    expect(adminCatalog.stats.totalCatalog).toBe(4);
    expect(adminCatalog.stats.totalManual).toBe(1);
    expect(adminCatalog.stats.totalHidden).toBe(1);
    expect(adminCatalog.stats.totalActive).toBe(3);

    // Filtra só ocultos
    const onlyHidden = getAdminCatalog(mockSnapshot, { status: "hidden" });
    expect(onlyHidden.products.length).toBe(1);
    expect(onlyHidden.products[0].id).toBe("103");

    // Filtra por busca de nome
    const searchRes = getAdminCatalog(mockSnapshot, { query: "Especial" });
    expect(searchRes.products.length).toBe(1);
    expect(searchRes.products[0].name).toBe("Produto Manual Especial");
  });
});
