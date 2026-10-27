# Admin Catalog Products Endpoint

## Overview
Administrative CRUD API endpoint for catalog items, allowing managers to list all items, create custom products, update overrides, and delete custom entries.

## Interface
- `GET(req: NextRequest)`: Returns complete unfiltered product list with visibility status flags.
- `POST(req: NextRequest)`: Creates custom product entry.
- `PUT(req: NextRequest)`: Updates existing custom product or manual category assignment.
- `DELETE(req: NextRequest)`: Removes custom product entry.

## Invariants
- Requires authenticated session with `master` role.
- Custom products cannot overwrite IDs of crawled products.

## Side Effects
- Reads and updates `custom_products.json`.
- Modifies server-side catalog cache.

## Verification
- Run: `cd frontend && npm test`
