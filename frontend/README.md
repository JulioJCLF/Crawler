# Frontend Vitrine & Backoffice

## System Overview
Next.js static export vitrine and dynamic administrative backoffice for the Arsenal Crawler. Displays catalog products with dynamic currency conversion (USD to BRL), commercial markup, shopping cart with WhatsApp order dispatch, and an administrative portal for product moderation and pricing controls.

## Local Interface & Invariants
- `next.config.ts`: Configures static export (`output: 'export'`) when `STATIC_EXPORT=true` for GitHub Pages, with base path `/crawler`.
- `vitest.config.ts`: Vitest test configuration with React Testing Library and JSDOM environment.
- `docker-entrypoint.sh`: Container entrypoint ensuring volume write permissions via `su-exec` in Railway deployments.

## Subdirectories & System Boundaries
- [scripts](./scripts/README.md): Catalog audit and authentication credential reset CLI scripts.
- [src](./src/README.md): Application source code containing App Router pages, components, services, and state providers.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load Geist, a new font family for Vercel.

## Global Invariants
- **Commercial Viability**: No UI refactor may remove product prices, shopping cart functionality, or the direct WhatsApp order link (mandate per `05-frontend-guidelines.md`).
- **Brand Cleansing**: Storefront displays must sanitize product titles to remove supplier branding while preserving technical specifications and model designations.
- **Role Permissions**: Financial exchange rate editing is accessible to `dolar_operator` and `master`, whereas destructive catalog hiding and custom product creation are restricted to `master`.

## Global Side Effects
- Reads and updates persisted JSON data in `data/` or volume mount (`pricing.json`, `auth.json`, `hidden_products.json`, `custom_products.json`).
- Dispatches order messages via external WhatsApp Web API.

## System Verification
- Run: `cd frontend && npm test`
- Typecheck: `cd frontend && npx tsc --noEmit`
