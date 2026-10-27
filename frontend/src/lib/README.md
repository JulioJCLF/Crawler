# Frontend Library Utilities & Services

## Overview
Domain business logic, catalog data access services, price calculation rules, string sanitization, authentication services, and search helpers.

## Interface
- `cleanProductName(name: string): string`: Cleans product names stripping provider branding while maintaining specifications.
- `isSpeedLoader(product: { name: string }): boolean`: Identifies speed loaders, quick loaders, and loader repair kits.
- `buildActiveFilterChips(state: FilterState): ActiveFilterChip[]`: Formats active search and category filters into removable UI chips.
- `CLEARED_FILTER_STATE: FilterState`: Default clean filter state object.
- `isAccessory(name: string): boolean` / `isReplicaGun(name: string): boolean` / `isShotgun(product: any): boolean`: Pure categorization helpers.
- `AIRSOFT_BRANDS: string[]`: Known airsoft manufacturers for brand extraction.
- `getHiddenProducts()` / `saveHiddenProducts(map: Record<string, HiddenProductEntry>)`: Manages manually hidden products persisted on disk.
- `resolveCategoryLabel(slug: string): string`: Converts category slug into localized display label.
- `getPricingConfig(): PricingConfig` / `updatePricingConfig(config: Partial<PricingConfig>)`: Manages dynamic exchange rate and markup persistence.
- `calculateBRLPrice(usdPriceStr, categorySlug, customConfig?): CalculatedPrice`: Computes converted BRL price, margin, and installment calculations.
- `hashPassword(password: string, salt: string): string`: Computes SHA-256 salted hashes for administrative authentication.
- `getStoredAuthConfig(): MultiUserAuthConfig`: Retrieves multi-user authentication data.
- `normalizeText(text: string): string` / `preprocessSearchTokens(query: string): string[]`: Tokenizes and normalizes search terms with typo and synonym expansion.
- `cn(...inputs: ClassValue[]): string`: Tailwind CSS class merge utility.

## Invariants
- Product sanitization (`cleanProductName`) removes 'Arsenal Sports' occurrences without removing hyphenated model codes or calibers.
- `calculateBRLPrice` guarantees consistent rounding and fallback behavior when USD price is missing or zero.
- Catalog services fall back gracefully to local mock or empty states if filesystem persistence paths are not configured.
- Passwords are encrypted with SHA-256 using per-user unique salt.

## Side Effects
- Reads and writes persistence files (`pricing.json`, `auth.json`, `hidden_products.json`, `custom_products.json`, `snapshot.json`) via Node.js filesystem APIs in server environments.
- Logs warnings and audit records to server console.

## Verification
- Run: `cd frontend && npm test`
