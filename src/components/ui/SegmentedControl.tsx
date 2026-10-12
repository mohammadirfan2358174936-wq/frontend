import {
  useId,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/utils/cn";

export interface SegmentedOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

export interface SegmentedControlProps {
  options: SegmentedOption[];
  /** Controlled value. Omit for uncontrolled usage with `defaultValue`. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  "aria-label"?: string;
}

export function SegmentedControl({
  options,
  value,
  defaultValue,
  onChange,
  className,
  "aria-label": ariaLabel,
}: SegmentedControlProps) {
  const scopeId = useId();
  const reduceMotion = useReducedMotion();
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(
    defaultValue ?? options[0]?.value ?? "",
  );
  const current = isControlled ? value : internal;

  const select = (v: string) => {
    if (!isControlled) setInternal(v);
    onChange?.(v);
  };

  const layoutTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 380, damping: 30 };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = options.findIndex((o) => o.value === current);
    if (idx < 0) return;

    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (idx + 1) % options.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
      next = (idx - 1 + options.length) % options.length;
    else return;

    e.preventDefault();
    select(options[next].value);
    document.getElementById(`${scopeId}-${options[next].value}`)?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel ?? "View"}
      onKeyDown={handleKeyDown}
      className={cn(
        "glass inline-flex items-center gap-1 self-start rounded-xl p-1",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === current;
        return (
          <button
            key={option.value}
            id={`${scopeId}-${option.value}`}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => select(option.value)}
            className={cn(
              "relative rounded-lg px-4 py-1.5 text-sm font-medium outline-none ring-focus transition-colors duration-200",
              active ? "text-white" : "text-white/60 hover:text-white",
            )}
          >
            <span className="relative z-10 flex items-center gap-1.5">
              {option.icon}
              {option.label}
            </span>

            {/* Sliding highlight — layoutId scoped to this instance. */}
            {active && (
              <motion.span
                aria-hidden
                layoutId={`${scopeId}-segment`}
                transition={layoutTransition}
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-brand-600 to-violet-glow shadow-[0_6px_18px_-6px_rgba(99,102,241,0.6)]"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
