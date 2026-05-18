import type { RegisteredSystem } from "./types";

/**
 * Logistic Map
 * x_{n+1} = r * x_n * (1 - x_n)
 * Although 1D, we visualize it as a time series or recurrence plot.
 */
export const logisticMapSystem: RegisteredSystem = {
  math: {
    id: "logistic",
    type: "map",
    dimension: 2,
    defaultParams: {
      r: 3.9,
    },
    initialState: [0.5, 0, 0],
    getNextState: (params) => {
      return (state) => [
        params.r * state[0] * (1 - state[0]),
        0,
        0,
      ];
    },
    mapStateToPoint: (state) => [state[0] * 40 - 20, 0, 0],
  },
  meta: {
    name: "Logistic Map",
    description:
      "A polynomial mapping of degree 2, often cited as an archetypal example of how complex, chaotic behaviour can arise from very simple non-linear dynamical equations.",
    equations: ["x_{n+1} = r x_n (1 - x_n)"],
    history:
      "Popularized in a 1976 paper by the biologist Robert May, in part as a discrete-time demographic model analogous to the logistic equation first created by Pierre François Verhulst.",
    use: [
      "Population dynamics",
      "Chaos theory",
      "Bifurcation analysis",
    ],
    sliders: [
      { key: "r", label: "Parameter r", min: 0, max: 4, step: 0.01 },
    ],
    cameraConfig: {
      position: [0, 0, 100],
      target: [0, 0, 0],
    },
  },
};
