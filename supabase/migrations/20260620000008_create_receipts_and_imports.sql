CREATE TABLE IF NOT EXISTS receipts (
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

CREATE TABLE IF NOT EXISTS import_sessions (
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

CREATE TABLE IF NOT EXISTS import_transactions (
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
