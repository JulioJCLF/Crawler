# Admin Catalog Unhide Endpoint

## Overview
Administrative endpoint to restore visibility of previously hidden catalog items.

## Interface
- `POST(req: NextRequest)`: Removes product ID from hidden products registry.

## Invariants
- Requires authenticated session with `master` role.
- Idempotent: unhiding a product that was not hidden succeeds with 200 OK.

## Side Effects
- Updates `data/hidden_products.json`.
- Invalidates active catalog cache.

## Verification
- Run: `cd frontend && npm test`
