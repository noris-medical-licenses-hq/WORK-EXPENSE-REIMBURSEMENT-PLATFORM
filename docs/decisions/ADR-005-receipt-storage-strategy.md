# ADR-005: Receipt Storage Strategy

**Date:** 2026-06-20  
**Status:** Accepted  
**Deciders:** Product Architecture

---

## Context

Receipts are files (JPEG, PNG, PDF) that must be stored securely, scoped to the authenticated user, and retrievable on demand. Options evaluated:

1. Supabase Storage
2. AWS S3
3. Cloudinary
4. Store as base64 in PostgreSQL

## Decision

**Use Supabase Storage with a private bucket scoped per user.**

Storage path pattern:
```
receipts/{user_id}/{expense_id}/{uuid}-{sanitized-original-filename}
```

Access via signed URLs (short TTL, generated on demand).

## Rationale

- Supabase Storage is already part of the stack — no additional vendor
- Storage policies enforce user_id scoping natively
- Signed URLs ensure receipts are not publicly accessible
- Path structure makes it easy to list all receipts for a user or expense
- Same auth token used for database is used for storage

## File Constraints

- Maximum size: 10MB per file
- Accepted types: image/jpeg, image/png, image/webp, application/pdf
- Multiple receipts per expense are supported
- Filename is sanitized before storage (no special characters)

## Security Rules

- Bucket is private (not public)
- Storage policy: `auth.uid() = user_id` extracted from path
- Signed URL TTL: 60 minutes (sufficient for typical session)
- Service role is never used from frontend

## Deletion Rules

- When a receipt record is deleted from the DB, the file is deleted from storage
- When an expense is deleted (soft), receipts remain attached (the expense still exists with `deleted_at`)
- Hard deletion of expense would cascade-delete receipts from storage

## Consequences

**Positive:**
- Single vendor
- Native access control
- No CORS issues

**Negative:**
- Supabase Storage free tier limits (5GB)
- No built-in image optimization
- No CDN in free tier

## Alternatives Considered

**AWS S3:** Rejected for MVP. Requires separate AWS account, credentials management, and additional cost/complexity.

**Base64 in PostgreSQL:** Rejected. Would bloat the database significantly and has poor performance at scale.
