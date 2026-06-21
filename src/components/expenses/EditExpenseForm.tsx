"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { useTrips } from "@/hooks/useTrips";
import { useBatches } from "@/hooks/useBatches";
import { ExpenseService } from "@/lib/services/expense.service";
import type { ExpenseWithRelations } from "@/lib/types/expense.types";

const CURRENCIES = [
  "USD", "EUR", "GBP", "ILS", "CAD", "AUD", "CHF",
  "JPY", "CNY", "INR", "MXN", "BRL", "SEK", "NOK", "DKK",
];

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: "Amount must be greater than 0",
    }),
  currency: z.string().min(3).max(3),
  expense_date: z.string().min(1, "Date is required"),
  vendor_name: z.string().nullable(),
  category_id: z.string().nullable(),
  payment_method_id: z.string().nullable(),
  trip_id: z.string().nullable(),
  batch_id: z.string().nullable(),
  is_personal: z.boolean(),
  notes: z.string().nullable(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  expense: ExpenseWithRelations;
  userId: string;
  onSaved: (updated: ExpenseWithRelations) => void;
  onCancel: () => void;
}

export function EditExpenseForm({ expense, userId, onSaved, onCancel }: Props) {
  const { categories } = useCategories(userId);
  const { paymentMethods } = usePaymentMethods(userId);
  const { trips } = useTrips(userId);
  const { batches } = useBatches(userId);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: expense.title,
      amount: expense.amount.toString(),
      currency: expense.currency,
      expense_date: expense.expense_date,
      vendor_name: expense.vendor_name ?? null,
      category_id: expense.category_id ?? null,
      payment_method_id: expense.payment_method_id ?? null,
      trip_id: expense.trip_id ?? null,
      batch_id: expense.batch_id ?? null,
      is_personal: expense.is_personal,
      notes: expense.notes ?? null,
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    try {
      const updated = await ExpenseService.update(expense.id, userId, {
        title: values.title,
        amount: parseFloat(values.amount),
        currency: values.currency,
        expense_date: values.expense_date,
        vendor_name: values.vendor_name ?? null,
        category_id: values.category_id ?? null,
        payment_method_id: values.payment_method_id ?? null,
        trip_id: values.trip_id ?? null,
        batch_id: values.batch_id ?? null,
        is_personal: values.is_personal,
        notes: values.notes ?? null,
      });
      onSaved({ ...expense, ...updated });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {submitError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {submitError}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          {...register("title")}
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Amount <span className="text-red-500">*</span>
          </label>
          <input
            {...register("amount")}
            type="number"
            step="0.01"
            min="0.01"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Currency</label>
          <select
            {...register("currency")}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Date <span className="text-red-500">*</span>
        </label>
        <input
          {...register("expense_date")}
          type="date"
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Vendor</label>
        <input
          {...register("vendor_name")}
          placeholder="e.g. Marriott, Delta"
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {categories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
          <select
            {...register("category_id")}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ""}{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {paymentMethods.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Method</label>
          <select
            {...register("payment_method_id")}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Not specified</option>
            {paymentMethods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}{p.last_four ? ` ···${p.last_four}` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Trip */}
      {trips.filter((t) => t.status === "planning" || t.status === "active").length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Trip</label>
          <select
            {...register("trip_id")}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No trip</option>
            {trips
              .filter((t) => t.status === "planning" || t.status === "active")
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}{t.destination ? ` — ${t.destination}` : ""}
                </option>
              ))}
          </select>
        </div>
      )}

      {/* Batch — only draft batches can receive expenses */}
      {batches.filter((b) => b.status === "draft").length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Submission Batch
          </label>
          <select
            {...register("batch_id")}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No batch</option>
            {batches
              .filter((b) => b.status === "draft")
              .map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
          </select>
        </div>
      )}

      {/* Personal expense toggle */}
      <div className="flex items-center justify-between py-1">
        <div>
          <p className="text-sm font-medium text-slate-700">Personal expense</p>
          <p className="text-xs text-slate-400 mt-0.5">Not for reimbursement</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            {...register("is_personal")}
            type="checkbox"
            className="sr-only peer"
          />
          <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
        <textarea
          {...register("notes")}
          rows={2}
          placeholder="Business purpose, attendees, context..."
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl px-4 py-3 text-sm font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
