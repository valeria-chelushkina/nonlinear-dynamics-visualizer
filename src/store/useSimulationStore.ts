import { create } from 'zustand';
import { SYSTEM_REGISTRY } from '@/core/systems';
import type { Vector3 } from '@/core/math/types';

export type Side = 'left' | 'right';

export interface SimulationData {
  systemType: string;
  params: Record<string, number>;
  points: Vector3[];
  isPaused: boolean;
  speed: number;
  maxPoints: number;
}


interface User {
  id: string;
  username: string;
}

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

  // User info
  user: User | null;
  token: string | null;

  // Actions
  setSystemType: (side: Side, type: string) => void;
  setParams: (side: Side, params: Partial<Record<string, number>>) => void;
  addPoint: (side: Side, point: Vector3) => void;
  togglePause: (side: Side) => void;
  setSpeed: (side: Side, speed: number) => void;
  resetSimulation: (side: Side) => void;
  loadPreset: (side: Side, systemType: string, newParams: any) => void;
  toggleComparison: () => void;
  toggleSyncCameras: () => void;
  toggleAllPause: () => void;
  triggerScreenshot: (side: Side) => void;
  setCameraConfig: (config: { position: [number, number, number], target: [number, number, number] }) => void;
  copyParam: (from: Side, to: Side, key: string) => void;
  copySpeed: (from: Side, to: Side) => void;
  syncAll: () => void;
  setAuth: (user: User | null, token: string | null) => void;
  logout: () => void;
}

const INITIAL_POINT: Vector3 = [0.1, 0.1, 0.1];

const createDefaultSim = (type: string = 'lorenz'): SimulationData => {
  const system = SYSTEM_REGISTRY[type] || SYSTEM_REGISTRY['lorenz'];
  return {
    systemType: system.id,
    params: { ...system.defaultParams },
    points: [INITIAL_POINT],
    isPaused: false,
    speed: 1,
    maxPoints: 5000,
  };
};

export const useSimulationStore = create<SimulationStore>((set) => ({
  sims: {
    left: createDefaultSim('lorenz'),
    right: createDefaultSim('lorenz'),
  },
  comparisonMode: false,
  syncCameras: false,
  cameraConfig: {
    position: [-108, 30, 40],
    target: [0, 25, 0],
  },

  user: null,
  token: null,

  screenshotSignal: { side: null, timestamp: 0 },

  setCameraConfig: (config) => set({ cameraConfig: config }),

  triggerScreenshot: (side) => set({ 
    screenshotSignal: { side, timestamp: Date.now() } 
  }),

  setSystemType: (side, type) => 
    set((state) => ({
      sims: {
        ...state.sims,
        [side]: {
          ...createDefaultSim(type),
          isPaused: true,
        }
      }
    })),

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

  loadPreset: (side, systemType, newParams) => {
    set((state) => ({
      sims: {
        ...state.sims,
        [side]: {
          ...state.sims[side],
          systemType,
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

  copyParam: (from, to, key) => set(state => {
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
            [key]: fromSim.params[key]
          }
        }
      }
    };
  }),

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

  setAuth: (user, token) => set({ user, token }),
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));
