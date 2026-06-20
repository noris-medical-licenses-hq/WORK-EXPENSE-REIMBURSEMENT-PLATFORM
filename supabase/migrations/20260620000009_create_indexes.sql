-- Most common query: expenses by user, ordered by date
CREATE INDEX IF NOT EXISTS idx_expenses_user_date
  ON expenses(user_id, expense_date DESC)
  WHERE deleted_at IS NULL;

-- Status filtering (dashboard metrics)
CREATE INDEX IF NOT EXISTS idx_expenses_user_status
  ON expenses(user_id, reimbursement_status)
  WHERE deleted_at IS NULL;

-- Missing receipts
CREATE INDEX IF NOT EXISTS idx_expenses_user_receipt_missing
  ON expenses(user_id)
  WHERE deleted_at IS NULL AND receipt_status = 'required_missing';

-- Batch lookup
CREATE INDEX IF NOT EXISTS idx_expenses_batch
  ON expenses(batch_id)
  WHERE batch_id IS NOT NULL AND deleted_at IS NULL;

-- Trip lookup
CREATE INDEX IF NOT EXISTS idx_expenses_trip
  ON expenses(trip_id)
  WHERE trip_id IS NOT NULL AND deleted_at IS NULL;

-- Receipts by expense
CREATE INDEX IF NOT EXISTS idx_receipts_expense
  ON receipts(expense_id);

-- Import sessions by user
CREATE INDEX IF NOT EXISTS idx_import_sessions_user
  ON import_sessions(user_id, status);

-- Import transactions by session
CREATE INDEX IF NOT EXISTS idx_import_txn_session
  ON import_transactions(session_id, status);

-- Trips by user (active only)
CREATE INDEX IF NOT EXISTS idx_trips_user_active
  ON trips(user_id, status)
  WHERE deleted_at IS NULL;

-- Batches by user
CREATE INDEX IF NOT EXISTS idx_batches_user_status
  ON reimbursement_batches(user_id, status);
