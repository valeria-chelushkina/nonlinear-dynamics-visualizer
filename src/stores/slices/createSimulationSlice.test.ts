import { describe, it, expect, beforeEach } from "vitest";
import { createSimulationSlice } from "./createSimulationSlice";

// Mocking Zustand-like set/get
describe("Simulation Slice", () => {
  let state: any;
  const set = (fn: any) => {
    const updates = typeof fn === "function" ? fn(state) : fn;
    state = { ...state, ...updates };
  };
  const get = () => state;

  beforeEach(() => {
    state = {
      ...createSimulationSlice(set, get),
      butterflyMode: false,
    };
  });

  it("should initialize with default simulations", () => {
    expect(state.sims.left).toBeDefined();
    expect(state.sims.right).toBeDefined();
    expect(state.sims.left.systemType).toBe("lorenz");
  });

  it("should add a point correctly", () => {
    const point: [number, number, number] = [1, 2, 3];
    state.addPoint("left", point);

    const points = state.sims.left.points;
    expect(points[points.length - 1]).toEqual(point);
  });

  it("should implement sliding window when maxPoints is reached", () => {
    state.setMaxPoints("left", 3);
    state.addPoint("left", [1, 1, 1]);
    state.addPoint("left", [2, 2, 2]);
    state.addPoint("left", [3, 3, 3]);
    state.addPoint("left", [4, 4, 4]);

    expect(state.sims.left.points.length).toBe(3);
    expect(state.sims.left.points[0]).toEqual([2, 2, 2]);
    expect(state.sims.left.points[2]).toEqual([4, 4, 4]);
  });

  it("should batch add points correctly", () => {
    state.setMaxPoints("left", 10);
    const batch: [number, number, number][] = [
      [1, 1, 1],
      [2, 2, 2],
      [3, 3, 3],
    ];
    state.addPoints("left", batch);

    expect(state.sims.left.points.length).toBe(1 + 3); // initial point + 3
    expect(state.sims.left.points.slice(-3)).toEqual(batch);
  });

  it("should reset simulation state when changing system type", () => {
    state.setSystemType("left", "rossler");
    expect(state.sims.left.systemType).toBe("rossler");
    expect(state.sims.left.points.length).toBe(1); // should be reset to initial point
  });

  it("should update parameters correctly", () => {
    const newParams = { sigma: 20 };
    state.setParams("left", newParams);
    expect(state.sims.left.params.sigma).toBe(20);
  });

  it("should toggle pause correctly", () => {
    const initialPaused = state.sims.left.isPaused;
    state.togglePause("left");
    expect(state.sims.left.isPaused).toBe(!initialPaused);
  });

  it("should respect butterfly mode for parameter updates", () => {
    state.butterflyMode = true;
    state.setParams("left", { sigma: 25 });
    expect(state.sims.left.params.sigma).toBe(25);
    expect(state.sims.right.params.sigma).toBe(25);
  });
});
