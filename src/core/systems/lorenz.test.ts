import { describe, it, expect } from "vitest";
import { lorenzSystem } from "./lorenz";

describe("Lorenz System Properties", () => {
  const { math } = lorenzSystem;
  const params = math.defaultParams;
  const derivative = math.getDerivative!(params);

  it("should have a fixed point at the origin (0,0,0)", () => {
    // For Lorenz, dx/dt = sigma(y-x), dy/dt = x(rho-z)-y, dz/dt = xy-betaz
    // If state is [0,0,0], all derivatives must be exactly 0
    const state = [0, 0, 0];
    const [dx, dy, dz] = derivative(state, 0);

    expect(dx).toBe(0);
    expect(dy).toBe(0);
    expect(dz).toBe(0);
  });

  it("should be symmetric under (x,y,z) -> (-x,-y,z)", () => {
    // The Lorenz system has a C2 symmetry.
    // The derivative at (-x, -y, z) should be (-dx, -dy, dz)
    const p1 = [10, 10, 10];
    const p2 = [-10, -10, 10];

    const [dx1, dy1, dz1] = derivative(p1, 0);
    const [dx2, dy2, dz2] = derivative(p2, 0);

    expect(dx2).toBeCloseTo(-dx1, 10);
    expect(dy2).toBeCloseTo(-dy1, 10);
    expect(dz2).toBeCloseTo(dz1, 10);
  });

  it("should produce finite derivatives for standard params", () => {
    // "Smoke test": Ensure it doesn't return NaN or Infinity immediately
    const state = [1, 1, 1];
    const result = derivative(state, 0);

    expect(result.every((v) => Number.isFinite(v))).toBe(true);
  });
});
