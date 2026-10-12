import type { HTMLAttributes, ReactNode } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

import { cn } from "@/utils/cn";

export interface CardProps extends Omit<HTMLMotionProps<"div">, "ref" | "children"> {
  children?: ReactNode;
  /** Translucent glass surface. Defaults to `true`. */
  glass?: boolean;
  /** Enables the hover lift + gradient sheen affordance. */
  interactive?: boolean;
}

export function Card({
  glass = true,
  interactive = false,
  className,
  children,
  ...rest
}: CardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(
        "group relative overflow-hidden rounded-2xl",
        glass
          ? "glass"
          : "border border-white/[0.06] bg-eventora-900/60",
        interactive && "glass-hover cursor-pointer",
        className,
      )}
      whileHover={reduceMotion || !interactive ? undefined : { y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      {...rest}
    >
      {children}

      {/* Gradient border/sheen that fades in on hover. Sits above content but is
          non-interactive and only ~10% white, so it never harms readability. */}
      {interactive && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 ring-1 ring-inset ring-white/10 transition-opacity duration-300 group-hover:opacity-100"
        />
      )}
    </motion.div>
  );
}

export function CardHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 p-6 pb-0", className)}
      {...rest}
    />
  );
}

export function CardTitle({
  className,
  ...rest
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-display text-lg font-semibold leading-tight tracking-tight text-white",
        className,
      )}
      {...rest}
    />
  );
}

export function CardDescription({
  className,
  ...rest
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-white/60", className)} {...rest} />
  );
}

export function CardContent({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...rest} />;
}

export function CardFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center gap-3 p-6 pt-0", className)}
      {...rest}
    />
  );
}
