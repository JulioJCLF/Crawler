# Admin Catalog Hide Endpoint

## Overview
Administrative endpoint to hide unwanted catalog items from public storefront views without deleting them from snapshots.

## Interface
- `POST(req: NextRequest)`: Adds product ID to hidden products registry with audit timestamp and author metadata.

## Invariants
- Requires authenticated session with `master` role.
- Hiding an item preserves its price history and snapshot record.

## Side Effects
- Appends product ID entry to `data/hidden_products.json`.
- Invalidates active catalog cache.

## Verification
- Run: `cd frontend && npm test`
