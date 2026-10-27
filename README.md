# Arsenal Crawler Blueprint

## System Overview
Automated web scraping, catalog change detection, currency-adjusted commercial vitrine, and backoffice moderation suite for Arsenal Sports catalog data. The system crawls product categories, sanitizes titles, tracks historic pricing revisions in persistent snapshots, and serves an interactive storefront with dynamic USD/BRL currency conversion, margin computation, shopping cart dispatch via WhatsApp, and automated reliability alerts.

## Local Interface & Invariants
- `Makefile`: Central project orchestration interface providing targets for documentation (`make docs`), backend testing (`make test`), typechecking (`make typecheck`), local crawling (`make crawler`), and frontend development (`make frontend-dev`).
- `docker-entrypoint.sh`: Container entrypoint managing process execution and file permissions in production environments.
- `projeto.json`: Project taxonomy, sprint phases, and documentation generator configuration.

## Subdirectories & System Boundaries
- [Backend](./backend/README.md): TypeScript crawler service built on Crawlee and Cheerio, handling multi-category pagination, change detection, price history preservation, category overrides, and failure alerts.
- [Frontend](./frontend/README.md): Next.js storefront vitrine and administrative portal providing catalog search, multi-facet filtering, dynamic BRL pricing, shopping cart with WhatsApp order generation, and catalog moderation.
- [Scripts](./scripts/README.md): Python automation utilities generating real-time project progress dashboards and tracking panels in `docs/Painéis`.

## Global Invariants
- **Spec-Driven Development**: All new features and functional changes must originate in requirements documentation (`docs/02 Requisitos`) and technical specifications before implementation.
- **Respect Source Infrastructure**: Scraper concurrency, request timeouts, and backoff delays must strictly adhere to `03-crawler-spec.md` to prevent load spikes on target servers.
- **Snapshot Immutability & History Preservation**: `snapshot.json` is a historical ledger; price points, `firstSeen` timestamps, and historic price revisions must never be truncated or overwritten destructively.
- **Commercial Storefront Mandate**: No refactoring may remove product prices, the shopping cart drawer, or the direct WhatsApp order link from product cards.
- **Brand Cleansing**: Product displays, WhatsApp messages, and notifications must sanitize titles removing supplier branding while preserving technical specifications and model codes.

## Global Side Effects
- Performs scheduled HTTP scraping requests against target catalog web pages.
- Reads and updates versioned `backend/snapshot.json` and administrative persistence stores (`pricing.json`, `auth.json`, `hidden_products.json`, `custom_products.json`).
- Generates GitHub issues and labels via GitHub CLI (`gh`) during scheduled CI crawler workflows on failures or category drop anomalies.
- Overwrites markdown tracking panels in `docs/Painéis/`.

## System Verification
- Run tests: `make test`
- Type check: `make typecheck`
- Generate docs: `make docs`
