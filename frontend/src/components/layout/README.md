# Layout Components

## Overview
High-level structural layout, search filtering, brand logo, hero banner, radar changelog, and cart drawer components.

## Interface
- `Hero()`: Hero section highlighting catalog features and search capabilities.
- `ActiveFilters({ chips, onRemove, onClearAll }: ActiveFiltersProps)`: Active filter tags display with individual and clear-all removal triggers.
- `Filters({ ... }: FiltersProps)`: Multi-facet sidebar filter panel covering macro-categories, sub-categories, price ranges, BB weights, and gear types.
- `Radar({ products }: { products: Product[] })`: Floating feed and badge showcasing recent additions, restocks, and price reductions.
- `Logo({ className }: { className?: string })`: Brand SVG logo renderer.
- `FloatingCart()`: Floating drawer trigger displaying item counts and slide-out cart drawer.
- `MACRO_CATEGORIES`: Pre-defined grouped category definitions.
- `BB_WEIGHTS`: Standard airsoft ammunition weight options.
- `VEST_CATEGORIES`: Tactical gear subcategories.

## Invariants
- Filters component synchronizes two-way state with active filter parameters.
- Radar exclusively shows products tagged with `changeType` (`new`, `restock`, `price_change`).
- ActiveFilters remains hidden when no filters are selected.

## Side Effects
- Reads and updates URL search params when filters are toggled.
- Renders responsive DOM overlays.

## Verification
- Run: `cd frontend && npm test`
