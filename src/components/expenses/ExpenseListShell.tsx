"use client";

import Link from "next/link";
import { Plus, List } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useExpenses } from "@/hooks/useExpenses";
import { EmptyState } from "@/components/shared/EmptyState";
import { ExpenseCard } from "./ExpenseCard";

export function ExpenseListShell() {
  const { user } = useUser();
  const { expenses, loading, error } = useExpenses(user?.id);

  return (
    <div className="space-y-4 px-4 py-6 md:px-0">
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

      {!loading && expenses.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          {expenses.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))}
        </div>
      )}
    </div>
  );
}
