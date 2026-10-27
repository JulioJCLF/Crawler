# Forgot Password Endpoint

## Overview
Password reset initiation endpoint creating recovery tokens and sending notification emails if SMTP is configured.

## Interface
- `POST(req: NextRequest)`: Accepts username or email, generates single-use reset token with expiration, and sends recovery email if configured.

## Invariants
- Does not reveal whether user exists to prevent account enumeration.
- Generated reset tokens expire after configured window (default 15 minutes).

## Side Effects
- Updates `data/auth.json` with temporary reset token.
- Dispatches SMTP reset email when email service is enabled.

## Verification
- Run: `cd frontend && npm test`
