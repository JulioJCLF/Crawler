# App Routing & Shell

## Overview
Next.js App Router root layout and storefront catalog homepage, integrating search, filtering, radar feed, and product grid.

## Interface
- `RootLayout({ children }: { children: React.ReactNode })`: Global HTML shell configuring Geist typography, context providers, and metadata.
- `metadata: Metadata`: Storefront SEO meta tags and viewport definitions.
- `matchesCategory(p: any, selectedCategory: string | null): boolean`: Category matching predicate supporting virtual and mapped categories.
- `StorefrontPage()`: Default export catalog browse page with client-side filter synchronization, pagination, and search queries.
- **Subdirectories**:
  - [Admin](./admin/README.md): Back-office management portal and authentication views.
  - [API](./api/README.md): Backend API route handlers for catalog, auth, pricing, and health checks.

## Invariants
- Vitrine homepage must retain commercial viability (price visibility, cart drawer, WhatsApp direct ordering).
- Page supports static HTML generation for GitHub Pages as well as dynamic Node.js server execution on Railway.

## Side Effects
- Mounts React context providers (`CartProvider`, `PricingProvider`, `ThemeProvider`).
- Interacts with browser URL search parameters for filter state.

## Verification
- Run: `cd frontend && npm test`
