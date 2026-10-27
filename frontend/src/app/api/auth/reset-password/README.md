# Reset Password Endpoint

## Overview
Password reset confirmation endpoint consuming valid recovery tokens and setting new user passwords.

## Interface
- `POST(req: NextRequest)`: Consumes reset token and replaces user password with new salted SHA-256 hash.

## Invariants
- Token must match and not be expired.
- Resets are single-use; the token is invalidated immediately upon successful password change.

## Side Effects
- Updates credentials and clears token in `data/auth.json`.

## Verification
- Run: `cd frontend && npm test`
