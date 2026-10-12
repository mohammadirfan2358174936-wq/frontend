import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/utils/cn";

export type ToastTone = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface ToneConfig {
  icon: LucideIcon;
  border: string;
  text: string;
  bar: string;
}

const toneConfig: Record<ToastTone, ToneConfig> = {
  success: {
    icon: CheckCircle2,
    border: "border-emerald-glow/30",
    text: "text-emerald-glow",
    bar: "bg-emerald-glow",
  },
  error: {
    icon: XCircle,
    border: "border-rose-glow/30",
    text: "text-rose-glow",
    bar: "bg-rose-glow",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-amber-glow/30",
    text: "text-amber-glow",
    bar: "bg-amber-glow",
  },
  info: {
    icon: Info,
    border: "border-brand-500/30",
    text: "text-brand-500",
    bar: "bg-brand-500",
  },
};

const AUTO_DISMISS_MS = 4500;

export function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const reduceMotion = useReducedMotion();
  const cfg = toneConfig[toast.tone];
  const Icon = cfg.icon;

  useEffect(() => {
    const timer = window.setTimeout(
      () => onDismiss(toast.id),
      AUTO_DISMISS_MS,
    );
    return () => window.clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <motion.div
      layout={!reduceMotion}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
      className={cn(
        "glass-strong pointer-events-auto relative w-full overflow-hidden rounded-xl border p-4 pr-10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)] sm:w-[22rem]",
        cfg.border,
      )}
    >
      <div className="flex items-start gap-3">
        <Icon aria-hidden className={cn("mt-0.5 h-5 w-5 shrink-0", cfg.text)} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">{toast.title}</p>
          {toast.description && (
            <p className="mt-0.5 text-xs text-white/60">{toast.description}</p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="ring-focus absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-md text-white/50 outline-none transition-colors hover:bg-white/5 hover:text-white"
      >
        <X aria-hidden className="h-3.5 w-3.5" />
      </button>

      {/* Slim auto-dismiss countdown — duration matches the timer above. */}
      <motion.span
        aria-hidden
        className={cn("absolute bottom-0 left-0 h-0.5", cfg.bar)}
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: AUTO_DISMISS_MS / 1000, ease: "linear" }}
      />
    </motion.div>
  );
}
