import type { StateVector, DerivativeFn } from "@/core/math/types";

/**
 * Standard Runge-Kutta 4th Order Integrator
 *
 * @param y The current state vector
 * @param t Current time
 * @param dt Time step
 * @param derivative The function returning dy/dt
 */
export function rk4(
  y: StateVector,
  t: number,
  dt: number,
  derivative: DerivativeFn,
): StateVector {
  const k1 = derivative(y, t);

  const y2: StateVector = y.map((val, i) => val + k1[i] * dt * 0.5);
  const k2 = derivative(y2, t + dt * 0.5);

  const y3: StateVector = y.map((val, i) => val + k2[i] * dt * 0.5);
  const k3 = derivative(y3, t + dt * 0.5);

  const y4: StateVector = y.map((val, i) => val + k3[i] * dt);
  const k4 = derivative(y4, t + dt);

  return y.map(
    (val, i) => val + (dt / 6.0) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]),
  );
}
