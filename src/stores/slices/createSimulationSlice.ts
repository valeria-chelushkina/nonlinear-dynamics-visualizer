/**
 * @file createSimulationSlice.ts
 * @description Manages multidimensional trajectory path state layers, parameter updates,
 * step-jump distance validations and view splitting triggers.
 */

import { SYSTEM_REGISTRY } from "@/core/systems";
import type { StateVector } from "@/core/math/types";
import type { Side, SimulationData } from "../types/simulation.types";
import { SimulationValidator } from "@/core/utils/validation";

export interface SimulationSlice {
  /** Map of active simulation coordinate datasets bound to left and right viewports */
  sims: Record<Side, SimulationData>;
  /** Override flag to halt default automated system resets when processing active presets */
  skipNextReset: boolean;
  /** Updates the state tracking flag determining automated system configuration resets */
  setSkipNextReset: (skip: boolean) => void;
  /** Alters target chaos equations model mappings assigned to an isolated viewport engine */
  setSystemType: (side: Side, type: string) => void;
  /** Merges new mathematical parameter configuration attributes into the active model instance */
  setParams: (side: Side, params: Partial<Record<string, number>>) => void;
  /** Validates and appends a newly calculated coordinate point to a viewport trace array */
  addPoint: (side: Side, point: StateVector) => void;
  /** Processes and batches a sequence of integration step coordinates down into trace arrays */
  addPoints: (side: Side, points: StateVector[]) => void;
  /** Flips the current running execution state of a specific rendering context */
  togglePause: (side: Side) => void;
  /** Directly sets the operational execution boundary of an active rendering engine */
  setPaused: (side: Side, isPaused: boolean) => void;
  /** Modifies the integration multiplier speed of the solver pipeline */
  setSpeed: (side: Side, speed: number) => void;
  /** Dictates upper historical trace point length boundaries to optimize memory profiles */
  setMaxPoints: (side: Side, maxPoints: number) => void;
  /** Clears and re-initializes vector trace state values back to designated origin points */
  resetSimulation: (side: Side) => void;
  /** Restores numerical configuration variables back to system engine default limits */
  resetParams: (side: Side) => void;
  /** Globally flushes all active viewport slice properties back to primary application baselines */
  resetSimulationState: (type?: string) => void;
  /** Instantly applies structural multi-variable configurations derived from custom definitions */
  loadPreset: (
    side: Side,
    systemType: string,
    newParams: Record<string, number>,
    cameraConfig: any,
    visuals?: any,
  ) => void;
  /** Reposition spatial projection perspective cameras across targeted view environments */
  setCameraConfig: (
    side: Side,
    config: {
      position: [number, number, number];
      target: [number, number, number];
    },
  ) => void;
}

const INITIAL_POINT: StateVector = [0.1, 0.1, 0.1];

const DEFAULT_CAMERA: {
  position: [number, number, number];
  target: [number, number, number];
} = {
  position: [-108, 30, 40],
  target: [0, 25, 0],
};

/**
 * Factory creating initial fallback state objects for a simulation engine viewport layer.
 */
export const createDefaultSim = (
  type: string = "lorenz",
  side: Side = "left",
): SimulationData => {
  const system = SYSTEM_REGISTRY[type] || SYSTEM_REGISTRY["lorenz"];
  const startPoint = system.math.initialState || INITIAL_POINT;

  return {
    systemType: system.math.id,
    params: { ...system.math.defaultParams },
    points: [startPoint],
    isPaused: false,
    speed: system.math.initialSpeed || 1,
    maxPoints: 30000,
    cameraConfig: system.meta.cameraConfig
      ? { ...system.meta.cameraConfig }
      : { ...DEFAULT_CAMERA },
    visuals: {
      color: side === "left" ? "#c026d3" : "#d32677",
      useGradient: false,
    },
  };
};

export const createSimulationSlice = (set: any, get: any): SimulationSlice => ({
  sims: {
    left: createDefaultSim("lorenz", "left"),
    right: createDefaultSim("lorenz", "right"),
  },

  skipNextReset: false,

  setSkipNextReset: (skip) => set(() => ({ skipNextReset: skip })),

  setCameraConfig: (side, config) =>
    set((state: any) => ({
      sims: {
        ...state.sims,
        [side]: { ...state.sims[side], cameraConfig: config },
      },
    })),

  setSystemType: (side, type) =>
    set((state: any) => ({
      sims: {
        ...state.sims,
        [side]: createDefaultSim(type, side),
      },
    })),

  setParams: (side, newParams) =>
    set((state: any) => {
      const { butterflyMode } = state;
      const updates: Record<string, any> = {
        [side]: {
          ...state.sims[side],
          params: { ...state.sims[side].params, ...newParams },
        },
      };

      if (butterflyMode && side === "left") {
        updates.right = {
          ...state.sims.right,
          params: { ...state.sims.right.params, ...newParams },
        };
      }

      return {
        sims: { ...state.sims, ...updates },
      };
    }),

  addPoint: (side, point) =>
    set((state: any) => {
      const sim = state.sims[side];

      // Structural numerical sanity validation step
      if (!SimulationValidator.isValidPoint(point)) return;

      // Integration step jump analysis
      if (sim.points.length > 0) {
        const last = sim.points[sim.points.length - 1];
        return SimulationValidator.isStableStep(point, last, 5000);
      }

      const newPoints = [...sim.points, point];
      const slicedPoints =
        newPoints.length > sim.maxPoints
          ? newPoints.slice(newPoints.length - sim.maxPoints)
          : newPoints;

      return {
        sims: {
          ...state.sims,
          [side]: { ...sim, points: slicedPoints },
        },
      };
    }),

  addPoints: (side, newBatch) =>
    set((state: any) => {
      const sim = state.sims[side];
      if (newBatch.length === 0) return;

      // Direct trace array injection—bypassing high-overhead calculation checks!
      const combinedPoints = [...sim.points, ...newBatch];
      const slicedPoints =
        combinedPoints.length > sim.maxPoints
          ? combinedPoints.slice(combinedPoints.length - sim.maxPoints)
          : combinedPoints;

      return {
        sims: {
          ...state.sims,
          [side]: { ...sim, points: slicedPoints },
        },
      };
    }),

  togglePause: (side) =>
    set((state: any) => {
      const { butterflyMode } = state;
      const nextPaused = !state.sims[side].isPaused;
      const updates: Record<string, any> = {
        [side]: { ...state.sims[side], isPaused: nextPaused },
      };

      if (butterflyMode && side === "left") {
        updates.right = { ...state.sims.right, isPaused: nextPaused };
      }

      return {
        sims: { ...state.sims, ...updates },
      };
    }),

  setPaused: (side, isPaused) =>
    set((state: any) => {
      const { butterflyMode } = state;
      const updates: Record<string, any> = {
        [side]: { ...state.sims[side], isPaused },
      };

      if (butterflyMode && side === "left") {
        updates.right = { ...state.sims.right, isPaused };
      }

      return {
        sims: { ...state.sims, ...updates },
      };
    }),

  setSpeed: (side, speed) =>
    set((state: any) => {
      const { butterflyMode } = state;
      const updates: Record<string, any> = {
        [side]: { ...state.sims[side], speed },
      };

      if (butterflyMode && side === "left") {
        updates.right = { ...state.sims.right, speed };
      }

      return {
        sims: { ...state.sims, ...updates },
      };
    }),

  setMaxPoints: (side, maxPoints) =>
    set((state: any) => {
      const { butterflyMode } = state;
      const updates: Record<string, any> = {
        [side]: { ...state.sims[side], maxPoints },
      };

      if (butterflyMode && side === "left") {
        updates.right = { ...state.sims.right, maxPoints };
      }

      return {
        sims: { ...state.sims, ...updates },
      };
    }),

  resetSimulation: (side) => {
    const { sims, butterflyMode, initialDifference = 0.0001 } = get();
    const system = SYSTEM_REGISTRY[sims[side].systemType];
    const startPoint = system?.math.initialState || INITIAL_POINT;

    if (butterflyMode && side === "left") {
      set((state: any) => ({
        sims: {
          ...state.sims,
          left: { ...state.sims.left, points: [], isPaused: true },
          right: { ...state.sims.right, points: [], isPaused: true },
        },
      }));

      setTimeout(() => {
        const secondPoint: StateVector = [...startPoint];
        secondPoint[0] += initialDifference;

        set((state: any) => ({
          sims: {
            ...state.sims,
            left: { ...state.sims.left, points: [startPoint], isPaused: false },
            right: {
              ...state.sims.right,
              points: [secondPoint],
              isPaused: false,
            },
          },
        }));
      }, 100);
    } else {
      set((state: any) => ({
        sims: {
          ...state.sims,
          [side]: { ...state.sims[side], points: [], isPaused: true },
        },
      }));

      setTimeout(() => {
        set((state: any) => ({
          sims: {
            ...state.sims,
            [side]: {
              ...state.sims[side],
              points: [startPoint],
              isPaused: false,
            },
          },
        }));
      }, 100);
    }
  },

  resetParams: (side) => {
    const { sims } = get();
    const system = SYSTEM_REGISTRY[sims[side].systemType];
    if (!system) return;

    set((state: any) => ({
      sims: {
        ...state.sims,
        [side]: {
          ...state.sims[side],
          params: { ...system.math.defaultParams },
        },
      },
    }));
  },

  resetSimulationState: (type) => {
    const { skipNextReset, sims } = get();

    if (skipNextReset) {
      set(() => ({ skipNextReset: false }));
      return;
    }

    const targetType = type || sims.left.systemType;
    if (
      sims.left.systemType === targetType &&
      sims.right.systemType === targetType
    ) {
      return;
    }

    set(() => ({
      sims: {
        left: createDefaultSim(targetType, "left"),
        right: createDefaultSim(targetType, "right"),
      },
    }));
  },

  loadPreset: (side, systemType, newParams, cameraConfig, visuals) => {
    const system = SYSTEM_REGISTRY[systemType] || SYSTEM_REGISTRY["lorenz"];
    const startPoint = system.math.initialState || INITIAL_POINT;
    const defaultCamera = system.meta.cameraConfig
      ? { ...system.meta.cameraConfig }
      : { ...DEFAULT_CAMERA };
    const finalCameraConfig = cameraConfig || defaultCamera;

    set((state: any) => ({
      skipNextReset: true,
      sims: {
        ...state.sims,
        [side]: {
          ...state.sims[side],
          systemType,
          params: newParams,
          points: [],
          isPaused: true,
          cameraConfig: finalCameraConfig,
          visuals: visuals || state.sims[side].visuals,
        },
      },
    }));

    setTimeout(() => {
      set((state: any) => ({
        sims: {
          ...state.sims,
          [side]: {
            ...state.sims[side],
            points: [startPoint],
            isPaused: false,
          },
        },
      }));
    }, 100);
  },
});
