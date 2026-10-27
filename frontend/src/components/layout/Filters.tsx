"use client";

import { useState } from "react";
import { Search, X, SlidersHorizontal, ArrowDownUp, Check, RotateCcw } from "lucide-react";
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

export const BB_WEIGHTS = ["0.20g", "0.23g", "0.25g", "0.28g", "0.30g", "0.32g", "0.36g", "0.40g", "0.43g", "0.45g", "0.48g", "0.50g"];

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

const POPULAR_BRANDS = ["Tokyo Marui", "G&G", "Krytac", "VFC", "CYMA", "KWA", "ARES", "Novritsch"];

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
  availableBrands
}: FiltersProps) {
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const isReplicaCategory = selectedCategory === "#aeg" || selectedCategory === "#gbb" || selectedCategory === "#gbbr" || selectedCategory === "#sniper" || selectedCategory === "#shotgun" || selectedCategory === "#hpa" || selectedCategory === "replicas";

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

  return (
    <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-border bg-card/60 p-4 md:p-6 flex flex-col gap-5 md:sticky md:top-0 md:h-screen md:overflow-y-auto">
      {/* Brand Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Logo className="h-10 md:h-12 w-auto object-contain" />
          <div>
            <h2 className="font-display font-bold text-base uppercase tracking-tight text-foreground">Filtros Táticos</h2>
            <span className="font-mono text-xs text-muted-foreground">{totalCount} equipamentos</span>
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setMobileExpanded(!mobileExpanded)}
          className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded bg-muted border border-border text-xs font-mono text-foreground"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-accent" />
          <span>{mobileExpanded ? "Ocultar" : "Expandir"}</span>
        </button>
      </div>

      <div className={`flex flex-col gap-5 ${mobileExpanded ? 'block' : 'hidden md:flex'}`}>
        
        {/* 1. BUSCA INTELIGENTE COM BOTÃO LIMPAR DIRETO */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="search-input" className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-accent" />
              Busca Rápida
            </label>
            {search && (
              <button 
                onClick={() => onSearchChange("")}
                className="font-mono text-[10px] text-muted-foreground hover:text-accent flex items-center gap-1"
              >
                Limpar busca
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
              className="w-full font-mono text-xs py-2.5 pl-3 pr-8 rounded bg-background border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-accent transition-colors"
            />
            {search && (
              <button 
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Atalhos de Busca Rápida (1 clique para buscar) */}
          <div className="flex flex-wrap gap-1 pt-1">
            {QUICK_SEARCH_SUGGESTIONS.map((s) => {
              const active = search.toLowerCase() === s.query.toLowerCase();
              return (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => onSearchChange(active ? "" : s.query)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded transition-all border ${
                    active
                      ? "bg-accent text-accent-foreground border-accent font-bold shadow-sm"
                      : "bg-background/80 text-muted-foreground border-border hover:border-accent hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. ORDENAÇÃO COMPACTA */}
        <div className="space-y-1.5">
          <label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
            <ArrowDownUp className="w-3.5 h-3.5 text-accent" />
            Ordenar Por
          </label>
          <div className="grid grid-cols-2 gap-1 bg-background/50 p-1 border border-border rounded">
            {[
              { id: "recent", label: "Recentes" },
              { id: "price_asc", label: "Menor R$" },
              { id: "price_desc", label: "Maior R$" },
              { id: "asc", label: "A - Z" },
            ].map((sort) => {
              const active = sortOrder === sort.id;
              return (
                <button
                  key={sort.id}
                  onClick={() => onSortChange(sort.id)}
                  className={`text-[11px] font-mono py-1 px-2 rounded text-center transition-all ${
                    active
                      ? "bg-accent text-accent-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {sort.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. FAIXA DE PREÇO (PILLS DIRETOS DE 1 CLIQUE) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Faixa de Preço
            </label>
            {selectedPriceRange && (
              <button 
                onClick={() => onSelectPriceRange(null)} 
                className="font-mono text-[10px] text-muted-foreground hover:text-accent"
              >
                Reset
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onSelectPriceRange(null)}
              className={`text-[11px] font-mono py-1.5 px-2 rounded text-center border transition-all ${
                selectedPriceRange === null
                  ? "bg-accent text-accent-foreground border-accent font-bold"
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
                  onClick={() => onSelectPriceRange(active ? null : r.id)}
                  className={`text-[11px] font-mono py-1.5 px-2 rounded text-center border transition-all ${
                    active
                      ? "bg-accent text-accent-foreground border-accent font-bold"
                      : "bg-background text-muted-foreground border-border hover:border-accent hover:text-foreground"
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. SUB-FILTROS CONTEXTUAIS RÁPIDOS */}

        {/* A. Gramatura de BBs */}
        {selectedCategory === "#bbs" && (
          <div className="p-3 bg-muted/30 border border-border rounded space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase font-bold text-accent">Peso da Esfera (BBs)</span>
              {selectedWeight && (
                <button onClick={() => onSelectWeight(null)} className="font-mono text-[10px] text-muted-foreground hover:text-accent">
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
                    className={`text-xs font-mono py-1 rounded text-center border transition-all ${
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

        {/* B. Tipo de Vestuário */}
        {selectedCategory === "#vestuario" && (
          <div className="p-3 bg-muted/30 border border-border rounded space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase font-bold text-accent">Tipo de Equipamento</span>
              {selectedVestCategory && (
                <button onClick={() => onSelectVestCategory(null)} className="font-mono text-[10px] text-muted-foreground hover:text-accent">
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
                    className={`text-[11px] font-mono py-1.5 px-2 rounded text-left truncate border transition-all ${
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

        {/* C. Fabricante / Marca (Disponível dinamicamente conforme a categoria ativa) */}
        {availableBrands.length > 0 && (
          <div className="p-3 bg-muted/30 border border-border rounded space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase font-bold text-accent">Fabricante / Marca</span>
              {selectedBrand && (
                <button onClick={() => onSelectBrand(null)} className="font-mono text-[10px] text-muted-foreground hover:text-accent">
                  Reset
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {availableBrands.slice(0, 8).map((b) => {
                const active = selectedBrand === b;
                return (
                  <button
                    key={b}
                    onClick={() => onSelectBrand(active ? null : b)}
                    className={`text-[10px] font-mono px-2 py-1 rounded border transition-all ${
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
                className="w-full font-mono text-xs p-1.5 mt-1 rounded bg-background border border-border text-foreground"
              >
                <option value="">Todas as marcas ({availableBrands.length})...</option>
                {availableBrands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* 5. CATEGORIAS DE PRODUTOS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Categorias
            </h3>
            {selectedCategory && (
              <button 
                onClick={() => onSelectCategory(null)} 
                className="font-mono text-[10px] text-muted-foreground hover:text-accent"
              >
                Ver todas
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <button
              onClick={() => {
                onSelectCategory(null);
                onSelectBrand(null);
              }}
              className={`flex items-center justify-between font-mono text-xs px-3 py-2 rounded transition-all border ${
                selectedCategory === null 
                  ? "bg-accent text-accent-foreground border-accent font-bold" 
                  : "bg-background/40 hover:bg-muted text-muted-foreground border-transparent hover:border-border"
              }`}
            >
              <span>TODOS OS PRODUTOS</span>
              <span className="text-[10px] opacity-80">({totalCount})</span>
            </button>

            {MACRO_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => {
                    onSelectCategory(active ? null : cat.slug);
                    if (cat.slug !== "#bbs") onSelectWeight(null);
                    if (cat.slug !== "#vestuario") onSelectVestCategory(null);
                    onSelectBrand(null);
                  }}
                  className={`flex items-center justify-between font-mono text-xs px-3 py-2 rounded transition-all border ${
                    active
                      ? "bg-accent text-accent-foreground border-accent font-bold"
                      : "bg-background/40 hover:bg-muted text-muted-foreground border-transparent hover:border-border"
                  }`}
                >
                  <span className="truncate mr-2 uppercase">{cat.label}</span>
                  {active && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. BOTÃO DE LIMPAR TUDO */}
        {hasActiveFilters && (
          <button
            onClick={resetAllFilters}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded border border-destructive/40 text-destructive bg-destructive/10 hover:bg-destructive/20 font-mono text-xs uppercase font-semibold transition-colors mt-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar Todos os Filtros
          </button>
        )}

      </div>
    </aside>
  );
}
