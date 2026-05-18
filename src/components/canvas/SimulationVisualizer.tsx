/**
 * @file SimulationVisualizer.tsx
 * @description 3D WebGL simulation visualizer component
 * Translates multidimensional mathematical state vectors into an interactive 3D trail.
 */

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useUIStore } from "@/stores/useUIStore";
import { useVisualsStore } from "@/stores/useVisualsStore";
import type { Side } from "@/stores/useSimulationStore";
import { SYSTEM_REGISTRY } from "@/core/systems";
import { useSimulationLoop } from "./useSimulationLoop";

interface SimulationVisualizerProps {
  side?: Side;
}

// Bypassing strict JSX intrinsic typing for Three.js primitive element declarations
const ThreeLine = "line" as any;

const SimulationVisualizer: React.FC<SimulationVisualizerProps> = ({
  side = "left",
}) => {
  // Drives the math evaluation pipeline step-by-step per frame tick
  const { sim } = useSimulationLoop({ side });

  const theme = useUIStore((state) => state.theme);
  const visuals = useVisualsStore((state) => state.configs[side]);

  const { systemType, params, points } = sim;
  const geometryRef = useRef<THREE.BufferGeometry>(null);

  /** Map state vectors into flat WebGL arrays. Generates position tracking data and evaluates color interpolations */
  const { positions, colors } = useMemo(() => {
    if (points.length < 2) {
      return { positions: new Float32Array(0), colors: new Float32Array(0) };
    }

    const system = SYSTEM_REGISTRY[systemType];
    const mapFn = system?.mapStateToPoint || ((s: any) => [s[0], s[1], s[2]]);

    const flatPositions = new Float32Array(points.length * 3);
    const flatColors = new Float32Array(points.length * 3);

    const colorStart = new THREE.Color(visuals.color);
    const colorEnd = new THREE.Color(visuals.colorEnd || visuals.color);
    const lAdjust = theme === "light" ? 0.7 : 1.0;

    for (let i = 0; i < points.length; i++) {
      const renderPoint = mapFn(points[i], params);

      // Re-map axes cleanly across the WebGL viewing plane
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

  /** Re-binds freshly calculated vertices directly onto the active BufferGeometry attributes */
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

  if (points.length < 2) return null;

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
