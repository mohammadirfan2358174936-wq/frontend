import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { cn } from "@/utils/cn";
import { FieldError } from "./Input";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "checked"> {
  label?: ReactNode;
  description?: ReactNode;
  error?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Checkbox({
  label,
  description,
  error,
  checked = false,
  onCheckedChange,
  className,
  id,
  disabled,
  ...rest
}: CheckboxProps) {
  const autoId = useId();
  const boxId = id ?? `checkbox-${autoId}`;
  const errorId = `${boxId}-error`;
  const descId = `${boxId}-desc`;
  const reduceMotion = useReducedMotion();

  const describedBy =
    cn(description && descId, error && errorId) || undefined;

  return (
    <div className={cn("w-full", className)}>
      <label htmlFor={boxId} className="group flex cursor-pointer items-start gap-3">
        <span className="relative mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center">
          <input
            type="checkbox"
            id={boxId}
            checked={checked}
            disabled={disabled}
            onChange={(e) => onCheckedChange?.(e.target.checked)}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className="peer sr-only"
            {...rest}
          />

          {/* Styled box — the real input is `sr-only`. peer-driven focus ring. */}
          <motion.span
            aria-hidden
            whileTap={reduceMotion || disabled ? undefined : { scale: 0.88 }}
            transition={{ type: "spring", stiffness: 600, damping: 30 }}
            className={cn(
              "pointer-events-none absolute inset-0 flex items-center justify-center rounded-md border transition-colors duration-150",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-eventora-950",
              checked
                ? "border-brand-500 bg-gradient-to-br from-brand-500 to-violet-glow"
                : "border-white/20 bg-white/[0.04] group-hover:border-white/40",
              error && !checked && "border-rose-500/60",
              disabled && "opacity-50",
            )}
          >
            <motion.svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 text-white"
            >
              <motion.path
                d="M20 6 9 17l-5-5"
                initial={false}
                animate={{
                  pathLength: checked ? 1 : 0,
                  opacity: checked ? 1 : 0,
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              />
            </motion.svg>
          </motion.span>
        </span>

        {(label || description) && (
          <span className="flex flex-col gap-0.5">
            {label && <span className="text-sm font-medium text-white/90">{label}</span>}
            {description && (
              <span id={descId} className="text-xs text-white/50">
                {description}
              </span>
            )}
          </span>
        )}
      </label>

      <AnimatePresence initial={false}>
        {error && <FieldError id={errorId} message={error} />}
      </AnimatePresence>
    </div>
  );
}
