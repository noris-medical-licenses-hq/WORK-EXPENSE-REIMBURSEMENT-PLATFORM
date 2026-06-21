"use client";

import Link from "next/link";
import { AlertCircle, Clock, CheckCircle2, DollarSign, Plus } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useExpenses } from "@/hooks/useExpenses";
import { ExpenseCard } from "@/components/expenses/ExpenseCard";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import type { ExpenseWithRelations } from "@/lib/types/expense.types";

function sumByCurrency(list: ExpenseWithRelations[]): string {
  const byC: Record<string, number> = {};
  for (const e of list) {
    byC[e.currency] = (byC[e.currency] ?? 0) + e.amount;
  }
  const entries = Object.entries(byC);
  if (entries.length === 0) return "";
  return entries.map(([c, a]) => formatCurrency(a, c)).join(" · ");
}

export function DashboardShell() {
  const { user } = useUser();
  const { expenses, loading, error } = useExpenses(user?.id);

  const draft = expenses.filter((e) => e.reimbursement_status === "draft" || e.reimbursement_status === "ready");
  const submitted = expenses.filter((e) => e.reimbursement_status === "submitted");
  const approved = expenses.filter((e) => e.reimbursement_status === "approved" || e.reimbursement_status === "paid");
  const missingReceipts = expenses.filter((e) => e.receipt_status === "required_missing");

  const recent = expenses.slice(0, 5);

  return (
    <div className="space-y-6 px-4 py-6 md:px-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Your expense overview</p>
        </div>
        <Link
          href="/expenses/new"
          className="flex items-center gap-1.5 bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-slate-400" />
          </div>
          <p className="font-medium text-slate-700">No expenses yet</p>
          <p className="text-sm text-slate-400 mt-1 mb-5">Tap + to add your first expense</p>
          <Link
            href="/expenses/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add First Expense
          </Link>
        </div>
      ) : (
        <>
          {/* Status cards — each deep-links to the filtered expense list */}
          <div className="grid grid-cols-2 gap-3">
            <StatusCard
              label="Pending"
              value={draft.length.toString()}
              sub={sumByCurrency(draft) || undefined}
              icon={Clock}
              color="text-blue-600"
              bg="bg-blue-50"
              href="/expenses?filter=pending"
            />
            <StatusCard
              label="Submitted"
              value={submitted.length.toString()}
              sub={sumByCurrency(submitted) || undefined}
              icon={AlertCircle}
              color="text-amber-600"
              bg="bg-amber-50"
              href="/expenses?filter=submitted"
            />
            <StatusCard
              label="Approved"
              value={approved.length.toString()}
              sub={sumByCurrency(approved) || undefined}
              icon={CheckCircle2}
              color="text-green-600"
              bg="bg-green-50"
              href="/expenses?filter=approved"
            />
            <StatusCard
              label="Missing Receipts"
              value={missingReceipts.length.toString()}
              icon={AlertCircle}
              color="text-orange-600"
              bg="bg-orange-50"
              href="/expenses?filter=missing_receipts"
              urgent={missingReceipts.length > 0}
            />
          </div>

          {/* Recent expenses */}
          {recent.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-700">Recent</p>
                <Link href="/expenses" className="text-xs text-blue-600 hover:underline">
                  See all
                </Link>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                {recent.map((expense) => (
                  <ExpenseCard key={expense.id} expense={expense} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatusCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  bg,
  href,
  urgent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  href: string;
  urgent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`bg-white rounded-xl border p-4 space-y-2 hover:shadow-sm transition-shadow ${urgent && value !== "0" ? "border-orange-200" : "border-slate-100"}`}
    >
      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </Link>
  );
}
