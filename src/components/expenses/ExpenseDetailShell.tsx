import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function ExpenseDetailShell({ id }: { id: string }) {
  return (
    <div className="px-4 py-6 md:px-0 max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/expenses"
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Expense Detail</h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 p-6">
        <p className="text-sm text-slate-500 text-center py-8">
          Expense {id} — detail view coming in Sprint 2
        </p>
      </div>
    </div>
  );
}
