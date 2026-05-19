import type { RegisteredSystem } from "./types";

export const doublePendulumSystem: RegisteredSystem = {
  math: {
    id: "double-pendulum",
    type: "ode",
    dimension: 2,
    defaultParams: {
      m1: 10,
      m2: 10,
      l1: 20,
      l2: 20,
      g: 9.81,
    },
    getDerivative: (params) => {
      const { m1, m2, l1, l2, g } = params;
      return (state) => {
        const [th1, th2, w1, w2] = state;

        const num1 = -g * (2 * m1 + m2) * Math.sin(th1);
        const num2 = -m2 * g * Math.sin(th1 - 2 * th2);
        const num3 = -2 * Math.sin(th1 - th2) * m2;
        const num4 = w2 * w2 * l2 + w1 * w1 * l1 * Math.cos(th1 - th2);
        const den = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * th1 - 2 * th2));
        const dw1 = (num1 + num2 + num3 * num4) / den;

        const num5 = 2 * Math.sin(th1 - th2);
        const num6 = w1 * w1 * l1 * (m1 + m2);
        const num7 = g * (m1 + m2) * Math.cos(th1);
        const num8 = w2 * w2 * l2 * m2 * Math.cos(th1 - th2);
        const den2 = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * th1 - 2 * th2));
        const dw2 = (num5 * (num6 + num7 + num8)) / den2;

        return [w1, w2, dw1, dw2];
      };
    },
    mapStateToPoint: (state, params) => {
      const { l1, l2 } = params;
      const [th1, th2] = state;

      // Position of second bob
      const x2 = l1 * Math.sin(th1) + l2 * Math.sin(th2);
      const y2 = -l1 * Math.cos(th1) - l2 * Math.cos(th2);

      return [x2, y2 + 25, 0];
    },
    initialState: [Math.PI / 2, Math.PI / 2, 0, 0],
    initialSpeed: 5,
  },

  meta: {
    name: "Double Pendulum",
    description:
      "A pendulum with another pendulum attached to its end, exhibiting rich dynamic behavior and strong sensitivity to initial conditions.",
    equations: [
      "θ̇₁ = ω₁",
      "θ̇₂ = ω₂",
      "ω̇₁ = (-g(2m₁ + m₂)sin θ₁ - m₂g sin(θ₁ - 2θ₂) - 2sin(θ₁ - θ₂)m₂(ω₂²L₂ + ω₁²L₁cos(θ₁ - θ₂))) / (L₁(2m₁ + m₂ - m₂cos(2θ₁ - 2θ₂)))",
      "ω̇₂ = (2sin(θ₁ - θ₂)(ω₁²L₁(m₁ + m₂) + g(m₁ + m₂)cos θ₁ + ω₂²L₂m₂cos(θ₁ - θ₂))) / (L₂(2m₁ + m₂ - m₂cos(2θ₁ - 2θ₂)))",
    ],
    history:
      "The double pendulum is one of the simplest dynamical systems that can exhibit chaotic behavior. It is a classic example used to demonstrate chaos theory.",
    use: [
      "Classical Mechanics",
      "Chaos Theory Demonstration",
      "Nonlinear Dynamics Education",
    ],

    cameraConfig: {
      position: [0, 0, 100],
      target: [0, 0, 0],
    },

    sliders: [
      {
        key: "m1",
        label: "Mass 1",
        min: 1,
        max: 50,
        step: 0.1,
        description: "Mass of the first (top) pendulum bob",
        impact: "Affects the inertia and momentum of the upper joint",
      },
      {
        key: "m2",
        label: "Mass 2",
        min: 1,
        max: 50,
        step: 0.1,
        description: "Mass of the second (bottom) pendulum bob",
        impact: "Influences the chaotic 'kick' given to the first pendulum",
      },
      {
        key: "l1",
        label: "Length 1",
        min: 5,
        max: 50,
        step: 0.1,
        description: "Length of the first pendulum arm",
        impact: "Determines the period of oscillation for the upper section",
      },
      {
        key: "l2",
        label: "Length 2",
        min: 5,
        max: 50,
        step: 0.1,
        description: "Length of the second pendulum arm",
        impact: "Controls the leverage and complexity of the lower section",
      },
      {
        key: "g",
        label: "Gravity",
        min: 0,
        max: 20,
        step: 0.1,
        description: "Gravitational acceleration",
        impact: "Scales the overall speed and energy of the system",
      },
    ],
  },
};
