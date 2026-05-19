import type { Vector3 } from "@/core/math/types";
import type { RegisteredSystem } from "./types";

export const halvorsenSystem: RegisteredSystem = {
  math: {
    id: "halvorsen",
    type: "ode",
    defaultParams: {
      a: 1.4,
    },
    getDerivative: (params) => {
      const { a } = params;
      return ([x, y, z]): Vector3 => [
        -a * x - 4 * y - 4 * z - y ** 2,
        -a * y - 4 * z - 4 * x - z ** 2,
        -a * z - 4 * x - 4 * y - x ** 2,
      ];
    },
    initialState: [-5, 0, 0],
    initialSpeed: 2,
  },

  meta: {
    name: "Halvorsen Attractor",
    description:
      "A highly symmetric chaotic system that produces a distinct triangular or trefoil-like shape. It is one of the most visually balanced strange attractors, where the trajectory sweeps through three symmetric lobes.",
    equations: [
      "ẋ = -ax - 4y - 4z - y²",
      "ẏ = -ay - 4z - 4x - z²",
      "ż = -az - 4x - 4y - x²",
    ],
    history:
      "Discovered during numerical searches for symmetric chaotic flows. It is a member of a class of systems where the equations are cyclic permutations of each other, leading to its characteristic 3-fold rotational symmetry.",
    use: [
      "Benchmarking numerical integration algorithms",
      "Chaos synchronization studies",
      "Education in nonlinear dynamics symmetry",
      "Abstract 3D visualization",
    ],

    sliders: [
      {
        key: "a",
        label: "Param a",
        min: 0,
        max: 2.5,
        step: 0.01,
        description: "The primary control parameter",
        impact: "Determines whether the system collapses or expands into chaos",
      },
    ],
    cameraConfig: {
      position: [-25.49, -23.63, -16.75],
      target: [-4.19, -1.34, -3.2],
    },
  },
};
