"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Loader2 } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { ExpenseRepository } from "@/lib/repositories/expense.repository";
import { ExpenseService } from "@/lib/services/expense.service";
import { ReceiptSection } from "./ReceiptSection";
import {
  REIMBURSEMENT_STATUS_LABELS,
  REIMBURSEMENT_STATUS_COLORS,
  RECEIPT_STATUS_LABELS,
  VALID_STATUS_TRANSITIONS,
} from "@/lib/constants/status";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatDateFull } from "@/lib/utils/formatDate";
import type { ExpenseWithRelations, ReimbursementStatus } from "@/lib/types/expense.types";

const TRANSITION_LABELS: Record<ReimbursementStatus, string> = {
  draft: "Move to Draft",
  ready: "Mark Ready",
  submitted: "Mark Submitted",
  approved: "Mark Approved",
  paid: "Mark Reimbursed",
  rejected: "Mark Rejected",
};

export function ExpenseDetailShell({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useUser();
  const [expense, setExpense] = useState<ExpenseWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState<ReimbursementStatus | null>(null);
  const [deleting, setDeleting] = useState(false);

  const reload = useCallback(async () => {
    if (!user) return;
    try {
      const data = await ExpenseRepository.findById(id, user.id);
      setExpense(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load expense");
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function handleTransition(newStatus: ReimbursementStatus) {
    if (!user || !expense) return;
    setTransitioning(newStatus);
    setError(null);
    try {
      const updated = await ExpenseService.changeStatus(
        expense.id,
        user.id,
        newStatus
      );
      setExpense({ ...expense, ...updated });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status change failed");
    } finally {
      setTransitioning(null);
    }
  }

  async function handleDelete() {
    if (!user || !expense) return;
    if (!confirm("Delete this expense? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await ExpenseService.softDelete(expense.id, user.id);
      router.push("/expenses");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-6 md:px-0 max-w-lg flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="px-4 py-6 md:px-0 max-w-lg">
        <Link
          href="/expenses"
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to expenses
        </Link>
        <p className="text-slate-500">Expense not found.</p>
      </div>
    );
  }

  const statusColors = REIMBURSEMENT_STATUS_COLORS[expense.reimbursement_status];
  const validTransitions = VALID_STATUS_TRANSITIONS[expense.reimbursement_status] ?? [];

  return (
    <div className="px-4 py-6 md:px-0 max-w-lg space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/expenses"
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900 flex-1 truncate">
          {expense.title}
        </h1>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {deleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Amount card */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 text-center">
        <p className="text-3xl font-bold text-slate-900">
          {formatCurrency(expense.amount, expense.currency)}
        </p>
        <p className="text-sm text-slate-400 mt-1">
          {formatDateFull(expense.expense_date)}
        </p>
        <div className="mt-3">
          <span
            className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${statusColors?.bg ?? ""} ${statusColors?.text ?? ""} ${statusColors?.border ?? ""} border`}
          >
            {REIMBURSEMENT_STATUS_LABELS[expense.reimbursement_status]}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100">
        {expense.vendor_name && (
          <Row label="Vendor" value={expense.vendor_name} />
        )}
        {expense.category && (
          <Row
            label="Category"
            value={`${expense.category.icon ?? ""} ${expense.category.name}`.trim()}
          />
        )}
        {expense.payment_method && (
          <Row
            label="Payment"
            value={
              expense.payment_method.last_four
                ? `${expense.payment_method.name} ···${expense.payment_method.last_four}`
                : expense.payment_method.name
            }
          />
        )}
        <Row
          label="Receipt"
          value={RECEIPT_STATUS_LABELS[expense.receipt_status]}
        />
        {expense.is_personal && (
          <Row label="Type" value="Personal (not for reimbursement)" />
        )}
        {expense.notes && <Row label="Notes" value={expense.notes} />}
      </div>

      {/* Receipt upload */}
      <ReceiptSection
        expenseId={expense.id}
        userId={user!.id}
        onReceiptStatusChange={reload}
      />

      {/* Status transitions */}
      {validTransitions.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-2">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
            Change Status
          </p>
          {validTransitions.map((status) => (
            <button
              key={status}
              onClick={() => handleTransition(status)}
              disabled={!!transitioning}
              className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {TRANSITION_LABELS[status]}
              {transitioning === status && (
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between px-4 py-3 gap-4">
      <span className="text-sm text-slate-400 flex-shrink-0">{label}</span>
      <span className="text-sm text-slate-900 text-right">{value}</span>
    </div>
  );
}
