import type { Vector3 } from "@/core/math/types";
import type { RegisteredSystem } from "./types";

export const thomasSystem: RegisteredSystem = {
  math: {
    id: "thomas",
    type: "ode",
    defaultParams: {
      b: 0.19,
    },
    getDerivative: (params) => {
      const { b } = params;
      return ([x, y, z]): Vector3 => [
        Math.sin(y) - b * x,
        Math.sin(z) - b * y,
        Math.sin(x) - b * z,
      ];
    },
    initialState: [0.2, 0.5, 0.3],
    initialSpeed: 20,
  },

  meta: {
    name: "Thomas' Attractor",
    description:
      "A cyclically symmetric attractor proposed by René Thomas. It is known for its beautiful, labyrinth-like structure and high degree of mathematical symmetry. It represents a flow in a 3D space that can create complex, repeating patterns.",
    equations: [
      "dx/dt = sin(y) - bx",
      "dy/dt = sin(z) - by",
      "dz/dt = sin(x) - bz",
    ],
    history:
      "René Thomas developed this system as a 'pure' mathematical exploration of symmetry in chaos. Unlike the Lorenz system which came from weather, this was designed to find the simplest equations that could generate complex topological structures like 'chaotic labyrinths.'",
    use: [
      "Lattice theory and topology research",
      "Studying feedback loops in complex systems",
      "Generative art and geometric modeling",
      "Theoretical physics",
    ],
    sliders: [
      {
        key: "b",
        label: "Dissipation (b)",
        min: 0,
        max: 0.5,
        step: 0.001,
        description: "Friction or dissipation coefficient",
        impact: "Lower values allow for more complex 'labyrinth' exploration",
      },
    ],
    cameraConfig: {
      position: [3.61, -0.6, -10.73],
      target: [-0.11, 0.16, -0.55],
    },
  },
};
