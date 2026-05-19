import { describe, it, expect } from "vitest";
import { SimulationValidator } from "./validation";

describe("SimulationValidator", () => {
  describe("isValidPoint", () => {
    it("should return true for valid finite numbers", () => {
      expect(SimulationValidator.isValidPoint([0, 0, 0])).toBe(true);
      expect(SimulationValidator.isValidPoint([1.5, -2.3, 100.1])).toBe(true);
    });

    it("should return false if any coordinate is NaN", () => {
      expect(SimulationValidator.isValidPoint([NaN, 0, 0])).toBe(false);
      expect(SimulationValidator.isValidPoint([0, NaN, 0])).toBe(false);
      expect(SimulationValidator.isValidPoint([0, 0, NaN])).toBe(false);
    });

    it("should return false if any coordinate is Infinity", () => {
      expect(SimulationValidator.isValidPoint([Infinity, 0, 0])).toBe(false);
      expect(SimulationValidator.isValidPoint([0, -Infinity, 0])).toBe(false);
    });
  });

  describe("isStableStep", () => {
    it("should return true for small changes", () => {
      const p1 = [0, 0, 0];
      const p2 = [0.1, 0.1, 0.1];
      expect(SimulationValidator.isStableStep(p1, p2, 100)).toBe(true);
    });

    it("should return false if the distance exceeds the threshold", () => {
      const p1 = [0, 0, 0];
      const p2 = [101, 0, 0]; // Distance is 101
      expect(SimulationValidator.isStableStep(p1, p2, 100)).toBe(false);
    });
  });
});
