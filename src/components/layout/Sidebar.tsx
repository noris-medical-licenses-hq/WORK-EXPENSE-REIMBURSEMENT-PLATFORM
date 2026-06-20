"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  List,
  Plane,
  Package,
  Upload,
  BarChart2,
  Settings,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/expenses", icon: List, label: "Expenses" },
  { href: "/trips", icon: Plane, label: "Trips" },
  { href: "/batches", icon: Package, label: "Batches" },
  { href: "/import", icon: Upload, label: "Import" },
  { href: "/reports", icon: BarChart2, label: "Reports" },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 flex flex-col z-40">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <span className="text-lg font-bold text-slate-900">Expenses</span>
      </div>

      {/* Add expense button */}
      <div className="px-4 pt-4">
        <Link
          href="/expenses/new"
          className="flex items-center gap-2 w-full bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Expense
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-4 space-y-0.5">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Settings */}
      <div className="px-3 pb-4 border-t border-slate-100 pt-4">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            pathname.startsWith("/settings")
              ? "bg-blue-50 text-blue-700"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          )}
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
