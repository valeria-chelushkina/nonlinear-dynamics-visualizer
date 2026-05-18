/**
 * @file simulation.types.ts
 * @description Standardized type safety contracts and data schemas 
 * for the multi-viewport simulation engine state layer.
 */

import type { StateVector } from "@/core/math/types";

export type Side = "left" | "right";

export type Vector3Tuple = [number, number, number];

/** Configuration profile mapping rendering attributes for line rendering pipelines */
export interface VisualConfig {
  /** Hex color for the start of the trail */
  color: string;
   /** Hex color for the end of the trail (if gradient is enabled) */
  colorEnd?: string;
  /** Toggle for using gradient */
  useGradient: boolean;
}

/** Properties governing view projection cameras */
export interface CameraConfig {
  /** XYZ position coordinate where the physical camera is hanging in world space */
  position: Vector3Tuple;
  /** XYZ intersection focal point coordinate where the lens is looking */
  target: Vector3Tuple;
}

export interface SimulationData {
  /** System type */
  systemType: string;
  /** Parameters defining the specific system curves */
  params: Record<string, number>;
  /** History trail storage containing calculated points mapped to WebGL index buffers */
  points: StateVector[];
  isPaused: boolean;
  speed: number;
  /** Max amount of points in the buffer */
  maxPoints: number;
  /** Viewport projection layout matrix bounds */
  cameraConfig: CameraConfig;
  /** Core presentation styles */
  visuals: VisualConfig;
}

export interface ScreenshotSignal {
  side: Side | null;
  timestamp: number;
}