/**
 * @file useSimulationLoop.ts
 * @description Custom hook managing the mathematical integration lifecycle.
 */

import { useMemo, useRef } from "react";
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
  const addPoints = useSimulationStore((state) => state.addPoints);
  const systemType = useSimulationStore((state) => state.sims[side].systemType);
  const params = useSimulationStore((state) => state.sims[side].params);
  
  // Tracks the last accepted point across frame boundaries
  const lastSavedPointRef = useRef<StateVector | null>(null);

  const derivative = useMemo(() => {
    const system = SYSTEM_REGISTRY[systemType] || SYSTEM_REGISTRY["lorenz"];
    return system?.getDerivative(params);
  }, [systemType, params]);

  useFrame((_state, delta) => {
    const realTimeSim = useSimulationStore.getState().sims[side];
    if (!realTimeSim) return;

    const { points, isPaused, speed } = realTimeSim;
    if (isPaused || !derivative || points.length === 0) return;

    const lastPoint = points[points.length - 1];
    if (!lastPoint) return;

    // If persistent anchor is empty or out-of-sync, initialize it
    if (!lastSavedPointRef.current) {
      lastSavedPointRef.current = lastPoint;
    }

    const dt = 0.002;
    const stepsPerFrame = Math.min(500, Math.max(1, Math.floor((delta * speed) / dt)));

    const newBatch: StateVector[] = [];
    let currentPoint = lastPoint;

    for (let i = 0; i < stepsPerFrame; i++) {
      const nextPoint = rk4(currentPoint, 0, dt, derivative);
      
      if (!nextPoint.every(v => Number.isFinite(v))) {
        break;
      }
      
      currentPoint = nextPoint;

      // Calculate distance squared from persistent, cross-frame anchor point
      const dx = currentPoint[0] - lastSavedPointRef.current[0];
      const dy = currentPoint[1] - lastSavedPointRef.current[1];
      const dz = currentPoint[2] - lastSavedPointRef.current[2];
      const distSq = dx * dx + dy * dy + dz * dz;

      // Ensures smooth lines by only saving points after a minimum movement
      if (distSq >= 0.005) {
        newBatch.push(currentPoint);
        lastSavedPointRef.current = currentPoint; // Update the cross-frame anchor
      }
    }

    // If moved but didn't cross the spatial threshold, 
    // push the last point anyway to ensure the simulation appears to move at low speeds
    if (newBatch.length === 0 && stepsPerFrame > 0 && currentPoint !== lastPoint) {
       newBatch.push(currentPoint);
       lastSavedPointRef.current = currentPoint;
    }

    if (newBatch.length > 0) {
      addPoints(side, newBatch);
    }
  });

  // Reset spatial anchor if the user switches systems or resets the simulation
  useMemo(() => {
    lastSavedPointRef.current = null;
  }, [systemType]);

  const sim = useSimulationStore((state) => state.sims[side]);
  return { sim };
};