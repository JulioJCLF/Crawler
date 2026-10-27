# Products API Endpoint

## Overview
Public catalog data endpoint serving active products, applying exclusions, filters, and computed BRL prices.

## Interface
- `GET(req: NextRequest)`: Returns filtered, paginated catalog product listings with applied pricing rules.

## Invariants
- Hidden products listed in `hidden_products.json` are excluded from output unless requested in administrative mode.
- Returned products always have sanitized titles with provider branding stripped.

## Side Effects
- Reads `snapshot.json`, `hidden_products.json`, and `custom_products.json`.

## Verification
- Run: `cd frontend && npm test`
