import type { Vector3 } from "@/core/math/types";
import type { RegisteredSystem } from "./types";

export const lorenzSystem: RegisteredSystem = {
  math: {
    id: "lorenz",
    type: "ode",
    defaultParams: {
      sigma: 10,
      rho: 28,
      beta: 8 / 3,
    },
    getDerivative: (params) => {
      return ([x, y, z]): Vector3 => [
        params.sigma * (y - x),
        x * (params.rho - z) - y,
        x * y - params.beta * z,
      ];
    },
  },

  meta: {
    name: "Lorenz Attractor",
    description:
      'First discovered by Edward Lorenz in 1963, this system represents a simplified mathematical model for atmospheric convection. It is world-famous for demonstrating the "Butterfly Effect," where tiny differences in initial conditions lead to widely diverging outcomes.',
    equations: ["ẋ = σ(y - x)", "ẏ = x(ρ - z) - y", "ż = xy - βz"],
    history:
      "Lorenz discovered this while creating a simplified weather model. He noticed that tiny rounding errors in his computer calculations (like 0.506127 vs 0.506) led to completely different weather predictions. This revelation helped establish that: Deterministic systems can be unpredictable; Long-term weather forecasting has fundamental limits; Chaos is a natural phenomenon, not just mathematical curiosity",
    use: [
      "Weather patterns and atmospheric convection",
      "Laser dynamics",
      "Chemical reactions",
      "Population dynamics",
      "Economic models",
      "Neural networks",
    ],
    sliders: [
      {
        key: "sigma",
        label: "Sigma (σ)",
        min: 0,
        max: 50,
        step: 0.1,
        description: "The Prandtl number representing fluid viscosity",
        impact: "Higher values increase the 'stretching' of the attractor",
      },
      {
        key: "rho",
        label: "Rho (ρ)",
        min: 0,
        max: 100,
        step: 0.1,
        description: "The Rayleigh number representing temperature difference",
        impact: "Determines the point at which the system becomes chaotic",
      },
      {
        key: "beta",
        label: "Beta (β)",
        min: 0,
        max: 10,
        step: 0.01,
        description: "A geometric factor representing physical dimensions",
        impact: "Influences the vertical 'height' and stability of the lobes",
      },
    ],
    cameraConfig: {
      position: [-100, 30, 40],
      target: [0, 25, 0],
    },
  },
};
