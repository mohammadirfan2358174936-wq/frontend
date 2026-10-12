import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/utils/cn";

export type ProgressTone = "brand" | "cyan" | "emerald" | "amber" | "rose";

export interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  tone?: ProgressTone;
  label?: string;
}

const toneStyles: Record<ProgressTone, { gradient: string; glow: string }> = {
  brand: {
    gradient: "from-brand-500 to-violet-glow",
    glow: "shadow-[0_0_16px_-4px_#6366f1]",
  },
  cyan: {
    gradient: "from-cyan-glow to-blue-glow",
    glow: "shadow-[0_0_16px_-4px_#22d3ee]",
  },
  emerald: {
    gradient: "from-emerald-glow to-cyan-glow",
    glow: "shadow-[0_0_16px_-4px_#34d399]",
  },
  amber: {
    gradient: "from-amber-glow to-rose-glow",
    glow: "shadow-[0_0_16px_-4px_#fbbf24]",
  },
  rose: {
    gradient: "from-rose-glow to-fuchsia-glow",
    glow: "shadow-[0_0_16px_-4px_#fb7185]",
  },
};

export function Progress({
  value,
  max = 100,
  className,
  tone = "brand",
  label,
}: ProgressProps) {
  const reduceMotion = useReducedMotion();
  const ratio = max > 0 ? value / max : 0;
  const pct = Math.min(100, Math.max(0, ratio * 100));
  const styles = toneStyles[tone];

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-xs text-white/60">
          <span>{label}</span>
          <span className="tabular-nums">{Math.round(pct)}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label ?? "Progress"}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]"
      >
        <motion.div
          className={cn("h-full rounded-full bg-gradient-to-r", styles.gradient, styles.glow)}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 120, damping: 20 }
          }
        />
      </div>
    </div>
  );
}
