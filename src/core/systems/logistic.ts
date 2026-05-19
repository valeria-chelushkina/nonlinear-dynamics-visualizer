import type { RegisteredSystem } from "./types";

/**
 * Logistic Map (2D Projection)
 * x_{n+1} = r * x_n * (1 - x_n)
 * We visualize it as (x_n, x_{n+1}) to create the iconic "tent" or "arch" shape.
 */
export const logisticMapSystem: RegisteredSystem = {
  math: {
    id: "logistic",
    type: "map",
    dimension: 2,
    defaultParams: {
      r: 3.9,
    },
    initialState: [0.5, 0.5, 0],
    getNextState: (params) => {
      return (state) => {
        const nextX = params.r * state[0] * (1 - state[0]);
        // We store x_n in state[0] and x_{n+1} in state[1] for 2D visualization
        return [nextX, state[0], 0];
      };
    },
    // We map [x_n, x_{n-1}] to 2D space for the phase plot
    mapStateToPoint: (state) => [
      state[0] * 60 - 30, // Scale x_n
      state[1] * 60 - 30, // Scale x_{n-1}
      0
    ],
  },
  meta: {
    name: "Logistic Map",
    description:
      "A 2D phase-space projection of the logistic map. By plotting x_{n} against x_{n-1}, we visualize the parabolic attractor that governs the system's evolution.",
    equations: [
      "x_{n+1} = r x_n (1 - x_n)",
      "Plotting: (x_n, x_{n-1})"
    ],
    history:
      "Popularized by Robert May in 1976. This 2D projection reveals the 'hump' shape that causes chaos through stretching and folding.",
    use: [
      "Population dynamics",
      "Chaos theory",
      "Bifurcation analysis",
    ],
    sliders: [
      {
        key: "r",
        label: "Parameter r",
        min: 0,
        max: 4,
        step: 0.001,
        description: "Growth rate parameter",
        impact: "3.57+ leads to chaos; 4.0 is fully chaotic.",
      },
    ],
    cameraConfig: {
      position: [0, 0, 80],
      target: [0, 0, 0],
    },
  },
};
