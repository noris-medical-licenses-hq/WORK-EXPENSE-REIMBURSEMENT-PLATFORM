import { Package } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export function BatchListShell() {
  return (
    <div className="space-y-4 px-4 py-6 md:px-0">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Batches</h1>
      </div>
      <EmptyState
        title="No batches yet"
        description="Create a submission batch to group expenses and track your reimbursement requests."
        ctaLabel="Create a Batch"
        ctaHref="/batches/new"
        icon={<Package className="w-8 h-8 text-slate-400" />}
      />
    </div>
  );
}
