# Frontend Types

## Overview
Shared TypeScript data contracts and domain interfaces for the vitrine, administrative dashboard, and API layers.

## Interface
- `Product`: Complete product contract including pricing, history, badges, and metadata.
- `PricePoint`: Historic price entry with date and price value.
- `CategorySummary`: Aggregate count and metadata for a catalog category.
- `Snapshot`: Scraped catalog state holding all products and metadata.
- `PricingConfig`: Configuration for currency conversion and category markups.
- `CalculatedPrice`: Computed BRL price, margin, installment details, and rounding.
- `CustomProductInput`: Payload schema for manual product creation.
- `HiddenProductEntry`: Metadata for manually hidden catalog items.
- `AdminProductListResponse`: Paginated product payload for administrative views.
- `UserRole`: Literal type union `"master" | "dolar_operator"`.
- `AuthUser`: Authenticated user session representation.
- `PasswordResetToken`: Reset token record with expiration and user linkage.

## Invariants
- Types in this package are compile-time contracts and must remain synchronized with backend `types.ts`.
- `UserRole` strictly restricts access levels between administrator (`master`) and currency operator (`dolar_operator`).

## Side Effects
- None (compile-time type definitions only).

## Verification
- Run: `cd frontend && npx tsc --noEmit`
