import type { Vector3 } from "@/core/math/types";
import type { RegisteredSystem } from "./types";

export const aizawaSystem: RegisteredSystem = {
  math: {
    id: "aizawa",
    type: "ode",
    initialSpeed: 5,
    defaultParams: {
      a: 0.95,
      b: 0.7,
      c: 0.6,
      d: 3.5,
      e: 0.25,
      f: 0.1,
    },
    getDerivative: (params) => {
      return ([x, y, z]): Vector3 => [
        (z - params.b) * x - params.d * y,
        params.d * x + (z - params.b) * y,
        params.c +
          params.a * z -
          z ** 3 / 3 -
          (x ** 2 + y ** 2) * (1 + params.e * z) +
          params.f * z * x ** 3,
      ];
    },
  },

  meta: {
    name: "Aizawa Attractor",
    description:
      "The Aizawa attractor is a system of equations that, when applied iteratively on three-dimensional coordinates, evolves in such a way as to have the resulting coordinates map out a three dimensional shape, in this case a sphere with a tube-like structure penetrating one of it's axis.",
    equations: [
      "dx/dt = (z - b)x - dy",
      "dy/dt = dx + (z - b)y",
      "dz/dt = c + az - z^3/3 - (x^2 + y^2)(1 + ez) + fzx^3",
    ],
    history: "It represents a significant evolution in the study of deterministic chaos, known for its complex visual patterns and fractal properties",
    use: [],
    cameraConfig: {
      position: [-5, 2, 5],
      target: [0, 0.5, 0],
    },
    sliders: [
      { key: "a", label: "Param A", min: 0, max: 2, step: 0.01 },
      { key: "b", label: "Param B", min: 0, max: 2, step: 0.01 },
      { key: "c", label: "Param C", min: 0, max: 2, step: 0.01 },
      { key: "d", label: "Param D", min: 0, max: 5, step: 0.1 },
      { key: "e", label: "Param E", min: 0, max: 1, step: 0.01 },
      { key: "f", label: "Param F", min: 0, max: 1, step: 0.01 },
    ],
  },
};
