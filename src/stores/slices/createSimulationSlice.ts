import { SYSTEM_REGISTRY } from "@/core/systems";
import type { StateVector } from "@/core/math/types";
import type { Side, SimulationData } from "../types/simulation.types";

export interface SimulationSlice {
  /** Map of simulation data for left and right viewports */
  sims: Record<Side, SimulationData>;

  // Actions
  /** Changes the system type for a side and resets its state */
  setSystemType: (side: Side, type: string) => void;
  /** Merges new parameters into the existing simulation parameters */
  setParams: (side: Side, params: Partial<Record<string, number>>) => void;
  /** Adds a single point to the simulation trail with validation */
  addPoint: (side: Side, point: StateVector) => void;
  /** Adds a batch of points to the simulation trail with validation */
  addPoints: (side: Side, points: StateVector[]) => void;
  /** Toggles the pause state for a specific side */
  togglePause: (side: Side) => void;
  /** Sets the pause state for a specific side */
  setPaused: (side: Side, isPaused: boolean) => void;
  /** Updates simulation integration speed */
  setSpeed: (side: Side, speed: number) => void;
  /** Updates the maximum number of points to keep in history */
  setMaxPoints: (side: Side, maxPoints: number) => void;
  /** Resets the simulation trail to the initial state */
  resetSimulation: (side: Side) => void;
  /** Resets parameters to the system's defaults */
  resetParams: (side: Side) => void;
  /** Resets the entire simulation store state to defaults */
  resetSimulationState: (type?: string) => void;
  /** Loads a full simulation preset */
  loadPreset: (
    side: Side,
    systemType: string,
    newParams: any,
    cameraConfig: any,
    visuals?: any,
  ) => void;
  /** Updates camera position and target */
  setCameraConfig: (
    side: Side,
    config: {
      position: [number, number, number];
      target: [number, number, number];
    },
  ) => void;
  /** Internal flag to skip the next automatic reset (used when loading presets) */
  skipNextReset: boolean;
  /** Sets the skipNextReset flag */
  setSkipNextReset: (skip: boolean) => void;
}

const INITIAL_POINT: StateVector = [0.1, 0.1, 0.1];
const DEFAULT_CAMERA: {
  position: [number, number, number];
  target: [number, number, number];
} = {
  position: [-108, 30, 40],
  target: [0, 25, 0],
};

export const createDefaultSim = (
  type: string = "lorenz",
  side: Side = "left",
): SimulationData => {
  const system = SYSTEM_REGISTRY[type] || SYSTEM_REGISTRY["lorenz"];
  const startPoint =
    system.initialState || system.initialPoint || INITIAL_POINT;

  return {
    systemType: system.id,
    params: { ...system.defaultParams },
    points: [startPoint],
    isPaused: false,
    speed: system.initialSpeed || 1,
    maxPoints: 100000,
    cameraConfig: system.cameraConfig
      ? { ...system.cameraConfig }
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

  setSkipNextReset: (skip) => set({ skipNextReset: skip }),

  setCameraConfig: (side, config) =>
    set((state: any) => {
      console.log(`[SimulationStore] setCameraConfig for ${side}:`, config);
      return {
        sims: {
          ...state.sims,
          [side]: { ...state.sims[side], cameraConfig: config },
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
    set((state: any) => ({
      sims: {
        ...state.sims,
        [side]: {
          ...state.sims[side],
          params: { ...state.sims[side].params, ...newParams },
        },
      },
    })),

  addPoint: (side, point) =>
    set((state: any) => {
      const sim = state.sims[side];
      if (!point.every((val) => Number.isFinite(val))) return state;

      if (sim.points.length > 0) {
        const last = sim.points[sim.points.length - 1];
        const distSq =
          Math.pow(point[0] - last[0], 2) + Math.pow(point[1] - last[1], 2);
        if (distSq > 1000) return state;
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
      if (newBatch.length === 0) return state;

      const validBatch: StateVector[] = [];
      let lastPoint =
        sim.points.length > 0 ? sim.points[sim.points.length - 1] : null;

      for (const pt of newBatch) {
        if (pt.every((val) => Number.isFinite(val))) {
          if (lastPoint) {
            const distSq =
              Math.pow(pt[0] - lastPoint[0], 2) +
              Math.pow(pt[1] - lastPoint[1], 2);
            if (distSq < 2000) {
              validBatch.push(pt);
              lastPoint = pt;
            } else {
              break;
            }
          } else {
            validBatch.push(pt);
            lastPoint = pt;
          }
        }
      }

      if (validBatch.length === 0) return state;

      const combinedPoints = [...sim.points, ...validBatch];
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
    set((state: any) => ({
      sims: {
        ...state.sims,
        [side]: { ...state.sims[side], isPaused: !state.sims[side].isPaused },
      },
    })),

  setPaused: (side, isPaused) =>
    set((state: any) => ({
      sims: {
        ...state.sims,
        [side]: { ...state.sims[side], isPaused },
      },
    })),

  setSpeed: (side, speed) =>
    set((state: any) => ({
      sims: {
        ...state.sims,
        [side]: { ...state.sims[side], speed },
      },
    })),

  setMaxPoints: (side, maxPoints) =>
    set((state: any) => ({
      sims: {
        ...state.sims,
        [side]: { ...state.sims[side], maxPoints },
      },
    })),

  resetSimulation: (side) => {
    const { sims } = get();
    const system = SYSTEM_REGISTRY[sims[side].systemType];
    const startPoint =
      system?.initialState || system?.initialPoint || INITIAL_POINT;

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
          params: { ...system.defaultParams },
        },
      },
    }));
  },

  resetSimulationState: (type) => {

    if (get().skipNextReset) {
    console.log("[SimulationStore] Skipping resetSimulationState execution because a preset was loaded.");
    set({ skipNextReset: false });
    return; 
  }

    const targetType = type || get().sims.left.systemType;
    set({
      sims: {
        left: createDefaultSim(targetType, "left"),
        right: createDefaultSim(targetType, "right"),
      },
    });
  },

  loadPreset: (side, systemType, newParams, cameraConfig, visuals) => {
    console.log(`[SimulationStore] loadPreset started for ${side}:`, { systemType, cameraConfig });
    const system = SYSTEM_REGISTRY[systemType] || SYSTEM_REGISTRY["lorenz"];
    const startPoint =
      system.initialState || system.initialPoint || INITIAL_POINT;

    const defaultCamera = system.cameraConfig
      ? { ...system.cameraConfig }
      : { ...DEFAULT_CAMERA };

    const finalCameraConfig = cameraConfig || defaultCamera;
    console.log(`[SimulationStore] loadPreset final cameraConfig for ${side}:`, finalCameraConfig);

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
