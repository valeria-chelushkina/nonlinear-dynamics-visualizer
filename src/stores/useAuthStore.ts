/**
 * @file useAuthStore.ts
 * @description Specialized Zustand store for authentication and session management.
 */

import { create } from "zustand";

interface User {
  id: string;
  username: string;
  email?: string;
}

interface AuthStore {
  /** The current user OR null if it's a guest. */
  user: User | null;
  /** JWT token for API authorization headers. */
  token: string | null;
  /** Value for conditional rendering. */
  isAuthenticated: boolean;

  // Actions

  /**
   * Hydrates the store from localStorage. Call on app initialization.
   */
  initialize: () => void;

  /**
   * Updates authentication state and persists it to localStorage.
   * @param user - User from backend
   * @param token - Valid JWT string
   */
  setAuth: (user: User | null, token: string | null) => void;

  /** Clears all session data and removes token from the browser. */
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  initialize: () => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      try {
        set({
          user: JSON.parse(savedUser),
          token: savedToken,
          isAuthenticated: true,
        });
      } catch (err) {
        console.error("Failed to parse user from storage", err);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  },

  setAuth: (user, token) => {
    if (user && token) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
    set({ user, token, isAuthenticated: !!(user && token) });
  },
  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
