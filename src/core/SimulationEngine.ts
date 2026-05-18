/**
 * @file SimulationEngine.ts
 * @description Standalone execution engine for higher-order dynamical systems.
 * Manages numerical integration state cycles, cross-frame spatial filtering
 * and track history arrays entirely isolated from React rendering loops.
 */

import {
  rk4,
  createRK4ScratchContext,
  type RK4ScratchContext,
} from "./math/integrator";
import { SimulationValidator } from "./utils/validation";
import type { StateVector } from "./math/types";

export class SimulationEngine {
  private points: StateVector[] = [];
  private lastSavedPoint: StateVector | null = null;
  private scratch: RK4ScratchContext;
  private maxPoints: number;

  /**
   * Instantiates a standalone simulation calculation engine instance.
   */
  constructor(dimension: number = 3, maxPoints: number = 30000) {
    this.maxPoints = maxPoints;
    this.scratch = createRK4ScratchContext(dimension);
  }

  /**
   * Initializes or forces a hard state wipe of the trajectory tracking history.
   */
  public init(startPoint: StateVector): void {
    this.points = [[...startPoint]];
    this.lastSavedPoint = [...startPoint];
  }

  /**
   * Evaluates sequential sub-step integration calculations relative to time deltas.
   * Runs internal step filters and divergence guards before modifying state records.
   */
  public step(
    delta: number,
    speed: number,
    derivative: (state: StateVector, t: number) => StateVector,
  ): StateVector[] {
    if (this.points.length === 0) return [];

    const lastPoint = this.points[this.points.length - 1];
    if (!this.lastSavedPoint) {
      this.lastSavedPoint = lastPoint;
    }

    const dt = 0.002;
    // Cap step sequences per frame slice to defend against high system rendering hangs
    const stepsPerFrame = Math.min(
      500,
      Math.max(1, Math.floor((delta * speed) / dt)),
    );

    const frameBatch: StateVector[] = [];
    let currentPoint = lastPoint;

    for (let i = 0; i < stepsPerFrame; i++) {
      const nextPoint = new Float32Array(currentPoint.length);
      rk4(nextPoint, currentPoint, 0, dt, derivative, this.scratch);

      // Operational Safety Checks
      if (!SimulationValidator.isValidPoint(nextPoint as any)) {
        break;
      }
      if (
        !SimulationValidator.isStableStep(currentPoint, nextPoint as any, 10000)
      ) {
        break; // Stop integration updates instantly if a math explosion is caught
      }

      currentPoint = nextPoint as any;

      // Cross-Frame Spatial Odometer Calculations
      const dx = currentPoint[0] - this.lastSavedPoint[0];
      const dy = currentPoint[1] - this.lastSavedPoint[1];
      const dz = currentPoint[2] - this.lastSavedPoint[2];
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq >= 0.005) {
        const savedPt = Array.from(currentPoint);
        frameBatch.push(savedPt);
        this.lastSavedPoint = savedPt;
      }
    }

    // Low Velocity Fallback Guard: Keeps visual continuity tracking alive at minimal speeds
    if (
      frameBatch.length === 0 &&
      stepsPerFrame > 0 &&
      currentPoint !== lastPoint
    ) {
      const fallbackPt = Array.from(currentPoint);
      frameBatch.push(fallbackPt);
      this.lastSavedPoint = fallbackPt;
    }

    // Mutate state track history limits smoothly
    if (frameBatch.length > 0) {
      this.points.push(...frameBatch);
      if (this.points.length > this.maxPoints) {
        this.points.splice(0, this.points.length - this.maxPoints);
      }
    }

    return frameBatch;
  }

  /**
   * Evaluates sequential iterations for discrete maps.
   */
  public stepMap(
    speed: number,
    nextStateFn: (state: StateVector) => StateVector,
  ): StateVector[] {
    if (this.points.length === 0) return [];

    const lastPoint = this.points[this.points.length - 1];
    
    // For maps, speed determines how many iterations per frame
    const iterations = Math.max(1, Math.floor(speed * 10));
    const frameBatch: StateVector[] = [];
    let currentPoint = lastPoint;

    for (let i = 0; i < iterations; i++) {
      const nextPoint = nextStateFn(currentPoint);

      if (!SimulationValidator.isValidPoint(nextPoint as any)) {
        break;
      }

      currentPoint = nextPoint;
      frameBatch.push(Array.from(currentPoint));
    }

    if (frameBatch.length > 0) {
      this.points.push(...frameBatch);
      if (this.points.length > this.maxPoints) {
        this.points.splice(0, this.points.length - this.maxPoints);
      }
    }

    return frameBatch;
  }

  /**
   * Computes a full batch of points for a map at once (static view).
   */
  public computeMapBatch(
    count: number,
    startPoint: StateVector,
    nextStateFn: (state: StateVector) => StateVector,
  ): StateVector[] {
    const batch: StateVector[] = [[...startPoint]];
    let currentPoint = startPoint;

    for (let i = 0; i < count; i++) {
      const nextPoint = nextStateFn(currentPoint);
      if (!SimulationValidator.isValidPoint(nextPoint as any)) {
        break;
      }
      currentPoint = nextPoint;
      batch.push(Array.from(currentPoint));
    }

    this.points = batch;
    return batch;
  }

  public getPoints(): StateVector[] {
    return this.points;
  }

  public setMaxPoints(maxPoints: number): void {
    this.maxPoints = maxPoints;
    if (this.points.length > this.maxPoints) {
      this.points.splice(0, this.points.length - this.maxPoints);
    }
  }

  public clear(): void {
    this.points = [];
    this.lastSavedPoint = null;
  }

  public getDimension(): number {
    return this.scratch.y2.length;
  }
}
