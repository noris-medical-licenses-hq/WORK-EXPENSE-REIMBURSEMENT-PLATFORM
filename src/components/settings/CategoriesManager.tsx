"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { CategoryRepository } from "@/lib/repositories/category.repository";
import type { ExpenseCategory } from "@/lib/types/expense.types";

interface Props {
  categories: ExpenseCategory[];
  userId: string;
  onChanged: (updated: ExpenseCategory[]) => void;
}

export function CategoriesManager({ categories, userId, onChanged }: Props) {
  const [toggling, setToggling] = useState<string | null>(null);

  async function handleToggle(category: ExpenseCategory) {
    setToggling(category.id);
    try {
      const updated = await CategoryRepository.update(category.id, userId, {
        is_active: !category.is_active,
      });
      onChanged(
        categories.map((c) => (c.id === updated.id ? updated : c))
      );
    } catch {
      // Silently fail for toggle — low-stakes
    } finally {
      setToggling(null);
    }
  }

  if (categories.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-8">
        No categories yet. Categories are seeded on first sign-in.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {categories.map((cat) => (
        <li
          key={cat.id}
          className="flex items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl leading-none">{cat.icon ?? "💳"}</span>
            <span
              className={`text-sm font-medium ${cat.is_active ? "text-slate-900" : "text-slate-400 line-through"}`}
            >
              {cat.name}
            </span>
            {cat.is_default && (
              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                default
              </span>
            )}
          </div>
          <button
            onClick={() => handleToggle(cat)}
            disabled={toggling === cat.id}
            className="w-8 h-8 flex items-center justify-center"
            title={cat.is_active ? "Hide category" : "Show category"}
          >
            {toggling === cat.id ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            ) : (
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={cat.is_active}
                  onChange={() => handleToggle(cat)}
                  className="sr-only peer"
                  readOnly
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
              </label>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
