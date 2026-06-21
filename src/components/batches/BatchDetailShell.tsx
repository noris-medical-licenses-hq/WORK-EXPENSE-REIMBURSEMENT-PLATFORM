"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { BatchRepository } from "@/lib/repositories/batch.repository";
import { ExpenseRepository } from "@/lib/repositories/expense.repository";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatDate } from "@/lib/utils/formatDate";
import {
  REIMBURSEMENT_STATUS_LABELS,
  REIMBURSEMENT_STATUS_COLORS,
  BATCH_STATUS_LABELS,
} from "@/lib/constants/status";
import type { ReimbursementBatch } from "@/lib/types/batch.types";
import type { Expense } from "@/lib/types/expense.types";

const BATCH_STATUS_COLORS = {
  draft: "bg-slate-100 text-slate-600",
  submitted: "bg-amber-50 text-amber-700",
  approved: "bg-green-50 text-green-700",
  paid: "bg-emerald-50 text-emerald-800",
  rejected: "bg-red-50 text-red-600",
} as const;

function sumByCurrency(list: Expense[]): string {
  const byC: Record<string, number> = {};
  for (const e of list) {
    byC[e.currency] = (byC[e.currency] ?? 0) + e.amount;
  }
  const entries = Object.entries(byC);
  if (entries.length === 0) return "";
  return entries.map(([c, a]) => formatCurrency(a, c)).join(" · ");
}

export function BatchDetailShell({ id }: { id: string }) {
  const { user } = useUser();
  const [batch, setBatch] = useState<ReimbursementBatch | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [batchData, expenseData] = await Promise.all([
        BatchRepository.findById(id, user.id),
        ExpenseRepository.findByBatch(id, user.id),
      ]);
      setBatch(batchData);
      setExpenses(expenseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load batch");
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="px-4 py-6 md:px-0 flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="px-4 py-6 md:px-0">
        <Link href="/batches" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to batches
        </Link>
        <p className="text-slate-500">{error ?? "Batch not found."}</p>
      </div>
    );
  }

  const total = sumByCurrency(expenses);

  return (
    <div className="px-4 py-6 md:px-0 max-w-lg space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/batches"
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900 flex-1 truncate">{batch.name}</h1>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${BATCH_STATUS_COLORS[batch.status]}`}>
          {BATCH_STATUS_LABELS[batch.status]}
        </span>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Batch details */}
      <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100">
        <div className="flex items-start justify-between px-4 py-3">
          <span className="text-sm text-slate-400">Created</span>
          <span className="text-sm text-slate-700">{formatDate(batch.created_at)}</span>
        </div>
        {batch.description && (
          <div className="flex items-start justify-between px-4 py-3 gap-4">
            <span className="text-sm text-slate-400 flex-shrink-0">Description</span>
            <span className="text-sm text-slate-700 text-right">{batch.description}</span>
          </div>
        )}
        {batch.notes && (
          <div className="flex items-start justify-between px-4 py-3 gap-4">
            <span className="text-sm text-slate-400 flex-shrink-0">Notes</span>
            <span className="text-sm text-slate-700 text-right">{batch.notes}</span>
          </div>
        )}
      </div>

      {/* Summary */}
      {expenses.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">
              {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">in this batch</p>
          </div>
          {total && <p className="text-base font-semibold text-slate-900">{total}</p>}
        </div>
      )}

      {/* Expense list */}
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-2">Expenses</p>
        {expenses.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 px-4 py-10 text-center">
            <Package className="w-8 h-8 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No expenses in this batch yet.</p>
            <p className="text-xs text-slate-300 mt-1">
              Expense-to-batch linking is coming soon.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100">
            {expenses.map((expense) => {
              const colors = REIMBURSEMENT_STATUS_COLORS[expense.reimbursement_status];
              return (
                <Link
                  key={expense.id}
                  href={`/expenses/${expense.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{expense.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(expense.expense_date)}</p>
                  </div>
                  <div className="text-right flex-shrink-0 space-y-0.5">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrency(expense.amount, expense.currency)}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full ${colors?.bg ?? ""} ${colors?.text ?? ""}`}
                    >
                      {REIMBURSEMENT_STATUS_LABELS[expense.reimbursement_status]}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
