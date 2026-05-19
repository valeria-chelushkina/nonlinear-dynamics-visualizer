import { describe, it, expect } from "vitest";
import { CoordinateTransformer } from "./coordinateTransformer";

describe("CoordinateTransformer", () => {
  it("should transform standard math points to Three.js space", () => {
    // Current implementation: toThreeSpace(p) => [p[0], p[2], -p[1]] (standard Y-up conversion)
    const mathPoint = [10, 20, 30];
    const threePoint = CoordinateTransformer.toThreeSpace(mathPoint);

    expect(threePoint[0]).toBe(10);
    expect(threePoint[1]).toBe(30);
    expect(threePoint[2]).toBe(20);
  });

  it("should handle zero coordinates", () => {
    const mathPoint = [0, 0, 0];
    const threePoint = CoordinateTransformer.toThreeSpace(mathPoint);

    expect(threePoint).toEqual([0, 0, 0]);
  });
});
