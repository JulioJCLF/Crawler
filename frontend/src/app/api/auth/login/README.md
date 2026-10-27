# Auth Login Endpoint

## Overview
User authentication endpoint handling credential validation and issuing signed session cookies.

## Interface
- `POST(req: NextRequest)`: Validates username and password against stored salt and hash, returning session cookie on success.

## Invariants
- Invalid credentials return 401 Unauthorized without exposing specific error details.
- Successful authentication sets HTTP-only `SESSION_COOKIE_NAME` cookie.

## Side Effects
- Reads `data/auth.json`.
- Sets session cookie in response headers.

## Verification
- Run: `cd frontend && npm test`
