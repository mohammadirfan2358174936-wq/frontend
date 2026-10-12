import type { HTMLAttributes } from "react";

import { cn } from "@/utils/cn";

export function Skeleton({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-md bg-white/5", className)}
      {...rest}
    />
  );
}

/** Event card placeholder matching the real EventCard silhouette. */
export function EventCardSkeleton() {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      <div className="flex flex-col gap-3 p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/** Small dashboard metric placeholder. */
export function StatSkeleton() {
  return (
    <div className="glass flex flex-col gap-3 rounded-2xl p-5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

/** Generic bar-chart placeholder. */
export function ChartSkeleton({ className }: { className?: string }) {
  // Deterministic heights so the layout is stable across renders.
  const heights = [40, 65, 52, 80, 45, 92, 60, 72, 38, 85, 55, 68];

  return (
    <div className={cn("glass flex flex-col gap-4 rounded-2xl p-5", className)}>
      <Skeleton className="h-5 w-40" />
      <div aria-hidden className="flex h-40 items-end gap-2">
        {heights.map((h, i) => (
          <Skeleton key={i} className="w-full" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}
