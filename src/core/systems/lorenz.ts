import type { Vector3, DerivativeFn } from '@/core/math/types';

export interface LorenzParams {
  sigma: number;
  rho: number;
  beta: number;
}

/**
 * Lorenz System Equations:
 * dx/dt = sigma * (y - x)
 * dy/dt = x * (rho - z) - y
 * dz/dt = x * y - beta * z
 */
export const lorenzDerivative = (params: LorenzParams): DerivativeFn => {
  return ([x, y, z]): Vector3 => {
    return [
      params.sigma * (y - x),
      x * (params.rho - z) - y,
      x * y - params.beta * z
    ];
  };
};

export const DEFAULT_LORENZ_PARAMS: LorenzParams = {
  sigma: 10,
  rho: 28,
  beta: 8 / 3,
};
