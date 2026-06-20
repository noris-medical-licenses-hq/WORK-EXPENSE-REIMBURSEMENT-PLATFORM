-- Enable RLS on all application tables
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

-- Profiles: user can only access their own profile
CREATE POLICY "profiles_own_row" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Expense categories: user can only access their own
CREATE POLICY "expense_categories_own_rows" ON expense_categories
  FOR ALL USING (auth.uid() = user_id);

-- Payment methods: user can only access their own
CREATE POLICY "payment_methods_own_rows" ON payment_methods
  FOR ALL USING (auth.uid() = user_id);

-- Trips: user can only access their own
CREATE POLICY "trips_own_rows" ON trips
  FOR ALL USING (auth.uid() = user_id);

-- Projects: user can only access their own
CREATE POLICY "projects_own_rows" ON projects
  FOR ALL USING (auth.uid() = user_id);

-- Reimbursement batches: user can only access their own
CREATE POLICY "batches_own_rows" ON reimbursement_batches
  FOR ALL USING (auth.uid() = user_id);

-- Expenses: user can only access their own
CREATE POLICY "expenses_own_rows" ON expenses
  FOR ALL USING (auth.uid() = user_id);

-- Receipts: user can only access their own
CREATE POLICY "receipts_own_rows" ON receipts
  FOR ALL USING (auth.uid() = user_id);

-- Import sessions: user can only access their own
CREATE POLICY "import_sessions_own_rows" ON import_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Import transactions: user can only access their own
CREATE POLICY "import_transactions_own_rows" ON import_transactions
  FOR ALL USING (auth.uid() = user_id);
