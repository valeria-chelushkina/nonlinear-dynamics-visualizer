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

  const systemType = useSimulationStore((state) => state.sims[side].systemType);
  const params = useSimulationStore((state) => state.sims[side].params);
  const maxPoints = useSimulationStore((state) => state.sims[side].maxPoints);

  /** Persistent reference cache capturing the pure standalone math engine instance */
  const engineRef = useRef<SimulationEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new SimulationEngine(3, maxPoints);
  }

  /** Keep constraints synchronized */
  useEffect(() => {
    engineRef.current?.setMaxPoints(maxPoints);
  }, [maxPoints]);

  /** Memoized vector field derivative equations provider */
  const derivative = useMemo(() => {
    const system = SYSTEM_REGISTRY[systemType] || SYSTEM_REGISTRY["lorenz"];
    return system?.math.getDerivative(params);
  }, [systemType, params]);

  /**
   * Tracks historical array structures to catch manual user timeline events and synchronizes
   * the persistent calculation context variables cleanly.
   */
  const storePoints = useSimulationStore((state) => state.sims[side].points);
  useEffect(() => {
    if (storePoints.length <= 1 && engineRef.current) {
      engineRef.current.clear();
      if (storePoints.length === 1) {
        engineRef.current.init(storePoints[0]);
      }
    }
  }, [storePoints, systemType]);

  /** React Three Fiber Core Animation Tick Bridge */
  useFrame((_state, delta) => {
    const realTimeSim = useSimulationStore.getState().sims[side];
    if (!realTimeSim) return;

    const { isPaused, speed } = realTimeSim;
    if (isPaused || !derivative || !engineRef.current) return;

    const newBatch = engineRef.current.step(delta, speed, derivative);

    if (newBatch.length > 0) {
      addPoints(side, newBatch);
    }
  });

  const sim = useSimulationStore((state) => state.sims[side]);
  return { sim };
};
