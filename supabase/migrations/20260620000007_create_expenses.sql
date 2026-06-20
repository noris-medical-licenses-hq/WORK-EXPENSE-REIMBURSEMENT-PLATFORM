CREATE TABLE IF NOT EXISTS expenses (
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
