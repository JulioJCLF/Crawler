"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowDownUp,
  Check,
  RotateCcw,
  Ticket,
  ChevronDown,
  Layers,
  DollarSign,
  Tag,
  Crosshair,
  Shield,
  Wrench,
  Shirt,
} from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { CategorySummary } from "@/types";
import { Logo } from "@/components/layout/Logo";
import { QUICK_SEARCH_SUGGESTIONS, PRICE_RANGES } from "@/lib/searchUtils";

interface FiltersProps {
  categories: CategorySummary[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  search: string;
  onSearchChange: (search: string) => void;
  totalCount: number;
  selectedWeight: string | null;
  onSelectWeight: (weight: string | null) => void;
  selectedVestCategory: string | null;
  onSelectVestCategory: (vestCat: string | null) => void;
  selectedBrand: string | null;
  onSelectBrand: (brand: string | null) => void;
  selectedPriceRange: string | null;
  onSelectPriceRange: (rangeId: string | null) => void;
  sortOrder: string;
  onSortChange: (sort: string) => void;
  availableBrands: string[];
}

export const MACRO_CATEGORIES = [
  { slug: "#aeg", label: "Rifles AEG", group: "armas" },
  { slug: "#gbbr", label: "Rifles GBBR", group: "armas" },
  { slug: "#gbb", label: "Pistolas GBB", group: "armas" },
  { slug: "#sniper", label: "Snipers / Spring", group: "armas" },
  { slug: "#shotgun", label: "Shotguns", group: "armas" },
  { slug: "#magazines", label: "Magazines & Carregadores", group: "armas" },
  { slug: "#speedsoft", label: "Speedsoft", group: "armas" },
  { slug: "#granadas", label: "Granadas & Lançadores", group: "armas" },
  { slug: "#miras", label: "Red Dots e Miras", group: "opticos" },
  { slug: "#luz", label: "Lanternas e Lasers", group: "opticos" },
  { slug: "#mount", label: "Trilhos e Mounts", group: "opticos" },
  { slug: "#tracers", label: "Tracers & Silenciadores", group: "opticos" },
  { slug: "#pecas-internas", label: "Peças Internas", group: "pecas" },
  { slug: "#pecas-pistolas", label: "Peças de Pistola (AAP/Hi-Capa)", group: "pecas" },
  { slug: "#motores", label: "Motores", group: "pecas" },
  { slug: "#engrenagens", label: "Engrenagens", group: "pecas" },
  { slug: "#canos", label: "Canos de Precisão", group: "pecas" },
  { slug: "#mosfets", label: "MOSFETs & Gatilhos", group: "pecas" },
  { slug: "buckings", label: "Buckings", group: "pecas" },
  { slug: "#pecas-externas", label: "Peças Externas", group: "pecas" },
  { slug: "#vestuario", label: "Vestuário Tático", group: "vestuario" },
  { slug: "#coldres", label: "Coldres", group: "vestuario" },
  { slug: "#cases", label: "Cases & Maletas", group: "vestuario" },
  { slug: "#hpa", label: "HPA & Ar Comprimido", group: "suprimentos" },
  { slug: "#bbs", label: "Munição (BBs)", group: "suprimentos" },
  { slug: "#suprimentos", label: "Gás e Baterias", group: "suprimentos" },
];

export const CATEGORY_GROUPS = [
  { id: "armas", label: "Armas & Réplicas", icon: Crosshair },
  { id: "opticos", label: "Ópticos & Iluminação", icon: Shield },
  { id: "pecas", label: "Peças & Upgrades", icon: Wrench },
  { id: "vestuario", label: "Vestuário & Suprimentos", icon: Shirt },
];

export const BB_WEIGHTS = [
  "0.20g",
  "0.23g",
  "0.25g",
  "0.28g",
  "0.30g",
  "0.32g",
  "0.36g",
  "0.40g",
  "0.43g",
  "0.45g",
  "0.48g",
  "0.50g",
];

export const VEST_CATEGORIES = [
  { value: "holsters", label: "Holsters" },
  { value: "helmets", label: "Helmets" },
  { value: "headsets", label: "Headsets / Comms" },
  { value: "gloves", label: "Gloves" },
  { value: "vests", label: "Vests & Carriers" },
  { value: "belts", label: "Belts" },
  { value: "uniforms", label: "Uniforms & Apparel" },
  { value: "slings", label: "Slings" },
  { value: "backpacks", label: "Backpacks & Bags" },
  { value: "eyewear", label: "Eyewear & Masks" },
];

const SORT_OPTIONS = [
  { id: "recent", label: "Recentes" },
  { id: "price_asc", label: "Menor R$" },
  { id: "price_desc", label: "Maior R$" },
  { id: "asc", label: "A - Z" },
];

export function Filters({
  selectedCategory,
  onSelectCategory,
  search,
  onSearchChange,
  totalCount,
  selectedWeight,
  onSelectWeight,
  selectedVestCategory,
  onSelectVestCategory,
  selectedBrand,
  onSelectBrand,
  selectedPriceRange,
  onSelectPriceRange,
  sortOrder,
  onSortChange,
  availableBrands,
}: FiltersProps) {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  // Estados dos acordeões colapsáveis (fechados por padrão para manter a barra limpa)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: false,
    price: false,
    sort: false,
    brand: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const hasActiveFilters = Boolean(
    search || selectedCategory || selectedBrand || selectedWeight || selectedVestCategory || selectedPriceRange
  );

  const resetAllFilters = () => {
    onSearchChange("");
    onSelectCategory(null);
    onSelectBrand(null);
    onSelectWeight(null);
    onSelectVestCategory(null);
    onSelectPriceRange(null);
  };

  // Encontra labels dos filtros selecionados para exibir no badge dos acordeões
  const activeCategoryMeta = MACRO_CATEGORIES.find((c) => c.slug === selectedCategory);
  const activePriceMeta = PRICE_RANGES.find((p) => p.id === selectedPriceRange);
  const activeSortMeta = SORT_OPTIONS.find((s) => s.id === sortOrder);

  return (
    <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-border bg-card/60 p-4 md:p-5 flex flex-col gap-4 md:sticky md:top-0 md:h-screen md:overflow-y-auto">
      {/* Brand Header */}
      <div className="flex items-center justify-between border-b border-border pb-3.5">
        <div className="flex items-center gap-3">
          <Logo className="h-9 md:h-11 w-auto object-contain" />
          <div>
            <h2 className="font-display font-bold text-sm uppercase tracking-tight text-foreground">
              Filtros Táticos
            </h2>
            <span className="font-mono text-[11px] text-muted-foreground">{totalCount} equipamentos</span>
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setMobileExpanded(!mobileExpanded)}
          className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border text-xs font-mono text-foreground cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-accent" />
          <span>{mobileExpanded ? "Ocultar" : "Expandir"}</span>
        </button>
      </div>

      <div className={`flex flex-col gap-3.5 ${mobileExpanded ? "block" : "hidden md:flex"}`}>
        {/* Link para Rifas Oficiais Loteria Federal */}
        <Link
          href="/rifas"
          className="flex items-center justify-between p-3 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-card hover:border-amber-400 text-amber-300 transition-all group shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <div className="font-heading uppercase text-xs tracking-wider font-bold text-foreground group-hover:text-amber-300 transition-colors">
                RIFA HUNTING
              </div>
              <div className="text-[10px] font-mono text-muted-foreground">
                Loteria Federal Oficial
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 text-amber-300 font-bold">
            Ao Vivo
          </span>
        </Link>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 1. BUSCA POR TEXTO (FILTRO PRINCIPAL SEMPRE VISÍVEL)          */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="p-3.5 rounded-xl border border-border bg-card/80 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <label
              htmlFor="search-input"
              className="font-mono text-[11px] uppercase tracking-wider text-foreground font-bold flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5 text-accent" />
              <span>Pesquisar Equipamento</span>
            </label>
            {search && (
              <button
                onClick={() => onSearchChange("")}
                className="font-mono text-[10px] text-muted-foreground hover:text-accent flex items-center gap-1 cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="relative">
            <input
              id="search-input"
              type="text"
              placeholder="Ex: Glock, M4, Red Dot, 0.25g..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full font-mono text-xs py-2.5 pl-3 pr-8 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-accent transition-colors shadow-inner"
            />
            {search && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Atalhos Rápidos Populares */}
          <div className="flex flex-wrap gap-1 pt-0.5">
            {QUICK_SEARCH_SUGGESTIONS.map((s) => {
              const active = search.toLowerCase() === s.query.toLowerCase();
              return (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => onSearchChange(active ? "" : s.query)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-md transition-all border cursor-pointer ${
                    active
                      ? "bg-accent text-accent-foreground border-accent font-bold shadow-xs"
                      : "bg-background text-muted-foreground border-border hover:border-accent hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 2. SUB-FILTROS CONTEXTUAIS RÁPIDOS (BBs e Vestuário)         */}
        {/* Abrem automaticamente se a categoria relevante for ativada     */}
        {/* ───────────────────────────────────────────────────────────── */}

        {/* Gramatura de BBs */}
        {selectedCategory === "#bbs" && (
          <div className="p-3 bg-accent/5 border border-accent/30 rounded-xl space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase font-bold text-accent">Peso da Esfera (BBs)</span>
              {selectedWeight && (
                <button
                  onClick={() => onSelectWeight(null)}
                  className="font-mono text-[10px] text-muted-foreground hover:text-accent cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-1">
              {BB_WEIGHTS.map((w) => {
                const active = selectedWeight === w;
                return (
                  <button
                    key={w}
                    onClick={() => onSelectWeight(active ? null : w)}
                    className={`text-xs font-mono py-1 rounded-md text-center border transition-all cursor-pointer ${
                      active
                        ? "bg-accent text-accent-foreground border-accent font-bold"
                        : "bg-background text-muted-foreground border-border hover:border-accent hover:text-foreground"
                    }`}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tipo de Vestuário */}
        {selectedCategory === "#vestuario" && (
          <div className="p-3 bg-accent/5 border border-accent/30 rounded-xl space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase font-bold text-accent">Tipo de Equipamento</span>
              {selectedVestCategory && (
                <button
                  onClick={() => onSelectVestCategory(null)}
                  className="font-mono text-[10px] text-muted-foreground hover:text-accent cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {VEST_CATEGORIES.map((v) => {
                const active = selectedVestCategory === v.value;
                return (
                  <button
                    key={v.value}
                    onClick={() => onSelectVestCategory(active ? null : v.value)}
                    className={`text-[11px] font-mono py-1.5 px-2 rounded-md text-left truncate border transition-all cursor-pointer ${
                      active
                        ? "bg-accent text-accent-foreground border-accent font-bold"
                        : "bg-background text-muted-foreground border-border hover:border-accent hover:text-foreground"
                    }`}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 3. FILTROS COLAPSÁVEIS (ACORDEÕES)                             */}
        {/* ───────────────────────────────────────────────────────────── */}

        {/* ACORDEÃO 1: CATEGORIAS */}
        <div className="border border-border rounded-xl bg-card/60 overflow-hidden transition-all duration-200">
          <button
            type="button"
            onClick={() => toggleSection("categories")}
            className="w-full flex items-center justify-between p-3.5 cursor-pointer hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent" />
              <span className="font-mono text-xs font-bold uppercase tracking-wide text-foreground">
                Categorias
              </span>
            </div>

            <div className="flex items-center gap-2">
              {activeCategoryMeta ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 font-bold max-w-[120px] truncate">
                  {activeCategoryMeta.label}
                </span>
              ) : (
                <span className="text-[10px] font-mono text-muted-foreground">Todas</span>
              )}
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                  openSections.categories ? "rotate-180 text-foreground" : ""
                }`}
              />
            </div>
          </button>

          {openSections.categories && (
            <div className="p-3.5 pt-0 border-t border-border/40 space-y-3.5 animate-in fade-in duration-150">
              {/* Botão de Todos os Produtos */}
              <button
                type="button"
                onClick={() => {
                  onSelectCategory(null);
                  onSelectBrand(null);
                }}
                className={`w-full flex items-center justify-between font-mono text-xs px-3 py-2 rounded-lg transition-all border cursor-pointer ${
                  selectedCategory === null
                    ? "bg-accent text-accent-foreground border-accent font-bold shadow-xs"
                    : "bg-background text-muted-foreground border-border hover:border-accent hover:text-foreground"
                }`}
              >
                <span>TODOS OS PRODUTOS</span>
                <span className="text-[10px] opacity-80 font-bold">({totalCount})</span>
              </button>

              {/* Grupos Táticos de Categorias */}
              <div className="space-y-3">
                {CATEGORY_GROUPS.map((group) => {
                  const groupCats = MACRO_CATEGORIES.filter(
                    (c) =>
                      c.group === group.id ||
                      (group.id === "vestuario" && (c.group === "vestuario" || c.group === "suprimentos"))
                  );

                  return (
                    <div key={group.id} className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                        <group.icon className="w-3 h-3 text-accent" />
                        <span>{group.label}</span>
                      </div>

                      <div className="grid grid-cols-1 gap-1">
                        {groupCats.map((cat) => {
                          const active = selectedCategory === cat.slug;
                          return (
                            <button
                              key={cat.slug}
                              type="button"
                              onClick={() => {
                                onSelectCategory(active ? null : cat.slug);
                                if (cat.slug !== "#bbs") onSelectWeight(null);
                                if (cat.slug !== "#vestuario") onSelectVestCategory(null);
                                onSelectBrand(null);
                              }}
                              className={`flex items-center justify-between font-mono text-xs px-2.5 py-1.5 rounded-lg transition-all border text-left cursor-pointer ${
                                active
                                  ? "bg-accent text-accent-foreground border-accent font-bold"
                                  : "bg-background/80 hover:bg-muted text-muted-foreground border-border/50 hover:border-border hover:text-foreground"
                              }`}
                            >
                              <span className="truncate mr-2 uppercase">{cat.label}</span>
                              {active && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ACORDEÃO 2: FAIXA DE PREÇO */}
        <div className="border border-border rounded-xl bg-card/60 overflow-hidden transition-all duration-200">
          <button
            type="button"
            onClick={() => toggleSection("price")}
            className="w-full flex items-center justify-between p-3.5 cursor-pointer hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-accent" />
              <span className="font-mono text-xs font-bold uppercase tracking-wide text-foreground">
                Faixa de Preço
              </span>
            </div>

            <div className="flex items-center gap-2">
              {activePriceMeta ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 font-bold max-w-[120px] truncate">
                  {activePriceMeta.label}
                </span>
              ) : (
                <span className="text-[10px] font-mono text-muted-foreground">Todos</span>
              )}
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                  openSections.price ? "rotate-180 text-foreground" : ""
                }`}
              />
            </div>
          </button>

          {openSections.price && (
            <div className="p-3.5 pt-0 border-t border-border/40 space-y-2 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onSelectPriceRange(null)}
                  className={`text-[11px] font-mono py-1.5 px-2 rounded-lg text-center border transition-all cursor-pointer ${
                    selectedPriceRange === null
                      ? "bg-accent text-accent-foreground border-accent font-bold shadow-xs"
                      : "bg-background text-muted-foreground border-border hover:border-accent hover:text-foreground"
                  }`}
                >
                  Todos os Valores
                </button>
                {PRICE_RANGES.map((r) => {
                  const active = selectedPriceRange === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => onSelectPriceRange(active ? null : r.id)}
                      className={`text-[11px] font-mono py-1.5 px-2 rounded-lg text-center border transition-all cursor-pointer ${
                        active
                          ? "bg-accent text-accent-foreground border-accent font-bold shadow-xs"
                          : "bg-background text-muted-foreground border-border hover:border-accent hover:text-foreground"
                      }`}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ACORDEÃO 3: ORDENAR POR */}
        <div className="border border-border rounded-xl bg-card/60 overflow-hidden transition-all duration-200">
          <button
            type="button"
            onClick={() => toggleSection("sort")}
            className="w-full flex items-center justify-between p-3.5 cursor-pointer hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ArrowDownUp className="w-4 h-4 text-accent" />
              <span className="font-mono text-xs font-bold uppercase tracking-wide text-foreground">
                Ordenar Por
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 font-bold">
                {activeSortMeta?.label || "Padrão"}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                  openSections.sort ? "rotate-180 text-foreground" : ""
                }`}
              />
            </div>
          </button>

          {openSections.sort && (
            <div className="p-3.5 pt-0 border-t border-border/40 space-y-2 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-1.5">
                {SORT_OPTIONS.map((sort) => {
                  const active = sortOrder === sort.id;
                  return (
                    <button
                      key={sort.id}
                      type="button"
                      onClick={() => onSortChange(sort.id)}
                      className={`text-[11px] font-mono py-1.5 px-2 rounded-lg text-center border transition-all cursor-pointer ${
                        active
                          ? "bg-accent text-accent-foreground border-accent font-bold shadow-xs"
                          : "bg-background text-muted-foreground border-border hover:border-accent hover:text-foreground"
                      }`}
                    >
                      {sort.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ACORDEÃO 4: FABRICANTE / MARCA */}
        {availableBrands.length > 0 && (
          <div className="border border-border rounded-xl bg-card/60 overflow-hidden transition-all duration-200">
            <button
              type="button"
              onClick={() => toggleSection("brand")}
              className="w-full flex items-center justify-between p-3.5 cursor-pointer hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-accent" />
                <span className="font-mono text-xs font-bold uppercase tracking-wide text-foreground">
                  Fabricante / Marca
                </span>
              </div>

              <div className="flex items-center gap-2">
                {selectedBrand ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 font-bold max-w-[120px] truncate">
                    {selectedBrand}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {availableBrands.length} marcas
                  </span>
                )}
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                    openSections.brand ? "rotate-180 text-foreground" : ""
                  }`}
                />
              </div>
            </button>

            {openSections.brand && (
              <div className="p-3.5 pt-0 border-t border-border/40 space-y-2.5 animate-in fade-in duration-150">
                <div className="flex flex-wrap gap-1">
                  {availableBrands.slice(0, 8).map((b) => {
                    const active = selectedBrand === b;
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => onSelectBrand(active ? null : b)}
                        className={`text-[10px] font-mono px-2 py-1 rounded-md border transition-all cursor-pointer ${
                          active
                            ? "bg-accent text-accent-foreground border-accent font-bold"
                            : "bg-background text-muted-foreground border-border hover:border-accent hover:text-foreground"
                        }`}
                      >
                        {b}
                      </button>
                    );
                  })}
                </div>

                {availableBrands.length > 8 && (
                  <select
                    value={selectedBrand || ""}
                    onChange={(e) => onSelectBrand(e.target.value || null)}
                    className="w-full font-mono text-xs p-2 rounded-lg bg-background border border-border text-foreground cursor-pointer focus:outline-none focus:border-accent"
                  >
                    <option value="">Todas as marcas ({availableBrands.length})...</option>
                    {availableBrands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 4. BOTÃO LIMPAR TODOS OS FILTROS                              */}
        {/* ───────────────────────────────────────────────────────────── */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetAllFilters}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-destructive/40 text-destructive bg-destructive/10 hover:bg-destructive/20 font-mono text-xs uppercase font-bold transition-colors cursor-pointer shadow-xs mt-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar Todos os Filtros</span>
          </button>
        )}
      </div>
    </aside>
  );
}
