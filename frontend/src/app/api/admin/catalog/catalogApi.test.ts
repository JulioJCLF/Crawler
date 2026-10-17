import { describe, it, expect, vi } from "vitest";
import { GET as getCatalogProducts, POST as createCatalogProduct } from "./products/route";
import { POST as hideProductRoute } from "./hide/route";
import { POST as unhideProductRoute } from "./unhide/route";
import { POST as resetCacheRoute } from "./reset-cache/route";
import { NextRequest } from "next/server";

// Mock de autenticação
vi.mock("@/lib/auth", () => ({
  SESSION_COOKIE_NAME: "admin_session",
  verifySessionToken: vi.fn((token) => {
    if (token === "valid-admin-token") {
      return { username: "admin", role: "master" };
    }
    if (token === "valid-cambio-token") {
      return { username: "cambio", role: "dolar_operator" };
    }
    return null;
  }),
}));

// Mock do catalogService para isolar testes de API e evitar conflito de I/O em paralelo
vi.mock("@/lib/catalogService", () => ({
  getAdminCatalog: vi.fn().mockReturnValue({
    products: [
      { id: "101", name: "Rifle M4 Cyma", category: "replicas" },
      { id: "102", name: "BBs 0.25g Precision", category: "bbs" },
    ],
    total: 2,
    page: 1,
    totalPages: 1,
    limit: 30,
    stats: { totalActive: 2, totalHidden: 0, totalManual: 0, totalCatalog: 2 },
  }),
  createCustomProduct: vi.fn((input) => ({
    success: true,
    product: {
      id: "manual-99999",
      name: input.name,
      category: input.category,
      fixedBrlPrice: input.fixedBrlPrice,
      source: "manual",
      status: "active",
    },
  })),
  hideProduct: vi.fn(() => ({ success: true })),
  unhideProduct: vi.fn(() => ({ success: true })),
}));

// Mock do snapshot base e cache
vi.mock("@/lib/productsService", () => ({
  clearProductsCache: vi.fn().mockResolvedValue({
    count: 2,
    updatedAt: "2026-10-16T12:00:00.000Z",
  }),
  getBaseProductsSnapshot: vi.fn().mockResolvedValue({
    snapshot: {
      updatedAt: "2026-10-16T12:00:00.000Z",
      count: 2,
      categories: [],
      products: [],
    },
    source: "mock",
    cachedAt: Date.now(),
  }),
  invalidateProductsMemoryCache: vi.fn(),
}));

describe("Rotas de API - Gestão de Catálogo Administrativo", () => {
  it("rejeita acesso de usuário não autenticado com 401", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/catalog/products");
    const res = await getCatalogProducts(req);
    expect(res.status).toBe(401);
  });

  it("rejeita acesso do operador de dólar (dolar_operator) com 403 Forbidden", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/catalog/products", {
      headers: {
        cookie: "admin_session=valid-cambio-token",
      },
    });
    const res = await getCatalogProducts(req);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain("Apenas Administrador Master");
  });

  it("retorna lista de produtos e estatísticas para administrador master autenticado", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/catalog/products?status=all", {
      headers: {
        cookie: "admin_session=valid-admin-token",
      },
    });

    const res = await getCatalogProducts(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.products).toBeDefined();
    expect(data.total).toBe(2);
    expect(data.stats.totalCatalog).toBe(2);
    expect(data.stats.totalActive).toBe(2);
  });

  it("permite cadastrar produto manual via POST autenticado como master", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/catalog/products", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "admin_session=valid-admin-token",
      },
      body: JSON.stringify({
        name: "Pistola Exclusiva Airsoft",
        category: "replicas",
        fixedBrlPrice: 650.0,
      }),
    });

    const res = await createCatalogProduct(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.product.id).toMatch(/^manual-/);
    expect(data.product.name).toBe("Pistola Exclusiva Airsoft");
  });

  it("permite ocultar produto e depois restaurá-lo", async () => {
    // 1. Oculta produto 101
    const hideReq = new NextRequest("http://localhost:3000/api/admin/catalog/hide", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "admin_session=valid-admin-token",
      },
      body: JSON.stringify({
        id: "101",
        name: "Rifle M4 Cyma",
        reason: "Fora de linha",
      }),
    });

    const hideRes = await hideProductRoute(hideReq);
    expect(hideRes.status).toBe(200);

    // 2. Restaura produto 101
    const unhideReq = new NextRequest("http://localhost:3000/api/admin/catalog/unhide", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "admin_session=valid-admin-token",
      },
      body: JSON.stringify({ id: "101" }),
    });

    const unhideRes = await unhideProductRoute(unhideReq);
    expect(unhideRes.status).toBe(200);

    const unhideData = await unhideRes.json();
    expect(unhideData.success).toBe(true);
  });

  it("permite ao master resetar o cache do catálogo", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/catalog/reset-cache", {
      method: "POST",
      headers: {
        cookie: "admin_session=valid-admin-token",
      },
    });

    const res = await resetCacheRoute(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.count).toBe(2);
  });

  it("rejeita reset de cache para operador de dolar", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/catalog/reset-cache", {
      method: "POST",
      headers: {
        cookie: "admin_session=valid-cambio-token",
      },
    });

    const res = await resetCacheRoute(req);
    expect(res.status).toBe(403);
  });
});
