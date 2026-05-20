/**
 * @file coordinateTransformer.ts
 * @description Changes math coordinates into 3D graphics coordinates.
 */

import type { StateVector } from "@/core/math/types";
import type { Vector3Tuple } from "@/stores/types/simulation.types";

export const CoordinateTransformer = {

  /** Rearranges the numbers to fit Three.js space. */
  toThreeSpace(point: StateVector | number[]): Vector3Tuple {
    const x = point[0] ?? 0;
    const y = point[1] ?? 0;
    const z = point[2] ?? 0;

    // Swapping Y and Z (because Three.js uses Y for height): 
    // Math X -> Three.js X
    // Math Z -> Three.js Y
    // Math Y -> Three.js Z
    return [x, z, y];
  }
};