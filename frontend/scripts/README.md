# Frontend Scripts

## Overview
Maintenance and operational CLI scripts for frontend data audits and administrative credential resets.

## Interface
- `catalog-audit.ts`: Audits snapshot data against catalog filters, identifying hidden or excluded items.
- `reset-auth.ts`: Resets local and production auth storage credentials to factory defaults.

## Invariants
- Scripts must be executed within Node.js runtime with TypeScript loader (`tsx` or `ts-node`).
- `reset-auth.ts` restores default `admin` and `cambio` credentials, overwriting current `auth.json`.

## Side Effects
- Reads `snapshot.json` and `hidden_products.json`.
- Modifies or recreates `auth.json` on credential resets.
- Outputs status reports to standard output.

## Verification
- Run: `cd frontend && npm test`
