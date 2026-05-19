import type { RegisteredSystem } from "./types";

/**
 * The Hénon Map
 * A discrete-time dynamical system that exhibits chaotic behavior.
 * x_{n+1} = 1 - a x_n^2 + y_n
 * y_{n+1} = b x_n
 */
export const henonSystem: RegisteredSystem = {
  math: {
    id: "henon",
    type: "map",
    dimension: 2,
    defaultParams: {
      a: 1.4,
      b: 0.3,
    },
    initialState: [0.1, 0.1, 0],
    getNextState: (params) => {
      return (state) => [
        1 - params.a * state[0] * state[0] + state[1],
        params.b * state[0],
        0,
      ];
    },
    mapStateToPoint: (state) => [state[0] * 20, state[1] * 20, 0],
  },
  meta: {
    name: "Hénon Map",
    description:
      "One of the most-studied examples of dynamical systems that exhibit chaotic behavior. It takes a point (x, y) and maps it to a new point in the plane.",
    equations: ["xₙ₊₁ = 1 - a xₙ² + yₙ", "yₙ₊₁ = b xₙ"],
    history:
      "Introduced by Michel Hénon in 1976 as a simplified model of the Poincaré section of the Lorenz model. It shows how simple 2D quadratic maps can lead to complex fractal structures.",
    use: [
      "Chaos theory",
      "Nonlinear dynamics",
      "Fractal generation",
      "Statistical mechanics",
    ],
    sliders: [
      {
        key: "a",
        label: "Parameter a",
        min: 0,
        max: 2,
        step: 0.01,
        description: "Nonlinearity parameter",
        impact: "Controls the degree of quadratic folding; higher values lead to chaos",
      },
      {
        key: "b",
        label: "Parameter b",
        min: 0,
        max: 0.5,
        step: 0.01,
        description: "Area-preserving (dissipation) parameter",
        impact: "Determines how much the system 'remembers' its previous state",
      },
    ],
    cameraConfig: {
      position: [0, 0, 100],
      target: [0, 0, 0],
    },
  },
};
