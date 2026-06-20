import Link from "next/link";
import { Receipt, AlertCircle } from "lucide-react";
import type { ExpenseWithRelations } from "@/lib/types/expense.types";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatDate } from "@/lib/utils/formatDate";

const STATUS_CONFIG = {
  draft: { label: "Draft", className: "bg-slate-100 text-slate-600" },
  ready: { label: "Ready", className: "bg-blue-50 text-blue-700" },
  submitted: { label: "Submitted", className: "bg-amber-50 text-amber-700" },
  approved: { label: "Approved", className: "bg-green-50 text-green-700" },
  paid: { label: "Paid", className: "bg-emerald-50 text-emerald-800" },
  rejected: { label: "Rejected", className: "bg-red-50 text-red-700" },
} as const;

interface Props {
  expense: ExpenseWithRelations;
}

export function ExpenseCard({ expense }: Props) {
  const status = STATUS_CONFIG[expense.reimbursement_status];

  return (
    <Link
      href={`/expenses/${expense.id}`}
      className="flex items-center gap-3 px-4 py-3.5 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors border-b border-slate-100 last:border-0"
    >
      {/* Category icon or fallback */}
      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-base flex-shrink-0">
        {expense.category?.icon ?? "💳"}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">
          {expense.title}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {formatDate(expense.expense_date)}
          {expense.vendor_name ? ` · ${expense.vendor_name}` : ""}
        </p>
      </div>

      {/* Right side */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-sm font-semibold text-slate-900">
          {formatCurrency(expense.amount, expense.currency)}
        </span>
        <div className="flex items-center gap-1.5">
          {expense.receipt_status === "required_missing" && (
            <AlertCircle className="w-3 h-3 text-amber-500" />
          )}
          {expense.receipt_status === "uploaded" && (
            <Receipt className="w-3 h-3 text-green-500" />
          )}
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${status?.className ?? ""}`}
          >
            {status?.label ?? expense.reimbursement_status}
          </span>
        </div>
      </div>
    </Link>
  );
}
