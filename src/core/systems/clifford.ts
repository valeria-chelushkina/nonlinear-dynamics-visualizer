import type { RegisteredSystem } from "./types";

/**
 * Clifford Attractor
 * A type of fractal attractor created by a simple set of iterative equations.
 * x_{n+1} = sin(a * y_n) + c * cos(a * x_n)
 * y_{n+1} = sin(b * x_n) + d * cos(b * y_n)
 */
export const cliffordSystem: RegisteredSystem = {
  math: {
    id: "clifford",
    type: "map",
    dimension: 2,
    defaultParams: {
      a: -1.4,
      b: 1.6,
      c: 1.0,
      d: 0.7,
    },
    initialState: [0.1, 0.1, 0],
    getNextState: (params) => {
      return (state) => {
        const x = state[0];
        const y = state[1];
        const { a, b, c, d } = params;

        return [
          Math.sin(a * y) + c * Math.cos(a * x),
          Math.sin(b * x) + d * Math.cos(b * y),
          0,
        ];
      };
    },
    mapStateToPoint: (state) => [state[0] * 20, state[1] * 20, 0],
  },
  meta: {
    name: "Clifford Attractor",
    description:
      "A chaotic attractor defined by trigonometric functions. Small changes in parameters a, b, c, or d lead to radically different fractal shapes.",
    equations: [
      "xₙ₊₁ = sin(a*yₙ) + c*cos(a*xₙ)",
      "yₙ₊₁ = sin(b*xₙ) + d*cos(b*yₙ)",
    ],
    history:
      "Named after Clifford Pickover, who explored these types of attractors in his work on computer-generated art and chaos theory.",
    use: ["Digital art", "Fractal exploration", "Chaos theory visualization"],
    sliders: [
      {
        key: "a",
        label: "Parameter a",
        min: -3,
        max: 3,
        step: 0.01,
        description: "Sinusoidal scaling for y into x",
        impact: "Drastically changes the overall symmetry and fold patterns",
      },
      {
        key: "b",
        label: "Parameter b",
        min: -3,
        max: 3,
        step: 0.01,
        description: "Sinusoidal scaling for x into y",
        impact: "Influences the density and distribution of points",
      },
      {
        key: "c",
        label: "Parameter c",
        min: -3,
        max: 3,
        step: 0.01,
        description: "Cosine coefficient for x",
        impact: "Shifts the 'center of gravity' and stretching of the fractal",
      },
      {
        key: "d",
        label: "Parameter d",
        min: -3,
        max: 3,
        step: 0.01,
        description: "Cosine coefficient for y",
        impact: "Affects the recursive structure and fine-grained detail",
      },
    ],
    cameraConfig: {
      position: [0, 0, 100],
      target: [0, 0, 0],
    },
  },
};
