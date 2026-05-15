import type { Vector3 } from '@/core/math/types';
import type { SystemDefinition } from './types';

export const lorenzSystem: SystemDefinition = {
  id: 'lorenz',
  name: 'Lorenz Attractor',
  defaultParams: {
    sigma: 10,
    rho: 28,
    beta: 8 / 3,
  },
  getDerivative: (params) => {
    return ([x, y, z]): Vector3 => [
      params.sigma * (y - x),
      x * (params.rho - z) - y,
      x * y - params.beta * z
    ];
  },
  sliders: [
    { key: 'sigma', label: 'Sigma (σ)', min: 0, max: 50, step: 0.1 },
    { key: 'rho', label: 'Rho (ρ)', min: 0, max: 100, step: 0.1 },
    { key: 'beta', label: 'Beta (β)', min: 0, max: 10, step: 0.01 },
  ]
};
