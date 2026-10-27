"use client";

import { ActiveFilterChip, FilterKey } from "@/lib/activeFilters";

interface ActiveFiltersProps {
  chips: ActiveFilterChip[];
  onRemove: (key: FilterKey) => void;
  onClearAll: () => void;
}

// REQ-017: resumo dos filtros ativos, com opção de remover um por um ou limpar tudo.
export function ActiveFilters({ chips, onRemove, onClearAll }: ActiveFiltersProps) {
  if (chips.length === 0) return null;

  return (
    <div
      data-testid="active-filters"
      className="flex flex-wrap items-center gap-2 mb-6 font-mono text-xs"
    >
      <span className="text-muted-foreground text-[11px] uppercase tracking-wider mr-1">Filtros:</span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={() => onRemove(chip.key)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-accent/10 border border-accent/40 text-accent hover:bg-accent/20 hover:border-accent transition-colors"
          title="Clique para remover este filtro"
        >
          <span className="font-medium">{chip.label}</span>
          <span aria-hidden="true" className="text-sm font-bold leading-none">&times;</span>
        </button>
      ))}
      <button
        onClick={onClearAll}
        className="px-2.5 py-1 rounded border border-border text-muted-foreground uppercase text-[11px] hover:text-destructive hover:border-destructive/50 transition-colors ml-1"
      >
        Limpar filtros
      </button>
    </div>
  );
}
