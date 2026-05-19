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
    history:
      "Otto Rössler designed this system in 1976 specifically to provide a simpler version of the Lorenz attractor that was easier to analyze. By using only one nonlinear term, he created a system that exhibits the same 'folding' behavior seen in paper-making, providing deep insights into how chaos is generated in 3D flows.",
    use: [
      "Chemical kinetics",
      "Electronic oscillations",
      "Biological rhythms",
      "Studying the topology of chaos",
    ],
    sliders: [
      {
        key: "a",
        label: "Param A",
        min: 0,
        max: 1,
        step: 0.01,
        description: "Bifurcation parameter affecting spiral growth",
        impact: "Controls the degree of spiraling in the XY plane",
      },
      {
        key: "b",
        label: "Param B",
        min: 0,
        max: 1,
        step: 0.01,
        description: "Controls the z-axis threshold",
        impact: "Influences the frequency of 'spikes' into the Z dimension",
      },
      {
        key: "c",
        label: "Param C",
        min: 0,
        max: 20,
        step: 0.1,
        description: "The primary bifurcation parameter",
        impact: "Determines the transition from periodic orbits to chaos",
      },
    ],
    cameraConfig: {
      position: [-28.4, 16.12, 20.62],
      target: [-0.46, 9.14, -0.33],
    },
  },
};
