import type { Vector3 } from "@/core/math/types";
import type { RegisteredSystem } from "./types";

export const chuaSystem: RegisteredSystem = {
  math: {
    id: "chua",
    type: "ode",
    defaultParams: {
      alpha: 15.6,
      beta: 28,
      m0: -1.143,
      m1: -0.714,
    },
    getDerivative: (params) => {
      const { alpha, beta, m0, m1 } = params;
      return ([x, y, z]): Vector3 => {
        // Piecewise linear function f(x)
        const fx =
          m1 * x + 0.5 * (m0 - m1) * (Math.abs(x + 1) - Math.abs(x - 1));

        return [alpha * (y - x - fx), x - y + z, -beta * y];
      };
    },
    initialSpeed: 4,
  },

  meta: {
    name: "Chua's Circuit",
    description:
      "Invented in 1983 by Leon Chua, this is a non-linear electronic circuit that exhibits chaotic behavior. It was the first system where chaos was mathematically proven and physically observed in hardware, making it a landmark in the transition from theory to real-world engineering.",
    equations: [
      "ẋ = α(y - x - f(x))",
      "ẏ = x - y + z",
      "ż = -βy",
      "f(x) = m₁x + 0.5(m₀ - m₁)(|x+1| - |x-1|)",
    ],
    history:
      "Leon Chua invented this circuit specifically to prove that chaotic behavior can be found in simple physical systems. He sought the simplest possible circuit that could satisfy the conditions for chaos. Today, it remains one of the most studied examples of chaos due to its ease of physical implementation. It essentially proved that 'strange attractors' weren't just computer bugs, but physical realities.",
    use: [
      "Secure communication and signal encryption",
      "Random number generation",
      "Modeling of non-linear electronic components",
      "Synthetic music and sound generation",
      "Neuroscience (modeling neuron firing patterns)",
    ],
    sliders: [
      {
        key: "alpha",
        label: "Alpha (α)",
        min: 0,
        max: 25,
        step: 0.1,
        description: "The ratio of capacitance between the two capacitors",
        impact:
          "Primary bifurcation parameter; controls the transition to chaos",
      },
      {
        key: "beta",
        label: "Beta (β)",
        min: 0,
        max: 50,
        step: 0.1,
        description: "Represents resistance or inductance in the circuit",
        impact: "Affects the stability and size of the double-scroll attractor",
      },
      {
        key: "m0",
        label: "m0",
        min: -2,
        max: 0,
        step: 0.001,
        description: "Slope of the inner region of the nonlinear resistor",
        impact: "Determines the behavior of the system near the origin",
      },
      {
        key: "m1",
        label: "m1",
        min: -1,
        max: 0,
        step: 0.001,
        description: "Slope of the outer regions of the nonlinear resistor",
        impact: "Affects the overall bounds and folding of the trajectory",
      },
    ],
    cameraConfig: {
      position: [2.59, 1.82, 9.46],
      target: [0.07, 0.09, -0.01],
    },
  },
};
