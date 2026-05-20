/**
 * @file SimulationVisualizer2D.tsx
 * @description Draws 2D physics simulations, like a double pendulum.
 * Flattens 3D paths onto a flat 2D plane and draws mechanical rods and hinges.
 */

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useUIStore } from "@/stores/useUIStore";
import { useVisualsStore } from "@/stores/useVisualsStore";
import type { Side } from "@/stores/types/simulation.types";
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

  const { systemType, params, points, maxPoints } = sim;
  const geometryRef = useRef<THREE.BufferGeometry>(null);

  // References to the individual pendulum rods and circular joints
  const rod1Ref = useRef<THREE.Mesh>(null);
  const rod2Ref = useRef<THREE.Mesh>(null);
  const joint1Ref = useRef<THREE.Mesh>(null);
  const joint2Ref = useRef<THREE.Mesh>(null);
  const mountRef = useRef<THREE.Mesh>(null);

  // Pre-allocated memory arrays to hold position and color data without lag
  const positionsRef = useRef<Float32Array | null>(null);
  const colorsRef = useRef<Float32Array | null>(null);
  const lastUploadedCountRef = useRef<number>(0);
  const currentCapacityRef = useRef<number>(0);

  const systemColor = theme === "dark" ? "#ffffff" : "#1a1a1a";

  // If the arrays haven't been created yet or the max limit changed, allocate memory once
  if (!positionsRef.current || currentCapacityRef.current !== maxPoints) {
    positionsRef.current = new Float32Array(maxPoints * 3);
    colorsRef.current = new Float32Array(maxPoints * 3);
    currentCapacityRef.current = maxPoints;
    lastUploadedCountRef.current = 0;
  }

  /** Only sends new points to the GPU instead of rebuilding the whole line trail. */
  useEffect(() => {
    const geometry = geometryRef.current;
    if (!geometry) return;

    const currentCount = points.length;

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
    const mapFn = system?.math.mapStateToPoint || ((s: any) => [s[0], s[1], 0]);

    const posArr = positionsRef.current!;
    const colArr = colorsRef.current!;

    const colorStart = new THREE.Color(visuals.color);
    const colorEnd = new THREE.Color(visuals.colorEnd || visuals.color);

    const isSaturatedWindow = currentCount >= maxPoints;
    const startIdx = isSaturatedWindow ? 0 : lastUploadedCountRef.current;

    // Convert raw math points into flat 2D coordinates (Z = 0)
    for (let i = startIdx; i < currentCount; i++) {
      const renderPoint = mapFn(points[i], params);
      const i3 = i * 3;

      posArr[i3] = renderPoint[0];
      posArr[i3 + 1] = renderPoint[1];
      posArr[i3 + 2] = 0;
    }

    // Handles custom gradients or solid lines
    if (visuals.useGradient) {
      for (let i = 0; i < currentCount; i++) {
        const i3 = i * 3;
        const baseColor = new THREE.Color()
          .copy(colorStart)
          .lerp(colorEnd, i / (currentCount - 1));

        colArr[i3] = baseColor.r;
        colArr[i3 + 1] = baseColor.g;
        colArr[i3 + 2] = baseColor.b;
      }
    } else {
      for (let i = startIdx; i < currentCount; i++) {
        const i3 = i * 3;
        colArr[i3] = colorStart.r;
        colArr[i3 + 1] = colorStart.g;
        colArr[i3 + 2] = colorStart.b;
      }
    }

    let posAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
    let colAttr = geometry.getAttribute("color") as THREE.BufferAttribute;

    if (!posAttr) {
      posAttr = new THREE.BufferAttribute(posArr, 3);
      colAttr = new THREE.BufferAttribute(colArr, 3);
      geometry.setAttribute("position", posAttr);
      geometry.setAttribute("color", colAttr);
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    geometry.setDrawRange(0, currentCount);
    lastUploadedCountRef.current = currentCount;
  }, [points, visuals, systemType, params, theme, maxPoints]);

  /** Smooth frame-by-frame updates for the moving mechanical pieces. */
  useFrame(() => {
    // If aren't displaying a double pendulum, hide the mechanical rods and exit
    if (systemType !== "double-pendulum" || points.length === 0) {
      if (rod1Ref.current) rod1Ref.current.visible = false;
      if (rod2Ref.current) rod2Ref.current.visible = false;
      if (joint1Ref.current) joint1Ref.current.visible = false;
      if (joint2Ref.current) joint2Ref.current.visible = false;
      if (mountRef.current) mountRef.current.visible = false;
      return;
    }

    const lastState = points[points.length - 1];
    const [th1, th2] = lastState;
    const { l1, l2 } = params;

    // Trigonometry to find exactly where the joints are in 2D space
    const x1 = l1 * Math.sin(th1);
    const y1 = -l1 * Math.cos(th1) + 25;
    const x2 = x1 + l2 * Math.sin(th2);
    const y2 = y1 - l2 * Math.cos(th2);

    const p0 = new THREE.Vector3(0, 25, 0.2);
    const p1 = new THREE.Vector3(x1, y1, 0.2);
    const p2 = new THREE.Vector3(x2, y2, 0.2);

    if (mountRef.current) {
      mountRef.current.visible = true;
      mountRef.current.position.copy(p0);
    }

    if (joint1Ref.current) {
      joint1Ref.current.visible = true;
      joint1Ref.current.position.copy(p1);
      (joint1Ref.current.material as THREE.MeshBasicMaterial).color.set(systemColor);
    }

    if (joint2Ref.current) {
      joint2Ref.current.visible = true;
      joint2Ref.current.position.copy(p2);
      (joint2Ref.current.material as THREE.MeshBasicMaterial).color.set(visuals.color);
    }

    if (rod1Ref.current) {
      rod1Ref.current.visible = true;
      const center = new THREE.Vector3().addVectors(p0, p1).multiplyScalar(0.5);
      const length = p0.distanceTo(p1);
      const angle = Math.atan2(y1 - p0.y, x1 - p0.x);
      
      rod1Ref.current.position.copy(center);
      rod1Ref.current.rotation.z = angle;
      rod1Ref.current.scale.x = length;
      (rod1Ref.current.material as THREE.MeshBasicMaterial).color.set(systemColor);
    }

    if (rod2Ref.current) {
      rod2Ref.current.visible = true;
      const center = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const length = p1.distanceTo(p2);
      const angle = Math.atan2(y2 - p1.y, x2 - p1.x);

      rod2Ref.current.position.copy(center);
      rod2Ref.current.rotation.z = angle;
      rod2Ref.current.scale.x = length;
      (rod2Ref.current.material as THREE.MeshBasicMaterial).color.set(systemColor);
    }
  });

  return (
    <group>
      <ThreeLine frustumCulled={false}>
        <bufferGeometry ref={geometryRef} />
        <lineBasicMaterial vertexColors transparent opacity={0.6} />
      </ThreeLine>

      <mesh ref={rod1Ref} visible={false}>
        <planeGeometry args={[1, 0.4]} />
        <meshBasicMaterial transparent opacity={0.8} toneMapped={false} />
      </mesh>

      <mesh ref={rod2Ref} visible={false}>
        <planeGeometry args={[1, 0.4]} />
        <meshBasicMaterial transparent opacity={0.8} toneMapped={false} />
      </mesh>

      <mesh ref={joint1Ref} visible={false}>
        <circleGeometry args={[1, 32]} />
        <meshBasicMaterial toneMapped={false} />
      </mesh>

      <mesh ref={joint2Ref} visible={false}>
        <circleGeometry args={[1.5, 32]} />
        <meshBasicMaterial />
      </mesh>

      <mesh ref={mountRef} visible={false}>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial color="#888" toneMapped={false} />
      </mesh>
    </group>
  );
};

export default SimulationVisualizer2D;
