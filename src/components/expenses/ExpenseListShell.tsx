import { List } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export function ExpenseListShell() {
  return (
    <div className="space-y-4 px-4 py-6 md:px-0">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Expenses</h1>
      </div>
      <EmptyState
        title="No expenses yet"
        description="Add your first expense to get started tracking reimbursements."
        ctaLabel="Add First Expense"
        ctaHref="/expenses/new"
        icon={<List className="w-8 h-8 text-slate-400" />}
      />
    </div>
  );
}
