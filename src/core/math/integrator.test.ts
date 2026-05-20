import { describe, it, expect } from "vitest";
import { rk4, createRK4Optimized } from "./integrator";

describe("RK4 Integrator", () => {
  it("should correctly integrate a simple linear growth (dx/dt = x)", () => {
    // dx/dt = x, with x(0) = 1
    // Exact solution: x(t) = e^t
    const deriv = (state: any) => [state[0]];
    const initialState = [1];
    const dt = 0.1;
    const nextState = new Float32Array(1);
    const scratch = createRK4Optimized(1);

    rk4(nextState, initialState, 0, dt, deriv, scratch);

    // x(0.1) = e^0.1 ≈ 1.1051709
    expect(nextState[0]).toBeCloseTo(1.10517, 5);
  });

  it("should correctly integrate a harmonic oscillator (dx/dt = v, dv/dt = -x)", () => {
    // Harmonic oscillator:
    // dx/dt = v
    // dv/dt = -x
    // Exact solution: x(t) = cos(t), v(t) = -sin(t) starting from [1, 0]
    const deriv = (state: { [key: number]: number }) => [state[1], -state[0]];
    const initialState = [1, 0];
    const dt = 0.1;
    const nextState = new Float32Array(2);
    const scratch = createRK4Optimized(2);

    rk4(nextState, initialState, 0, dt, deriv, scratch);

    // x(0.1) = cos(0.1) ≈ 0.995004
    // v(0.1) = -sin(0.1) ≈ -0.099833
    expect(nextState[0]).toBeCloseTo(0.995004, 5);
    expect(nextState[1]).toBeCloseTo(-0.099833, 5);
  });

  it("should handle zero derivatives correctly", () => {
    const deriv = () => [0, 0, 0];
    const initialState = [1, 2, 3];
    const dt = 0.1;
    const nextState = new Float32Array(3);
    const scratch = createRK4Optimized(3);

    rk4(nextState, initialState, 0, dt, deriv, scratch);

    expect(nextState[0]).toBe(1);
    expect(nextState[1]).toBe(2);
    expect(nextState[2]).toBe(3);
  });
});
