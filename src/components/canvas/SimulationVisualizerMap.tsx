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

const ThreeLine = "line" as any;

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
  const { positions, colors, sizes, timeSeriesPositions } = useMemo(() => {
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
    
    // Time series: X is time (iteration index), Y is the X-coordinate of the state
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

      // Dynamic sizing: newer points are slightly larger
      flatSizes[i] = (0.5 + t * 1.5) * (theme === "light" ? 1.2 : 1.0);

      // Time series projection
      tsPositions[i3] = (i / count) * 100 - 50; 
      tsPositions[i3 + 1] = points[i][0] * 10 - 40;
      tsPositions[i3 + 2] = 0;

      // Enhanced coloring: lerp with a slight brightness boost for newer points
      const lerpedColor = new THREE.Color().copy(colorStart).lerp(colorEnd, t);
      
      if (theme === "dark") {
        // Boost vibrancy in dark mode for a "glowing" effect
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
      timeSeriesPositions: tsPositions 
    };
  }, [points, visuals, systemType, params, theme]);

  /** Synchronize buffers with GPU */
  useEffect(() => {
    if (geometryRef.current && positions.length > 0) {
      geometryRef.current.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometryRef.current.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      geometryRef.current.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    }
    if (timeSeriesGeometryRef.current && timeSeriesPositions.length > 0) {
      timeSeriesGeometryRef.current.setAttribute("position", new THREE.BufferAttribute(timeSeriesPositions, 3));
      timeSeriesGeometryRef.current.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    }
  }, [positions, colors, sizes, timeSeriesPositions]);

  return (
    <group>
      {/* Main Map Attractor (Point Cloud) */}
      <points frustumCulled={false}>
        <bufferGeometry ref={geometryRef} />
        <pointsMaterial 
          vertexColors 
          size={1} // Base size, multiplied by 'size' attribute if using a custom shader, 
                   // but for pointsMaterial it's a fixed size unless we use a shader.
                   // Since we want dynamic sizes without a custom shader easily, 
                   // we'll stick to a nice looking fixed size with a glow texture.
          transparent 
          opacity={theme === "light" ? 0.6 : 0.8} 
          sizeAttenuation={true}
          blending={theme === "dark" ? THREE.AdditiveBlending : THREE.NormalBlending}
          depthWrite={false}
        />
      </points>

      {/* Time Series Projection (Lower Section) */}
      <ThreeLine frustumCulled={false} position={[0, -10, 0]}>
        <bufferGeometry ref={timeSeriesGeometryRef} />
        <lineBasicMaterial 
          vertexColors 
          transparent 
          opacity={theme === "light" ? 0.3 : 0.5} 
          blending={theme === "dark" ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </ThreeLine>
    </group>
  );
};

export default SimulationVisualizerMap;
