/**
 * @file useUIStore.ts
 * @description Store for UI layout, theme management and global interaction signals.
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { logger } from "./middleware/log.middleware";

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

const applyThemeToRoot = (theme: Theme) => {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
};

export const useUIStore = create<UIStore>()(
  devtools(
    logger("UI")((set: any) => ({
      theme: (() => {
        const saved = localStorage.getItem("theme") as Theme;
        const theme = saved || "light";
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-theme", theme);
        }
        return theme;
      })(),

      isLibraryOpen: false,

      toggleTheme: () =>
        set((state: any) => {
          const nextTheme = state.theme === "light" ? "dark" : "light";
          applyThemeToRoot(nextTheme);
          return { theme: nextTheme };
        }),

      setTheme: (theme: any) => {
        applyThemeToRoot(theme);
        set({ theme });
      },

      toggleLibrary: () =>
        set((state: any) => ({
          isLibraryOpen: !state.isLibraryOpen,
        })),

      setLibraryOpen: (isOpen: any) =>
        set({
          isLibraryOpen: isOpen,
        }),
    })),
  ),
);
