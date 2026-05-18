/**
 * @file SimulationVisualizer2D.tsx
 * @description 2D projection & mechanical visualizer component
 * Flattens 3D vector trajectories onto a 2D plane and handles physical
 * geometry overlays for classical mechanics models.
 */

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useUIStore } from "@/stores/useUIStore";
import { useVisualsStore } from "@/stores/useVisualsStore";
import type { Side } from "@/stores/useSimulationStore";
import { SYSTEM_REGISTRY } from "@/core/systems";
import { useSimulationLoop } from "../../hooks/useSimulationLoop";

interface SimulationVisualizer2DProps {
  side?: Side;
}

const ThreeLine = "line" as any;

const SimulationVisualizer2D: React.FC<SimulationVisualizer2DProps> = ({
  side = "left",
}) => {
  const { sim } = useSimulationLoop({ side });

  const theme = useUIStore((state) => state.theme);
  const visuals = useVisualsStore((state) => state.configs[side]);

  const { systemType, params, points } = sim;
  const geometryRef = useRef<THREE.BufferGeometry>(null);

  const systemColor = theme === "dark" ? "#ffffff" : "#1a1a1a";

  /** Flatten multi-axis coordinates onto a static 2D plane while computing localized color trail progressions */
  const { positions, colors, lastState } = useMemo(() => {
    if (points.length < 2) {
      return {
        positions: new Float32Array(0),
        colors: new Float32Array(0),
        lastState: points[0],
      };
    }

    const system = SYSTEM_REGISTRY[systemType];
    const mapFn = system?.math.mapStateToPoint || ((s: any) => [s[0], s[1], 0]);

    const flatPositions = new Float32Array(points.length * 3);
    const flatColors = new Float32Array(points.length * 3);

    const colorStart = new THREE.Color(visuals.color);
    const colorEnd = new THREE.Color(visuals.colorEnd || visuals.color);

    for (let i = 0; i < points.length; i++) {
      const renderPoint = mapFn(points[i], params);

      flatPositions[i * 3] = renderPoint[0];
      flatPositions[i * 3 + 1] = renderPoint[1];
      flatPositions[i * 3 + 2] = 0; // Fixed flat Z depth

      if (visuals.useGradient) {
        const t = i / (points.length - 1);
        const lerpedColor = new THREE.Color()
          .copy(colorStart)
          .lerp(colorEnd, t);
        flatColors[i * 3] = lerpedColor.r;
        flatColors[i * 3 + 1] = lerpedColor.g;
        flatColors[i * 3 + 2] = lerpedColor.b;
      } else {
        flatColors[i * 3] = colorStart.r;
        flatColors[i * 3 + 1] = colorStart.g;
        flatColors[i * 3 + 2] = colorStart.b;
      }
    }
    return {
      positions: flatPositions,
      colors: flatColors,
      lastState: points[points.length - 1],
    };
  }, [points, visuals, systemType, params, theme]);

  /** Bind flat coordinates straight onto the GPU vertex registry */
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

  /** Maps current angular velocities and displacements to real-world geometric layout fields for multi-joint linkages */
  const pendulumParts = useMemo(() => {
    if (systemType !== "double-pendulum" || !lastState) return null;
    const [th1, th2] = lastState;
    const { l1, l2 } = params;

    // Trig transformations determining real positions of joints relative to the anchor mount point
    const x1 = l1 * Math.sin(th1);
    const y1 = -l1 * Math.cos(th1) + 25;
    const x2 = x1 + l2 * Math.sin(th2);
    const y2 = y1 - l2 * Math.cos(th2);

    const p0 = new THREE.Vector3(0, 25, 0.2);
    const p1 = new THREE.Vector3(x1, y1, 0.2);
    const p2 = new THREE.Vector3(x2, y2, 0.2);

    // Calculate rotation transformations and length scales for linkage rods
    const center1 = new THREE.Vector3().addVectors(p0, p1).multiplyScalar(0.5);
    const length1 = p0.distanceTo(p1);
    const angle1 = Math.atan2(y1 - p0.y, x1 - p0.x);

    const center2 = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    const length2 = p1.distanceTo(p2);
    const angle2 = Math.atan2(y2 - p1.y, x2 - p1.x);

    return {
      p0,
      p1,
      p2,
      rod1: { position: center1, length: length1, rotation: angle1 },
      rod2: { position: center2, length: length2, rotation: angle2 },
    };
  }, [systemType, lastState, params]);

  return (
    <group>
      {/* Structural system trail line */}
      <ThreeLine frustumCulled={false}>
        <bufferGeometry ref={geometryRef} />
        <lineBasicMaterial vertexColors transparent opacity={0.6} />
      </ThreeLine>

      {/* Conditional mechanical rig layout overlay */}
      {pendulumParts && (
        <>
          {/* Rod 1 */}
          <mesh
            position={pendulumParts.rod1.position}
            rotation={[0, 0, pendulumParts.rod1.rotation]}
          >
            <planeGeometry args={[pendulumParts.rod1.length, 0.4]} />
            <meshBasicMaterial
              color={systemColor}
              transparent
              opacity={0.8}
              toneMapped={false}
            />
          </mesh>

          {/* Rod 2 */}
          <mesh
            position={pendulumParts.rod2.position}
            rotation={[0, 0, pendulumParts.rod2.rotation]}
          >
            <planeGeometry args={[pendulumParts.rod2.length, 0.4]} />
            <meshBasicMaterial
              color={systemColor}
              transparent
              opacity={0.8}
              toneMapped={false}
            />
          </mesh>

          {/* Joints & Weights Bobs */}
          <mesh position={pendulumParts.p1}>
            <circleGeometry args={[1, 32]} />
            <meshBasicMaterial color={systemColor} toneMapped={false} />
          </mesh>
          <mesh position={pendulumParts.p2}>
            <circleGeometry args={[1.5, 32]} />
            <meshBasicMaterial color={visuals.color} />
          </mesh>

          {/* Core fixed mount pivot */}
          <mesh position={pendulumParts.p0}>
            <circleGeometry args={[0.5, 32]} />
            <meshBasicMaterial color="#888" toneMapped={false} />
          </mesh>
        </>
      )}
    </group>
  );
};

export default SimulationVisualizer2D;
