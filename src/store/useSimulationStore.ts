import { create } from 'zustand';
import type { LorenzParams } from '@/core/systems/lorenz';
import { DEFAULT_LORENZ_PARAMS } from '@/core/systems/lorenz';
import type { Vector3 } from '@/core/math/types';

interface SimulationState {
  // Parameters
  params: LorenzParams;
  setParams: (params: Partial<LorenzParams>) => void;
  
  // Simulation state
  points: Vector3[];
  isPaused: boolean;
  speed: number;
  maxPoints: number;
  
  // Actions
  addPoint: (point: Vector3) => void;
  togglePause: () => void;
  setSpeed: (speed: number) => void;
  resetSimulation: () => void;
  loadPreset: (newParams: LorenzParams) => void; //LorenzParams - temporary (until other models are added)
}

const INITIAL_POINT: Vector3 = [0.1, 0.1, 0.1];

export const useSimulationStore = create<SimulationState>((set) => ({
  params: { ...DEFAULT_LORENZ_PARAMS },
  setParams: (newParams) => 
    set((state) => ({ 
      params: { ...state.params, ...newParams },
    })),
    
  points: [INITIAL_POINT],
  isPaused: false,
  speed: 1,
  maxPoints: 5000,
  
  addPoint: (point) => 
    set((state) => {
      const newPoints = [...state.points, point];
      if (newPoints.length > state.maxPoints) {
        return { points: newPoints.slice(newPoints.length - state.maxPoints) };
      }
      return { points: newPoints };
    }),
    
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  
  setSpeed: (speed) => set({ speed }),
  
  resetSimulation: () => set({ points: [INITIAL_POINT] }),

  loadPreset: (newParams: LorenzParams) => {
    set({
      params: newParams,
      points: [[0.1, 0.1, 0.1]], // reset
      isPaused: true
    });
    setTimeout(() => {
      set({ isPaused: false });
    }, 50);
  },

}));
