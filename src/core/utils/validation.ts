/**
 * @file validaton.ts
 * @description Checks the simulation for broken data, glitches or physics explosions.
 */

import { VectorMath } from "../math/vector";
import type { StateVector } from "@/core/math/types";

export const SimulationValidator = {

  /** Checks if a point has valid numbers (not infinity and not NaN error errors). */
  isValidPoint: (point: StateVector): boolean => {
    return point.every((val) => Number.isFinite(val) && !Number.isNaN(val));
  },

  /** Makes sure the object didn't instantly teleport or teleport too far due to a glitch (happened a lot of time before implementing it). */
  isStableStep: (
    last: StateVector,
    next: StateVector,
    threshold: number = 100,
  ): boolean => {
    // Detect "jumps" where the integrator exploded
    return VectorMath.distance(last, next) < threshold;
  },
};