import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

export type BadgeTone =
  | "brand"
  | "cyan"
  | "emerald"
  | "amber"
  | "rose"
  | "neutral";

export interface BadgeProps {
  tone?: BadgeTone;
  /** Small leading status dot that inherits the tone color. */
  dot?: boolean;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

const toneStyles: Record<BadgeTone, string> = {
  brand: "border-brand-500/30 bg-brand-500/10 text-brand-500",
  cyan: "border-cyan-glow/30 bg-cyan-glow/10 text-cyan-glow",
  emerald: "border-emerald-glow/30 bg-emerald-glow/10 text-emerald-glow",
  amber: "border-amber-glow/30 bg-amber-glow/10 text-amber-glow",
  rose: "border-rose-glow/30 bg-rose-glow/10 text-rose-glow",
  neutral: "border-white/10 bg-white/5 text-white/70",
};

export function Badge({
  tone = "brand",
  dot = false,
  icon,
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm",
        toneStyles[tone],
        className,
      )}
    >
      {dot && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />}
      {icon && (
        <span aria-hidden className="-ml-0.5 flex h-3.5 w-3.5 items-center justify-center">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
