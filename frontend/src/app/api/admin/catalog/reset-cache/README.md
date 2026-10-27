# Admin Catalog Reset Cache Endpoint

## Overview
Administrative endpoint forcing immediate cache invalidation and reloading catalog data from disk.

## Interface
- `POST(req: NextRequest)`: Clears in-memory catalog cache and triggers fresh reload from `snapshot.json`.

## Invariants
- Requires authenticated session with `master` role.
- Response includes timestamp of reload and count of active items loaded.

## Side Effects
- Clears server in-memory catalog cache.
- Reads `snapshot.json`, `hidden_products.json`, and `custom_products.json`.

## Verification
- Run: `cd frontend && npm test`
