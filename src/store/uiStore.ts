import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * UI STORE
 * --------
 * Global chrome state: nav drawers, theme, motion preference, saved events.
 * Deliberately tiny — component-local UI state stays component-local.
 */

interface UiState {
  mobileNavOpen: boolean;
  commandOpen: boolean;
  theme: "dark" | "light";
  reducedMotion: boolean;
  savedEventIds: number[];
  recentSearches: string[];

  setMobileNav: (open: boolean) => void;
  setCommand: (open: boolean) => void;
  setTheme: (theme: "dark" | "light") => void;
  toggleTheme: () => void;
  setReducedMotion: (value: boolean) => void;
  toggleSaved: (eventId: number) => void;
  isSaved: (eventId: number) => boolean;
  pushSearch: (term: string) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      mobileNavOpen: false,
      commandOpen: false,
      theme: "dark",
      reducedMotion: false,
      savedEventIds: [],
      recentSearches: [],

      setMobileNav: (mobileNavOpen) => set({ mobileNavOpen }),
      setCommand: (commandOpen) => set({ commandOpen }),

      setTheme: (theme) => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        document.documentElement.classList.toggle("light", theme === "light");
        set({ theme });
      },

      toggleTheme: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),

      setReducedMotion: (value) => {
        document.documentElement.classList.toggle("reduced-motion", value);
        set({ reducedMotion: value });
      },

      toggleSaved: (eventId) => {
        const current = get().savedEventIds;
        const next = current.includes(eventId)
          ? current.filter((id) => id !== eventId)
          : [...current, eventId];
        set({ savedEventIds: next });
      },

      isSaved: (eventId) => get().savedEventIds.includes(eventId),

      pushSearch: (term) => {
        const trimmed = term.trim();
        if (!trimmed) return;
        const next = [trimmed, ...get().recentSearches.filter((t) => t !== trimmed)].slice(0, 6);
        set({ recentSearches: next });
      },
    }),
    {
      name: "eventora-ui",
      partialize: (state) => ({
        theme: state.theme,
        reducedMotion: state.reducedMotion,
        savedEventIds: state.savedEventIds,
        recentSearches: state.recentSearches,
      }),
    },
  ),
);
