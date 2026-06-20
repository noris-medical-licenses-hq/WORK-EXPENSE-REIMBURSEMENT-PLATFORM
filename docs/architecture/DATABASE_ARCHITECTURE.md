# Database Architecture v1

**Project:** Work Expense Reimbursement Platform  
**Version:** 1.0  
**Date:** 2026-06-20  
**Status:** Approved

---

## 1. Overview

- **Database:** PostgreSQL (managed by Supabase)
- **Schema:** public (application tables), auth (Supabase managed)
- **Auth:** Supabase Auth owns `auth.users`
- **Security:** Row Level Security (RLS) enabled on all application tables
- **Migrations:** Managed via Supabase CLI migration files

---

## 2. Migration Strategy

### 2.1 File Naming Convention
```
supabase/migrations/
  YYYYMMDDHHMMSS_description.sql
```

Example:
```
20260620000001_create_profiles.sql
20260620000002_create_expense_categories.sql
20260620000003_create_payment_methods.sql
20260620000004_create_trips.sql
20260620000005_create_projects.sql
20260620000006_create_reimbursement_batches.sql
20260620000007_create_expenses.sql
20260620000008_create_receipts.sql
20260620000009_create_import_sessions.sql
20260620000010_create_import_transactions.sql
20260620000011_create_indexes.sql
20260620000012_seed_default_categories.sql
20260620000013_seed_default_payment_methods.sql
20260620000014_create_rls_policies.sql
20260620000015_create_views.sql
```

### 2.2 Migration Rules
- Each migration must be idempotent where possible (`CREATE TABLE IF NOT EXISTS`)
- Never DROP a column in a migration — add nullable columns, deprecate old ones
- Never rename a column in a migration without a transition period
- All migrations must have a corresponding rollback documented in comments
- Seed data goes in separate migration files, not embedded in schema migrations

---

## 3. Full Schema

### 3.1 Enumerations

```sql
-- Expense reimbursement lifecycle status
CREATE TYPE reimbursement_status AS ENUM (
  'draft',
  'ready',
  'submitted',
  'approved',
  'paid',
  'rejected'
);

-- Receipt attachment status
CREATE TYPE receipt_status AS ENUM (
  'not_required',
  'required_missing',
  'uploaded'
);

-- Trip lifecycle status
CREATE TYPE trip_status AS ENUM (
  'planning',
  'active',
  'completed',
  'cancelled'
);

-- Project lifecycle status
CREATE TYPE project_status AS ENUM (
  'active',
  'completed',
  'archived'
);

-- Reimbursement batch status
CREATE TYPE batch_status AS ENUM (
  'draft',
  'submitted',
  'approved',
  'paid',
  'rejected'
);

-- Payment method type
CREATE TYPE payment_method_type AS ENUM (
  'credit_card',
  'debit_card',
  'cash',
  'bank_transfer',
  'paypal',
  'apple_pay',
  'google_pay',
  'other'
);

-- Import session status
CREATE TYPE import_status AS ENUM (
  'pending',
  'processing',
  'review',
  'completed',
  'failed'
);

-- Import transaction status
CREATE TYPE import_transaction_status AS ENUM (
  'pending',
  'imported',
  'skipped',
  'duplicate'
);
```

### 3.2 Profiles

```sql
CREATE TABLE profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       text,
  email           text NOT NULL,
  avatar_url      text,
  default_currency char(3) NOT NULL DEFAULT 'USD',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 3.3 Expense Categories

```sql
CREATE TABLE expense_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        text NOT NULL,
  icon        text,
  color       text,
  is_default  boolean NOT NULL DEFAULT false,
  is_active   boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);
```

### 3.4 Payment Methods

```sql
CREATE TABLE payment_methods (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        text NOT NULL,
  type        payment_method_type NOT NULL DEFAULT 'other',
  last_four   char(4),
  is_default  boolean NOT NULL DEFAULT false,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);
```

### 3.5 Trips

```sql
CREATE TABLE trips (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        text NOT NULL,
  destination text,
  client      text,
  start_date  date,
  end_date    date,
  status      trip_status NOT NULL DEFAULT 'planning',
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz,
  CONSTRAINT trips_dates_check CHECK (
    end_date IS NULL OR start_date IS NULL OR end_date >= start_date
  )
);

CREATE TRIGGER set_trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 3.6 Projects

```sql
CREATE TABLE projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  client      text,
  status      project_status NOT NULL DEFAULT 'active',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 3.7 Reimbursement Batches

```sql
CREATE TABLE reimbursement_batches (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name         text NOT NULL,
  description  text,
  status       batch_status NOT NULL DEFAULT 'draft',
  submitted_at timestamptz,
  approved_at  timestamptz,
  paid_at      timestamptz,
  notes        text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT batch_paid_check CHECK (
    paid_at IS NULL OR status = 'paid'
  )
);

CREATE TRIGGER set_batches_updated_at
  BEFORE UPDATE ON reimbursement_batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 3.8 Expenses *(Core Table)*

```sql
CREATE TABLE expenses (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title                 text NOT NULL,
  description           text,
  amount                numeric(12, 2) NOT NULL,
  currency              char(3) NOT NULL,
  expense_date          date NOT NULL,
  vendor_name           text,
  vendor_country        char(2),
  category_id           uuid REFERENCES expense_categories(id) ON DELETE SET NULL,
  payment_method_id     uuid REFERENCES payment_methods(id) ON DELETE SET NULL,
  trip_id               uuid REFERENCES trips(id) ON DELETE SET NULL,
  project_id            uuid REFERENCES projects(id) ON DELETE SET NULL,
  batch_id              uuid REFERENCES reimbursement_batches(id) ON DELETE SET NULL,
  receipt_status        receipt_status NOT NULL DEFAULT 'required_missing',
  reimbursement_status  reimbursement_status NOT NULL DEFAULT 'draft',
  is_personal           boolean NOT NULL DEFAULT false,
  notes                 text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  deleted_at            timestamptz,
  CONSTRAINT expense_amount_positive CHECK (amount > 0),
  CONSTRAINT expense_currency_length CHECK (length(currency) = 3)
);

CREATE TRIGGER set_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 3.9 Receipts

```sql
CREATE TABLE receipts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id  uuid NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_path   text NOT NULL,
  file_name   text NOT NULL,
  file_type   text NOT NULL,
  file_size   integer NOT NULL,
  ocr_raw     jsonb,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT receipts_file_size_check CHECK (file_size > 0 AND file_size <= 10485760)
);
```

### 3.10 Import Sessions

```sql
CREATE TABLE import_sessions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name         text NOT NULL,
  file_type         text NOT NULL,
  status            import_status NOT NULL DEFAULT 'pending',
  raw_data          jsonb,
  transaction_count integer,
  imported_count    integer DEFAULT 0,
  skipped_count     integer DEFAULT 0,
  error_message     text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  completed_at      timestamptz
);
```

### 3.11 Import Transactions

```sql
CREATE TABLE import_transactions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       uuid NOT NULL REFERENCES import_sessions(id) ON DELETE CASCADE,
  user_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  raw_date         text,
  raw_amount       text,
  raw_currency     text,
  raw_merchant     text,
  raw_description  text,
  mapped_expense_id uuid REFERENCES expenses(id) ON DELETE SET NULL,
  status           import_transaction_status NOT NULL DEFAULT 'pending',
  duplicate_of_id  uuid REFERENCES expenses(id) ON DELETE SET NULL,
  duplicate_score  integer CHECK (duplicate_score BETWEEN 0 AND 100),
  created_at       timestamptz NOT NULL DEFAULT now()
);
```

---

## 4. Utility Functions

```sql
-- Auto-update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 5. Row Level Security Policies

All tables have RLS enabled. Authenticated users can only access their own data.

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE reimbursement_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_transactions ENABLE ROW LEVEL SECURITY;

-- Profile: user owns their own profile
CREATE POLICY "profiles_own_row" ON profiles
  FOR ALL USING (auth.uid() = id);

-- All other tables: user_id = authenticated user
-- Pattern applied to: expense_categories, payment_methods, trips,
-- projects, reimbursement_batches, expenses, receipts, import_sessions, import_transactions

CREATE POLICY "expense_categories_own_rows" ON expense_categories
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "payment_methods_own_rows" ON payment_methods
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "trips_own_rows" ON trips
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "projects_own_rows" ON projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "batches_own_rows" ON reimbursement_batches
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "expenses_own_rows" ON expenses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "receipts_own_rows" ON receipts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "import_sessions_own_rows" ON import_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "import_transactions_own_rows" ON import_transactions
  FOR ALL USING (auth.uid() = user_id);
```

---

## 6. Database Views

```sql
-- Dashboard summary per user
CREATE VIEW expense_summary AS
SELECT
  user_id,
  COUNT(*) FILTER (WHERE reimbursement_status = 'draft') AS draft_count,
  COUNT(*) FILTER (WHERE reimbursement_status = 'ready') AS ready_count,
  COUNT(*) FILTER (WHERE reimbursement_status = 'submitted') AS submitted_count,
  COUNT(*) FILTER (WHERE reimbursement_status = 'approved') AS approved_count,
  COUNT(*) FILTER (WHERE reimbursement_status = 'paid') AS paid_count,
  COUNT(*) FILTER (WHERE reimbursement_status = 'rejected') AS rejected_count,
  COUNT(*) FILTER (WHERE receipt_status = 'required_missing') AS missing_receipts_count,
  SUM(amount) FILTER (WHERE reimbursement_status IN ('draft', 'ready')) AS pending_amount,
  SUM(amount) FILTER (WHERE reimbursement_status = 'submitted') AS submitted_amount,
  SUM(amount) FILTER (WHERE reimbursement_status = 'approved') AS approved_amount
FROM expenses
WHERE deleted_at IS NULL
GROUP BY user_id;
```

---

## 7. Storage Buckets

```
receipts/
  {user_id}/
    {expense_id}/
      {uuid}-{original_filename}
```

**Bucket policy:** Private bucket. Access via signed URLs scoped to authenticated user.

---

## 8. Seed Data

On first login (profile creation trigger), seed:

**Default Categories:**
```
Meals & Dining | icon: fork-knife | color: #F59E0B
Transportation | icon: car | color: #3B82F6
Accommodation | icon: bed | color: #8B5CF6
Flights | icon: plane | color: #06B6D4
Parking | icon: parking | color: #64748B
Fuel | icon: fuel | color: #EF4444
Equipment | icon: laptop | color: #10B981
Office Supplies | icon: paperclip | color: #6366F1
Conference & Events | icon: calendar | color: #EC4899
Client Entertainment | icon: star | color: #F97316
Telecommunications | icon: phone | color: #14B8A6
Other | icon: more-horizontal | color: #94A3B8
```

**Default Payment Methods:**
```
Cash | type: cash | is_default: false
Credit Card | type: credit_card | is_default: true
Other | type: other | is_default: false
```

---

*Next: See EXPENSE_LIFECYCLE.md for status transition rules.*
