import { Upload } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export function ImportStartShell() {
  return (
    <div className="space-y-4 px-4 py-6 md:px-0">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Import</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Import expenses from bank or card exports
        </p>
      </div>

      <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-8">
        <EmptyState
          title="Upload a bank or card export"
          description="Supports CSV and Excel files from major banks and card providers."
          ctaLabel="Choose File"
          ctaHref="#"
          icon={<Upload className="w-8 h-8 text-slate-400" />}
        />
      </div>
    </div>
  );
}
