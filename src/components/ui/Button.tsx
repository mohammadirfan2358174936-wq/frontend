import { forwardRef, type ReactNode } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

import { cn } from "@/utils/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "danger"
  | "success";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref" | "children"> {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  glow?: boolean;
}

/**
 * `group` enables the child shimmer to react to hover via `group-hover`.
 * `ring-focus` (defined in index.css) supplies the visible keyboard focus ring.
 * `overflow-hidden` clips the shimmer sweep to the rounded surface.
 */
const base =
  "group relative inline-flex select-none items-center justify-center gap-2 overflow-hidden font-semibold tracking-tight outline-none ring-focus transition-colors duration-200 disabled:pointer-events-none disabled:opacity-60";

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 rounded-xl px-4 text-sm",
  md: "h-11 rounded-xl px-5 text-sm",
  lg: "h-12 rounded-2xl px-6 text-base",
  xl: "h-14 rounded-2xl px-8 text-base",
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "border border-white/10 bg-gradient-to-r from-brand-600 via-violet-600 to-fuchsia-600 text-white shadow-[0_10px_34px_-10px_rgba(99,102,241,0.65)] hover:brightness-110",
  secondary: "glass glass-hover text-white",
  ghost: "text-white/80 hover:bg-white/5 hover:text-white",
  outline:
    "border border-white/15 bg-transparent text-white hover:border-white/30 hover:bg-white/5",
  danger:
    "border border-rose-400/20 bg-rose-600/90 text-white shadow-[0_10px_34px_-12px_rgba(225,29,72,0.6)] hover:bg-rose-600",
  success:
    "border border-emerald-400/20 bg-emerald-600/90 text-white shadow-[0_10px_34px_-12px_rgba(16,185,129,0.55)] hover:bg-emerald-600",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      glow = false,
      className,
      children,
      disabled,
      type = "button",
      ...rest
    },
    ref,
  ) {
    const reduceMotion = useReducedMotion();
    const inert = disabled || loading;

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={inert}
        aria-busy={loading || undefined}
        className={cn(
          base,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          glow && "glow-indigo",
          className,
        )}
        whileHover={reduceMotion || inert ? undefined : { scale: 1.02 }}
        whileTap={reduceMotion || inert ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        {...rest}
      >
        {/* Decorative shimmer highlight — glides across on hover. */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
        />

        {loading ? (
          <Loader2 aria-hidden className="relative z-[1] h-4 w-4 shrink-0 animate-spin" />
        ) : (
          leftIcon && (
            <span aria-hidden className="relative z-[1] shrink-0">
              {leftIcon}
            </span>
          )
        )}

        <span className="relative z-[1]">{children}</span>

        {rightIcon && !loading && (
          <span aria-hidden className="relative z-[1] shrink-0">
            {rightIcon}
          </span>
        )}
      </motion.button>
    );
  },
);

Button.displayName = "Button";

export default Button;
