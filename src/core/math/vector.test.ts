import { describe, it, expect } from "vitest";
import { VectorMath } from "./vector";

describe("VectorMath", () => {
  it("should calculate distance between two 3D points", () => {
    const v1 = [0, 0, 0];
    const v2 = [3, 4, 0];
    // Distance = sqrt((3-0)^2 + (4-0)^2 + (0-0)^2) = sqrt(9 + 16) = 5
    expect(VectorMath.distance(v1, v2)).toBe(5);
  });

  it("should calculate distance between two points in 3D space", () => {
    const v1 = [1, 2, 3];
    const v2 = [4, 6, 8];
    // Distance = sqrt((4-1)^2 + (6-2)^2 + (8-3)^2) = sqrt(3^2 + 4^2 + 5^2) = sqrt(9 + 16 + 25) = sqrt(50) ≈ 7.0710678
    expect(VectorMath.distance(v1, v2)).toBeCloseTo(Math.sqrt(50), 5);
  });

  it("should return 0 for the same point", () => {
    const v1 = [1.5, -2.5, 3.0];
    expect(VectorMath.distance(v1, v1)).toBe(0);
  });
});
