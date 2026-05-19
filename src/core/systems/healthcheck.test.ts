import { describe, it, expect } from "vitest";
import { SYSTEM_LIST } from "./index";

describe("Systems Registry Health Check", () => {
  SYSTEM_LIST.forEach((system) => {
    describe(`System: ${system.meta.name} (${system.math.id})`, () => {
      it("should have required metadata", () => {
        expect(system.meta.name).toBeDefined();
        expect(system.meta.description).toBeDefined();
        expect(Array.isArray(system.meta.equations)).toBe(true);
        expect(Array.isArray(system.meta.sliders)).toBe(true);
      });

      it("should have valid mathematical configuration", () => {
        expect(system.math.id).toBeDefined();
        expect(["ode", "map"]).toContain(system.math.type);
        expect(system.math.defaultParams).toBeDefined();

        if (system.math.type === "ode") {
          expect(system.math.getDerivative).toBeTypeOf("function");
        } else {
          expect(system.math.getNextState).toBeTypeOf("function");
        }
      });

      it("should produce finite outputs from the core math function", () => {
        const { math } = system;
        const params = math.defaultParams;
        const initialState = math.initialState || [0.1, 0.1, 0.1];

        if (math.type === "ode") {
          const derivative = math.getDerivative!(params);
          const result = derivative(initialState, 0);
          expect(result.length).toBeGreaterThanOrEqual(2);
          expect(
            result.every((v) => typeof v === "number" && Number.isFinite(v)),
          ).toBe(true);
        } else {
          const nextStateFn = math.getNextState!(params);
          const result = nextStateFn(initialState);
          expect(result.length).toBeGreaterThanOrEqual(1);
          expect(
            result.every((v) => typeof v === "number" && Number.isFinite(v)),
          ).toBe(true);
        }
      });

      it("should have valid slider configurations", () => {
        system.meta.sliders.forEach((slider) => {
          expect(slider.key).toBeDefined();
          expect(slider.min).toBeLessThanOrEqual(slider.max);
          expect(system.math.defaultParams[slider.key]).toBeDefined();
        });
      });

      if (system.math.mapStateToPoint) {
        it("should correctly map state to a 3D point", () => {
          const initialState = system.math.initialState || [0.1, 0.1, 0.1];
          const point = system.math.mapStateToPoint!(
            initialState,
            system.math.defaultParams,
          );
          expect(point.length).toBe(3);
          expect(
            point.every((v) => typeof v === "number" && Number.isFinite(v)),
          ).toBe(true);
        });
      }
    });
  });
});
