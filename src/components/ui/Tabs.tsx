import {
  useId,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/utils/cn";

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  content?: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  onChange?: (id: string) => void;
  className?: string;
  variant?: "underline" | "pill";
}

export function Tabs({
  items,
  defaultValue,
  onChange,
  className,
  variant = "underline",
}: TabsProps) {
  // Unique scope so layoutId never collides between multiple Tabs instances.
  const scopeId = useId();
  const [active, setActive] = useState(defaultValue ?? items[0]?.id ?? "");
  const reduceMotion = useReducedMotion();

  const tabBtnId = (id: string) => `${scopeId}-tab-${id}`;
  const panelId = (id: string) => `${scopeId}-panel-${id}`;
  const layoutTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 380, damping: 30 };

  const select = (id: string) => {
    setActive(id);
    onChange?.(id);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = items.findIndex((i) => i.id === active);
    if (idx < 0) return;

    let next = -1;
    if (e.key === "ArrowRight") next = (idx + 1) % items.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + items.length) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    else return;

    e.preventDefault();
    select(items[next].id);
    document.getElementById(tabBtnId(items[next].id))?.focus();
  };

  const isUnderline = variant === "underline";

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div
        role="tablist"
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
        className={cn(
          "relative flex items-center",
          isUnderline
            ? "gap-1 border-b border-white/10"
            : "glass gap-1 self-start rounded-xl p-1",
        )}
      >
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={tabBtnId(item.id)}
              aria-selected={isActive}
              aria-controls={panelId(item.id)}
              tabIndex={isActive ? 0 : -1}
              onClick={() => select(item.id)}
              className={cn(
                "relative outline-none ring-focus transition-colors duration-200",
                isUnderline
                  ? "-mb-px flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
                  : "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium",
                isActive ? "text-white" : "text-white/60 hover:text-white",
              )}
            >
              <span className="relative z-10 flex items-center gap-2">
                {item.icon}
                {item.label}
              </span>

              {/* Sliding indicator — layoutId scoped to this Tabs instance. */}
              {isActive &&
                (isUnderline ? (
                  <motion.span
                    aria-hidden
                    layoutId={`${scopeId}-underline`}
                    transition={layoutTransition}
                    className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-brand-500 to-fuchsia-glow"
                  />
                ) : (
                  <motion.span
                    aria-hidden
                    layoutId={`${scopeId}-pill`}
                    transition={layoutTransition}
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-brand-600 to-violet-glow shadow-[0_6px_20px_-6px_rgba(99,102,241,0.6)]"
                  />
                ))}
            </button>
          );
        })}
      </div>

      {items.map((item) =>
        item.id === active && item.content !== undefined ? (
          <motion.div
            key={item.id}
            role="tabpanel"
            id={panelId(item.id)}
            aria-labelledby={tabBtnId(item.id)}
            tabIndex={0}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="ring-focus rounded-xl outline-none"
          >
            {item.content}
          </motion.div>
        ) : null,
      )}
    </div>
  );
}
