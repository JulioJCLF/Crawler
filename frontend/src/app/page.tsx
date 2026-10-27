"use client";

import { useEffect, useState, useMemo } from "react";
import { Filters, MACRO_CATEGORIES } from "@/components/layout/Filters";
import { ActiveFilters } from "@/components/layout/ActiveFilters";
import { Radar } from "@/components/layout/Radar";
import { ProductCard } from "@/components/ProductCard";
import { useTheme } from "@/providers/ThemeProvider";
import { usePricing } from "@/providers/PricingProvider";
import { parseUsdPrice } from "@/lib/pricingConfig";
import { AIRSOFT_BRANDS } from "@/lib/brands";
import { siteConfig } from "@/config/site";
import { buildActiveFilterChips, CLEARED_FILTER_STATE, FilterKey } from "@/lib/activeFilters";
import { matchesSmartSearch, matchesPriceRange } from "@/lib/searchUtils";
import {
  isAegReplica,
  isTrueSpringSniper,
  isShotgun,
  isAirsoftMotor,
  isGearSet,
  isPrecisionBarrel,
  isTracerOrSilencer,
  isElectronicTrigger,
  isHpaEquipment,
  isHandguard,
  isHolster,
  isMagazine,
  isSpeedLoader,
} from "@/lib/categoryUtils";

export function matchesCategory(p: any, selectedCategory: string | null): boolean {
  if (!selectedCategory) return true;

  if (selectedCategory === "#aeg") {
    return isAegReplica(p);
  } else if (selectedCategory === "#gbbr") {
    return p.category === "replicas" && p.name.toLowerCase().includes("gbbr") && !isShotgun(p) && !isHandguard(p) && !isMagazine(p);
  } else if (selectedCategory === "#gbb") {
    return p.category === "replicas" && (/\bgbb\b/i.test(p.name) && !p.name.toLowerCase().includes("gbbr")) && !isShotgun(p) && !isHandguard(p) && !isMagazine(p);
  } else if (selectedCategory === "#sniper") {
    return isTrueSpringSniper(p);
  } else if (selectedCategory === "#shotgun") {
    return isShotgun(p);
  } else if (selectedCategory === "#magazines") {
    return isMagazine(p);
  } else if (selectedCategory === "#speedsoft") {
    return p.category === "speedsoft";
  } else if (selectedCategory === "#granadas") {
    return p.category === "granadas";
  } else if (selectedCategory === "#miras") {
    return p.category === "miras" && !/lanterna|laser|flashlight|iluminador|luz|mount|base|trilho|rail|ris |ras |anel/i.test(p.name);
  } else if (selectedCategory === "#luz") {
    return p.category === "miras" && /lanterna|laser|flashlight|iluminador|luz/i.test(p.name);
  } else if (selectedCategory === "#mount") {
    if (p.category !== "miras") return false;
    const n = p.name.toLowerCase();
    const hasMount = /mount|base|trilho|rail|ris |ras |anel/i.test(n);
    const isOptic = /red dot|scope|sight|acog|magnifier|holografic|mira|luneta|visor|lanterna|laser|flashlight/i.test(n);
    return hasMount && !isOptic;
  } else if (selectedCategory === "#tracers") {
    return isTracerOrSilencer(p);
  } else if (selectedCategory === "#motores") {
    return isAirsoftMotor(p);
  } else if (selectedCategory === "#engrenagens") {
    return isGearSet(p);
  } else if (selectedCategory === "#canos") {
    return isPrecisionBarrel(p);
  } else if (selectedCategory === "#mosfets") {
    return isElectronicTrigger(p);
  } else if (selectedCategory === "#pecas-pistolas") {
    return p.category === "pistolas" && !isHandguard(p);
  } else if (selectedCategory === "#pecas-internas") {
    return (
      p.category === "pecas-internas" &&
      !isTrueSpringSniper(p) &&
      !isShotgun(p) &&
      !isAirsoftMotor(p) &&
      !isGearSet(p) &&
      !isPrecisionBarrel(p) &&
      !isElectronicTrigger(p) &&
      !isHpaEquipment(p) &&
      !isMagazine(p)
    );
  } else if (selectedCategory === "#pecas-externas") {
    return (p.category === "pecas-externas" && !isShotgun(p) && !isTracerOrSilencer(p)) || isHandguard(p);
  } else if (selectedCategory === "#vestuario") {
    return p.category === "vestuario" && !isHolster(p);
  } else if (selectedCategory === "#coldres") {
    return isHolster(p);
  } else if (selectedCategory === "#hpa") {
    return isHpaEquipment(p);
  } else if (selectedCategory === "#bbs") {
    if (isSpeedLoader(p) || isTracerOrSilencer(p)) return false;
    return p.category === "bbs" || p.name.toLowerCase().includes("bbs");
  } else if (selectedCategory === "#suprimentos") {
    return (
      ["gas", "baterias"].includes(p.category) &&
      !p.name.toLowerCase().includes("bbs") &&
      !isHpaEquipment(p)
    );
  } else if (selectedCategory === "replicas") {
    return p.category === "replicas" && !isHandguard(p) && !isMagazine(p);
  } else {
    return p.category === selectedCategory;
  }
}

export default function Home() {
  const [snapshot, setSnapshot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { layout, setTheme, setLayout, theme } = useTheme();
  const { calculatePrice } = usePricing();

  const [selectedWeight, setSelectedWeight] = useState<string | null>(null);
  const [selectedVestCategory, setSelectedVestCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<string>("recent");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 36;

  useEffect(() => {
    // Prioriza o endpoint de cache server-side acelerado no Railway, com fallback para o GitHub Raw
    const apiUrl = "/api/products";
    const githubFallbackUrl = "https://raw.githubusercontent.com/JulioJCLF/crawler/main/backend/snapshot.json";

    fetch(apiUrl, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setSnapshot(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("[Catalogue] Falha ao buscar de /api/products, tentando fallback do GitHub:", err);
        fetch(githubFallbackUrl)
          .then((res) => res.json())
          .then((data) => {
            setSnapshot(data);
            setLoading(false);
          })
          .catch((fallbackErr) => {
            console.error("Falha ao recuperar catálogo de ambas as fontes:", fallbackErr);
            setLoading(false);
          });
      });
  }, []);

  // Filtra itens sem preço (Sob Consulta) da exibição principal e do radar.
  // IMPORTANTE: hooks precisam ser chamados incondicionalmente, ANTES de qualquer
  // return antecipado (loading / !snapshot), senão React quebra (error #310).
  const availableProducts = useMemo(
    () => (snapshot?.products ?? []).filter((p: any) => p.price),
    [snapshot]
  );

  const availableBrands = useMemo(() => {
    const brandsCount = new Map<string, number>();
    const baseProducts = availableProducts.filter((p: any) => matchesCategory(p, selectedCategory));

    baseProducts.forEach((p: any) => {
      const lowerName = p.name.toLowerCase();
      AIRSOFT_BRANDS.forEach((brand) => {
        const regex = new RegExp(`\\b${brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
        if (regex.test(lowerName)) {
          brandsCount.set(brand, (brandsCount.get(brand) || 0) + 1);
        }
      });
    });

    return Array.from(brandsCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([brand]) => brand);
  }, [availableProducts, selectedCategory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="font-mono text-xs animate-pulse uppercase tracking-widest text-accent flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent" />
          Estabelecendo conexão...
        </div>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="flex items-center justify-center min-h-screen text-destructive font-mono uppercase text-sm">
        [ERRO] Falha ao recuperar pacote de dados.
      </div>
    );
  }

  const handleSearchChange = (s: string) => {
    setSearch(s);
    setCurrentPage(1);
  };

  const handleCategoryChange = (c: string | null) => {
    setSelectedCategory(c);
    setCurrentPage(1);
  };

  const handleWeightChange = (w: string | null) => {
    setSelectedWeight(w);
    setCurrentPage(1);
  };

  const handleVestCategoryChange = (v: string | null) => {
    setSelectedVestCategory(v);
    setCurrentPage(1);
  };

  const handleBrandChange = (b: string | null) => {
    setSelectedBrand(b);
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (rangeId: string | null) => {
    setSelectedPriceRange(rangeId);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortOrder(sort);
    setCurrentPage(1);
  };

  // availableProducts e availableBrands são calculados acima (antes dos returns).

  // REQ-017 / REQ-022: remove um filtro específico do resumo, mantendo os demais.
  const handleRemoveFilter = (key: FilterKey) => {
    switch (key) {
      case "search":
        handleSearchChange(CLEARED_FILTER_STATE.search);
        break;
      case "category":
        handleCategoryChange(CLEARED_FILTER_STATE.category);
        break;
      case "brand":
        handleBrandChange(CLEARED_FILTER_STATE.brand);
        break;
      case "weight":
        handleWeightChange(CLEARED_FILTER_STATE.weight);
        break;
      case "vestCategory":
        handleVestCategoryChange(CLEARED_FILTER_STATE.vestCategory);
        break;
      case "priceRange":
        handlePriceRangeChange(CLEARED_FILTER_STATE.priceRange);
        break;
    }
  };

  // REQ-017 / REQ-022: limpa todos os filtros, reseta a página, mas não toca em sortOrder.
  const handleClearAllFilters = () => {
    setSearch(CLEARED_FILTER_STATE.search);
    setSelectedCategory(CLEARED_FILTER_STATE.category);
    setSelectedBrand(CLEARED_FILTER_STATE.brand);
    setSelectedWeight(CLEARED_FILTER_STATE.weight);
    setSelectedVestCategory(CLEARED_FILTER_STATE.vestCategory);
    setSelectedPriceRange(CLEARED_FILTER_STATE.priceRange);
    setCurrentPage(1);
  };

  const filteredProducts = availableProducts.filter((p: any) => {
    const matchesSearch = matchesSmartSearch(p.name, search);
    const matchesCat = matchesCategory(p, selectedCategory);

    let matchesWeight = true;
    if (selectedWeight && matchesCat && selectedCategory === "#bbs") {
      const w = selectedWeight.replace('g', '');
      const regex = new RegExp(`\\b${w}\\s*g?\\b`, 'i');
      matchesWeight = regex.test(p.name);
    }

    let matchesVest = true;
    if (selectedVestCategory && matchesCat && selectedCategory === "#vestuario") {
      let vestRegex = /.*/;
      switch (selectedVestCategory) {
        case "holsters": vestRegex = /coldre|holster/i; break;
        case "helmets": vestRegex = /capacete|helmet/i; break;
        case "headsets": vestRegex = /fone|headset|abafador|headphone|ptt|comunicador/i; break;
        case "gloves": vestRegex = /luva|glove/i; break;
        case "vests": vestRegex = /colete|vest|plate carrier|chest rig/i; break;
        case "belts": vestRegex = /cinto|belt/i; break;
        case "uniforms": vestRegex = /farda|calça|camisa|combat shirt|uniforme|bota|coturno|jaqueta|chapeu|boonie/i; break;
        case "slings": vestRegex = /bandoleira|sling/i; break;
        case "backpacks": vestRegex = /mochila|backpack|bag|bolsa|pochete/i; break;
        case "eyewear": vestRegex = /oculos|óculos|eyewear|goggle|mascara|máscara|mask|balaclava/i; break;
      }
      matchesVest = vestRegex.test(p.name);
    }

    let matchesBrand = true;
    if (selectedBrand && matchesCat) {
      // Create a regex to match the exact word to prevent "KWA" from matching "KWC" if they overlap somehow (they don't, just safe)
      const brandRegex = new RegExp(`\\b${selectedBrand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      matchesBrand = brandRegex.test(p.name);
    }

    let matchesPrice = true;
    if (selectedPriceRange) {
      const calculated = calculatePrice(p.price, p.category);
      matchesPrice = matchesPriceRange(calculated?.amount, selectedPriceRange);
    }

    return matchesSearch && matchesCat && matchesWeight && matchesVest && matchesBrand && matchesPrice;
  });

  const activeFilterChips = buildActiveFilterChips({
    search,
    category: selectedCategory,
    brand: selectedBrand,
    weight: selectedWeight,
    vestCategory: selectedVestCategory,
    priceRange: selectedPriceRange,
  });

  // Apply Sorting
  const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
    switch (sortOrder) {
      case "asc":
        return a.name.localeCompare(b.name);
      case "price_asc":
        return parseUsdPrice(a.price) - parseUsdPrice(b.price);
      case "price_desc":
        return parseUsdPrice(b.price) - parseUsdPrice(a.price);
      case "recent":
      default:
        // Use firstSeen date. If dates are the same, rely on their original order (fallback)
        if (a.firstSeen && b.firstSeen) {
          return new Date(b.firstSeen).getTime() - new Date(a.firstSeen).getTime();
        }
        return 0;
    }
  });

  // Paginação
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Dev Tools - controlados por código (siteConfig.showDevTools).
          Em produção fica desligado, então o cliente final nunca vê. */}
      {siteConfig.showDevTools && (
        <div className="fixed bottom-4 left-4 z-50 flex gap-2">
          <button
            onClick={() => setTheme(theme === 'hunting' ? 'minimal' : 'hunting')}
            className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-mono opacity-20 hover:opacity-100 transition-opacity shadow-lg"
          >
            Theme: {theme}
          </button>
          <button
            onClick={() => setLayout(layout === 'sidebar' ? 'topbar' : 'sidebar')}
            className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-mono opacity-20 hover:opacity-100 transition-opacity shadow-lg"
          >
            Layout: {layout}
          </button>
        </div>
      )}

      <div className={`flex flex-1 ${layout === 'sidebar' ? 'flex-col md:flex-row' : 'flex-col'}`}>
        <Filters 
          categories={snapshot.categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategoryChange}
          search={search}
          onSearchChange={handleSearchChange}
          totalCount={availableProducts.length}
          selectedWeight={selectedWeight}
          onSelectWeight={handleWeightChange}
          selectedVestCategory={selectedVestCategory}
          onSelectVestCategory={handleVestCategoryChange}
          selectedBrand={selectedBrand}
          onSelectBrand={handleBrandChange}
          selectedPriceRange={selectedPriceRange}
          onSelectPriceRange={handlePriceRangeChange}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          availableBrands={availableBrands}
        />

        <main className={`flex-1 min-w-0 ${layout === 'sidebar' ? 'p-4 md:p-10 md:max-h-screen md:overflow-y-auto' : 'p-4 md:p-6'}`}>
          <div className="max-w-[1400px] mx-auto">
            {/* Oculta Radar quando há pesquisa ou categoria selecionada */}
            {!search && !selectedCategory && <Radar products={availableProducts} />}

            {/* Quick Category Rail for instantaneous 1-click filtering */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-hide pt-2">
              <button
                onClick={() => handleCategoryChange(null)}
                className={`flex-shrink-0 text-xs font-mono px-3 py-1.5 rounded transition-all border ${
                  selectedCategory === null
                    ? "bg-accent text-accent-foreground border-accent font-bold shadow-xs"
                    : "bg-card text-muted-foreground border-border hover:border-accent hover:text-foreground"
                }`}
              >
                Todas ({availableProducts.length})
              </button>
              {MACRO_CATEGORIES.map((cat) => {
                const active = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => handleCategoryChange(active ? null : cat.slug)}
                    className={`flex-shrink-0 text-xs font-mono px-3 py-1.5 rounded transition-all border ${
                      active
                        ? "bg-accent text-accent-foreground border-accent font-bold shadow-xs"
                        : "bg-card text-muted-foreground border-border hover:border-accent hover:text-foreground"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <ActiveFilters
              chips={activeFilterChips}
              onRemove={handleRemoveFilter}
              onClearAll={handleClearAllFilters}
            />

            <div className="mb-6 flex items-baseline justify-between mt-8 border-b border-border pb-3">
              <h2 className="font-display font-medium text-2xl tracking-[-0.03em] uppercase text-foreground">
                Acervo
              </h2>
              <span className="font-mono text-xs text-muted-foreground">
                [{filteredProducts.length} ITENS INDEXADOS]
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {currentProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20 text-muted-foreground font-mono text-sm border border-dashed border-border p-8">
                Nenhum equipamento encontrado na varredura com os filtros atuais.
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-4 border-t border-border pt-6 pb-20">
                <button 
                  onClick={() => {
                    setCurrentPage(p => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="px-5 py-2 bg-card border border-border rounded-none text-xs font-mono uppercase tracking-wider disabled:opacity-30 hover:border-accent hover:text-accent transition-colors text-foreground"
                >
                  &larr; Anterior
                </button>
                <div className="font-mono text-xs text-muted-foreground flex items-center gap-1.5 px-3 py-1 bg-muted/40 border border-border">
                  <span className="text-accent font-medium">PAG {currentPage}</span>
                  <span>/</span>
                  <span>{totalPages}</span>
                </div>
                <button 
                  onClick={() => {
                    setCurrentPage(p => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  className="px-5 py-2 bg-card border border-border rounded-none text-xs font-mono uppercase tracking-wider disabled:opacity-30 hover:border-accent hover:text-accent transition-colors text-foreground"
                >
                  Próxima &rarr;
                </button>
              </div>
            )}

            <footer className="mt-8 py-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-muted-foreground">
              <div>
                <span>{siteConfig.brandName} Catalog · {availableProducts.length} itens indexados</span>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="/admin"
                  className="hover:text-foreground transition-colors flex items-center gap-1.5 font-bold"
                >
                  Gerenciador de Catálogo & Preços
                </a>
                <span>·</span>
                <span>Railway Ready</span>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
