import {
  cloneElement,
  isValidElement,
  useId,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { cn } from "@/utils/cn";

export type TooltipSide = "top" | "right" | "bottom" | "left";

export interface TooltipProps {
  content: ReactNode;
  side?: TooltipSide;
  className?: string;
  children: ReactNode;
}

const sideStyles: Record<TooltipSide, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

export function Tooltip({
  content,
  side = "top",
  className,
  children,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const tooltipId = `tooltip-${useId()}`;

  const show = () => setOpen(true);
  const hide = () => setOpen(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === "Escape") setOpen(false);
  };

  // Inject aria-describedby onto the focusable child when visible.
  const triggerChild = isValidElement(children)
    ? cloneElement(children as ReactElement<{ "aria-describedby"?: string }>, {
        "aria-describedby": open ? tooltipId : undefined,
      })
    : children;

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={handleKeyDown}
    >
      {triggerChild}

      <AnimatePresence>
        {open && (
          // Outer span owns the translate placement; inner motion span owns
          // scale/fade so the two transforms never fight each other.
          <span
            className={cn("pointer-events-none absolute z-50", sideStyles[side])}
          >
            <motion.span
              role="tooltip"
              id={tooltipId}
              initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.94 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
              className="glass-strong block whitespace-nowrap rounded-lg border border-white/[0.12] px-2.5 py-1.5 text-xs font-medium text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7)]"
            >
              {content}
            </motion.span>
          </span>
        )}
      </AnimatePresence>
    </span>
  );
}
