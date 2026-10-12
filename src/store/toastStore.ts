import { create } from "zustand";
import type { ToastItem, ToastTone } from "@/components/ui/Toast";

/**
 * TOAST STORE
 * -----------
 * Toast notifications are spawned here and rendered once by <Toaster/>.
 * Keep the list shallow (max 4 visible) so the corner never covers content.
 */

interface ToastStore {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, "id">) => string;
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  warning: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

let counter = 0;
const AUTO_DISMISS_MS = 4500;
const MAX_VISIBLE = 4;

export const useToastStore = create<ToastStore>((set, get) => {
  const push = (toast: Omit<ToastItem, "id">) => {
    counter += 1;
    const id = `toast-${counter}-${Date.now().toString(36)}`;
    const toasts = [...get().toasts, { ...toast, id }];
    // Drop the oldest when the stack overflows.
    set({ toasts: toasts.slice(-MAX_VISIBLE) });
    window.setTimeout(() => get().dismiss(id), AUTO_DISMISS_MS);
    return id;
  };

  const toneFactory = (tone: ToastTone) => (title: string, description?: string) =>
    push({ tone, title, description });

  return {
    toasts: [],
    push,
    success: toneFactory("success"),
    error: toneFactory("error"),
    warning: toneFactory("warning"),
    info: toneFactory("info"),
    dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
    clear: () => set({ toasts: [] }),
  };
});

/** Convenience helper for non-React call sites (axios interceptors, etc.). */
export const toast = {
  success: (title: string, description?: string) => useToastStore.getState().success(title, description),
  error: (title: string, description?: string) => useToastStore.getState().error(title, description),
  warning: (title: string, description?: string) => useToastStore.getState().warning(title, description),
  info: (title: string, description?: string) => useToastStore.getState().info(title, description),
};
