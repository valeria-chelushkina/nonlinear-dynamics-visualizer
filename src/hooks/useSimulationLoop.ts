/**
 * @file useSimulationLoop.ts
 * @description A helper hook that runs math equations on every single animation frame
 * to update the 3D graphics.
 */

import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useSimulationStore } from "@/stores/useSimulationStore";
import type { Side } from "@/stores/useSimulationStore";
import { SimulationEngine } from "@/core/SimulationEngine";
import { SYSTEM_REGISTRY } from "@/core/systems";

interface UseSimulationLoopProps {
  side: Side;
}

/**
 * Custom hook that runs math equations over and over in the background 
 * using React Three Fiber's endless frame loop.
 */
export const useSimulationLoop = ({ side }: UseSimulationLoopProps) => {
  const addPoints = useSimulationStore((state) => state.addPoints);

  const setPoints = useSimulationStore((state) => state.setPoints);

  const systemType = useSimulationStore((state) => state.sims[side].systemType);
  const params = useSimulationStore((state) => state.sims[side].params);

  const system = useMemo(() => {
    return SYSTEM_REGISTRY[systemType] || SYSTEM_REGISTRY["lorenz"];
  }, [systemType]);

  const stateDimension = useMemo(() => {
    return system.math.initialState?.length || 3;
  }, [system]);

  /** Keeps a single, persistent copy of math engine alive across renders. */
  const engineRef = useRef<SimulationEngine | null>(null);
  if (!engineRef.current || engineRef.current.getDimension() !== stateDimension) {
    engineRef.current = new SimulationEngine(stateDimension);
  }

  /** Gets the formula for ODEs. */
  const derivative = useMemo(() => {
    if (system.math.type !== "ode") return null;
    return system.math.getDerivative?.(params);
  }, [system, params]);

  /** Gets the formula for maps. */
  const nextStateFn = useMemo(() => {
    if (system.math.type !== "map") return null;
    return system.math.getNextState?.(params);
  }, [system, params]);

  /**  Static computation for Maps when parameters change. */
  useEffect(() => {
    if (system.math.type === "map" && nextStateFn && engineRef.current) {
      const initial = system.math.initialState || [0.1, 0.1, 0];
      const batch = engineRef.current.computeMapBatch(5000, initial, nextStateFn);
      setPoints(side, batch);
    }
  }, [system, nextStateFn, side, setPoints]);

  /**
   * If the user clicks 'Restart',  wipe out the math engine's memory to start over.
   */
  const storePoints = useSimulationStore((state) => state.sims[side].points);
  useEffect(() => {
    if (storePoints.length <= 1 && engineRef.current && system.math.type === "ode") {
      engineRef.current.clear();
    }
  }, [storePoints, system, side]);

  /** Runs on every frame to add draeing points. */
  useFrame((_state, delta) => {
    const realTimeSim = useSimulationStore.getState().sims[side];
    if (!realTimeSim) return;

    const { isPaused, speed, points: currentStorePoints } = realTimeSim;
    if (isPaused || !engineRef.current || currentStorePoints.length === 0) return;

    const lastPoint = currentStorePoints[currentStorePoints.length - 1];

    if (system.math.type === "ode" && derivative) {
      const newBatch = engineRef.current.step(lastPoint, delta, speed, derivative);
      if (newBatch.length > 0) {
        addPoints(side, newBatch);
      }
    }
  });

  const sim = useSimulationStore((state) => state.sims[side]);
  return { sim };
};
