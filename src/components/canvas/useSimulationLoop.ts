/**
 * @file useSimulationLoop.ts
 * @description Custom hook managing the mathematical integration lifecycle.
 */

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useSimulationStore } from "@/stores/useSimulationStore";
import type { Side } from "@/stores/useSimulationStore";
import type { StateVector } from "@/core/math/types";
import { rk4 } from "@/core/math/integrator";
import { SYSTEM_REGISTRY } from "@/core/systems";

interface UseSimulationLoopProps {
  side: Side;
}

export const useSimulationLoop = ({ side }: UseSimulationLoopProps) => {
  const sim = useSimulationStore((state) => state.sims[side]);
  const addPoints = useSimulationStore((state) => state.addPoints);

  const { systemType, params, points, isPaused, speed } = sim;

  // Memoize system derivative calculation to prevent recalculated allocations
  const derivative = useMemo(() => {
    const system = SYSTEM_REGISTRY[systemType] || SYSTEM_REGISTRY["lorenz"];
    return system?.getDerivative(params);
  }, [systemType, params]);

  useFrame((_state, delta) => {
    if (isPaused || !derivative || points.length === 0) return;

    const lastPoint = points[points.length - 1];
    if (!lastPoint) return;

    const dt = 0.005;
    // Adapt steps per frame fluidly based on current monitor refresh rate/delta drops
    const stepsPerFrame = Math.max(1, Math.floor((delta * speed) / dt));

    const newBatch: StateVector[] = [];
    let currentPoint = lastPoint;

    for (let i = 0; i < stepsPerFrame; i++) {
      currentPoint = rk4(currentPoint, 0, dt, derivative);

      // Downsample data streams slightly to maintain performant GPU buffer bounds
      if (i % 2 === 0) {
        newBatch.push(currentPoint);
      }
    }

    if (newBatch.length > 0) {
      addPoints(side, newBatch);
    }
  });

  return { sim };
};
