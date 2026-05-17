import type { StateVector } from "@/core/math/types";

export type Side = "left" | "right";

export interface VisualConfig {
  /** Hex color for the start of the trail */
  color: string;
  /** Hex color for the end of the trail (if gradient is enabled) */
  colorEnd?: string;
  /** Toggle for using gradient */
  useGradient: boolean;
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
  visuals?: VisualConfig;
}

export interface ScreenshotSignal {
  /** On which side screenshot was made */
  side: Side | null;
  /** Unique timestamp to ensure the listener detects a change every time */
  timestamp: number;
}
