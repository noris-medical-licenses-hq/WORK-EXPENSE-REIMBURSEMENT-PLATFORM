"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Plus,
  X,
  Loader2,
  CheckSquare,
  Square,
  AlertCircle,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { BatchRepository } from "@/lib/repositories/batch.repository";
import { ExpenseRepository } from "@/lib/repositories/expense.repository";
import { BatchService } from "@/lib/services/batch.service";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatDate } from "@/lib/utils/formatDate";
import {
  REIMBURSEMENT_STATUS_LABELS,
  REIMBURSEMENT_STATUS_COLORS,
  BATCH_STATUS_LABELS,
} from "@/lib/constants/status";
import type { ReimbursementBatch, BatchStatus } from "@/lib/types/batch.types";
import type { Expense } from "@/lib/types/expense.types";

const BATCH_STATUS_COLORS = {
  draft: "bg-slate-100 text-slate-600",
  submitted: "bg-amber-50 text-amber-700",
  approved: "bg-green-50 text-green-700",
  paid: "bg-emerald-50 text-emerald-800",
  rejected: "bg-red-50 text-red-600",
} as const;

const TRANSITION_CONFIG: Partial<
  Record<BatchStatus, { label: string; next: BatchStatus; style: string }>
> = {
  draft: {
    label: "Submit Batch",
    next: "submitted",
    style: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  submitted: {
    label: "Approve Batch",
    next: "approved",
    style: "bg-green-600 hover:bg-green-700 text-white",
  },
  approved: {
    label: "Mark as Paid",
    next: "paid",
    style: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
};

function sumByCurrencyRows(list: Expense[]): Array<{ currency: string; amount: number }> {
  const byC: Record<string, number> = {};
  for (const e of list) {
    byC[e.currency] = (byC[e.currency] ?? 0) + e.amount;
  }
  return Object.entries(byC).map(([currency, amount]) => ({ currency, amount }));
}

export function BatchDetailShell({ id }: { id: string }) {
  const { user } = useUser();

  // Core state
  const [batch, setBatch] = useState<ReimbursementBatch | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status transition state
  const [transitioning, setTransitioning] = useState(false);
  const [transitionError, setTransitionError] = useState<string | null>(null);

  // Assignment panel state
  const [showAssignPanel, setShowAssignPanel] = useState(false);
  const [available, setAvailable] = useState<Expense[]>([]);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [assigning, setAssigning] = useState(false);

  // Remove state
  const [removing, setRemoving] = useState<string | null>(null);

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

  async function openAssignPanel() {
    if (!user) return;
    setShowAssignPanel(true);
    setAvailableLoading(true);
    setSelected(new Set());
    try {
      const data = await ExpenseRepository.findReadyUnassigned(user.id);
      setAvailable(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load available expenses");
    } finally {
      setAvailableLoading(false);
    }
  }

  function toggleSelect(expenseId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(expenseId)) {
        next.delete(expenseId);
      } else {
        next.add(expenseId);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === available.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(available.map((e) => e.id)));
    }
  }

  async function handleAssign() {
    if (!user || selected.size === 0) return;
    setAssigning(true);
    setError(null);
    try {
      await BatchService.assignExpenses(id, user.id, Array.from(selected));
      setShowAssignPanel(false);
      setSelected(new Set());
      setLoading(true);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign expenses");
    } finally {
      setAssigning(false);
    }
  }

  async function handleRemove(expenseId: string) {
    if (!user) return;
    setRemoving(expenseId);
    setError(null);
    try {
      await BatchService.removeExpense(id, user.id, expenseId);
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove expense");
    } finally {
      setRemoving(null);
    }
  }

  async function handleTransition(newStatus: BatchStatus) {
    if (!user) return;
    setTransitioning(true);
    setTransitionError(null);
    try {
      const updated = await BatchService.changeStatus(id, user.id, newStatus);
      setBatch(updated);
      // Reload expenses to reflect propagated statuses
      const updatedExpenses = await ExpenseRepository.findByBatch(id, user.id);
      setExpenses(updatedExpenses);
    } catch (err) {
      setTransitionError(err instanceof Error ? err.message : "Status change failed");
    } finally {
      setTransitioning(false);
    }
  }

  // ── Loading / not found states ────────────────────────────────────────
  if (loading) {
    return (
      <div className="px-4 py-6 md:px-0 flex items-center justify-center min-h-[200px]">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="px-4 py-6 md:px-0">
        <Link
          href="/batches"
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to batches
        </Link>
        <p className="text-slate-500">{error ?? "Batch not found."}</p>
      </div>
    );
  }

  const totals = sumByCurrencyRows(expenses);
  const transition = TRANSITION_CONFIG[batch.status];
  const isDraft = batch.status === "draft";

  // ── Main render ────────────────────────────────────────────────────────
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
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${BATCH_STATUS_COLORS[batch.status]}`}
        >
          {BATCH_STATUS_LABELS[batch.status]}
        </span>
      </div>

      {/* General error */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Batch metadata */}
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
      </div>

      {/* Totals summary */}
      {expenses.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">
              {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
            </p>
            <div className="text-right">
              {totals.map(({ currency, amount }) => (
                <p key={currency} className="text-sm font-semibold text-slate-900">
                  {formatCurrency(amount, currency)}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Status transition */}
      {transition && (
        <div className="space-y-2">
          {transitionError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {transitionError}
            </div>
          )}
          <button
            onClick={() => handleTransition(transition.next)}
            disabled={transitioning}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${transition.style}`}
          >
            {transitioning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing…
              </>
            ) : (
              transition.label
            )}
          </button>
        </div>
      )}

      {batch.status === "paid" && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-center">
          <p className="text-sm font-medium text-emerald-800">Batch fully reimbursed ✓</p>
        </div>
      )}

      {/* Expense list */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-slate-700">Expenses in batch</p>
          {isDraft && !showAssignPanel && (
            <button
              onClick={openAssignPanel}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Expenses
            </button>
          )}
        </div>

        {/* Assignment panel */}
        {showAssignPanel && (
          <div className="bg-white rounded-xl border border-blue-200 mb-3 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-blue-50">
              <p className="text-sm font-semibold text-blue-900">Add Ready Expenses</p>
              <button
                onClick={() => { setShowAssignPanel(false); setSelected(new Set()); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {availableLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : available.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-slate-400">No ready unassigned expenses.</p>
                <p className="text-xs text-slate-300 mt-1">
                  Mark expenses as Ready first, then return here to add them.
                </p>
              </div>
            ) : (
              <>
                {/* Select all */}
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 w-full px-4 py-2.5 border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  {selected.size === available.length ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-xs font-medium text-slate-600">
                    Select all ({available.length})
                  </span>
                </button>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {available.map((expense) => {
                    const isSelected = selected.has(expense.id);
                    return (
                      <button
                        key={expense.id}
                        onClick={() => toggleSelect(expense.id)}
                        className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors ${
                          isSelected ? "bg-blue-50" : "hover:bg-slate-50"
                        }`}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {expense.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {formatDate(expense.expense_date)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 flex-shrink-0">
                          {formatCurrency(expense.amount, expense.currency)}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="px-4 py-3 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => { setShowAssignPanel(false); setSelected(new Set()); }}
                    className="flex-1 border border-slate-200 text-slate-600 rounded-lg px-3 py-2 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssign}
                    disabled={selected.size === 0 || assigning}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {assigning ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      `Add ${selected.size > 0 ? selected.size : ""} Selected`
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Expense rows */}
        {expenses.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 px-4 py-10 text-center">
            <Package className="w-8 h-8 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No expenses in this batch yet.</p>
            {isDraft && (
              <p className="text-xs text-slate-300 mt-1">
                Use "Add Expenses" above to include ready expenses.
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100">
            {expenses.map((expense) => {
              const colors = REIMBURSEMENT_STATUS_COLORS[expense.reimbursement_status];
              return (
                <div key={expense.id} className="flex items-center gap-3 px-4 py-3">
                  <Link
                    href={`/expenses/${expense.id}`}
                    className="flex-1 min-w-0 hover:opacity-80 transition-opacity"
                  >
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {expense.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatDate(expense.expense_date)}
                    </p>
                  </Link>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrency(expense.amount, expense.currency)}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full ${colors?.bg ?? ""} ${colors?.text ?? ""}`}
                    >
                      {REIMBURSEMENT_STATUS_LABELS[expense.reimbursement_status]}
                    </span>
                  </div>
                  {/* Remove button: only visible for draft batches */}
                  {isDraft && (
                    <button
                      onClick={() => handleRemove(expense.id)}
                      disabled={removing === expense.id}
                      className="w-7 h-7 flex items-center justify-center rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 flex-shrink-0"
                      title="Remove from batch"
                    >
                      {removing === expense.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
