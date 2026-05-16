import type { Vector3 } from '@/core/math/types';
import type { SystemDefinition } from './types';

export const rosslerSystem: SystemDefinition = {
  id: 'rossler',
  name: 'Rössler Attractor',
  description: 'The Rössler attractor is a system of three non-linear ordinary differential equations. It was intended to behave similarly to the Lorenz attractor but be easier to analyze mathematically, featuring only one nonlinear term.',
  equations: [
    "dx/dt = -y - z",
    "dy/dt = x + ay",
    "dz/dt = b + z(x - c)"
  ],
  history: '',
  use: [],
  defaultParams: {
    a: 0.2,
    b: 0.2,
    c: 5.7,
  },
  getDerivative: (params) => {
    return ([x, y, z]): Vector3 => [
      -y - z,
      x + params.a * y,
      params.b + z * (x - params.c)
    ];
  },
  sliders: [
    { key: 'a', label: 'Param A', min: 0, max: 1, step: 0.01 },
    { key: 'b', label: 'Param B', min: 0, max: 1, step: 0.01 },
    { key: 'c', label: 'Param C', min: 0, max: 20, step: 0.1 },
  ]
};
