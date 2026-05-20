/**
 * @file SimulationVisualizer.tsx
 * @description Optimized 3D WebGL simulation visualizer component.
 */

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useUIStore } from "@/stores/useUIStore";
import { useVisualsStore } from "@/stores/useVisualsStore";
import type { Side } from "@/stores/types/simulation.types";
import { SYSTEM_REGISTRY } from "@/core/systems";
import { CoordinateTransformer } from "@/core/utils/coordinateTransformer";
import { useSimulationLoop } from "../../hooks/useSimulationLoop";

interface SimulationVisualizerProps {
  side?: Side;
}

const ThreeLine = "line" as any;

const SimulationVisualizer: React.FC<SimulationVisualizerProps> = ({
  side = "left",
}) => {
  const { sim } = useSimulationLoop({ side });
  const theme = useUIStore((state) => state.theme);
  const visuals = useVisualsStore((state) => state.configs[side]);

  const { systemType, params, points, maxPoints } = sim;

  const geometryRef = useRef<THREE.BufferGeometry>(null);

  // Pre-allocated memory arrays to hold position and color data without lag
  const positionsRef = useRef<Float32Array | null>(null);
  const colorsRef = useRef<Float32Array | null>(null);
  const lastUploadedCountRef = useRef<number>(0);
  const currentCapacityRef = useRef<number>(0);

  // Pre-allocated memory arrays to hold position and color data without lag
  if (!positionsRef.current || currentCapacityRef.current !== maxPoints) {
    positionsRef.current = new Float32Array(maxPoints * 3);
    colorsRef.current = new Float32Array(maxPoints * 3);
    currentCapacityRef.current = maxPoints;
    lastUploadedCountRef.current = 0; // forces complete baseline redraw on capacity change
  }

  /** Only sends new points to the GPU instead of rebuilding the whole line. */
  useEffect(() => {
    const geometry = geometryRef.current;
    if (!geometry) return;

    const currentCount = Math.min(points.length, maxPoints);

    // Reset tracker if the simulation was cleared or restarted
    if (currentCount < lastUploadedCountRef.current || currentCount <= 1) {
      lastUploadedCountRef.current = 0;
    }

    // Don't draw anything if there aren't enough points to connect a line
    if (currentCount < 2) {
      geometry.setDrawRange(0, 0);
      return;
    }

    const system = SYSTEM_REGISTRY[systemType];
    const mapFn =
      system?.math.mapStateToPoint || ((s: any) => [s[0], s[1], s[2]]);

    const posArr = positionsRef.current!;
    const colArr = colorsRef.current!;

    const colorStart = new THREE.Color(visuals.color);
    const colorEnd = new THREE.Color(visuals.colorEnd || visuals.color);
    const lAdjust = theme === "light" ? 0.7 : 1.0;

    const isSaturatedWindow = currentCount >= maxPoints;
    const startIdx = isSaturatedWindow ? 0 : lastUploadedCountRef.current;

    // Convert raw math points into 3D graphics coordinates
    for (let i = startIdx; i < currentCount; i++) {
      const rawMathPoint = mapFn(points[i], params);
      const threeSpacePoint = CoordinateTransformer.toThreeSpace(rawMathPoint);
      const i3 = i * 3;

      posArr[i3] = threeSpacePoint[0];
      posArr[i3 + 1] = threeSpacePoint[1];
      posArr[i3 + 2] = threeSpacePoint[2];
    }

    // Handle custom gradients or solid lines
    if (visuals.useGradient) {
      for (let i = 0; i < currentCount; i++) {
        const i3 = i * 3;
        const baseColor = new THREE.Color()
          .copy(colorStart)
          .lerp(colorEnd, i / (currentCount - 1));

        colArr[i3] = baseColor.r * lAdjust;
        colArr[i3 + 1] = baseColor.g * lAdjust;
        colArr[i3 + 2] = baseColor.b * lAdjust;
      }
    } else {
      for (let i = startIdx; i < currentCount; i++) {
        const i3 = i * 3;
        colArr[i3] = colorStart.r * lAdjust;
        colArr[i3 + 1] = colorStart.g * lAdjust;
        colArr[i3 + 2] = colorStart.b * lAdjust;
      }
    }

    // Bind pre-allocated memory blocks directly to Three.js geometry attributes
    let posAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
    let colAttr = geometry.getAttribute("color") as THREE.BufferAttribute;

    const needsRebind = !posAttr || posAttr.array !== posArr;

    if (needsRebind) {
      posAttr = new THREE.BufferAttribute(posArr, 3);
      colAttr = new THREE.BufferAttribute(colArr, 3);
      geometry.setAttribute("position", posAttr);
      geometry.setAttribute("color", colAttr);
    }

    // Tell the GPU exactly which range of points changed so it only updates what is necessary
    posAttr.needsUpdate = true;
    posAttr.updateRanges = [];

    if (!isSaturatedWindow && startIdx < currentCount) {
      posAttr.updateRanges.push({
        start: startIdx * 3,
        count: (currentCount - startIdx) * 3,
      });
    } else {
      posAttr.updateRanges.push({ 
        start: 0, 
        count: currentCount * 3 
      });
    }

    colAttr.needsUpdate = true;
    colAttr.updateRanges = [];

    if (visuals.useGradient || isSaturatedWindow) {
      colAttr.updateRanges.push({ 
        start: 0, 
        count: currentCount * 3 
      });
    } else {
      colAttr.updateRanges.push({
        start: startIdx * 3,
        count: (currentCount - startIdx) * 3,
      });
    }

    // Update drawing size boundaries and spatial volume spheres for proper camera viewing
    geometry.setDrawRange(0, currentCount);
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    lastUploadedCountRef.current = currentCount;
  }, [points, visuals, systemType, params, theme, maxPoints]);

  // Prevent crashes or empty renderings if there is no path data yet
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
