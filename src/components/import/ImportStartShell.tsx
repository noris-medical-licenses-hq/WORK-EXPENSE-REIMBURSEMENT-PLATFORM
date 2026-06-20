import Link from "next/link";
import { Upload, ArrowLeft } from "lucide-react";

export function ImportStartShell() {
  return (
    <div className="space-y-4 px-4 py-6 md:px-0 max-w-lg">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Import</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Import expenses from bank or card exports
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 p-8 text-center space-y-4">
        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
          <Upload className="w-7 h-7 text-slate-400" />
        </div>
        <div>
          <p className="font-semibold text-slate-700">Import not yet available</p>
          <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
            Bank CSV/Excel import is planned for a future release. For now, add expenses manually.
          </p>
        </div>
        <Link
          href="/expenses/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Add Expense Manually
        </Link>
      </div>
    </div>
  );
}
