/**
 * @file useSimulationLoop.ts
 * @description React Three Fiber lifecycle bridge hook that binds the numerical
 * calculation pipeline to the 3D graphics frame loop.
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
 * Custom React hook coordinating real-time mathematical integration iterations
 * within the continuous React Three Fiber requestAnimationFrame lifecycle.
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

  /** Persistent reference cache capturing the pure standalone math engine instance */
  const engineRef = useRef<SimulationEngine | null>(null);
  if (!engineRef.current || engineRef.current.getDimension() !== stateDimension) {
    engineRef.current = new SimulationEngine(stateDimension);
  }

  /** Memoized vector field derivative equations provider (for ODEs) */
  const derivative = useMemo(() => {
    if (system.math.type !== "ode") return null;
    return system.math.getDerivative?.(params);
  }, [system, params]);

  /** Memoized next state function (for Maps) */
  const nextStateFn = useMemo(() => {
    if (system.math.type !== "map") return null;
    return system.math.getNextState?.(params);
  }, [system, params]);

  /** 
   * Static computation for Maps when parameters change
   */
  useEffect(() => {
    if (system.math.type === "map" && nextStateFn && engineRef.current) {
      const initial = system.math.initialState || [0.1, 0.1, 0];
      const batch = engineRef.current.computeMapBatch(5000, initial, nextStateFn);
      setPoints(side, batch);
    }
  }, [system, nextStateFn, side, setPoints]);

  /**
   * Tracks historical array structures to catch manual user timeline events and synchronizes
   * the persistent calculation context variables cleanly.
   */
  const storePoints = useSimulationStore((state) => state.sims[side].points);
  useEffect(() => {
    if (storePoints.length <= 1 && engineRef.current && system.math.type === "ode") {
      engineRef.current.clear();
    }
  }, [storePoints, system, side]);

  /** React Three Fiber Core Animation Tick Bridge */
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
    } else if (system.math.type === "map" && nextStateFn) {
      // If not paused, we can still "evolve" the map if we want, 
      // but usually maps are viewed statically. 
      // For now, let's just keep it static as requested.
    }
  });

  const sim = useSimulationStore((state) => state.sims[side]);
  return { sim };
};
