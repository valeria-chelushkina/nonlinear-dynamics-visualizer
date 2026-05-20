/**
 * @file createSimulationSlice.ts
 * @description Decoupled state slice managing coordinate history states, camera targets,
 * and presentation metrics across decoupled left/right rendering contexts.
 */

import { SYSTEM_REGISTRY } from "@/core/systems";
import type { StateVector } from "@/core/math/types";
import type { Side, SimulationData } from "../types/simulation.types";

// TYPE DEFINITIONS & INTERFACES

export interface SimulationStateSlice {
  /** Map of active simulation coordinate datasets bound to left and right viewports */
  sims: Record<Side, SimulationData>;
  /** Override flag to halt default automated system resets when processing active presets */
  skipNextReset: boolean;
}

export interface SimulationActionsSlice {
  /** Updates the state tracking flag determining automated system configuration resets */
  setSkipNextReset: (skip: boolean) => void;
  /** Alters target chaos equations model mappings assigned to an isolated viewport engine */
  setSystemType: (side: Side, type: string) => void;
  /** Merges new mathematical parameter configuration attributes into the active model instance */
  setParams: (side: Side, params: Partial<Record<string, number>>) => void;
  /** Appends a single newly calculated coordinate point to a viewport trace array */
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
  /** Directly sets the entire coordinate trace history array (used for static maps) */
  setPoints: (side: Side, points: StateVector[]) => void;
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

export type SimulationSlice = SimulationStateSlice & SimulationActionsSlice;

// CONSTANTS & FACTORY HELPERS

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

// SLICE IMPLEMENTATION

export const createSimulationSlice = (set: any, get: any): SimulationSlice => ({
  // Data state
  sims: {
    left: createDefaultSim("lorenz", "left"),
    right: createDefaultSim("lorenz", "right"),
  },
  skipNextReset: false,

  // Actions
  setSkipNextReset: (skip) => set(() => ({ skipNextReset: skip })),

  setCameraConfig: (side, config) =>
    set((state: any) => {
      const { syncCameras } = state;
      const updates: Record<string, any> = {
        [side]: { ...state.sims[side], cameraConfig: config },
      };

      if (syncCameras) {
        const otherSide = side === "left" ? "right" : "left";
        updates[otherSide] = {
          ...state.sims[otherSide],
          cameraConfig: config,
        };
      }

      return {
        sims: {
          ...state.sims,
          ...updates,
        },
      };
    }),

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

      return { sims: { ...state.sims, ...updates } };
    }),

  addPoint: (side, point) =>
    set((state: any) => {
      const sim = state.sims[side];
      const newPoints = [...sim.points, point];
      
      return {
        sims: {
          ...state.sims,
          [side]: {
            ...sim,
            points: newPoints.length > sim.maxPoints 
              ? newPoints.slice(newPoints.length - sim.maxPoints) 
              : newPoints,
          },
        },
      };
    }),

  addPoints: (side, newBatch) =>
    set((state: any) => {
      const sim = state.sims[side];
      if (newBatch.length === 0) return;

      const combinedPoints = [...sim.points, ...newBatch];
      return {
        sims: {
          ...state.sims,
          [side]: {
            ...sim,
            points: combinedPoints.length > sim.maxPoints
              ? combinedPoints.slice(combinedPoints.length - sim.maxPoints)
              : combinedPoints,
          },
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

      return { sims: { ...state.sims, ...updates } };
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

      return { sims: { ...state.sims, ...updates } };
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

      return { sims: { ...state.sims, ...updates } };
    }),

  setMaxPoints: (side, maxPoints) =>
    set((state: any) => {
      const { butterflyMode } = state;
      
      const updateSim = (sim: any) => ({
        ...sim,
        maxPoints,
        points: sim.points.length > maxPoints 
          ? sim.points.slice(sim.points.length - maxPoints) 
          : sim.points,
      });

      const updates: Record<string, any> = {
        [side]: updateSim(state.sims[side]),
      };

      if (butterflyMode && side === "left") {
        updates.right = updateSim(state.sims.right);
      }

      return { sims: { ...state.sims, ...updates } };
    }),

  resetSimulation: (side) => {
    const { sims, butterflyMode, initialDifference = 0.0001 } = get();
    const system = SYSTEM_REGISTRY[sims[side].systemType];
    const startPoint = system?.math.initialState || INITIAL_POINT;

    // Complex timing loops are removed. 
    set((state: any) => {
      const updates: Record<string, any> = {};

      if (butterflyMode && side === "left") {
        const secondPoint: StateVector = [...startPoint];
        secondPoint[0] += initialDifference;

        updates.left = { ...state.sims.left, points: [startPoint], isPaused: false };
        updates.right = { ...state.sims.right, points: [secondPoint], isPaused: false };
      } else {
        updates[side] = { ...state.sims[side], points: [startPoint], isPaused: false };
      }

      return { sims: { ...state.sims, ...updates } };
    });
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

  setPoints: (side, points) =>
    set((state: any) => ({
      sims: {
        ...state.sims,
        [side]: { ...state.sims[side], points },
      },
    })),

  resetSimulationState: (type) => {
    const { skipNextReset, sims } = get();

    if (skipNextReset) {
      set(() => ({ skipNextReset: false }));
      return;
    }

    const targetType = type || sims.left.systemType;

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

    set((state: any) => {
      const { syncCameras } = state;
      const targetCamera = cameraConfig || defaultCamera;

      const updates: Record<string, any> = {
        [side]: {
          ...state.sims[side],
          systemType,
          params: newParams,
          points: [startPoint], // synchronous setup handles canvas pipeline flushes natively
          isPaused: false,
          cameraConfig: targetCamera,
          visuals: visuals || state.sims[side].visuals,
        },
      };

      if (syncCameras) {
        const otherSide = side === "left" ? "right" : "left";
        updates[otherSide] = {
          ...state.sims[otherSide],
          cameraConfig: targetCamera,
        };
      }

      return {
        skipNextReset: true,
        sims: {
          ...state.sims,
          ...updates,
        },
      };
    });
  },
});