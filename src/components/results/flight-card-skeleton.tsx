import { Skeleton } from "@/components/ui/skeleton";

export function FlightCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-14" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-7 w-14" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
      </div>
      <div className="flex shrink-0 flex-row items-center justify-between gap-4 border-t border-border pt-4 sm:flex-col sm:items-end sm:gap-3 sm:border-t-0 sm:pt-0">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
    </div>
  );
}
