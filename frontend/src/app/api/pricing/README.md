# Pricing API Endpoint

## Overview
HTTP endpoint for retrieving and updating commercial pricing parameters, currency exchange rates, and category profit margins.

## Interface
- `GET()`: Returns current `PricingConfig` (USD to BRL rate, category markups, last updated timestamp).
- `POST(req: NextRequest)`: Authenticated mutation endpoint updating exchange rate and category margins.

## Invariants
- `POST` requires valid operator or administrator session cookie.
- Negative or non-numeric exchange rates and markups are rejected with 400 Bad Request.

## Side Effects
- Persists updated pricing configuration to `data/pricing.json`.
- Invalidate in-memory server cache.

## Verification
- Run: `cd frontend && npm test`
