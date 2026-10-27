# Health API Endpoint

## Overview
Liveness and readiness health-check HTTP endpoint for deployment platforms and container orchestrators.

## Interface
- `GET()`: Returns HTTP 200 JSON status payload `{"status": "ok", "timestamp": string}`.

## Invariants
- Does not require authentication or database connection.
- Always responds with 200 OK when the Next.js process is healthy.

## Side Effects
- Returns JSON response.

## Verification
- Run: `cd frontend && npm test`
