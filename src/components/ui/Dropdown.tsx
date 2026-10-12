import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { cn } from "@/utils/cn";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

export interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onSelect?: () => void;
  danger?: boolean;
  /** Renders a non-interactive separator instead of a menu item. */
  separator?: boolean;
}

export interface DropdownProps {
  /** Presentational trigger content (icon/avatar/label), rendered inside our
   *  menu-button — do not pass a `<button>` or you'll nest buttons. */
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({
  trigger,
  items,
  align = "right",
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const reduceMotion = useReducedMotion();

  useOnClickOutside(containerRef, () => setOpen(false));

  // Move focus to the first item when the menu opens.
  useEffect(() => {
    if (!open) return;
    const first =
      containerRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
    first?.focus();
  }, [open]);

  const handleMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;

    e.preventDefault();
    const menuItems = Array.from(
      containerRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ??
        [],
    );
    if (menuItems.length === 0) return;
    const current = menuItems.indexOf(document.activeElement as HTMLElement);
    const next =
      e.key === "ArrowDown"
        ? (current + 1) % menuItems.length
        : (current - 1 + menuItems.length) % menuItems.length;
    menuItems[next]?.focus();
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-block text-left", className)}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className="ring-focus inline-flex items-center rounded-lg outline-none"
      >
        {trigger}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            aria-orientation="vertical"
            onKeyDown={handleMenuKeyDown}
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "glass-strong absolute z-50 mt-2 min-w-[12rem] overflow-hidden rounded-xl border border-white/[0.12] p-1 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.75)]",
              align === "right" ? "right-0" : "left-0",
            )}
          >
            {items.map((item) =>
              item.separator ? (
                <div
                  key={item.id}
                  role="separator"
                  className="my-1 h-px bg-white/10"
                />
              ) : (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    item.onSelect?.();
                    setOpen(false);
                    // Return focus to the trigger so keyboard users keep their place.
                    triggerRef.current?.focus();
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm outline-none ring-focus transition-colors",
                    item.danger
                      ? "text-rose-glow hover:bg-rose-500/10 focus-visible:bg-rose-500/10"
                      : "text-white/80 hover:bg-white/[0.07] hover:text-white focus-visible:bg-white/[0.07]",
                  )}
                >
                  {item.icon && (
                    <span aria-hidden className="flex h-4 w-4 items-center justify-center">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </button>
              ),
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
