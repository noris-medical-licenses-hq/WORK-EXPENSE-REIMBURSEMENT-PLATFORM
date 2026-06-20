import { BarChart2 } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export function ReportsShell() {
  return (
    <div className="space-y-4 px-4 py-6 md:px-0">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Expense summaries by month and category
        </p>
      </div>
      <EmptyState
        title="No data to report yet"
        description="Add expenses to see monthly and category breakdowns."
        ctaLabel="Add Expense"
        ctaHref="/expenses/new"
        icon={<BarChart2 className="w-8 h-8 text-slate-400" />}
      />
    </div>
  );
}
