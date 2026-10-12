import { describe, it, expect } from "vitest";
import { buildActiveFilterChips, CLEARED_FILTER_STATE, FilterState } from "./activeFilters";

const emptyState: FilterState = {
  search: "",
  category: null,
  brand: null,
  weight: null,
  vestCategory: null,
  priceRange: null,
};

describe("buildActiveFilterChips", () => {
  it("retorna lista vazia quando nenhum filtro está ativo", () => {
    expect(buildActiveFilterChips(emptyState)).toEqual([]);
  });

  it("inclui um chip para cada filtro ativo, incluindo faixa de preço", () => {
    const chips = buildActiveFilterChips({
      search: "picatinny",
      category: "#aeg",
      brand: "KWA",
      weight: "0.28g",
      vestCategory: "holsters",
      priceRange: "150-500",
    });

    expect(chips.map((c) => c.key)).toEqual([
      "search",
      "category",
      "priceRange",
      "brand",
      "weight",
      "vestCategory",
    ]);
    expect(chips.find((c) => c.key === "priceRange")?.label).toBe("Preço: R$ 150 a R$ 500");
  });

  it("usa o rótulo legível da categoria, não o slug interno", () => {
    const chips = buildActiveFilterChips({ ...emptyState, category: "#aeg" });
    expect(chips[0].label).toBe("Rifles AEG");
  });

  it("usa o rótulo legível do tipo de vestuário, não a chave interna", () => {
    const chips = buildActiveFilterChips({ ...emptyState, vestCategory: "holsters" });
    expect(chips[0].label).toBe("Holsters");
  });
});

describe("CLEARED_FILTER_STATE", () => {
  it("zera busca, categoria, marca, peso, vestuário e faixa de preço", () => {
    expect(CLEARED_FILTER_STATE).toEqual(emptyState);
  });

  it("não tem campo de ordenação (RN2: limpar filtros não mexe em sortOrder)", () => {
    expect("sortOrder" in CLEARED_FILTER_STATE).toBe(false);
  });
});
