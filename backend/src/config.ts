export const CATEGORIES = [
  { slug: "replicas",       label: "Réplicas",                url: "https://www.arsenalsports.com/produtos/airsoft-replicas-de-airsoft/filter?d=124" },
  { slug: "pecas-externas", label: "Peças Externas",          url: "https://www.arsenalsports.com/produtos/airsoft-pecas-externas-para-replicas-de-airsoft/filter?d=191" },
  { slug: "pecas-internas", label: "Peças Internas",          url: "https://www.arsenalsports.com/produtos/airsoft-pecas-internas-para-replicas-de-airsoft/filter?d=229" },
  { slug: "pistolas",       label: "Peças para Pistolas",     url: "https://www.arsenalsports.com/produtos/airsoft-pecas-exclusivas-para-pistolas/filter?d=423" },
  { slug: "rifles-gas",     label: "Peças para Rifles a Gás", url: "https://www.arsenalsports.com/produtos/airsoft-pecas-exclusivas-para-rifles-a-gas/filter?d=214" },
  { slug: "sniper",         label: "Peças para Sniper",       url: "https://www.arsenalsports.com/produtos/airsoft-pecas-exclusivas-para-sniper/filter?d=424" },
  { slug: "magazines",      label: "Magazines",               url: "https://www.arsenalsports.com/produtos/airsoft-magazines-para-replicas-de-airsoft/filter?d=114" },
  { slug: "bbs",            label: "BBs",                     url: "https://www.arsenalsports.com/produtos/airsoft-bbs-/filter?d=163" },
  { slug: "gas",            label: "Gas / CO2 / HPA",         url: "https://www.arsenalsports.com/produtos/airsoft-green-gas--co2--hpa/filter?d=176" },
  { slug: "baterias",       label: "Baterias & Carregadores", url: "https://www.arsenalsports.com/produtos/airsoft-baterias--carregadores/filter?d=104" },
  { slug: "granadas",       label: "Granadas",                url: "https://www.arsenalsports.com/produtos/airsoft-granadas-de-airsoft/filter?d=184" },
  { slug: "speedsoft",      label: "Speedsoft",               url: "https://www.arsenalsports.com/produtos/airsoft-speedsoft/filter?d=256" },
  { slug: "miras",          label: "Miras e Red Dots",        url: "https://www.arsenalsports.com/produtos/otica-e-iluminacao/filter?d=273" },
  { slug: "vestuario",      label: "Equipamento e Vestuário", url: "https://www.arsenalsports.com/produtos?d=381" },
];

/**
 * Categorias DERIVADAS: não são fonte de crawl (o site não tem uma URL só de
 * buckings), mas são destinos válidos criados pela heurística/overrides.
 * Ex.: "buckings" (borrachas de hop-up) ficam pulverizados no site inteiro;
 * aqui damos um lugar próprio pra eles.
 */
export const VIRTUAL_CATEGORIES = [
  { slug: "buckings", label: "Buckings" },
];

/** Todas as categorias válidas (crawl + derivadas). Use para resumo/validação. */
export const ALL_CATEGORIES = [...CATEGORIES, ...VIRTUAL_CATEGORIES];

export const MAX_PAGES = 150;
export const PAGE_PARAM = "pagina";

// Exclude non-airsoft related words based on user request (wellness, outside scope)
export const EXCLUDED_KEYWORDS = [
  "wellness",
  "fitness",
  "yoga",
  "chaveiro", // keychain
  "adesivo", // sticker
  "caneca", // mug
  "mouse pad"
];

export const CATEGORY_WEIGHTS: Record<string, number> = {
  "replicas": 1,
  "vestuario": 2,
  "pecas-externas": 3,
  "pecas-internas": 3,
  "pistolas": 3,
  "rifles-gas": 3,
  "sniper": 3,
  "miras": 4,
  "magazines": 5,
  "bbs": 5,
  "gas": 5,
  "baterias": 5,
  "granadas": 5,
  "speedsoft": 5,
  "buckings": 6,
};

export function enforceCategory(name: string, originalCategory: string): { categorySlug: string, weight: number } {
  const lowerName = name.toLowerCase();
  let defaultWeight = CATEGORY_WEIGHTS[originalCategory] || 0;

  // BUCKINGS (borracha de hop-up) têm categoria própria. Verificado ANTES de
  // tudo (peso 110, maior que a regra de "arma AEG" = 100) porque muitos buckings
  // têm "AEG" no nome e estavam sendo forçados para "replicas".
  if (lowerName.match(/\bbucking\b/) || lowerName.match(/hop[\s-]?up rubber/)) {
    return { categorySlug: "buckings", weight: 110 };
  }

  // OVERRIDES GLOBAIS: Garante que armas verdadeiras não caiam em peças (PESO 100)
  if (
    lowerName.endsWith("airsoft rifle") || 
    lowerName.includes("blowback airsoft pistol") ||
    lowerName.match(/\bsniper rifle\b/) || 
    lowerName.match(/\bairsoft sniper\b/) ||
    (lowerName.match(/\baeg\b/) && !lowerName.match(/for aeg|gearbox|part|peça|magazine/i))
  ) {
    return { categorySlug: "replicas", weight: 100 };
  }

  // OVERRIDES GENÉRICOS (Replicas -> Peças)
  if (originalCategory === "replicas") {
    if (lowerName.match(/\b(magazine|mag)\b/i)) {
      return { categorySlug: "magazines", weight: CATEGORY_WEIGHTS["magazines"] };
    }
    if (lowerName.match(/for aeg|for gbb|for gbbr|cylinder|spring|gearbox|piston|hop up|bucking|gear|motor|handguard|stock|grip|peça|peca/i)) {
      if (lowerName.match(/handguard|stock|grip|rail/i)) {
        return { categorySlug: "pecas-externas", weight: CATEGORY_WEIGHTS["pecas-externas"] };
      }
      return { categorySlug: "pecas-internas", weight: CATEGORY_WEIGHTS["pecas-internas"] };
    }
  }

  return { categorySlug: originalCategory, weight: defaultWeight };
}

// Returns true if product should be kept, false if it should be excluded
export function isValidProduct(name: string): boolean {
  const lowerName = name.toLowerCase();
  for (const keyword of EXCLUDED_KEYWORDS) {
    if (lowerName.includes(keyword)) {
      return false;
    }
  }
  return true;
}

/**
 * Remove qualquer ocorrência da escrita "Arsenal Sports" do título/descrição
 * do produto (seja como sufixo, prefixo, entre parênteses ou separado por hífen),
 * preservando o restante do título e especificações técnicas (como roscas "14MM-").
 */
export function cleanProductName(name: string): string {
  if (!name) return "";
  return name
    .replace(/\s*[\(\[]\s*arsenal\s+sports\s*[\)\]]/gi, "")
    .replace(/(\s+[-|/•]\s*|\s+)\barsenal\s+sports\b/gi, "")
    .replace(/^\barsenal\s+sports\b\s*[-|/•]?\s*/gi, "")
    .replace(/\barsenal\s+sports\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}
