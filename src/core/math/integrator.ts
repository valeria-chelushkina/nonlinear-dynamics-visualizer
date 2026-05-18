/**
 * @file integrator.ts
 * @description High-performance numerical integration using the Runge-Kutta 4th Order (RK4) method.
 */

import type { StateVector, DerivativeFn } from "@/core/math/types";

/**
 * Reusable memory block containing pre-allocated temporary state structures.
 * Bypasses the need to spin up new arrays hundreds of times per frame block.
 */
export interface RK4ScratchContext {
  y2: Float32Array;
  y3: Float32Array;
  y4: Float32Array;
}

/**
 * Create an isolated high-performance memory context for a given system dimension.
 */
export function createRK4ScratchContext(dimension: number): RK4ScratchContext {
  return {
    y2: new Float32Array(dimension),
    y3: new Float32Array(dimension),
    y4: new Float32Array(dimension),
  };
}

/**
 * Evaluates vectors over a continuous vector field and writes the resulting coordinate
 * outputs directly into a provided destination vector buffer.
 */
export function rk4(
  out: StateVector,
  y: StateVector,
  t: number,
  dt: number,
  derivative: DerivativeFn,
  scratch: RK4ScratchContext,
): void {
  const n = y.length;
  const { y2, y3, y4 } = scratch;

  const dtHalf = dt * 0.5;
  const dtSix = dt / 6.0;

  // Evaluate k1 and project half-step to y2
  const k1 = derivative(y, t);
  for (let i = 0; i < n; i++) {
    y2[i] = y[i] + k1[i] * dtHalf;
  }

  // Evaluate k2 and project half-step to y3
  const k2 = derivative(y2, t + dtHalf);
  for (let i = 0; i < n; i++) {
    y3[i] = y[i] + k2[i] * dtHalf;
  }

  // Evaluate k3 and project full-step to y4
  const k3 = derivative(y3, t + dtHalf);
  for (let i = 0; i < n; i++) {
    y4[i] = y[i] + k3[i] * dt;
  }

  // Evaluate k4 and combine weighted average into destination out buffer
  const k4 = derivative(y4, t + dt);
  for (let i = 0; i < n; i++) {
    out[i] = y[i] + dtSix * (k1[i] + 2.0 * k2[i] + 2.0 * k3[i] + k4[i]);
  }
}