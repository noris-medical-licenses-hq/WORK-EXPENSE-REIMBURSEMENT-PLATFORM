"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, List } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useExpenses } from "@/hooks/useExpenses";
import { EmptyState } from "@/components/shared/EmptyState";
import { ExpenseCard } from "./ExpenseCard";
import type { ReimbursementStatus } from "@/lib/types/expense.types";

type Filter = "all" | "pending" | "submitted" | "approved" | "missing_receipts";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "submitted", label: "Submitted" },
  { id: "approved", label: "Approved" },
  { id: "missing_receipts", label: "Missing" },
];

const PENDING_STATUSES: ReimbursementStatus[] = ["draft", "ready"];

export function ExpenseListShell() {
  const { user } = useUser();
  const { expenses, loading, error } = useExpenses(user?.id);
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    switch (filter) {
      case "pending":
        return expenses.filter((e) => PENDING_STATUSES.includes(e.reimbursement_status));
      case "submitted":
        return expenses.filter((e) => e.reimbursement_status === "submitted");
      case "approved":
        return expenses.filter((e) => e.reimbursement_status === "approved" || e.reimbursement_status === "paid");
      case "missing_receipts":
        return expenses.filter((e) => e.receipt_status === "required_missing");
      default:
        return expenses;
    }
  }, [expenses, filter]);

  const counts: Record<Filter, number> = {
    all: expenses.length,
    pending: expenses.filter((e) => PENDING_STATUSES.includes(e.reimbursement_status)).length,
    submitted: expenses.filter((e) => e.reimbursement_status === "submitted").length,
    approved: expenses.filter((e) => e.reimbursement_status === "approved" || e.reimbursement_status === "paid").length,
    missing_receipts: expenses.filter((e) => e.receipt_status === "required_missing").length,
  };

  return (
    <div className="space-y-3 px-4 py-6 md:px-0">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Expenses</h1>
        <Link
          href="/expenses/new"
          className="flex items-center gap-1.5 bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New
        </Link>
      </div>

      {/* Filter tabs — only show once data is loaded */}
      {!loading && expenses.length > 0 && (
        <div className="flex gap-1 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
          {FILTERS.map((f) => {
            const count = counts[f.id];
            if (count === 0 && f.id !== "all") return null;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  filter === f.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label}
                {count > 0 && f.id !== "all" && (
                  <span className={`ml-1 ${filter === f.id ? "opacity-80" : "opacity-60"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {!loading && !error && expenses.length === 0 && (
        <EmptyState
          title="No expenses yet"
          description="Add your first expense to get started tracking reimbursements."
          ctaLabel="Add First Expense"
          ctaHref="/expenses/new"
          icon={<List className="w-8 h-8 text-slate-400" />}
        />
      )}

      {!loading && expenses.length > 0 && filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-sm">
          No expenses match this filter.
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          {filtered.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))}
        </div>
      )}
    </div>
  );
}
