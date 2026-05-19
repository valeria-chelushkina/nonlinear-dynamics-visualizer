/**
 * @file useVisualsStore.ts
 * @description Manages visual settings for the simulations (colors, effects).
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { logger } from "./middleware/log.middleware";
import type { VisualConfig, Side } from "./types/simulation.types";

interface VisualsStore {
  /** Visual configurations for both sides of the comparison view */
  configs: Record<Side, VisualConfig>;

  /**
   * Updates the visual configuration for a specific side and persists to localStorage.
   * @param side - 'left' or 'right' side
   * @param config - Partial visual configuration to merge
   */
  setVisuals: (side: Side, config: Partial<VisualConfig>) => void;
}

/** Default visuals in case if storage is empty. */
const DEFAULT_VISUALS: Record<Side, VisualConfig> = {
  left: {
    color: "#c026d3",
    useGradient: false,
  },
  right: {
    color: "#d32677",
    useGradient: false,
  },
};

const getInitialVisuals = (side: Side): VisualConfig => {
  const saved = localStorage.getItem(`visuals_${side}`);
  if (saved) {
    try {
      return { ...DEFAULT_VISUALS[side], ...JSON.parse(saved) };
    } catch (err) {
      console.error(
        `VisualsStore: Failed to parse saved visuals for ${side}`,
        err,
      );
    }
  }
  return DEFAULT_VISUALS[side];
};

export const useVisualsStore = create<VisualsStore>()(
  devtools(
    logger("Visuals")((set: any) => ({
      configs: {
        left: getInitialVisuals("left"),
        right: getInitialVisuals("right"),
      },

      setVisuals: (side: any, newConfig: any) =>
        set((state: any) => {
          const updatedConfig = { ...state.configs[side], ...newConfig };
          localStorage.setItem(
            `visuals_${side}`,
            JSON.stringify(updatedConfig),
          );
          return {
            configs: {
              ...state.configs,
              [side]: updatedConfig,
            },
          };
        }),
    })),
  ),
);
