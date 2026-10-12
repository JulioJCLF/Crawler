import { describe, it, expect } from "vitest";
import {
  normalizeText,
  preprocessSearchTokens,
  matchesSmartSearch,
  matchesPriceRange,
  PRICE_RANGES,
} from "./searchUtils";

describe("searchUtils - Busca Inteligente e Normalização", () => {
  it("normaliza textos removendo acentos e convertendo para minúsculas", () => {
    expect(normalizeText("Peças & Ópticos")).toBe("pecas & opticos");
    expect(normalizeText("MUNIÇÃO DE AIRSOFT")).toBe("municao de airsoft");
    expect(normalizeText("")).toBe("");
    expect(normalizeText(null)).toBe("");
  });

  it("corrige erros e sinônimos frequentes de digitação", () => {
    expect(preprocessSearchTokens("glok")).toEqual(["glock"]);
    expect(preprocessSearchTokens("m-4")).toEqual(["m4"]);
    expect(preprocessSearchTokens("hopup")).toEqual(["hop", "up"]);
    expect(preprocessSearchTokens("red-dot")).toEqual(["red", "dot"]);
  });

  it("encontra produtos independentemente da ordem das palavras (multi-termo)", () => {
    const title = "CYMA AIRSOFT M4 CARBINE AEG RIFLE BLACK";
    expect(matchesSmartSearch(title, "m4 carbine")).toBe(true);
    expect(matchesSmartSearch(title, "carbine m4")).toBe(true);
    expect(matchesSmartSearch(title, "black aeg cyma")).toBe(true);
  });

  it("encontra produtos mesmo com acentuação divergente", () => {
    const title = "MIRA OPTICA RED DOT HOLOGRAFICA";
    expect(matchesSmartSearch(title, "óptica")).toBe(true);
    expect(matchesSmartSearch(title, "optica")).toBe(true);
    expect(matchesSmartSearch(title, "holográfica")).toBe(true);
  });

  it("encontra termos com sinônimos/erros comuns", () => {
    const title = "WE GLOCK 17 GEN 4 GBB PISTOL";
    expect(matchesSmartSearch(title, "glok 17")).toBe(true);
    expect(matchesSmartSearch(title, "gloc")).toBe(true);
  });

  it("retorna falso quando algum termo não estiver presente", () => {
    const title = "CYMA AIRSOFT M4 CARBINE AEG";
    expect(matchesSmartSearch(title, "m4 sniper")).toBe(false);
  });

  it("retorna true para consultas vazias", () => {
    expect(matchesSmartSearch("Qualquer Produto", "")).toBe(true);
    expect(matchesSmartSearch("Qualquer Produto", "   ")).toBe(true);
  });
});

describe("searchUtils - Filtro por Faixa de Preço", () => {
  it("retorna true se nenhum range estiver selecionado", () => {
    expect(matchesPriceRange(250, null)).toBe(true);
    expect(matchesPriceRange(250, "")).toBe(true);
  });

  it("filtra corretamente pelas faixas configuradas", () => {
    // Até R$ 150
    expect(matchesPriceRange(80, "ate-150")).toBe(true);
    expect(matchesPriceRange(150, "ate-150")).toBe(true);
    expect(matchesPriceRange(151, "ate-150")).toBe(false);

    // R$ 150 a R$ 500
    expect(matchesPriceRange(300, "150-500")).toBe(true);
    expect(matchesPriceRange(140, "150-500")).toBe(false);
    expect(matchesPriceRange(550, "150-500")).toBe(false);

    // Acima de R$ 3.000
    expect(matchesPriceRange(3500, "acima-3000")).toBe(true);
    expect(matchesPriceRange(2999, "acima-3000")).toBe(false);
  });

  it("retorna false para valores nulos ou zerados", () => {
    expect(matchesPriceRange(null, "ate-150")).toBe(false);
    expect(matchesPriceRange(0, "ate-150")).toBe(false);
  });
});
