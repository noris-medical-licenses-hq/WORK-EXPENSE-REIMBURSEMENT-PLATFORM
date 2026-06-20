import { Plane } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export function TripListShell() {
  return (
    <div className="space-y-4 px-4 py-6 md:px-0">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Trips</h1>
      </div>
      <EmptyState
        title="No trips yet"
        description="Create a trip to organize travel-related expenses together."
        ctaLabel="Create a Trip"
        ctaHref="/trips/new"
        icon={<Plane className="w-8 h-8 text-slate-400" />}
      />
    </div>
  );
}
