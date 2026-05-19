import type { Vector3 } from "@/core/math/types";
import type { RegisteredSystem } from "./types";

export const hindmarshRoseSystem: RegisteredSystem = {
  math: {
    id: "hindmarsh-rose",
    type: "ode",
    defaultParams: {
      a: 1.0,
      b: 3.0,
      c: 1.0,
      d: 5.0,
      r: 0.006,
      s: 4.0,
      xR: -1.6,
      I: 3.25,
    },
    getDerivative: (params) => {
      const { a, b, c, d, r, s, xR, I } = params;
      return ([x, y, z]): Vector3 => [
        y - a * x ** 3 + b * x ** 2 - z + I,
        c - d * x ** 2 - y,
        r * (s * (x - xR) - z),
      ];
    },
    initialSpeed: 5,
  },

  meta: {
    name: "Hindmarsh-Rose Model",
    description:
      "A mathematical model used in neuroscience to represent the electrical activity of a single neuron. It is particularly famous for its ability to simulate 'chaotic bursting'—the random sequence of spikes followed by a quiescent period, which is a fundamental behavior of brain cells.",
    equations: [
      "dx/dt = y - ax³ + bx² - z + I",
      "dy/dt = c - dx² - y",
      "dz/dt = r[s(x - xR) - z]",
    ],
    history:
      "Developed in the 1980s by J.L. Hindmarsh and R.M. Rose, this model was a breakthrough in computational neuroscience. It successfully bridged the gap between complex biological models and simpler mathematical ones, proving that even a single neuron can exhibit deterministic chaos.",
    use: [
      "Neuroscience and brain activity simulation",
      "Artificial Intelligence (Spiking Neural Networks)",
      "Medical research on epilepsy and neural disorders",
      "Computational biology",
    ],
    sliders: [
      {
        key: "I",
        label: "Input Current (I)",
        min: 0,
        max: 5,
        step: 0.01,
        description: "External input current applied to the neuron",
        impact: "Higher current triggers more frequent firing and transitions to chaos",
      },
      {
        key: "r",
        label: "Time Scale (r)",
        min: 0.0001,
        max: 0.01,
        step: 0.0001,
        description: "Time scale for the slow adaptation current",
        impact: "Controls the frequency of 'bursting' cycles vs individual spikes",
      },
      {
        key: "a",
        label: "Param a",
        min: 0,
        max: 2,
        step: 0.1,
        description: "Ratio of current to voltage change",
        impact: "Affects the steepness of the action potential spike",
      },
      {
        key: "b",
        label: "Param b",
        min: 0,
        max: 5,
        step: 0.1,
        description: "Recovery variable coefficient",
        impact: "Influences the refractory period between spikes",
      },
      {
        key: "c",
        label: "Param c",
        min: 0,
        max: 2,
        step: 0.1,
        description: "Steady state parameter",
        impact: "Affects the resting potential of the neuron model",
      },
      {
        key: "d",
        label: "Param d",
        min: 0,
        max: 10,
        step: 0.1,
        description: "Fast ion channel conductance",
        impact: "Controls the dampening of the rapid spike activity",
      },
      {
        key: "s",
        label: "Param s",
        min: 0,
        max: 10,
        step: 0.1,
        description: "Adaptation sensitivity",
        impact: "Governs how quickly the neuron adapts to constant stimulus",
      },
      {
        key: "xR",
        label: "Resting x",
        min: -2,
        max: 0,
        step: 0.1,
        description: "Reference voltage for the neuron",
        impact: "Shifts the baseline potential and firing threshold",
      },
    ],
    cameraConfig: {
      position: [-5.78, 3.44, 5.08],
      target: [1.85, 0.38, -5.57],
    },
  },
};
