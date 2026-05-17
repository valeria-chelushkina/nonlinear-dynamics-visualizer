/**
 * @file useSimulationStore.ts
 * @description Main simulation store assembled from focused slices.
 * Handles physical state, comparison logic and the butterfly effect.
 */

import { create } from "zustand";
import { createSimulationSlice } from "./slices/createSimulationSlice";
import type { SimulationSlice } from "./slices/createSimulationSlice";
import { createComparisonSlice } from "./slices/createComparisonSlice";
import type { ComparisonSlice } from "./slices/createComparisonSlice";
import { createButterflySlice } from "./slices/createButterflySlice";
import type { ButterflySlice } from "./slices/createButterflySlice";
import type { Side } from "./types/simulation.types";

/** Combined store type representing the full simulation state */
export interface SimulationStore
  extends SimulationSlice, ComparisonSlice, ButterflySlice {
  /** Signal used to trigger screenshots in the canvas */
  screenshotSignal: { side: Side | null; timestamp: number };
  /** Triggers a screenshot for a specific side */
  triggerScreenshot: (side: Side) => void;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  ...createSimulationSlice(set, get),
  ...createComparisonSlice(set, get),
  ...createButterflySlice(set, get),

  screenshotSignal: { side: null, timestamp: 0 },

  triggerScreenshot: (side: Side) =>
    set({
      screenshotSignal: { side, timestamp: Date.now() },
    }),
}));

export type { Side };
