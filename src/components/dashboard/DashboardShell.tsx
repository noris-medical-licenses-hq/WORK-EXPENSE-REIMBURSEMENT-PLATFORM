"use client";

import Link from "next/link";
import { AlertCircle, Clock, CheckCircle2, DollarSign, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import type { ExpenseWithRelations } from "@/lib/types/expense.types";
import { ExpenseCard } from "@/components/expenses/ExpenseCard";
import { formatCurrency } from "@/lib/utils/formatCurrency";

export function DashboardShell() {
  const { user } = useUser();
  const [expenses, setExpenses] = useState<ExpenseWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    createClient()
      .from("expenses")
      .select("*, category:expense_categories(*), payment_method:payment_methods(*)")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("expense_date", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setExpenses((data as unknown as ExpenseWithRelations[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  const draft = expenses.filter((e) => e.reimbursement_status === "draft" || e.reimbursement_status === "ready");
  const submitted = expenses.filter((e) => e.reimbursement_status === "submitted");
  const approved = expenses.filter((e) => e.reimbursement_status === "approved");
  const missingReceipts = expenses.filter((e) => e.receipt_status === "required_missing");

  const pendingAmount = draft.reduce((sum, e) => sum + e.amount, 0);
  const submittedAmount = submitted.reduce((sum, e) => sum + e.amount, 0);
  const approvedAmount = approved.reduce((sum, e) => sum + e.amount, 0);

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
      ) : expenses.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-slate-400" />
          </div>
          <p className="font-medium text-slate-700">No expenses yet</p>
          <p className="text-sm text-slate-400 mt-1 mb-5">
            Tap + to add your first expense
          </p>
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
          {/* Status cards */}
          <div className="grid grid-cols-2 gap-3">
            <StatusCard
              label="Pending"
              value={draft.length.toString()}
              sub={pendingAmount > 0 ? formatCurrency(pendingAmount, "USD") : undefined}
              icon={Clock}
              color="text-blue-600"
              bg="bg-blue-50"
              href="/expenses"
            />
            <StatusCard
              label="Submitted"
              value={submitted.length.toString()}
              sub={submittedAmount > 0 ? formatCurrency(submittedAmount, "USD") : undefined}
              icon={AlertCircle}
              color="text-amber-600"
              bg="bg-amber-50"
              href="/expenses"
            />
            <StatusCard
              label="Approved"
              value={approved.length.toString()}
              sub={approvedAmount > 0 ? formatCurrency(approvedAmount, "USD") : undefined}
              icon={CheckCircle2}
              color="text-green-600"
              bg="bg-green-50"
              href="/expenses"
            />
            <StatusCard
              label="Missing Receipts"
              value={missingReceipts.length.toString()}
              icon={AlertCircle}
              color="text-orange-600"
              bg="bg-orange-50"
              href="/expenses"
              urgent={missingReceipts.length > 0}
            />
          </div>

          {/* Recent expenses */}
          {recent.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-700">Recent</p>
                <Link
                  href="/expenses"
                  className="text-xs text-blue-600 hover:underline"
                >
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
      <div
        className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}
      >
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
