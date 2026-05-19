import type { RegisteredSystem } from "./types";

/**
 * The Ikeda Map
 * A discrete-time dynamical system first proposed by Kensuke Ikeda as a model 
 * of light going around across a nonlinear optical resonator.
 */
export const ikedaSystem: RegisteredSystem = {
  math: {
    id: "ikeda",
    type: "map",
    dimension: 2,
    defaultParams: {
      u: 0.9,
    },
    initialState: [0.1, 0.1, 0],
    getNextState: (params) => {
      return (state) => {
        const x = state[0];
        const y = state[1];
        const t = 0.4 - 6.0 / (1.0 + x * x + y * y);
        const cosT = Math.cos(t);
        const sinT = Math.sin(t);
        const u = params.u;

        return [1 + u * (x * cosT - y * sinT), u * (x * sinT + y * cosT), 0];
      };
    },
    mapStateToPoint: (state) => [state[0] * 15, state[1] * 15, 0],
  },
  meta: {
    name: "Ikeda Map",
    description:
      "A discrete-time dynamical system showing complex trajectories and a strange attractor. It models light propagation in a nonlinear optical cavity.",
    equations: [
      "tₙ = 0.4 - 6 / (1 + (xₙ)² + (yₙ)²)",
      "xₙ₊₁ = 1 + u(xₙ cos tₙ - yₙ sin tₙ)",
      "yₙ₊₁ = u(xₙ sin tₙ + yₙ cos tₙ)",
    ],
    history:
      "First proposed by Kensuke Ikeda in 1979 to describe the stationary state of the light field in a ring cavity containing a nonlinear dielectric medium.",
    use: [
      "Optical bistability",
      "Laser dynamics",
      "Chaos in optics",
      "Nonlinear systems research",
    ],
    sliders: [
      {
        key: "u",
        label: "Parameter u",
        min: 0,
        max: 1,
        step: 0.01,
        description: "Saturation or loss parameter of the optical cavity",
        impact: "Controls the amount of energy retained; chaos typically emerges around u = 0.9",
      },
    ],
    cameraConfig: {
      position: [0, 0, 100],
      target: [0, 0, 0],
    },
  },
};
