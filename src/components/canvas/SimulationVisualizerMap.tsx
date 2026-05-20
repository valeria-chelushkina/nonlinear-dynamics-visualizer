/**
 * @file SimulationVisualizerMap.tsx
 * @description Draws Map style simulations.
 * It shows: main simulation and a mini timeline graph underneath it.
 */

import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useUIStore } from "@/stores/useUIStore";
import { useVisualsStore } from "@/stores/useVisualsStore";
import type { Side } from "@/stores/types/simulation.types";
import { SYSTEM_REGISTRY } from "@/core/systems";
import { useSimulationLoop } from "../../hooks/useSimulationLoop";

interface SimulationVisualizerMapProps {
  side?: Side;
}

const ThreeLine = "line" as any;

const SimulationVisualizerMap = ({
  side = "left",
}: SimulationVisualizerMapProps) => {
  const { sim } = useSimulationLoop({ side });
  const theme = useUIStore((state) => state.theme);
  const visuals = useVisualsStore((state) => state.configs[side]);

  const { systemType, params, points } = sim;
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const timeSeriesGeometryRef = useRef<THREE.BufferGeometry>(null);

  /**  Pre-calculate all dot locations, colors and line coordinates. */
  const { positions, colors, sizes, timeSeriesPositions } = useMemo(() => {
    // If there is no data, return empty data blocks
    if (points.length < 1) {
      return {
        positions: new Float32Array(0),
        colors: new Float32Array(0),
        sizes: new Float32Array(0),
        timeSeriesPositions: new Float32Array(0),
      };
    }

    const system = SYSTEM_REGISTRY[systemType];
    const mapFn = system?.math.mapStateToPoint || ((s: any) => [s[0], s[1], 0]);

    const count = points.length;
    const flatPositions = new Float32Array(count * 3);
    const flatColors = new Float32Array(count * 3);
    const flatSizes = new Float32Array(count);

    // Coordinates for the mini timeline graph at the bottom (X = time, Y = simulation value)
    const tsPositions = new Float32Array(count * 3);

    const colorStart = new THREE.Color(visuals.color);
    const colorEnd = new THREE.Color(visuals.colorEnd || visuals.color);
    const lAdjust = theme === "light" ? 0.6 : 1.0;

    for (let i = 0; i < count; i++) {
      const renderPoint = mapFn(points[i], params);
      const i3 = i * 3;
      const t = i / (count - 1);

      flatPositions[i3] = renderPoint[0];
      flatPositions[i3 + 1] = renderPoint[1];
      flatPositions[i3 + 2] = 0;

      // Make the newest dots slightly larger
      flatSizes[i] = (0.5 + t * 1.5) * (theme === "light" ? 1.2 : 1.0);

      // Mini timeline graph
      tsPositions[i3] = (i / count) * 100 - 50;
      tsPositions[i3 + 1] = points[i][0] * 10 - 40;
      tsPositions[i3 + 2] = 0;

      // Blend from start color to end color
      const lerpedColor = new THREE.Color().copy(colorStart).lerp(colorEnd, t);

      if (theme === "dark") {
        lerpedColor.multiplyScalar(0.8 + t * 0.4);
      }

      flatColors[i3] = lerpedColor.r * lAdjust;
      flatColors[i3 + 1] = lerpedColor.g * lAdjust;
      flatColors[i3 + 2] = lerpedColor.b * lAdjust;
    }

    return {
      positions: flatPositions,
      colors: flatColors,
      sizes: flatSizes,
      timeSeriesPositions: tsPositions,
    };
  }, [points, visuals, systemType, params, theme]);

  /** Synchronize buffers with GPU */
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
      geometryRef.current.setAttribute(
        "size",
        new THREE.BufferAttribute(sizes, 1),
      );
    }
    if (timeSeriesGeometryRef.current && timeSeriesPositions.length > 0) {
      timeSeriesGeometryRef.current.setAttribute(
        "position",
        new THREE.BufferAttribute(timeSeriesPositions, 3),
      );
      timeSeriesGeometryRef.current.setAttribute(
        "color",
        new THREE.BufferAttribute(colors, 3),
      );
    }
  }, [positions, colors, sizes, timeSeriesPositions]);

  return (
    <group>
      {/* Main simulation */}
      <points frustumCulled={false}>
        <bufferGeometry ref={geometryRef} />
        <pointsMaterial
          vertexColors
          size={1}
          transparent
          opacity={theme === "light" ? 0.6 : 0.8}
          sizeAttenuation={true}
          blending={
            theme === "dark" ? THREE.AdditiveBlending : THREE.NormalBlending
          }
          depthWrite={false}
        />
      </points>

      {/* Time graph */}
      <ThreeLine frustumCulled={false} position={[0, -10, 0]}>
        <bufferGeometry ref={timeSeriesGeometryRef} />
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={theme === "light" ? 0.3 : 0.5}
          blending={
            theme === "dark" ? THREE.AdditiveBlending : THREE.NormalBlending
          }
        />
      </ThreeLine>
    </group>
  );
};

export default SimulationVisualizerMap;
