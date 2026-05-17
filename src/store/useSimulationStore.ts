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
  cameraConfig: {
    position: [number, number, number];
    target: [number, number, number];
  };
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
  butterflyMode: boolean;
  initialDifference: number;
  screenshotSignal: { side: Side | null; timestamp: number };

  // User info
  user: User | null;
  token: string | null;

  // Actions
  setSystemType: (side: Side, type: string) => void;
  setParams: (side: Side, params: Partial<Record<string, number>>) => void;
  addPoint: (side: Side, point: Vector3) => void;
  addPoints: (side: Side, points: Vector3[]) => void;
  togglePause: (side: Side) => void;
  setSpeed: (side: Side, speed: number) => void;
  setMaxPoints: (side: Side, maxPoints: number) => void;
  resetSimulation: (side: Side) => void;
  loadPreset: (side: Side, systemType: string, newParams: any, cameraConfig: any) => void;
  toggleComparison: () => void;
  toggleSyncCameras: () => void;
  toggleAllPause: () => void;
  triggerScreenshot: (side: Side) => void;
  setCameraConfig: (side: Side, config: { position: [number, number, number], target: [number, number, number] }) => void;
  copyParam: (from: Side, to: Side, key: string) => void;
  copySpeed: (from: Side, to: Side) => void;
  syncAll: () => void;
  
  // Butterfly Actions
  toggleButterflyMode: () => void;
  setInitialDifference: (val: number) => void;
  runButterflyEffect: () => void;
  
  setAuth: (user: User | null, token: string | null) => void;
  logout: () => void;
}

const INITIAL_POINT: Vector3 = [0.1, 0.1, 0.1];
const DEFAULT_CAMERA: { position: [number, number, number], target: [number, number, number] } = {
  position: [-108, 30, 40],
  target: [0, 25, 0],
};

const createDefaultSim = (type: string = 'lorenz'): SimulationData => {
  const system = SYSTEM_REGISTRY[type] || SYSTEM_REGISTRY['lorenz'];
  return {
    systemType: system.id,
    params: { ...system.defaultParams },
    points: [INITIAL_POINT],
    isPaused: false,
    speed: 1,
    maxPoints: 30000,
    cameraConfig: { ...DEFAULT_CAMERA },
  };
};

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  sims: {
    left: createDefaultSim('lorenz'),
    right: createDefaultSim('lorenz'),
  },
  comparisonMode: false,
  syncCameras: false,
  butterflyMode: false,
  initialDifference: 0.0001,

  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),

  screenshotSignal: { side: null, timestamp: 0 },

  setCameraConfig: (side, config) => 
    set((state) => {
      const { syncCameras } = state;
      if (syncCameras) {
        return {
          sims: {
            left: { ...state.sims.left, cameraConfig: config },
            right: { ...state.sims.right, cameraConfig: config },
          }
        };
      }
      return {
        sims: {
          ...state.sims,
          [side]: { ...state.sims[side], cameraConfig: config },
        }
      };
    }),

  triggerScreenshot: (side) => set({ 
    screenshotSignal: { side, timestamp: Date.now() } 
  }),

  setSystemType: (side, type) => 
    set((state) => ({
      sims: {
        ...state.sims,
        [side]: createDefaultSim(type)
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

  addPoints: (side, newBatch) =>
    set((state) => {
      const sim = state.sims[side];
      if (newBatch.length === 0) return state;

      const combinedPoints = [...sim.points, ...newBatch];
      const slicedPoints = combinedPoints.length > sim.maxPoints
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
    set((state) => {
      if (state.butterflyMode) {
        const nextPaused = !state.sims.left.isPaused;
        return {
          sims: {
            left: { ...state.sims.left, isPaused: nextPaused },
            right: { ...state.sims.right, isPaused: nextPaused },
          },
        };
      }
      return {
        sims: {
          ...state.sims,
          [side]: { ...state.sims[side], isPaused: !state.sims[side].isPaused },
        },
      };
    }),

  setSpeed: (side, speed) =>
    set((state) => {
      if (state.butterflyMode) {
        return {
          sims: {
            left: { ...state.sims.left, speed },
            right: { ...state.sims.right, speed },
          },
        };
      }
      return {
        sims: {
          ...state.sims,
          [side]: { ...state.sims[side], speed },
        },
      };
    }),

  setMaxPoints: (side, maxPoints) =>
    set((state) => ({
      sims: {
        ...state.sims,
        [side]: { ...state.sims[side], maxPoints },
      },
    })),

  resetSimulation: (side) => {
    const { butterflyMode, runButterflyEffect } = get();
    if (butterflyMode) {
      runButterflyEffect();
      return;
    }

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

  loadPreset: (side, systemType, newParams, cameraConfig) => {
    set((state) => ({
      screenshotSignal: { side: null, timestamp: 0 },
      sims: {
        ...state.sims,
        [side]: {
          ...state.sims[side],
          systemType,
          params: newParams,
          points: [],
          isPaused: true,
          cameraConfig: cameraConfig || { ...DEFAULT_CAMERA },
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
    set((state) => {
      const nextComparisonMode = !state.comparisonMode;
      // If we are closing comparison mode, reset the right side to defaults
      const rightSim = nextComparisonMode 
        ? state.sims.right 
        : createDefaultSim(state.sims.left.systemType);

      return {
        comparisonMode: nextComparisonMode,
        butterflyMode: false, // Mutually exclusive for simplicity
        screenshotSignal: { side: null, timestamp: 0 },
        sims: {
          ...state.sims,
          right: rightSim
        }
      };
    }),

  toggleSyncCameras: () => set(state => ({ 
    syncCameras: !state.syncCameras,
    screenshotSignal: { side: null, timestamp: 0 }
  })),
  
  toggleAllPause: () => set(state => {
    const nextPaused = !state.sims.left.isPaused;
    return {
      screenshotSignal: { side: null, timestamp: 0 },
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


  // Butterfly Mode Actions
  toggleButterflyMode: () => set(state => ({ 
    butterflyMode: !state.butterflyMode,
    comparisonMode: false 
  })),

  setInitialDifference: (val) => set({ initialDifference: val }),

  runButterflyEffect: () => {
    const { initialDifference, sims } = get();
    const leftParams = sims.left.params;
    const systemType = sims.left.systemType;

    set((state) => ({
      sims: {
        left: { ...state.sims.left, systemType, params: leftParams, points: [], isPaused: true },
        right: { ...state.sims.right, systemType, params: leftParams, points: [], isPaused: true },
      }
    }));

    setTimeout(() => {
      set((state) => ({
        sims: {
          left: { ...state.sims.left, points: [INITIAL_POINT], isPaused: false },
          right: { ...state.sims.right, points: [[INITIAL_POINT[0] + initialDifference, INITIAL_POINT[1], INITIAL_POINT[2]]], isPaused: false },
        }
      }));
    }, 100);
  },

  setAuth: (user, token) => {
    if (user && token) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));
