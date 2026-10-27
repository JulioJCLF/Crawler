# Authentication API Subsystem

## Overview
Authentication and session management API routes, covering credential validation, session inspection, and password recovery.

## Subdirectories & Boundaries
- [login](./login/README.md): Credential validation and session cookie issuing.
- [logout](./logout/README.md): Session termination and cookie expiration.
- [me](./me/README.md): Active session inspection and role retrieval.
- [forgot-password](./forgot-password/README.md): Password recovery initiation and token generation.
- [reset-password](./reset-password/README.md): Recovery token validation and password setting.
- [change-password](./change-password/README.md): Authenticated user self-service password updates.
