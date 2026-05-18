/**
 * @file SimulationVisualizerMap.tsx
 * @description Specialized visualizer for discrete-time dynamical systems (Maps).
 * Renders iterations as discrete points and includes a secondary time series projection.
 */

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useUIStore } from "@/stores/useUIStore";
import { useVisualsStore } from "@/stores/useVisualsStore";
import type { Side } from "@/stores/types/simulation.types";
import { SYSTEM_REGISTRY } from "@/core/systems";
import { useSimulationLoop } from "../../hooks/useSimulationLoop";

interface SimulationVisualizerMapProps {
  side?: Side;
}

const SimulationVisualizerMap: React.FC<SimulationVisualizerMapProps> = ({
  side = "left",
}) => {
  const { sim } = useSimulationLoop({ side });
  const theme = useUIStore((state) => state.theme);
  const visuals = useVisualsStore((state) => state.configs[side]);

  const { systemType, params, points } = sim;
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const timeSeriesGeometryRef = useRef<THREE.BufferGeometry>(null);

  /** 
   * Pre-compute point cloud positions and colors.
   * Maps use discrete points rather than lines to emphasize their non-continuous nature.
   */
  const { positions, colors, timeSeriesPositions } = useMemo(() => {
    if (points.length < 1) {
      return {
        positions: new Float32Array(0),
        colors: new Float32Array(0),
        timeSeriesPositions: new Float32Array(0),
      };
    }

    const system = SYSTEM_REGISTRY[systemType];
    const mapFn = system?.math.mapStateToPoint || ((s: any) => [s[0], s[1], 0]);

    const flatPositions = new Float32Array(points.length * 3);
    const flatColors = new Float32Array(points.length * 3);
    
    // Time series: X is time (iteration index), Y is the X-coordinate of the state
    const tsPositions = new Float32Array(points.length * 3);

    const colorStart = new THREE.Color(visuals.color);
    const colorEnd = new THREE.Color(visuals.colorEnd || visuals.color);
    const lAdjust = theme === "light" ? 0.7 : 1.0;

    for (let i = 0; i < points.length; i++) {
      const renderPoint = mapFn(points[i], params);
      const i3 = i * 3;

      flatPositions[i3] = renderPoint[0];
      flatPositions[i3 + 1] = renderPoint[1];
      flatPositions[i3 + 2] = 0;

      // Time series projection (bottom of the screen or separate)
      // Normalizing time to -50 to 50 range, and scaling state
      tsPositions[i3] = (i / points.length) * 100 - 50; 
      tsPositions[i3 + 1] = points[i][0] * 10 - 40; // Shift down
      tsPositions[i3 + 2] = 0;

      if (visuals.useGradient) {
        const t = i / (points.length - 1);
        const lerpedColor = new THREE.Color().copy(colorStart).lerp(colorEnd, t);
        flatColors[i3] = lerpedColor.r * lAdjust;
        flatColors[i3 + 1] = lerpedColor.g * lAdjust;
        flatColors[i3 + 2] = lerpedColor.b * lAdjust;
      } else {
        flatColors[i3] = colorStart.r * lAdjust;
        flatColors[i3 + 1] = colorStart.g * lAdjust;
        flatColors[i3 + 2] = colorStart.b * lAdjust;
      }
    }

    return { 
      positions: flatPositions, 
      colors: flatColors,
      timeSeriesPositions: tsPositions 
    };
  }, [points, visuals, systemType, params, theme]);

  /** Synchronize buffers with GPU */
  useEffect(() => {
    if (geometryRef.current && positions.length > 0) {
      geometryRef.current.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometryRef.current.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    }
    if (timeSeriesGeometryRef.current && timeSeriesPositions.length > 0) {
      timeSeriesGeometryRef.current.setAttribute("position", new THREE.BufferAttribute(timeSeriesPositions, 3));
      timeSeriesGeometryRef.current.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    }
  }, [positions, colors, timeSeriesPositions]);

  return (
    <group>
      {/* Main Map Attractor (Point Cloud) */}
      <points frustumCulled={false}>
        <bufferGeometry ref={geometryRef} />
        <pointsMaterial 
          vertexColors 
          size={0.2} 
          transparent 
          opacity={0.8} 
          sizeAttenuation={true}
        />
      </points>

      {/* Time Series Projection (Lower Section) */}
      <line frustumCulled={false} position={[0, -10, 0]}>
        <bufferGeometry ref={timeSeriesGeometryRef} />
        <lineBasicMaterial vertexColors transparent opacity={0.4} />
      </line>
    </group>
  );
};

export default SimulationVisualizerMap;
