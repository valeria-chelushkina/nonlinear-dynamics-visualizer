import type { Vector3 } from "@/core/math/types";
import type { RegisteredSystem } from "./types";

export const chenSystem: RegisteredSystem = {
  math: {
    id: "chen",
    type: "ode",
    defaultParams: {
      a: 35,
      b: 3,
      c: 28,
    },
    getDerivative: (params) => {
      const { a, b, c } = params;
      return ([x, y, z]): Vector3 => [
        a * (y - x),
        (c - a) * x - x * z + c * y,
        x * y - b * z,
      ];
    },
  },

  meta: {
    name: "Chen Attractor",
    description:
      "Discovered in 1999, the Chen system is a dual to the Lorenz system. It represents a more complex 'butterfly' with higher density and different topological invariants. It is a key model in the classification of chaotic systems.",
    equations: [
      "dx/dt = a(y - x)",
      "dy/dt = (c - a)x - xz + cy",
      "dz/dt = xy - bz",
    ],
    history:
      "Guanrong Chen discovered this system while exploring the 'bridge' between the Lorenz and Lü systems. It proved that the Lorenz-style attractor was just one member of a broader family of chaotic flows, sparking a new wave of research into the mathematical structure of chaos in the late 90s.",
    use: [
      "Chaos-based secure communications",
      "Cryptography and signal masking",
      "Synchronization of complex networks",
      "Advanced nonlinear control theory",
    ],

    sliders: [
      {
        key: "a",
        label: "Param a",
        min: 0,
        max: 50,
        step: 0.1,
        description: "Coupling coefficient between x and y",
        impact: "Controls the strength of interaction between horizontal variables",
      },
      {
        key: "b",
        label: "Param b",
        min: 0,
        max: 10,
        step: 0.1,
        description: "Dissipation parameter",
        impact: "Affects the rate at which trajectories converge toward the attractor",
      },
      {
        key: "c",
        label: "Param c",
        min: 0,
        max: 40,
        step: 0.1,
        description: "Vertical feedback parameter",
        impact: "Determines the complexity of the 'wings' and the transition to chaos",
      },
    ],
    cameraConfig: {
      position: [-89.42, 37.6, 37.16],
      target: [0.83, 33.08, 1.06],
    },
  },
};
