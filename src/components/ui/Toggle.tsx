import { useId, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/utils/cn";

export interface ToggleProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

export function Toggle({
  checked = false,
  onCheckedChange,
  disabled,
  label,
  description,
  className,
  id,
  "aria-label": ariaLabel,
}: ToggleProps) {
  const autoId = useId();
  const labelId = id ?? `toggle-${autoId}`;
  const reduceMotion = useReducedMotion();

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      {(label || description) && (
        <span className="flex flex-col gap-0.5">
          {label && (
            <span id={labelId} className="text-sm font-medium text-white/90">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-white/50">{description}</span>
          )}
        </span>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : ariaLabel}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border p-0.5 outline-none ring-focus transition-colors duration-200 disabled:opacity-50",
          checked
            ? "border-brand-500/40 bg-gradient-to-r from-brand-600 to-violet-glow"
            : "border-white/10 bg-white/[0.06]",
        )}
      >
        {/* Knob travels 20px: track 44px − knob 20px − 2×2px padding. */}
        <motion.span
          aria-hidden
          animate={{ x: checked ? 20 : 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 700, damping: 34 }
          }
          className="block h-5 w-5 rounded-full bg-white shadow-md"
        />
      </button>
    </div>
  );
}
