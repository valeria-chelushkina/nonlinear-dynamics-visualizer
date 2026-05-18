import { SYSTEM_REGISTRY } from "@/core/systems";

export interface ButterflySlice {
  /** Whether butterfly mode (comparing two simulations with a small difference) is active */
  butterflyMode: boolean;
  /** The small initial deviation for the second simulation */
  initialDifference: number;

  // Actions
  /** Toggles butterfly mode */
  toggleButterflyMode: () => void;
  /** Sets the initial deviation value */
  setInitialDifference: (val: number) => void;
  /** Resets both simulations and starts them with the specified initial difference */
  runButterflyEffect: () => void;
}

const INITIAL_POINT: [number, number, number] = [0.1, 0.1, 0.1];

export const createButterflySlice = (set: any, get: any): ButterflySlice => ({
  butterflyMode: false,
  initialDifference: 0.0001,

  toggleButterflyMode: () =>
    set((state: any) => ({
      butterflyMode: !state.butterflyMode,
      comparisonMode: false, // Mutually exclusive with standard comparison mode
    })),

  setInitialDifference: (val) => set({ initialDifference: val }),

  runButterflyEffect: () => {
    const { initialDifference, sims } = get();
    const leftParams = sims.left.params;
    const systemType = sims.left.systemType;
    const speed = sims.left.speed;
    const system = SYSTEM_REGISTRY[systemType];
    const startPoint =
      system?.math.initialState || INITIAL_POINT;

    // Reset both to empty and paused first
    set((state: any) => ({
      sims: {
        ...state.sims,
        left: {
          ...state.sims.left,
          systemType,
          params: { ...leftParams },
          points: [],
          isPaused: true,
          speed: speed,
        },
        right: {
          ...state.sims.right,
          systemType,
          params: { ...leftParams },
          points: [],
          isPaused: true,
          speed: speed,
        },
      },
    }));

    // Small delay then start with initial difference
    setTimeout(() => {
      const secondPoint = [...startPoint];
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
  },
});
