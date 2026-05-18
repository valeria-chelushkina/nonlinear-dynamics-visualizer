/**
 * @file simulation.ts
 * @description Provides numerical sanity boundaries and vector calculation utilities
 * to detect and prevent chaotic integration explosions or floating-point anomalies.
 */

import type { StateVector } from "@/core/math/types";

/**
 * Validates that all structural entries of a StateVector represent 
 * standard, finite coordinates (prevents NaN or Infinity runtime pollution).
 * 
 * @param point - The three-dimensional numerical vector tuple to validate.
 * @returns True if every coordinate axis is a valid finite real number.
 */
export const isValidVector = (point: StateVector): boolean => {
  return point.every((value) => Number.isFinite(value));
};

/**
 * Computes the squared Euclidean distance separating two distinct multi-axis state vectors.
 * Utilizing the squared magnitude avoids expensive CPU/GPU square-root operations.
 * 
 * @param p1 - Origin mathematical state vector coordinates.
 * @param p2 - Terminal mathematical state vector coordinates.
 * @returns The scalar squared distance distance representation ($d^2$).
 */
export const getDistanceSquared = (p1: StateVector, p2: StateVector): number => {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const dz = p2[2] - p1[2];
  return dx * dx + dy * dy + dz * dz;
};