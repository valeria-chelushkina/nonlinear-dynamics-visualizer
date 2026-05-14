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

  // Actions
  setParams: (side: Side, params: Partial<LorenzParams>) => void;
  addPoint: (side: Side, point: Vector3) => void;
  togglePause: (side: Side) => void;
  setSpeed: (side: Side, speed: number) => void;
  resetSimulation: (side: Side) => void;
  loadPreset: (side: Side, newParams: LorenzParams) => void;
  toggleComparison: () => void;
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

  resetSimulation: (side) =>
    set((state) => ({
      sims: {
        ...state.sims,
        [side]: { ...state.sims[side], points: [INITIAL_POINT] },
      },
    })),

  loadPreset: (side, newParams) => {
    set((state) => ({
      sims: {
        ...state.sims,
        [side]: {
          ...state.sims[side],
          params: newParams,
          points: [INITIAL_POINT],
          isPaused: true,
        },
      },
    }));
    
    // Tiny delay to ensure React cycles before resuming
    setTimeout(() => {
      set((state) => ({
        sims: {
          ...state.sims,
          [side]: { ...state.sims[side], isPaused: false },
        },
      }));
    }, 50);
  },

  toggleComparison: () =>
    set((state) => ({
      comparisonMode: !state.comparisonMode,
    })),
}));
