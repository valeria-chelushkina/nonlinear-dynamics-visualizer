/**
 * @file vector.ts
 * @description Handles dimensional operations (only vrctor distance for now).
 */

import type { StateVector } from "./types";

export const VectorMath = {
    distance: (v1: StateVector, v2: StateVector): number => {
        return Math.sqrt(
            Math.pow(v2[0]-v1[0], 2) + 
            Math.pow(v2[1]-v1[1], 2) + 
            Math.pow(v2[2]-v1[2], 2)
        );
    },
};