import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { MATRIX_GRID_COLUMNS } from "./matrix-row";

/** Ligne de matrice en chargement — même grille que FareMatrix/MatrixRow. */
export function FlightCardSkeleton() {
  return (
    <div className={cn("grid items-center gap-px border-t border-border bg-border", MATRIX_GRID_COLUMNS)}>
      <div className="flex flex-col gap-2 bg-card px-4 py-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex flex-col items-center justify-center gap-1 bg-card px-3 py-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-3 w-10" />
        </div>
      ))}
    </div>
  );
}
