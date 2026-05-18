/**
 * @file validaton.ts
 * @description Provides validation routines to detect mathematical explosion states, non-finite values
 * and unnatural integration step discontinuities within chaotic dynamic attractor systems.
 */

import { VectorMath } from "../math/vector";
import type { StateVector } from "@/core/math/types";

export const SimulationValidator = {

  isValidPoint: (point: StateVector): boolean => {
    return point.every((val) => Number.isFinite(val) && !Number.isNaN(val));
  },

  isStableStep: (
    last: StateVector,
    next: StateVector,
    threshold: number = 100,
  ): boolean => {
    // Detect "jumps" where the integrator exploded
    return VectorMath.distance(last, next) < threshold;
  },
};