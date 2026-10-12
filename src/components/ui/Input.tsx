import {
  forwardRef,
  useId,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ChevronDown } from "lucide-react";

import { cn } from "@/utils/cn";

/* ------------------------------------------------------------------ */
/* Shared animated error message                                       */
/* ------------------------------------------------------------------ */

/**
 * Shared animated error message, exported for reuse by Checkbox/Toggle.
 * Intentionally NOT re-exported from the barrel — it is an internal helper.
 */
export function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <motion.p
      id={id}
      role="alert"
      initial={{ opacity: 0, height: 0, y: -4 }}
      animate={{ opacity: 1, height: "auto", y: 0 }}
      exit={{ opacity: 0, height: 0, y: -4 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="mt-1.5 flex items-center gap-1.5 overflow-hidden text-xs text-rose-400"
    >
      <AlertCircle aria-hidden className="h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
    </motion.p>
  );
}

/** Reusable border/focus styles for the glassy control surfaces. */
function controlStyles(error?: string, extra?: string) {
  return cn(
    "w-full rounded-xl border bg-white/[0.04] text-sm text-white outline-none backdrop-blur-sm transition-all duration-200 ring-focus placeholder:text-white/30",
    error
      ? "border-rose-500/50 focus-visible:border-rose-500/70 focus-visible:shadow-[0_0_0_4px_rgba(244,63,94,0.12)]"
      : "border-white/10 focus-visible:border-brand-500/60 focus-visible:shadow-[0_0_0_4px_rgba(99,102,241,0.12)]",
    extra,
  );
}

/* ------------------------------------------------------------------ */
/* Input                                                               */
/* ------------------------------------------------------------------ */

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    className,
    id,
    placeholder,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `input-${autoId}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div className="w-full">
      <div className="relative">
        {leftIcon && (
          <span
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-white/40"
          >
            {leftIcon}
          </span>
        )}

        {/* Floating label driven by :placeholder-shown — input must keep a
            single-space placeholder while empty. */}
        <input
          ref={ref}
          id={inputId}
          placeholder={label ? " " : placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={controlStyles(
            error,
            cn(
              "peer px-3 pt-5 pb-1.5",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className,
            ),
          )}
          {...rest}
        />

        {rightIcon && (
          <span
            aria-hidden
            className="pointer-events-none absolute right-3 top-1/2 z-[1] -translate-y-1/2 text-white/40"
          >
            {rightIcon}
          </span>
        )}

        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "pointer-events-none absolute top-1/2 origin-left -translate-y-1/2 text-white/40 transition-all duration-200",
              leftIcon ? "left-10" : "left-3",
              "peer-focus:-translate-y-1/2 peer-focus:top-0 peer-focus:scale-[0.78]",
              "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:scale-[0.78]",
              error ? "peer-focus:text-rose-400" : "peer-focus:text-brand-400",
            )}
          >
            {label}
          </label>
        )}
      </div>

      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-white/40">
          {hint}
        </p>
      )}
      <AnimatePresence initial={false}>
        {error && <FieldError id={errorId} message={error} />}
      </AnimatePresence>
    </div>
  );
});

Input.displayName = "Input";

/* ------------------------------------------------------------------ */
/* Textarea                                                            */
/* ------------------------------------------------------------------ */

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, error, hint, className, id, placeholder, rows = 4, ...rest },
    ref,
  ) {
    const autoId = useId();
    const areaId = id ?? `textarea-${autoId}`;
    const errorId = `${areaId}-error`;
    const hintId = `${areaId}-hint`;

    return (
      <div className="w-full">
        <div className="relative">
          <textarea
            ref={ref}
            id={areaId}
            rows={rows}
            placeholder={label ? " " : placeholder}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={controlStyles(
              error,
              cn("peer min-h-[7.5rem] resize-y px-3 pt-6 pb-3", className),
            )}
            {...rest}
          />

          {label && (
            <label
              htmlFor={areaId}
              className={cn(
                "pointer-events-none absolute left-3 top-4 origin-left text-white/40 transition-all duration-200",
                "peer-focus:top-1.5 peer-focus:scale-[0.78]",
                "peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:scale-[0.78]",
                error ? "peer-focus:text-rose-400" : "peer-focus:text-brand-400",
              )}
            >
              {label}
            </label>
          )}
        </div>

        {hint && !error && (
          <p id={hintId} className="mt-1.5 text-xs text-white/40">
            {hint}
          </p>
        )}
        <AnimatePresence initial={false}>
          {error && <FieldError id={errorId} message={error} />}
        </AnimatePresence>
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

/* ------------------------------------------------------------------ */
/* Select (native <select>, floating label via state — :placeholder-   */
/* shown never matches a <select>, so we track the value ourselves)     */
/* ------------------------------------------------------------------ */

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    error,
    hint,
    className,
    id,
    children,
    value,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? `select-${autoId}`;
  const errorId = `${selectId}-error`;
  const hintId = `${selectId}-hint`;

  const [focused, setFocused] = useState(false);
  const [filled, setFilled] = useState<boolean>(() => {
    const v = value ?? defaultValue;
    return v !== undefined && v !== "";
  });
  const floated = focused || filled;

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilled(e.target.value !== "");
    onChange?.(e);
  };

  return (
    <div className="w-full">
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          value={value}
          defaultValue={defaultValue}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          onChange={handleChange}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          className={controlStyles(
            error,
            cn(
              "appearance-none px-3 pt-5 pb-1.5 pr-10",
              className,
            ),
          )}
          {...rest}
        >
          {label && (
            <option value="" disabled hidden>
              {""}
            </option>
          )}
          {children}
        </select>

        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
        />

        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              "pointer-events-none absolute left-3 origin-left transition-all duration-200",
              floated
                ? "top-0 -translate-y-1/2 scale-[0.78]"
                : "top-1/2 -translate-y-1/2",
              floated
                ? error
                  ? "text-rose-400"
                  : "text-brand-400"
                : "text-white/40",
            )}
          >
            {label}
          </label>
        )}
      </div>

      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-white/40">
          {hint}
        </p>
      )}
      <AnimatePresence initial={false}>
        {error && <FieldError id={errorId} message={error} />}
      </AnimatePresence>
    </div>
  );
});

Select.displayName = "Select";

/* ------------------------------------------------------------------ */
/* Field — generic label + error wrapper for arbitrary controls        */
/* ------------------------------------------------------------------ */

export interface FieldProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
}: FieldProps) {
  const autoId = useId();
  const hintId = `field-${autoId}-hint`;

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="mb-1.5 block text-sm font-medium text-white/80"
        >
          {label}
          {required && <span className="ml-0.5 text-rose-400">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-white/40">
          {hint}
        </p>
      )}
      <AnimatePresence initial={false}>
        {error && <FieldError id={`field-${autoId}-error`} message={error} />}
      </AnimatePresence>
    </div>
  );
}
