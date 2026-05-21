import type { Vector3 } from "@/core/math/types";
import type { RegisteredSystem } from "./types";

export const chenSystem: RegisteredSystem = {
  math: {
    id: "chen",
    type: "ode",
    defaultParams: {
      sigma: 36,
      rho: 0,
      s: 20,
      beta: 3,
    },
    getDerivative: (params) => {
      const { sigma, rho, s, beta } = params;
      return ([x, y, z]): Vector3 => [
        sigma * (y - x),
        (rho - z) * x + s * y,
        x * y - beta * z,
      ];
    },
  },

  meta: {
    name: "Chen Attractor",
    description:
      "Discovered in 1999, the Chen system is a dual to the Lorenz system. It represents a more complex 'butterfly' with higher density and different topological invariants. It is a key model in the classification of chaotic systems.",
    equations: ["ẋ = σ(y - x)", "ẏ = (ρ - z)x + sy", "ż = xy - βz"],
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
        key: "sigma",
        label: "Sigma (σ)",
        min: 0,
        max: 50,
        step: 0.1,
        description: "Coupling coefficient between x and y components",
        impact:
          "Controls the expansion or contraction rate along the main chaotic folds",
      },
      {
        key: "rho",
        label: "Rho (ρ)",
        min: -10,
        max: 10,
        step: 0.1,
        description: "Nonlinear cross-coupling parameter",
        impact:
          "Triggers the stretching effect in the phase space, driving the system into chaos",
      },
      {
        key: "s",
        label: "Param s",
        min: 0,
        max: 40,
        step: 0.1,
        description: "Linear feedback coefficient for the y-velocity",
        impact:
          "Determines the vertical complexity and density of the attractor's wings",
      },
      {
        key: "beta",
        label: "Beta (β)",
        min: 0,
        max: 10,
        step: 0.1,
        description: "Dissipation/damping rate along the z-axis",
        impact:
          "Controls the vertical compression and stability of the chaotic trajectories",
      },
    ],
    cameraConfig: {
      position: [-89.42, 37.6, 37.16],
      target: [0.83, 33.08, 1.06],
    },
  },
};
