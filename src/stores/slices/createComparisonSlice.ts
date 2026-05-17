import type { Side } from "../types/simulation.types";
import { createDefaultSim } from "./createSimulationSlice";

export interface ComparisonSlice {
  /** Whether the split screen mode is active */
  comparisonMode: boolean;
  /** Whether cameras are synchronized between both simulations */
  syncCameras: boolean;

  // Actions
  /** Toggles split screen mode and resets right side simulation if closing */
  toggleComparison: () => void;
  /** Toggles camera synchronization */
  toggleSyncCameras: () => void;
  /** Toggles pause state for both simulations simultaneously */
  toggleAllPause: () => void;
  /** Copies a parameter value from one side to the other */
  copyParam: (from: Side, to: Side, key: string) => void;
  /** Synchronizes simulation speed between both sides */
  copySpeed: (from: Side, to: Side) => void;
  /** Resets and restarts both simulations simultaneously */
  syncAll: () => void;
}

export const createComparisonSlice = (set: any, get: any): ComparisonSlice => ({
  comparisonMode: false,
  syncCameras: false,

  toggleComparison: () =>
    set((state: any) => {
      const nextComparisonMode = !state.comparisonMode;
      const rightSim = nextComparisonMode
        ? state.sims.right
        : createDefaultSim(state.sims.left.systemType, "right");

      return {
        comparisonMode: nextComparisonMode,
        butterflyMode: false, // Mutually exclusive with butterfly mode
        sims: {
          ...state.sims,
          right: rightSim,
        },
      };
    }),

  toggleSyncCameras: () =>
    set((state: any) => ({
      syncCameras: !state.syncCameras,
    })),

  toggleAllPause: () =>
    set((state: any) => {
      const nextPaused = !state.sims.left.isPaused;
      return {
        sims: {
          left: { ...state.sims.left, isPaused: nextPaused },
          right: { ...state.sims.right, isPaused: nextPaused },
        },
      };
    }),

  copyParam: (from, to, key) =>
    set((state: any) => {
      const fromSim = state.sims[from];
      const toSim = state.sims[to];

      if (fromSim.systemType !== toSim.systemType) return state;

      return {
        sims: {
          ...state.sims,
          [to]: {
            ...state.sims[to],
            params: {
              ...state.sims[to].params,
              [key]: fromSim.params[key],
            },
          },
        },
      };
    }),

  copySpeed: (from, to) =>
    set((state: any) => ({
      sims: {
        ...state.sims,
        [to]: {
          ...state.sims[to],
          speed: state.sims[from].speed,
        },
      },
    })),

  syncAll: () => {
    const { resetSimulation } = get();
    resetSimulation("left");
    resetSimulation("right");
  },
});
