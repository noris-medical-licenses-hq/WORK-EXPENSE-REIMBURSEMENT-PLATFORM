import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type EmptyStateProps = {
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  icon?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  ctaLabel,
  ctaHref,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      {icon && (
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <p className="font-semibold text-slate-700">{title}</p>
      {description && (
        <p className="text-sm text-slate-400 mt-1 max-w-xs">{description}</p>
      )}
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="mt-4 inline-flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
