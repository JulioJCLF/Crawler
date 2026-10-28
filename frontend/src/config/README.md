# Site Configuration

## Overview
Global site metadata, theme definitions, routing base path calculations, and navigation constants.

## Interface
- `ThemeName`: Theme union (`"hunting" | "minimal" | "dark" | "light"`).
- `LayoutMode`: Navigation layout union (`"sidebar" | "topbar" | "drawer"`).
- `BASE_PATH: string`: Dynamic base path calculated from `NEXT_PUBLIC_BASE_PATH` or static export environment.
- `asset(path: string): string`: Helper resolving asset URLs respecting `BASE_PATH`.
- `SiteConfig`: Site branding and navigation contract.
- `WhatsAppSeller`: Contract defining selectable WhatsApp sales representatives (`id`, `name`, `number`).
- `siteConfig: SiteConfig`: Default site configuration including title, contacts, primary WhatsApp integration number, selectable `whatsappSellers` list for cart checkout, and social links.

## Invariants
- `BASE_PATH` resolves to `"/crawler"` when `STATIC_EXPORT === "true"` unless overridden by `NEXT_PUBLIC_BASE_PATH`.
- `siteConfig` defines the single source of truth for the commercial WhatsApp contact number and store branding.

## Side Effects
- Reads `process.env.NEXT_PUBLIC_BASE_PATH` and `process.env.STATIC_EXPORT` at initialization time.

## Verification
- Run: `cd frontend && npm test`
