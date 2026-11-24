import { describe, it, expect, beforeEach } from "vitest";
import {
  CatalogState,
  DEFAULT_CATALOG_STATE,
  serializeCatalogState,
  parseCatalogState,
  saveCatalogStateToStorage,
  loadCatalogStateFromStorage,
  clearCatalogStateFromStorage,
  saveCatalogScroll,
  getAndClearCatalogScroll,
} from "./catalogState";

describe("catalogState utils", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe("serializeCatalogState", () => {
    it("retorna string vazia para o estado padrão (página 1, sem filtros)", () => {
      expect(serializeCatalogState(DEFAULT_CATALOG_STATE)).toBe("");
    });

    it("serializa página maior que 1 e busca", () => {
      const state: CatalogState = {
        ...DEFAULT_CATALOG_STATE,
        page: 3,
        search: "m4 aeg",
      };
      const qs = serializeCatalogState(state);
      expect(qs).toBe("?page=3&q=m4+aeg");
    });

    it("serializa múltiplos filtros combinados", () => {
      const state: CatalogState = {
        page: 2,
        search: "sniper",
        category: "#sniper",
        weight: "0.36g",
        vestCategory: "vests",
        brand: "Tokyo Marui",
        priceRange: "1000-2000",
        sortOrder: "price_asc",
      };
      const qs = serializeCatalogState(state);
      expect(qs).toContain("page=2");
      expect(qs).toContain("q=sniper");
      expect(qs).toContain("cat=%23sniper");
      expect(qs).toContain("weight=0.36g");
      expect(qs).toContain("vest=vests");
      expect(qs).toContain("brand=Tokyo+Marui");
      expect(qs).toContain("price=1000-2000");
      expect(qs).toContain("sort=price_asc");
    });

    it("não inclui sortOrder se for 'recent' (padrão)", () => {
      const state: CatalogState = {
        ...DEFAULT_CATALOG_STATE,
        sortOrder: "recent",
        category: "#aeg",
      };
      const qs = serializeCatalogState(state);
      expect(qs).toBe("?cat=%23aeg");
      expect(qs).not.toContain("sort=");
    });
  });

  describe("parseCatalogState", () => {
    it("retorna objeto vazio para query string vazia", () => {
      expect(parseCatalogState("")).toEqual({});
      expect(parseCatalogState("?")).toEqual({});
    });

    it("faz o parse de parâmetros válidos", () => {
      const qs = "?page=4&q=glock&cat=%23gbb&brand=WE&sort=price_desc&price=500-1000";
      const parsed = parseCatalogState(qs);

      expect(parsed).toEqual({
        page: 4,
        search: "glock",
        category: "#gbb",
        brand: "WE",
        sortOrder: "price_desc",
        priceRange: "500-1000",
      });
    });

    it("ignora página inválida (negativa ou não numérica)", () => {
      expect(parseCatalogState("?page=abc")).toEqual({});
      expect(parseCatalogState("?page=-5")).toEqual({});
      expect(parseCatalogState("?page=0")).toEqual({});
    });
  });

  describe("sessionStorage storage functions", () => {
    it("salva e recupera o estado completo no sessionStorage", () => {
      const state: CatalogState = {
        page: 3,
        search: "rifle",
        category: "#aeg",
        weight: null,
        vestCategory: null,
        brand: "Krytac",
        priceRange: null,
        sortOrder: "asc",
      };

      saveCatalogStateToStorage(state);
      const loaded = loadCatalogStateFromStorage();
      expect(loaded).toEqual(state);

      clearCatalogStateFromStorage();
      expect(loadCatalogStateFromStorage()).toBeNull();
    });

    it("salva, lê e limpa a posição de scroll", () => {
      saveCatalogScroll(1250);
      expect(getAndClearCatalogScroll()).toBe(1250);
      // Após ler, deve ter sido limpo
      expect(getAndClearCatalogScroll()).toBeNull();
    });
  });
});
