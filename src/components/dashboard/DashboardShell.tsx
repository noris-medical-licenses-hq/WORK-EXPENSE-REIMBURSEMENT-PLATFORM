import { AlertCircle, Clock, CheckCircle2, DollarSign } from "lucide-react";

export function DashboardShell() {
  return (
    <div className="space-y-6 px-4 py-6 md:px-0">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Your expense overview
        </p>
      </div>

      {/* Status summary — placeholder until Sprint 2 */}
      <div className="grid grid-cols-2 gap-3">
        <StatusCard
          label="Pending Submission"
          value="—"
          icon={Clock}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatusCard
          label="Submitted"
          value="—"
          icon={AlertCircle}
          color="text-amber-600"
          bg="bg-amber-50"
        />
        <StatusCard
          label="Approved"
          value="—"
          icon={CheckCircle2}
          color="text-green-600"
          bg="bg-green-50"
        />
        <StatusCard
          label="Missing Receipts"
          value="—"
          icon={AlertCircle}
          color="text-orange-600"
          bg="bg-orange-50"
        />
      </div>

      {/* Empty state */}
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <DollarSign className="w-8 h-8 text-slate-400" />
        </div>
        <p className="font-medium text-slate-700">No expenses yet</p>
        <p className="text-sm text-slate-400 mt-1">
          Tap + to add your first expense
        </p>
      </div>
    </div>
  );
}

function StatusCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-2">
      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
