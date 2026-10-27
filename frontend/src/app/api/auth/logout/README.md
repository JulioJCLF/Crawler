# Auth Logout Endpoint

## Overview
Session termination endpoint clearing client authentication state.

## Interface
- `POST()`: Clears active session cookie and invalidates client credentials.

## Invariants
- Operates idempotently; returns 200 OK whether a session was active or not.

## Side Effects
- Clears `SESSION_COOKIE_NAME` cookie by expiring it in response headers.

## Verification
- Run: `cd frontend && npm test`
