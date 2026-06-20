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
