import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/utils/cn";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/** Builds a page list with "…" truncation, e.g. 1 … 4 5 6 … 20. */
function buildPageList(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  if (left > 2) pages.push("ellipsis");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push("ellipsis");

  pages.push(total);
  return pages;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const pages = useMemo(() => buildPageList(page, totalPages), [page, totalPages]);

  const navButton =
    "ring-focus grid h-9 w-9 place-items-center rounded-lg text-white/60 outline-none transition-colors hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:opacity-40";

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1", className)}
    >
      <button
        type="button"
        className={navButton}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft aria-hidden className="h-4 w-4" />
      </button>

      {/* Page numbers — desktop */}
      <div className="hidden items-center gap-1 sm:flex">
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`ellipsis-${i}`} aria-hidden className="px-1.5 text-white/40">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              aria-label={`Page ${p}`}
              className={cn(
                "ring-focus h-9 min-w-9 rounded-lg px-3 text-sm font-medium outline-none transition-colors",
                p === page
                  ? "bg-gradient-to-r from-brand-600 to-violet-glow text-white shadow-[0_6px_18px_-6px_rgba(99,102,241,0.6)]"
                  : "text-white/60 hover:bg-white/5 hover:text-white",
              )}
            >
              {p}
            </button>
          ),
        )}
      </div>

      {/* Compact counter — mobile */}
      <span className="px-3 text-sm text-white/60 sm:hidden">
        Page <span className="font-medium text-white">{page}</span> of {totalPages}
      </span>

      <button
        type="button"
        className={navButton}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight aria-hidden className="h-4 w-4" />
      </button>
    </nav>
  );
}
