# Production Readiness Checklist

Complete this checklist before announcing the app is live.

---

## Infrastructure

- [ ] Supabase project created (not the free tier sandbox)
- [ ] All 13 migrations applied without errors
- [ ] RLS enabled on all 10 tables (verified in Supabase dashboard)
- [ ] `receipts` storage bucket exists, public = false
- [ ] Storage RLS policies applied (3 policies on storage.objects)
- [ ] Supabase Auth → Site URL set to production domain
- [ ] Supabase Auth → Redirect URLs includes production callback URL

## Authentication

- [ ] Google OAuth configured and tested in production
- [ ] Microsoft OAuth configured and tested in production
- [ ] Magic Link tested with real email (check spam filter too)
- [ ] After sign-in, user appears in Supabase → Auth → Users
- [ ] After sign-in, row created in `public.profiles` (via trigger)
- [ ] After sign-in, default categories seeded in `expense_categories`
- [ ] After sign-in, default payment methods seeded in `payment_methods`

## Environment

- [ ] `NEXT_PUBLIC_SUPABASE_URL` set in Vercel (production + preview)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in Vercel (production + preview)
- [ ] No `service_role` key in any environment variable
- [ ] `.env.local` is in `.gitignore` and never committed
- [ ] `.env.example` is committed (no real values)

## Build & Deploy

- [ ] `npm run build` passes with zero errors locally
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] Vercel production build succeeds (check build logs)
- [ ] All 13 routes generate successfully in Vercel build
- [ ] No console errors on dashboard, expenses, or login pages

## Core User Flows

- [ ] New user can sign up and land on dashboard
- [ ] User can create a new expense (all required fields)
- [ ] Created expense appears in expense list
- [ ] Expense detail page loads correctly
- [ ] Status can be changed (draft → ready → submitted)
- [ ] Receipt can be uploaded on expense detail
- [ ] Uploaded receipt displays (signed URL works)
- [ ] Expense can be soft-deleted
- [ ] Deleted expense no longer appears in list

## Security

- [ ] Unauthenticated requests to `/dashboard` redirect to `/login`
- [ ] User A cannot access User B's expenses (RLS enforcement)
- [ ] User A cannot download User B's receipts (Storage RLS)
- [ ] No sensitive data visible in browser Network tab (no service_role key)

## Performance

- [ ] Dashboard loads in < 3 seconds on mobile
- [ ] Expense list loads in < 2 seconds for 50 expenses
- [ ] Receipt upload < 10 seconds for a 5MB file

---

## Known Limitations (Acceptable for MVP)

- No email notifications
- No export / reporting
- No import from bank statements
- No multi-currency amount totaling (amounts display in original currency)
- No trip or project management (UI shells only)
- No batch / submission workflow (status transitions only)
- OCR not implemented (manual entry only)
