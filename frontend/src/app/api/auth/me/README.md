# Auth Me Endpoint

## Overview
Session verification endpoint returning profile and role of currently authenticated user.

## Interface
- `GET(req: NextRequest)`: Reads active session cookie and returns user identity (`username`, `role`).

## Invariants
- If session cookie is missing or invalid, returns 401 Unauthorized.
- Never exposes password hashes or salt in response payload.

## Side Effects
- Reads incoming request cookie header.

## Verification
- Run: `cd frontend && npm test`
