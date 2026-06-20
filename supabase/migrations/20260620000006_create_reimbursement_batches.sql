CREATE TABLE IF NOT EXISTS reimbursement_batches (
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
