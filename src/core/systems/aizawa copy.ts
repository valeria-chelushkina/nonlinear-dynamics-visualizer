import type { Vector3 } from '@/core/math/types';
import type { SystemDefinition } from './types';

export const aizawaSystem: SystemDefinition = {
  id: 'hindmarshRose',
  name: 'Hindmarsh-Rose Attractor',
  description: "",
  equations: [
    "dx/dt = y+phi(x) - z + I",
    "dy/dt = ksi(x) - y",
    "dz/dt = r[s(x - x(R)) - z]",
    "phi(x) = -ax^3+bx^2",
    "ksi(x) = c - dx^2"
  ],
  history: '',
  use: [],
  defaultParams: {
    a: 0.95,
    b: 0.7,
    c: 0.6,
    d: 3.5,
    e: 0.25,
    f: 0.1
  },
  getDerivative: (params) => {
    return ([x, y, z]): Vector3 => [
      (z - params.b) * x - params.d * y,
      params.d * x + (z - params.b) * y,
      params.c + params.a * z - (z ** 3) / 3 - (x ** 2 + y ** 2) * (1 + params.e * z) + params.f * z * (x ** 3),
    ];
  },
  sliders: [
    { key: 'a', label: 'Param A', min: 0, max: 2, step: 0.01 },
    { key: 'b', label: 'Param B', min: 0, max: 2, step: 0.01 },
    { key: 'c', label: 'Param C', min: 0, max: 2, step: 0.01 },
    { key: 'd', label: 'Param D', min: 0, max: 5, step: 0.1 },
    { key: 'e', label: 'Param E', min: 0, max: 1, step: 0.01 },
    { key: 'f', label: 'Param F', min: 0, max: 1, step: 0.01 },
  ]
};
