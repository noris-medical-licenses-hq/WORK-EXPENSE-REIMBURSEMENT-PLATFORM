"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { NewExpenseForm } from "./NewExpenseForm";

export function NewExpenseShell() {
  const { user, loading } = useUser();

  return (
    <div className="px-4 py-6 md:px-0 max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/expenses"
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900">New Expense</h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 p-6">
        {loading || !user ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <NewExpenseForm userId={user.id} />
        )}
      </div>
    </div>
  );
}
