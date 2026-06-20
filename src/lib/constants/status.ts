import type {
  ReimbursementStatus,
  ReceiptStatus,
} from "@/lib/types/expense.types";
import type { TripStatus } from "@/lib/types/trip.types";
import type { BatchStatus } from "@/lib/types/batch.types";

export const REIMBURSEMENT_STATUS_LABELS: Record<ReimbursementStatus, string> =
  {
    draft: "Draft",
    ready: "Ready to Submit",
    submitted: "Submitted",
    approved: "Approved",
    paid: "Reimbursed",
    rejected: "Rejected",
  };

export const REIMBURSEMENT_STATUS_COLORS: Record<
  ReimbursementStatus,
  { text: string; bg: string; border: string }
> = {
  draft: {
    text: "text-slate-600",
    bg: "bg-slate-100",
    border: "border-slate-200",
  },
  ready: {
    text: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  submitted: {
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  approved: {
    text: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  paid: {
    text: "text-green-800",
    bg: "bg-green-100",
    border: "border-green-300",
  },
  rejected: {
    text: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
};

export const RECEIPT_STATUS_LABELS: Record<ReceiptStatus, string> = {
  not_required: "No Receipt Needed",
  required_missing: "Receipt Missing",
  uploaded: "Receipt Uploaded",
};

export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  planning: "Planning",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const BATCH_STATUS_LABELS: Record<BatchStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  approved: "Approved",
  paid: "Paid",
  rejected: "Rejected",
};

// Valid status transitions for expenses
export const VALID_STATUS_TRANSITIONS: Record<
  ReimbursementStatus,
  ReimbursementStatus[]
> = {
  draft: ["ready", "submitted"],
  ready: ["draft", "submitted"],
  submitted: ["approved", "rejected"],
  approved: ["paid", "rejected"],
  paid: ["approved"],
  rejected: ["draft", "ready"],
};
