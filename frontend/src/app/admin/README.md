# Admin Dashboard

## Overview
Administrative management portal view providing access to exchange rates, category profit margins, catalog hiding/unhiding, and custom product injection.

## Interface
- `AdminDashboardPage()`: Root administrative dashboard page verifying session permissions and rendering management tabs.
- **Subdirectories**:
  - [Login](./login/README.md): Administrative login and password recovery views.

## Invariants
- Access requires valid authentication session; unauthenticated requests redirect to `/admin/login`.
- Operators with `dolar_operator` role are restricted from destructive catalog editing tools available to `master`.

## Side Effects
- Queries `/api/auth/me` and `/api/admin/catalog/products` on page load.
- Dispatches mutations to `/api/pricing` and `/api/admin/catalog/*`.

## Verification
- Run: `cd frontend && npx tsc --noEmit`
