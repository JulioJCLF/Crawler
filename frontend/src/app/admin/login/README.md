# Admin Login Page

## Overview
Administrative authentication UI view presenting secure credential entry, password recovery links, and session redirects.

## Interface
- `AdminLoginPage()`: React Server/Client component rendering administrative login and recovery modals.

## Invariants
- Direct access when already authenticated redirects immediately to `/admin`.
- Authentication failures display inline error alerts without revealing whether username exists.

## Side Effects
- Submits credentials to `/api/auth/login`.
- Modifies client route location on successful authentication.

## Verification
- Run: `cd frontend && npx tsc --noEmit`
