import type { Vector3 } from '@/core/math/types';
import type { SystemDefinition } from './types';

export const halvorsenSystem: SystemDefinition = {
  id: 'halvorsen',
  name: 'Halvorsen Attractor',
  description: "A highly symmetric chaotic system that produces a distinct triangular or trefoil-like shape. It is one of the most visually balanced strange attractors, where the trajectory sweeps through three symmetric lobes.",
  equations: [
    "dx/dt = -ax - 4y - 4z - y²",
    "dy/dt = -ay - 4z - 4x - z²",
    "dz/dt = -az - 4x - 4y - x²"
  ],
  history: "Discovered during numerical searches for symmetric chaotic flows. It is a member of a class of systems where the equations are cyclic permutations of each other, leading to its characteristic 3-fold rotational symmetry.",
  use: [
    "Benchmarking numerical integration algorithms",
    "Chaos synchronization studies",
    "Education in nonlinear dynamics symmetry",
    "Abstract 3D visualization"
  ],
  defaultParams: {
    a: 1.4
  },
  getDerivative: (params) => {
    const { a } = params;
    return ([x, y, z]): Vector3 => [
      -a * x - 4 * y - 4 * z - y ** 2,
      -a * y - 4 * z - 4 * x - z ** 2,
      -a * z - 4 * x - 4 * y - x ** 2
    ];
  },
  sliders: [
    { key: 'a', label: 'Param a', min: 0, max: 2.5, step: 0.01 }
  ],
  cameraConfig: {
    position: [-3.16, -6.52, -36.22],
    target: [-3.02, -2.44, -2.8]
  },
  initialPoint: [-5, 0, 0],
  initialSpeed: 0.5
};
