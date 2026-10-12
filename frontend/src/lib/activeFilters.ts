import { MACRO_CATEGORIES, VEST_CATEGORIES } from "@/components/layout/Filters";
import { PRICE_RANGES } from "@/lib/searchUtils";

export interface FilterState {
  search: string;
  category: string | null;
  brand: string | null;
  weight: string | null;
  vestCategory: string | null;
  priceRange: string | null;
}

export type FilterKey = keyof FilterState;

export interface ActiveFilterChip {
  key: FilterKey;
  label: string;
}

function categoryLabel(slug: string): string {
  return MACRO_CATEGORIES.find((c) => c.slug === slug)?.label || slug;
}

function vestLabel(value: string): string {
  return VEST_CATEGORIES.find((v) => v.value === value)?.label || value;
}

function priceRangeLabel(rangeId: string): string {
  return PRICE_RANGES.find((r) => r.id === rangeId)?.label || rangeId;
}

// REQ-017 / REQ-022: monta o resumo de filtros ativos para exibir na vitrine.
export function buildActiveFilterChips(state: FilterState): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];

  if (state.search) {
    chips.push({ key: "search", label: `Busca: "${state.search}"` });
  }
  if (state.category) {
    chips.push({ key: "category", label: categoryLabel(state.category) });
  }
  if (state.priceRange) {
    chips.push({ key: "priceRange", label: `Preço: ${priceRangeLabel(state.priceRange)}` });
  }
  if (state.brand) {
    chips.push({ key: "brand", label: state.brand });
  }
  if (state.weight) {
    chips.push({ key: "weight", label: state.weight });
  }
  if (state.vestCategory) {
    chips.push({ key: "vestCategory", label: vestLabel(state.vestCategory) });
  }

  return chips;
}

// RN2: ordenação (sortOrder) não faz parte do FilterState — limpar filtros nunca a altera.
export const CLEARED_FILTER_STATE: FilterState = {
  search: "",
  category: null,
  brand: null,
  weight: null,
  vestCategory: null,
  priceRange: null,
};
