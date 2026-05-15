import { create } from 'zustand';
import type { LorenzParams } from '@/core/systems/lorenz';
import { DEFAULT_LORENZ_PARAMS } from '@/core/systems/lorenz';
import type { Vector3 } from '@/core/math/types';

export interface SimulationData {
  params: LorenzParams;
  points: Vector3[];
  isPaused: boolean;
  speed: number;
  maxPoints: number;
}

export type Side = 'left' | 'right';

interface SimulationStore {
  sims: {
    left: SimulationData;
    right: SimulationData;
  };
  comparisonMode: boolean;
  syncCameras: boolean;
  cameraConfig: {
    position: [number, number, number];
    target: [number, number, number];
  };
  screenshotSignal: { side: Side | null; timestamp: number };

  // Actions
  setParams: (side: Side, params: Partial<LorenzParams>) => void;
  addPoint: (side: Side, point: Vector3) => void;
  togglePause: (side: Side) => void;
  setSpeed: (side: Side, speed: number) => void;
  resetSimulation: (side: Side) => void;
  loadPreset: (side: Side, newParams: LorenzParams) => void;
  toggleComparison: () => void;
  toggleSyncCameras: () => void;
  toggleAllPause: () => void;
  triggerScreenshot: (side: Side) => void;
  setCameraConfig: (config: { position: [number, number, number], target: [number, number, number] }) => void;
  copyParam: (from: Side, to: Side, key: keyof LorenzParams) => void;
  copySpeed: (from: Side, to: Side) => void;
  syncAll: () => void;
}

const INITIAL_POINT: Vector3 = [0.1, 0.1, 0.1];

const createDefaultSim = (): SimulationData => ({
  params: { ...DEFAULT_LORENZ_PARAMS },
  points: [INITIAL_POINT],
  isPaused: false,
  speed: 1,
  maxPoints: 5000,
});

export const useSimulationStore = create<SimulationStore>((set) => ({
  sims: {
    left: createDefaultSim(),
    right: createDefaultSim(),
  },
  comparisonMode: false,
  syncCameras: false,
  cameraConfig: {
    position: [-108, 30, 40],
    target: [0, 25, 0],
  },
  screenshotSignal: { side: null, timestamp: 0 },

  setCameraConfig: (config) => set({ cameraConfig: config }),

  triggerScreenshot: (side) => set({ 
    screenshotSignal: { side, timestamp: Date.now() } 
  }),

  setParams: (side, newParams) =>
    set((state) => ({
      sims: {
        ...state.sims,
        [side]: {
          ...state.sims[side],
          params: { ...state.sims[side].params, ...newParams },
        },
      },
    })),

  addPoint: (side, point) =>
    set((state) => {
      const sim = state.sims[side];
      
      if (sim.points.length > 0) {
        const last = sim.points[sim.points.length - 1];
        const dist = Math.sqrt(
          Math.pow(point[0] - last[0], 2) + 
          Math.pow(point[1] - last[1], 2) + 
          Math.pow(point[2] - last[2], 2)
        );
        if (dist > 50) return state; 
      }

      const newPoints = [...sim.points, point];
      const slicedPoints = newPoints.length > sim.maxPoints
        ? newPoints.slice(newPoints.length - sim.maxPoints)
        : newPoints;

      return {
        sims: {
          ...state.sims,
          [side]: { ...sim, points: slicedPoints },
        },
      };
    }),

  togglePause: (side) =>
    set((state) => ({
      sims: {
        ...state.sims,
        [side]: { ...state.sims[side], isPaused: !state.sims[side].isPaused },
      },
    })),

  setSpeed: (side, speed) =>
    set((state) => ({
      sims: {
        ...state.sims,
        [side]: { ...state.sims[side], speed },
      },
    })),

  resetSimulation: (side) => {
    set((state) => ({
      sims: {
        ...state.sims,
        [side]: { ...state.sims[side], points: [], isPaused: true },
      },
    }));
    
    setTimeout(() => {
      set((state) => ({
        sims: {
          ...state.sims,
          [side]: { ...state.sims[side], points: [INITIAL_POINT], isPaused: false },
        },
      }));
    }, 100);
  },

  loadPreset: (side, newParams) => {
    set((state) => ({
      sims: {
        ...state.sims,
        [side]: {
          ...state.sims[side],
          params: newParams,
          points: [],
          isPaused: true,
        },
      },
    }));

    setTimeout(() => {
      set((state) => ({
        sims: {
          ...state.sims,
          [side]: { ...state.sims[side], points: [INITIAL_POINT], isPaused: false },
        },
      }));
    }, 100);
  },

  toggleComparison: () =>
    set((state) => ({
      comparisonMode: !state.comparisonMode,
    })),


  toggleSyncCameras: () => set(state => ({ syncCameras: !state.syncCameras })),
  
  toggleAllPause: () => set(state => {
    const nextPaused = !state.sims.left.isPaused;
    return {
      sims: {
        left: { ...state.sims.left, isPaused: nextPaused },
        right: { ...state.sims.right, isPaused: nextPaused }
      }
    };
  }),

  copyParam: (from, to, key) => set(state => ({
    sims: {
      ...state.sims,
      [to]: {
        ...state.sims[to],
        params: {
          ...state.sims[to].params,
          [key]: state.sims[from].params[key]
        }
      }
    }
  })),

  copySpeed: (from, to) => set(state => ({
    sims: {
      ...state.sims,
      [to]: {
        ...state.sims[to],
        speed: state.sims[from].speed
      }
    }
  })),

  syncAll: () => {
    set((state) => ({
      sims: {
        left: { ...state.sims.left, points: [], isPaused: true },
        right: { ...state.sims.right, points: [], isPaused: true },
      }
    }));
    
    setTimeout(() => {
      set((state) => ({
        sims: {
          left: { ...state.sims.left, points: [INITIAL_POINT], isPaused: false },
          right: { ...state.sims.right, points: [INITIAL_POINT], isPaused: false },
        }
      }));
    }, 100);
  },
}));
