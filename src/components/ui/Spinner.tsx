import { useId, type HTMLAttributes } from "react";
import { motion } from "framer-motion";

import { cn } from "@/utils/cn";

export type SpinnerProps = HTMLAttributes<HTMLSpanElement>;

export function Spinner({ className, ...rest }: SpinnerProps) {
  const gradientId = useId();

  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn("inline-block h-6 w-6", className)}
      {...rest}
    >
      <motion.svg
        className="h-full w-full"
        viewBox="0 0 50 50"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          {/* Mirrors the brand → violet → fuchsia token gradient. */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
        </defs>
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="90 40"
        />
      </motion.svg>
    </span>
  );
}
