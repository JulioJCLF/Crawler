# Components

## Overview
Presentation component library for the vitrine storefront, including individual product cards, layout sections, administration controls, and UI primitives.

## Interface
- `ProductCard({ product }: { product: Product })`: Showcase card rendering product imagery, sanitized title, computed BRL/USD pricing, installment terms, badge radar indicators, and WhatsApp / Cart action buttons.
- **Subdirectories**:
  - [Admin](./admin/README.md): Administrative inventory and catalog management tables.
  - [Layout](./layout/README.md): Structural layout blocks, filters, radar feed, hero banner, and cart drawers.
  - [UI](./ui/README.md): Low-level Tailwind and Radix UI primitives.

## Invariants
- `ProductCard` must always display the price, add to cart button, and WhatsApp ordering link (commercial storefront mandate per frontend guidelines).
- Products marked with price drop or restock show prominent status badges.

## Side Effects
- Interactive addition of items to shopping cart context (`useCart`).
- Generates outbound WhatsApp redirect links with pre-filled product query text.

## Verification
- Run: `cd frontend && npm test`
