/**
 * @file types.ts
 * @description Structural interfaces for system simulations.
 */

import type { StateVector, Vector3, DerivativeFn } from "@/core/math/types";

/**
 * Core mathematical interface representing the pure execution logic 
 * and boundary rules of a dynamical differential system.
 */
export interface IDynamicalSystem {
  /** Id of the system */
  id: string;
  /** Type of the system: continuous (ode) or discrete (map) */
  type: "ode" | "map";
  /** Either 2 or 3 dimension simulation (3D by default) */
  dimension?: 2 | 3;
  /** Default parameters for equations, can be changed in simulation */
  defaultParams: Record<string, number>;
  /** Origin initialization vector for trajectory pipeline loops */
  initialState?: StateVector;
  /** Speed at what simulation starts (default: 1) */
  initialSpeed?: number;
  /** Evaluates derivatives relative to real-time parameter mappings (for ODEs) */
  getDerivative?: (params: Record<string, number>) => DerivativeFn;
  /** Evaluates the next state directly (for discrete maps) */
  getNextState?: (params: Record<string, number>) => (state: StateVector) => StateVector;
  /** Translates high-dimensional state arrays into 3D Cartesian coordinates */
  mapStateToPoint?: (state: StateVector, params: Record<string, number>) => Vector3;
}

/**
 * Display configurations for dynamic configuration sliders in the dashboard interface.
 */
export interface SliderConfig {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
}

/**
 * Contextual layout configuration for spatial view camera placements.
 */
export interface CameraConfig {
  position: [number, number, number];
  target: [number, number, number];
}

/**
 * Configuration holding exclusively non-computational metadata, 
 * educational copy blocks and UI layout controls.
 */
export interface SystemMetadata {
  /** Name of the model */
  name: string;
  /** Basic description of the model */
  description: string;
  /** Formatted equations used to build a simulation */
  equations: string[];
  /** Historical origin summaries */
  history: string;
  /** Practical industry utility examples */
  use: string[];
  /** UI controls configuration layout */
  sliders: SliderConfig[];
  /** View camera positioning properties */
  cameraConfig?: CameraConfig;
}

/**
 * Unified composition mapping metadata configurations alongside 
 * mathematical solver instances for structural lookups.
 */
export interface RegisteredSystem {
  math: IDynamicalSystem;
  meta: SystemMetadata;
}