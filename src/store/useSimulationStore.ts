import { create } from 'zustand';
import { SYSTEM_REGISTRY } from '@/core/systems';
import type { StateVector } from '@/core/math/types';

export type Side = 'left' | 'right';

export interface VisualConfig {
  color: string;
  colorEnd?: string;
  useGradient: boolean;
  isNeon: boolean;
}

export interface SimulationData {
  systemType: string;
  params: Record<string, number>;
  points: StateVector[];
  isPaused: boolean;
  speed: number;
  maxPoints: number;
  cameraConfig: {
    position: [number, number, number];
    target: [number, number, number];
  };
  visuals: VisualConfig;
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
  addPoint: (side: Side, point: StateVector) => void;
  addPoints: (side: Side, points: StateVector[]) => void;
  togglePause: (side: Side) => void;
  setSpeed: (side: Side, speed: number) => void;
  setMaxPoints: (side: Side, maxPoints: number) => void;
  resetSimulation: (side: Side) => void;
  resetParams: (side: Side) => void;
  resetSimulationState: (type?: string) => void;
  setVisuals: (side: Side, visuals: Partial<VisualConfig>) => void;
  loadPreset: (side: Side, systemType: string, newParams: any, cameraConfig: any, visuals?: any) => void;
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

const INITIAL_POINT: StateVector = [0.1, 0.1, 0.1];
const DEFAULT_CAMERA: { position: [number, number, number], target: [number, number, number] } = {
  position: [-108, 30, 40],
  target: [0, 25, 0],
};

const getPersistedVisuals = (side: Side): VisualConfig => {
  const saved = localStorage.getItem(`visuals_${side}`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse persisted visuals', e);
    }
  }
  return {
    color: side === 'left' ? '#00ffcc' : '#ff3e00',
    colorEnd: side === 'left' ? '#0070ff' : '#ffcc00',
    useGradient: false,
    isNeon: false,
  };
};

const createDefaultSim = (type: string = 'lorenz', side: Side = 'left', preserveVisuals?: VisualConfig): SimulationData => {
  const system = SYSTEM_REGISTRY[type] || SYSTEM_REGISTRY['lorenz'];
  const startPoint = system.initialState || system.initialPoint || INITIAL_POINT;

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
    visuals: preserveVisuals || getPersistedVisuals(side)
  };
};

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  sims: {
    left: createDefaultSim('lorenz', 'left'),
    right: createDefaultSim('lorenz', 'right'),
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
        [side]: createDefaultSim(type, side, state.sims[side].visuals)
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

  setVisuals: (side, newVisuals) =>
    set((state) => {
      const updatedVisuals = { ...state.sims[side].visuals, ...newVisuals };
      localStorage.setItem(`visuals_${side}`, JSON.stringify(updatedVisuals));
      return {
        sims: {
          ...state.sims,
          [side]: {
            ...state.sims[side],
            visuals: updatedVisuals,
          },
        },
      };
    }),

  addPoint: (side, point) =>
    set((state) => {
      const sim = state.sims[side];
      
      // Basic validation: Check for NaN or Infinity
      if (!point.every(val => Number.isFinite(val))) return state;

      if (sim.points.length > 0) {
        const last = sim.points[sim.points.length - 1];
        // Only check first 2 components for jump (angles or coords)
        const distSq = 
          Math.pow(point[0] - last[0], 2) + 
          Math.pow(point[1] - last[1], 2);
        
        if (distSq > 1000) return state; 
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

      const validBatch: StateVector[] = [];
      let lastPoint = sim.points.length > 0 ? sim.points[sim.points.length - 1] : null;

      for (const pt of newBatch) {
        // Validate each point
        if (pt.every(val => Number.isFinite(val))) {
          if (lastPoint) {
            const distSq = 
              Math.pow(pt[0] - lastPoint[0], 2) + 
              Math.pow(pt[1] - lastPoint[1], 2);
            
            // Skip points that jump too far (divergence/instability)
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
    const { butterflyMode, runButterflyEffect, sims } = get();
    if (butterflyMode) {
      runButterflyEffect();
      return;
    }

    const system = SYSTEM_REGISTRY[sims[side].systemType];
    const startPoint = system?.initialState || system?.initialPoint || INITIAL_POINT;

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
          [side]: { ...state.sims[side], points: [startPoint], isPaused: false },
        },
      }));
    }, 100);
  },

  resetParams: (side) => {
    const { sims } = get();
    const system = SYSTEM_REGISTRY[sims[side].systemType];
    if (!system) return;

    set((state) => ({
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
    const targetType = type || get().sims.left.systemType;
    set({
      comparisonMode: false,
      butterflyMode: false,
      syncCameras: false,
      sims: {
        left: createDefaultSim(targetType, 'left'),
        right: createDefaultSim(targetType, 'right'),
      }
    });
  },

  loadPreset: (side, systemType, newParams, cameraConfig, visuals) => {
    const system = SYSTEM_REGISTRY[systemType] || SYSTEM_REGISTRY['lorenz'];
    const startPoint = system.initialState || system.initialPoint || INITIAL_POINT;
    const defaultCam = system.cameraConfig 
      ? { ...system.cameraConfig } 
      : { ...DEFAULT_CAMERA };
    
    const defaultVisuals = {
      color: side === 'left' ? '#00ffcc' : '#ff3e00',
      colorEnd: side === 'left' ? '#0070ff' : '#ffcc00',
      useGradient: false,
      isNeon: false,
    };

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
          cameraConfig: cameraConfig || defaultCam,
          visuals: visuals || defaultVisuals,
        },
      },
    }));

    setTimeout(() => {
      set((state) => ({
        sims: {
          ...state.sims,
          [side]: { ...state.sims[side], points: [startPoint], isPaused: false },
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
        : createDefaultSim(state.sims.left.systemType, 'right');

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
    const { sims } = get();
    const leftSystem = SYSTEM_REGISTRY[sims.left.systemType];
    const rightSystem = SYSTEM_REGISTRY[sims.right.systemType];
    const startPointLeft = leftSystem?.initialState || leftSystem?.initialPoint || INITIAL_POINT;
    const startPointRight = rightSystem?.initialState || rightSystem?.initialPoint || INITIAL_POINT;

    set((state) => ({
      sims: {
        left: { ...state.sims.left, points: [], isPaused: true },
        right: { ...state.sims.right, points: [], isPaused: true },
      }
    }));
    
    setTimeout(() => {
      set((state) => ({
        sims: {
          left: { ...state.sims.left, points: [startPointLeft], isPaused: false },
          right: { ...state.sims.right, points: [startPointRight], isPaused: false },
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
    const system = SYSTEM_REGISTRY[systemType];
    const startPoint = system?.initialState || system?.initialPoint || INITIAL_POINT;

    set((state) => ({
      sims: {
        left: { ...state.sims.left, systemType, params: leftParams, points: [], isPaused: true },
        right: { ...state.sims.right, systemType, params: leftParams, points: [], isPaused: true },
      }
    }));

    setTimeout(() => {
      const secondPoint = [...startPoint];
      secondPoint[0] += initialDifference;
      set((state) => ({
        sims: {
          left: { ...state.sims.left, points: [startPoint], isPaused: false },
          right: { ...state.sims.right, points: [secondPoint], isPaused: false },
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
