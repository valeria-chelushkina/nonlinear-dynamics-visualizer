/**
 * @file SimulationEngine.ts
 * @description The main engine that runs the physics simulation.
 * It does all the math calculations separately so it doesn't freeze or slow down the UI.
 */

import { rk4, createRK4Optimized, type RK4Optimized } from "./math/integrator";
import { SimulationValidator } from "./utils/validation";
import { AppLogger } from "./utils/logger";
import type { StateVector } from "./math/types";

export class SimulationEngine {
  private lastSavedPoint: StateVector | null = null;
  private scratch: RK4Optimized;

  /** Creates a new simulation engine instance. */
  constructor(dimension: number = 3) {
    this.scratch = createRK4Optimized(dimension);
  }

  /**
  * Advances the simulation forward in time (this function is called every frame).
  * Runs safety checks to stop glitches or math explosions before updating the position.
  * @param lastPoint - The current position of an object
  * @param delta - Time since last frame
  * @param speed - Simulation speed (is chosen by user)
  * @param derivative - Function that tells where to go next
  * @returns An array of coordinates that object passed during this step time
  *          (in simpler words - it is the piece of trajectory that has been drawn).
  */
  public step(
    lastPoint: StateVector,
    delta: number,
    speed: number,
    derivative: (state: StateVector, t: number) => StateVector,
  ): StateVector[] {
    if (!this.lastSavedPoint) {
      this.lastSavedPoint = lastPoint;
    }

    const dt = 0.002; // fixed step - 0.002s (means that one step takes 2ms)
    // Cap maximum steps per frame to prevent the app from freezing
    const stepsPerFrame = Math.min(
      500,
      Math.max(1, Math.floor((delta * speed) / dt)),
    );

    const frameBatch: StateVector[] = [];
    let currentPoint = lastPoint;

    for (let i = 0; i < stepsPerFrame; i++) {
      const nextPoint = new Float32Array(currentPoint.length);
      rk4(nextPoint, currentPoint, 0, dt, derivative, this.scratch);

      // Safet checks
      if (!SimulationValidator.isValidPoint(nextPoint as any)) {
        AppLogger.warn(
          "Simulation Engine: NaN or Infinite point detected. Stopping integration.",
          {
            lastValid: currentPoint,
            invalid: nextPoint,
          },
        );
        break;
      }
      if (
        !SimulationValidator.isStableStep(currentPoint, nextPoint as any, 10000)
      ) {
        AppLogger.warn(
          "Simulation Engine: Mathematical explosion (divergence) detected. Stopping integration.",
          {
            from: currentPoint,
            to: nextPoint,
          },
        );
        break; // Stop updates instantly if the physics engine breaks
      }

      currentPoint = nextPoint as any;

      // To avoid saving too much points - save a point only if it moved far enough; ignore if it (almost) stays in place.
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

    // If moving very slowly, save at least one point so the line doesn't disappear
    if (
      frameBatch.length === 0 &&
      stepsPerFrame > 0 &&
      currentPoint !== lastPoint
    ) {
      const fallbackPt = Array.from(currentPoint);
      frameBatch.push(fallbackPt);
      this.lastSavedPoint = fallbackPt;
    }

    return frameBatch;
  }

 /** 
  * Advances the simulation for discrete maps.
  * Does the same thing, as a 'step' function, just without rk4 integrator,
  * because discrete maps use step-by-step formulas.
  */
  public stepMap(
    lastPoint: StateVector,
    speed: number,
    nextStateFn: (state: StateVector) => StateVector,
  ): StateVector[] {
    // For maps, speed decides how many steps to calculate this frame
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

    return frameBatch;
  }

  /** Generates a large batch of points all at once to draw a static shape on screen. */
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

    return batch;
  }

  public clear(): void {
    this.lastSavedPoint = null;
  }

  public getDimension(): number {
    return this.scratch.y2.length;
  }
}
