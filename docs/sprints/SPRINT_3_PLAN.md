# Sprint 3: Receipt Upload & Deployment

**Project:** Work Expense Reimbursement Platform  
**Sprint:** 3  
**Goal:** Real receipt upload working end-to-end + production deployment documentation

---

## Sprint Goal

At the end of Sprint 3:
1. Users can upload receipts (JPEG, PNG, WebP, HEIC, PDF) to expenses
2. Uploaded receipts display with signed URLs (secure, time-limited)
3. Receipt deletion removes both Storage object and DB row
4. `expense.receipt_status` updates automatically on upload/delete
5. Full deployment documentation exists for Supabase + Vercel + OAuth
6. Production checklist is ready for go-live verification

---

## Sprint 3 Scope

### Completed

#### Storage Architecture
- [x] Migration `20260620000013_create_storage_bucket.sql`
  - Private `receipts` bucket (file_size_limit: 10MB)
  - Allowed MIME types: JPEG, PNG, WebP, HEIC, HEIF, PDF
  - 3 RLS policies on `storage.objects` scoped to user folder

#### Receipt Upload Code
- [x] `ReceiptRepository` — upload, findByExpense, getSignedUrl, remove
- [x] `ReceiptService` — file type validation, upload → status update, delete → status revert
- [x] `ReceiptSection` component — file picker, upload progress, receipt list, view (signed URL), delete
- [x] `ExpenseDetailShell` updated — receipt section integrated, reloads expense on status change

#### Deployment Documentation
- [x] `docs/deployment/SUPABASE_SETUP.md` — step-by-step project creation + migration application
- [x] `docs/deployment/VERCEL_SETUP.md` — GitHub → Vercel → env vars → custom domain
- [x] `docs/deployment/OAUTH_SETUP.md` — Google + Microsoft OAuth credential setup
- [x] `docs/deployment/PRODUCTION_CHECKLIST.md` — go-live verification checklist
- [x] `.env.example` — environment variable template
- [x] `README.md` — updated to Next.js 16, correct env file, deployment links

---

## Receipt Lifecycle (Sprint 3 Implementation)

```
Expense created
    ↓
receipt_status = "required_missing"    (default)
    ↓
User uploads file via ReceiptSection
    ↓
File stored: receipts/{user_id}/{expense_id}/{uuid}-{filename}
receipt_status = "uploaded"
    ↓
User views receipt → signed URL (1hr TTL)
    ↓
User deletes receipt → Storage object removed + DB row deleted
If last receipt: receipt_status reverts to "required_missing"
    ↓
OR: User marks receipt as not_required (via status transition in Sprint 4)
receipt_status = "not_required"
```

---

## Storage Strategy

| Property | Value |
|----------|-------|
| Bucket | `receipts` |
| Visibility | Private |
| Path template | `{user_id}/{expense_id}/{uuid}-{sanitized_filename}` |
| Max file size | 10 MB |
| Allowed types | JPEG, PNG, WebP, HEIC, HEIF, PDF |
| URL type | Signed (1 hour TTL) |
| RLS scope | First path segment must equal `auth.uid()` |

---

## Deferred to Sprint 4

- Settings page (profile, default currency, categories, payment methods)
- Trip management CRUD
- Batch management CRUD
- `mark_receipt_not_required` UX action
- Expense edit (update existing expense)
- Expense filters (by status, date range, category)
- Dashboard improvements (date grouping, spending trend)

---

## Definition of Done — Sprint 3

- [x] `npm run build` passes zero errors
- [x] `npx tsc --noEmit` passes zero errors
- [x] Storage migration file exists and is idempotent (`ON CONFLICT DO NOTHING`)
- [x] ReceiptSection renders in ExpenseDetailShell
- [x] Deployment docs cover all three setup steps (Supabase, OAuth, Vercel)
- [x] Production checklist covers all critical paths
- [x] All commits pushed to main
