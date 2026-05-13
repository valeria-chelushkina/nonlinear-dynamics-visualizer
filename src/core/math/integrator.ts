import type { Vector3, DerivativeFn } from '@/core/math/types';

/**
 * Standard Runge-Kutta 4th Order Integrator
 * 
 * @param y The current state vector [x, y, z]
 * @param t Current time
 * @param dt Time step
 * @param derivative The function returning dy/dt
 */
export function rk4(
  y: Vector3,
  t: number,
  dt: number,
  derivative: DerivativeFn
): Vector3 {
  const k1 = derivative(y, t);
  
  const y2: Vector3 = [
    y[0] + k1[0] * dt * 0.5,
    y[1] + k1[1] * dt * 0.5,
    y[2] + k1[2] * dt * 0.5,
  ];
  const k2 = derivative(y2, t + dt * 0.5);
  
  const y3: Vector3 = [
    y[0] + k2[0] * dt * 0.5,
    y[1] + k2[1] * dt * 0.5,
    y[2] + k2[2] * dt * 0.5,
  ];
  const k3 = derivative(y3, t + dt * 0.5);
  
  const y4: Vector3 = [
    y[0] + k3[0] * dt,
    y[1] + k3[1] * dt,
    y[2] + k3[2] * dt,
  ];
  const k4 = derivative(y4, t + dt);
  
  return [
    y[0] + (dt / 6.0) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
    y[1] + (dt / 6.0) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
    y[2] + (dt / 6.0) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]),
  ];
}
