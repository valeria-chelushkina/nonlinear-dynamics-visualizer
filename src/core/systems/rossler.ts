import type { Vector3 } from "@/core/math/types";
import type { RegisteredSystem } from "./types";

export const rosslerSystem: RegisteredSystem = {
  math: {
    id: "rossler",
    type: "ode",
    defaultParams: {
      a: 0.2,
      b: 0.2,
      c: 5.7,
    },
    getDerivative: (params) => {
      return ([x, y, z]): Vector3 => [
        -y - z,
        x + params.a * y,
        params.b + z * (x - params.c),
      ];
    },
    initialSpeed: 6,
  },

  meta: {
    name: "Rössler Attractor",
    description:
      "The Rössler attractor is a system of three non-linear ordinary differential equations. It was intended to behave similarly to the Lorenz attractor but be easier to analyze mathematically, featuring only one nonlinear term.",
    equations: ["dx/dt = -y - z", "dy/dt = x + ay", "dz/dt = b + z(x - c)"],
    history: "",
    use: [],
    sliders: [
      { key: "a", label: "Param A", min: 0, max: 1, step: 0.01 },
      { key: "b", label: "Param B", min: 0, max: 1, step: 0.01 },
      { key: "c", label: "Param C", min: 0, max: 20, step: 0.1 },
    ],
    cameraConfig: {
      position: [-28.4, 16.12, 20.62],
      target: [-0.46, 9.14, -0.33],
    },
  },
};
