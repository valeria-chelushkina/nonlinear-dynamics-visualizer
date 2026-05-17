/**
 * @file useUIStore.ts
 * @description Store for UI layout, theme management and global interaction signals.
 */

import { create } from "zustand";

type Theme = "light" | "dark";

interface UIStore {
  /** The current visual theme of the application */
  theme: Theme;
  /** Whether the library sidebar is open */
  isLibraryOpen: boolean;

  // Actions
  /** Toggles between light and dark themes and persists to localStorage */
  toggleTheme: () => void;
  /** Sets the application theme */
  setTheme: (theme: Theme) => void;
  /** Toggles the visibility of the library sidebar */
  toggleLibrary: () => void;
  /** Sets the library sidebar visibility */
  setLibraryOpen: (isOpen: boolean) => void;
}

/** Helper to apply theme to document root for CSS variables */
const applyThemeToRoot = (theme: Theme) => {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
};

export const useUIStore = create<UIStore>((set) => ({
  // Initialize theme from storage or default to light
  theme: (() => {
    const saved = localStorage.getItem("theme") as Theme;
    const theme = saved || "light";
    // Apply it immediately on load
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
    return theme;
  })(),

  isLibraryOpen: false,

  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === "light" ? "dark" : "light";
      applyThemeToRoot(nextTheme);
      return { theme: nextTheme };
    }),

  setTheme: (theme) => {
    applyThemeToRoot(theme);
    set({ theme });
  },

  toggleLibrary: () =>
    set((state) => ({
      isLibraryOpen: !state.isLibraryOpen,
    })),

  setLibraryOpen: (isOpen) =>
    set({
      isLibraryOpen: isOpen,
    }),
}));
