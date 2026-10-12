import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  /** Typically a Button or a primary action element. */
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.12] px-6 py-16 text-center",
        className,
      )}
    >
      {icon && (
        <div className="relative mb-5 grid h-16 w-16 place-items-center">
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-600/25 to-fuchsia-glow/10 blur-xl"
          />
          <span className="relative text-white/70">{icon}</span>
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-white/50">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
