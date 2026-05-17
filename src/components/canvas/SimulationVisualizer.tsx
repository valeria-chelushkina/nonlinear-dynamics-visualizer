import React, { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSimulationStore } from "@/stores/useSimulationStore";
import { useUIStore } from "@/stores/useUIStore";
import { useVisualsStore } from "@/stores/useVisualsStore";
import type { Side } from "@/stores/useSimulationStore";
import type { StateVector } from "@/core/math/types";
import { rk4 } from "@/core/math/integrator";
import { SYSTEM_REGISTRY } from "@/core/systems";

interface SimulationVisualizerProps {
  side?: Side;
}

const ThreeLine = "line" as any;

const SimulationVisualizer: React.FC<SimulationVisualizerProps> = ({
  side = "left",
}) => {
  const sim = useSimulationStore((state) => state.sims[side]);
  const addPoints = useSimulationStore((state) => state.addPoints);
  const theme = useUIStore((state) => state.theme);
  const visuals = useVisualsStore((state) => state.configs[side]);

  const { systemType, params, points, isPaused, speed } = sim;
  const geometryRef = useRef<THREE.BufferGeometry>(null);

  // Derivative function loaded from registry
  const derivative = useMemo(() => {
    const system = SYSTEM_REGISTRY[systemType] || SYSTEM_REGISTRY["lorenz"];
    return system.getDerivative(params);
  }, [systemType, params]);

  useFrame((_state, delta) => {
    if (isPaused) return;
    if (points.length === 0) return;

    const lastPoint = points[points.length - 1];
    if (!lastPoint) return;

    const dt = 0.005;

    const stepsPerFrame = Math.max(1, Math.floor((delta * speed) / dt));

    const newBatch: StateVector[] = [];
    let currentPoint = lastPoint;

    for (let i = 0; i < stepsPerFrame; i++) {
      currentPoint = rk4(currentPoint, 0, dt, derivative);

      if (i % 2 === 0) {
        newBatch.push(currentPoint);
      }
    }

    addPoints(side, newBatch);
  });

  const { positions, colors } = useMemo(() => {
    if (points.length < 2)
      return { positions: new Float32Array(0), colors: new Float32Array(0) };

    const system = SYSTEM_REGISTRY[systemType];
    const mapFn = system?.mapStateToPoint || ((s: any) => [s[0], s[1], s[2]]);

    const flatPositions = new Float32Array(points.length * 3);
    const flatColors = new Float32Array(points.length * 3);

    const colorStart = new THREE.Color(visuals.color);
    const colorEnd = new THREE.Color(visuals.colorEnd || visuals.color);

    const lAdjust = theme === "light" ? 0.7 : 1.0;

    for (let i = 0; i < points.length; i++) {
      const renderPoint = mapFn(points[i], params);

      flatPositions[i * 3] = renderPoint[0];
      flatPositions[i * 3 + 1] = renderPoint[2];
      flatPositions[i * 3 + 2] = renderPoint[1];

      const baseColor = visuals.useGradient
        ? new THREE.Color()
            .copy(colorStart)
            .lerp(colorEnd, i / (points.length - 1))
        : colorStart;

      flatColors[i * 3] = baseColor.r * lAdjust;
      flatColors[i * 3 + 1] = baseColor.g * lAdjust;
      flatColors[i * 3 + 2] = baseColor.b * lAdjust;
    }
    return { positions: flatPositions, colors: flatColors };
  }, [points, visuals, systemType, params, theme]);

  useEffect(() => {
    if (geometryRef.current && positions.length > 0) {
      geometryRef.current.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );
      geometryRef.current.setAttribute(
        "color",
        new THREE.BufferAttribute(colors, 3),
      );
      geometryRef.current.attributes.position.needsUpdate = true;
      geometryRef.current.attributes.color.needsUpdate = true;
    }
  }, [positions, colors]);

  if (points.length < 5) return null;

  return (
    <group>
      <ThreeLine frustumCulled={false}>
        <bufferGeometry ref={geometryRef} />
        <lineBasicMaterial
          vertexColors
          linewidth={1}
          transparent
          opacity={0.8}
          toneMapped={false}
        />
      </ThreeLine>
    </group>
  );
};

export default SimulationVisualizer;
