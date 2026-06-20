# Supabase Project Setup

Complete these steps once before first deployment. Takes approximately 15 minutes.

---

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Choose your organization
4. Fill in:
   - **Name:** `work-expense-reimbursement` (or any name)
   - **Database Password:** generate a strong password and save it somewhere safe
   - **Region:** choose the region closest to your users
5. Click **Create new project** — wait 2-3 minutes for provisioning

---

## 2. Get Your API Keys

1. Go to **Project Settings → API**
2. Copy:
   - **Project URL** → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Do NOT copy the `service_role` key — it is never used in this app

---

## 3. Apply Database Migrations

You have two options: SQL Editor (easier) or Supabase CLI (recommended for ongoing work).

### Option A: SQL Editor (No CLI Required)

Apply each migration file in order by pasting into the Supabase SQL Editor (**Database → SQL Editor → New query**):

1. `20260620000001_create_enums.sql`
2. `20260620000002_create_utility_functions.sql`
3. `20260620000003_create_profiles.sql`
4. `20260620000004_create_categories_and_payment_methods.sql`
5. `20260620000005_create_trips_and_projects.sql`
6. `20260620000006_create_reimbursement_batches.sql`
7. `20260620000007_create_expenses.sql`
8. `20260620000008_create_receipts_and_imports.sql`
9. `20260620000009_create_indexes.sql`
10. `20260620000010_create_rls_policies.sql`
11. `20260620000011_create_views.sql`
12. `20260620000012_seed_default_data_function.sql`
13. `20260620000013_create_storage_bucket.sql`

For each: paste the SQL → click **Run** → verify no errors.

### Option B: Supabase CLI

```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link to your project (get project-ref from Settings → General)
supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
supabase db push
```

---

## 4. Verify Schema

After applying migrations, verify in **Database → Tables** that you see:
- `profiles`
- `expense_categories`
- `payment_methods`
- `trips`
- `projects`
- `reimbursement_batches`
- `expenses`
- `receipts`
- `import_sessions`
- `import_transactions`

In **Storage → Buckets** verify you see: `receipts` (private)

---

## 5. Verify RLS Is Enabled

Go to **Database → Tables** and check that each table has the lock icon (RLS enabled). If any table shows RLS disabled, run:

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- (repeat for each table)
```

---

## 6. Configure Auth Providers

See [OAUTH_SETUP.md](./OAUTH_SETUP.md) for Google and Microsoft OAuth setup.

After configuring providers, also set:
- **Auth → URL Configuration → Site URL:** `https://your-vercel-app.vercel.app`
- **Auth → URL Configuration → Redirect URLs:** add:
  - `https://your-vercel-app.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` (for local dev)

---

## 7. Test the Connection

Once env vars are set locally:

```bash
cp .env.example .env.local
# Edit .env.local with your real values
npm run dev
```

Navigate to `http://localhost:3000/login` — the page should load without console errors.

---

## Regenerate TypeScript Types (After Schema Changes)

```bash
# Requires: supabase link (see Option B above)
npm run db:types
```

This overwrites `src/lib/supabase/types.ts` with auto-generated types from your live schema.
