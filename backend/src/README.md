# Backend Source Core

## Overview
Core scraping, snapshot management, category normalization, and workflow reporting engine for the Arsenal Crawler.

## Interface
- `Product`: Main product data contract holding identification, name, pricing, category classification, and price change history.
- `PricePoint`: Historic price entry with timestamp and price string.
- `CategorySummary`: Aggregate count and metadata for a catalog category.
- `Snapshot`: Serialized state of catalog execution containing all products, category counts, and update timestamp.
- `CATEGORIES`: Crawl source configuration defining target categories and entry URLs.
- `ALL_CATEGORIES`: Complete catalog taxonomy combining crawl targets and virtual categories.
- `enforceCategory(name: string, originalCategory: string): { categorySlug: string, weight: number }`: Keyword heuristic resolving accurate category and precedence weight based on product titles.
- `isValidProduct(name: string): boolean`: Exclusion filter filtering out unwanted non-airsoft items.
- `cleanProductName(name: string): string`: Sanitizes product titles removing provider branding while preserving technical specifications.
- `loadOverrides(path: string): Promise<OverrideMap>` / `saveOverrides(path: string, overrides: OverrideMap): Promise<void>`: Reads and writes manual category overrides in deterministic sorted JSON format.
- `applyOverrides(products: Product[], overrides: OverrideMap): ApplyResult`: Applies manual category corrections over scraped products.
- `recomputeCategorySummary(products: Product[]): CategorySummary[]`: Recalculates category item counts.
- `loadSnapshot(path: string): Promise<Snapshot | null>` / `saveSnapshot(path: string, snapshot: Snapshot): Promise<void>`: Snapshot storage operations.
- `applyChangeTracking(currentProducts: Product[], previousSnapshot: Snapshot | null, now: string): void`: Tracks price history, restocks, new products, and preserves first-seen timestamps.
- `runCrawler(): Promise<Product[]>`: Executes Crawlee CheerioCrawler pipeline across all categories with concurrency and retry controls.
- **Subdirectories**:
  - [Reliability](./reliability/README.md): Abrupt category drop detection and workflow failure issue management.

## Invariants
- Products with names matching `EXCLUDED_KEYWORDS` are discarded.
- Product titles are sanitized to strip 'Arsenal Sports' provider branding.
- Products are uniquely identified by numeric ID parsed from canonical product URL paths.
- Multiple occurrences of the same product across categories are resolved using category weight priority.
- If scraping yields 0 valid products, the execution terminates with code 1 and preserves existing snapshot state without overwriting.
- Product `firstSeen` dates and price history arrays are strictly preserved across crawls; price changes append new price points without erasing history.
- Manual category overrides in `overrides.json` override automated heuristic categorizations.

## Side Effects
- Performs HTTP scraping requests against target catalog URLs using Crawlee.
- Reads and updates `backend/snapshot.json`.
- Reads and writes `backend/overrides.json`.
- Writes `backend/category-alert.json` on detected category drops.
- Invokes GitHub CLI (`gh`) in reporting scripts (`reportExecutionStatus.ts`, `reportCategoryDrops.ts`) to manage alert labels and issues.
- Writes diagnostic logs to console and exits process on critical failures.

## Verification
- Run: `cd backend && npm test`
