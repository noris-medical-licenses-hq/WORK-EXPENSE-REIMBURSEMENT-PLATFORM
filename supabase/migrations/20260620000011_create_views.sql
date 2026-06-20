-- Dashboard summary per user
CREATE OR REPLACE VIEW expense_summary AS
SELECT
  user_id,
  COUNT(*) FILTER (WHERE reimbursement_status = 'draft')     AS draft_count,
  COUNT(*) FILTER (WHERE reimbursement_status = 'ready')     AS ready_count,
  COUNT(*) FILTER (WHERE reimbursement_status = 'submitted') AS submitted_count,
  COUNT(*) FILTER (WHERE reimbursement_status = 'approved')  AS approved_count,
  COUNT(*) FILTER (WHERE reimbursement_status = 'paid')      AS paid_count,
  COUNT(*) FILTER (WHERE reimbursement_status = 'rejected')  AS rejected_count,
  COUNT(*) FILTER (WHERE receipt_status = 'required_missing') AS missing_receipts_count,
  SUM(amount) FILTER (WHERE reimbursement_status IN ('draft', 'ready'))  AS pending_amount,
  SUM(amount) FILTER (WHERE reimbursement_status = 'submitted')          AS submitted_amount,
  SUM(amount) FILTER (WHERE reimbursement_status = 'approved')           AS approved_amount
FROM expenses
WHERE deleted_at IS NULL
GROUP BY user_id;
