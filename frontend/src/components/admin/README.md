# Admin Components

## Overview
Administrative dashboard management interfaces for product moderation, custom inventory entry, and catalog visibility controls.

## Interface
- `CatalogManager({ onCatalogChanged }: CatalogManagerProps)`: Comprehensive management table supporting manual product creation, hiding/unhiding items, cache resets, and price adjustments.

## Invariants
- Destructive operations (hiding, deletion) prompt confirmation or provide undo toasts.
- Actions trigger `onCatalogChanged` callback to invalidate cache and refresh table data.

## Side Effects
- Makes HTTP requests to `/api/admin/catalog/*` endpoints for updating catalog state.
- Dispatches UI notification toasts.

## Verification
- Run: `cd frontend && npx tsc --noEmit`
