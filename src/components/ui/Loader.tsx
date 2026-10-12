import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/utils/cn";

export interface LoaderProps {
  label?: string;
  /** Fill the viewport with the brand background and center the loader. */
  fullscreen?: boolean;
}

export function Loader({
  label = "Loading experience...",
  fullscreen = false,
}: LoaderProps) {
  const reduceMotion = useReducedMotion();
  const starGradientId = useId();

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-7",
        fullscreen && "fixed inset-0 z-[100] bg-eventora-950",
      )}
    >
      {/* Orbiting star + halo + ring cluster */}
      <div className="relative grid h-24 w-24 place-items-center">
        {/* Soft gradient halo */}
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-600/30 via-violet-glow/20 to-fuchsia-glow/30 blur-2xl"
          animate={
            reduceMotion
              ? undefined
              : { scale: [1, 1.18, 1], opacity: [0.65, 1, 0.65] }
          }
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Expanding halo ring */}
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full border border-brand-500/40"
          animate={
            reduceMotion ? undefined : { scale: [0.7, 1.35], opacity: [0.6, 0] }
          }
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />

        {/* Orbiting particle ring */}
        <motion.span
          aria-hidden
          className="absolute inset-2"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        >
          <span className="absolute left-1/2 top-0 h-1 w-1 -translate-x-1/2 rounded-full bg-cyan-glow" />
          <span className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-fuchsia-glow" />
          <span className="absolute left-0 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-brand-500" />
          <span className="absolute right-0 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-amber-glow" />
        </motion.span>

        {/* Pulsing 4-point star */}
        <motion.svg
          aria-hidden
          className="relative h-10 w-10"
          viewBox="0 0 24 24"
          animate={reduceMotion ? undefined : { scale: [1, 1.12, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <defs>
            <linearGradient id={starGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="55%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
          </defs>
          <path
            d="M12 1 L14 10 L23 12 L14 14 L12 23 L10 14 L1 12 L10 10 Z"
            fill={`url(#${starGradientId})`}
            strokeLinejoin="round"
            strokeWidth="1.5"
            stroke={`url(#${starGradientId})`}
          />
        </motion.svg>
      </div>

      <div className="flex flex-col items-center gap-3">
        <span className="font-display text-xl font-bold tracking-[0.25em] text-gradient">
          EVENTORA
        </span>
        {label && <p className="text-sm text-white/50">{label}</p>}
      </div>

      {/* Indeterminate progress bar */}
      <div
        aria-hidden
        className="h-0.5 w-48 overflow-hidden rounded-full bg-white/10"
      >
        <motion.span
          className="block h-full w-1/3 rounded-full bg-gradient-to-r from-brand-500 via-violet-glow to-fuchsia-glow"
          animate={reduceMotion ? undefined : { x: ["-110%", "320%"] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <span className="sr-only">Loading</span>
    </div>
  );
}
