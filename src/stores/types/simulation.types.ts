/**
 * @file simulation.types.ts
 * @description This file configures the data shapes for split-screen setups and visual layouts.
 */

import type { StateVector } from "@/core/math/types";

export type Side = "left" | "right";

export type Vector3Tuple = [number, number, number];

/** Configuration for visuals of a line. */
export interface VisualConfig {
  /** Hex color for the start of the trail. */
  color: string;
   /** Hex color for the end of the trail (if gradient is enabled). */
  colorEnd?: string;
  /** Toggle for using gradient. */
  useGradient: boolean;
}

/** Configuration for camera position. */
export interface CameraConfig {
  /** XYZ of where camera is positioned. */
  position: Vector3Tuple;
  /** XYZ fo where camera is looking at. */
  target: Vector3Tuple;
}

export interface SimulationData {
  /** System type. */
  systemType: string;
  /** Parameters of the specific system. */
  params: Record<string, number>;
  /** History trail storage containing calculated points. */
  points: StateVector[];
  isPaused: boolean;
  speed: number;
  /** Max amount of points in the buffer. */
  maxPoints: number;
  /** Camera placement. */
  cameraConfig: CameraConfig;
  /** Line appearance visuals. */
  visuals: VisualConfig;
}

export interface ScreenshotSignal {
  side: Side | null;
  timestamp: number;
}