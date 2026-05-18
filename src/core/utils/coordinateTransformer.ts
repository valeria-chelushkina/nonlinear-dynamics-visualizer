/**
 * @file coordinateTransformer.ts
 * @description Translates raw physics/mathematical state vectors into standardized 
 * Three.js Y-up Cartesian graphics space.
 */

import type { StateVector } from "@/core/math/types";
import type { Vector3Tuple } from "@/stores/types/simulation.types";

export const CoordinateTransformer = {
  toThreeSpace(point: StateVector | number[]): Vector3Tuple {
    const x = point[0] ?? 0;
    const y = point[1] ?? 0;
    const z = point[2] ?? 0;

    // Swapping Y and Z: 
    // Math X -> Three.js X
    // Math Z -> Three.js Y (Vertical Height Axis)
    // Math Y -> Three.js Z (Depth Axis)
    return [x, z, y];
  }
};