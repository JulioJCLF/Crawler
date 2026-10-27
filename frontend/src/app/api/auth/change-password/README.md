# Change Password Endpoint

## Overview
Self-service password update endpoint for active authenticated sessions.

## Interface
- `GET(req: NextRequest)`: Checks if current user is required to change password on first login.
- `POST(req: NextRequest)`: Validates current password and updates to new password.

## Invariants
- Requires active authenticated session.
- Re-verifies existing password prior to applying changes.

## Side Effects
- Updates password hash and salt in `data/auth.json`.

## Verification
- Run: `cd frontend && npm test`
