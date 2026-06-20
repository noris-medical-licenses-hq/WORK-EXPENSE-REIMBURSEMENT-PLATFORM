"use client";

import Link from "next/link";
import { BarChart2, ArrowRight } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useExpenses } from "@/hooks/useExpenses";
import { formatCurrency } from "@/lib/utils/formatCurrency";

export function ReportsShell() {
  const { user } = useUser();
  const { expenses, loading } = useExpenses(user?.id);

  // Group by currency to handle multi-currency correctly
  const byCurrency: Record<string, { pending: number; submitted: number; approved: number; paid: number }> = {};
  for (const e of expenses) {
    const c = e.currency;
    if (!byCurrency[c]) byCurrency[c] = { pending: 0, submitted: 0, approved: 0, paid: 0 };
    const entry = byCurrency[c]!;
    if (e.reimbursement_status === "draft" || e.reimbursement_status === "ready") entry.pending += e.amount;
    else if (e.reimbursement_status === "submitted") entry.submitted += e.amount;
    else if (e.reimbursement_status === "approved") entry.approved += e.amount;
    else if (e.reimbursement_status === "paid") entry.paid += e.amount;
  }

  const currencies = Object.keys(byCurrency);

  return (
    <div className="space-y-5 px-4 py-6 md:px-0">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500 mt-0.5">Expense totals by status and currency</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart2 className="w-7 h-7 text-slate-400" />
          </div>
          <p className="font-medium text-slate-700">No expenses yet</p>
          <p className="text-sm text-slate-400 mt-1 mb-5">
            Add expenses to see totals here.
          </p>
          <Link
            href="/expenses/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Add First Expense
          </Link>
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-400">
            {expenses.length} expense{expenses.length !== 1 ? "s" : ""} · {currencies.length} {currencies.length === 1 ? "currency" : "currencies"}
          </p>

          {currencies.map((currency) => {
            const totals = byCurrency[currency]!;
            return (
              <div key={currency} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800">{currency}</p>
                </div>
                <div className="divide-y divide-slate-100">
                  <SummaryRow label="Pending" amount={totals.pending} currency={currency} color="text-blue-600" />
                  <SummaryRow label="Submitted" amount={totals.submitted} currency={currency} color="text-amber-600" />
                  <SummaryRow label="Approved" amount={totals.approved} currency={currency} color="text-green-600" />
                  <SummaryRow label="Reimbursed" amount={totals.paid} currency={currency} color="text-emerald-700" />
                </div>
              </div>
            );
          })}

          <div className="text-center pt-2">
            <Link
              href="/expenses"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              View all expenses
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryRow({
  label,
  amount,
  currency,
  color,
}: {
  label: string;
  amount: number;
  currency: string;
  color: string;
}) {
  if (amount === 0) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-semibold ${color}`}>
        {formatCurrency(amount, currency)}
      </span>
    </div>
  );
}
