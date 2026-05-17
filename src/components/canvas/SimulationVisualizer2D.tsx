import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '@/store/useSimulationStore';
import type { Side } from '@/store/useSimulationStore';
import type { StateVector } from '@/core/math/types';
import { rk4 } from '@/core/math/integrator';
import { SYSTEM_REGISTRY } from '@/core/systems';

interface SimulationVisualizer2DProps {
  side?: Side;
}

const ThreeLine = 'line' as any;

const SimulationVisualizer2D: React.FC<SimulationVisualizer2DProps> = ({ side = 'left' }) => {
  const sim = useSimulationStore((state) => state.sims[side]);
  const addPoints = useSimulationStore((state) => state.addPoints);
  
  const { systemType, params, points, isPaused, speed, visuals } = sim;
  const geometryRef = useRef<THREE.BufferGeometry>(null);

  const derivative = useMemo(() => {
    const system = SYSTEM_REGISTRY[systemType];
    return system?.getDerivative(params);
  }, [systemType, params]);

  useFrame((_state, delta) => {
    if (isPaused || !derivative) return;
    if (points.length === 0) return;

    const lastPoint = points[points.length - 1];
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

  const { positions, colors, lastState } = useMemo(() => {
    if (points.length < 2) return { positions: new Float32Array(0), colors: new Float32Array(0), lastState: points[0] };

    const system = SYSTEM_REGISTRY[systemType];
    const mapFn = system?.mapStateToPoint || ((s: any) => [s[0], s[1], 0]);

    const flatPositions = new Float32Array(points.length * 3);
    const flatColors = new Float32Array(points.length * 3);

    const colorStart = new THREE.Color(visuals.color);
    const colorEnd = new THREE.Color(visuals.colorEnd || visuals.color);

    for (let i = 0; i < points.length; i++) {
      const renderPoint = mapFn(points[i], params);
      
      // Render in X-Y plane for 2D
      flatPositions[i * 3] = renderPoint[0];     
      flatPositions[i * 3 + 1] = renderPoint[1]; 
      flatPositions[i * 3 + 2] = 0; 

      if (visuals.useGradient) {
        const t = i / (points.length - 1);
        const lerpedColor = new THREE.Color().copy(colorStart).lerp(colorEnd, t);
        flatColors[i * 3] = lerpedColor.r;
        flatColors[i * 3 + 1] = lerpedColor.g;
        flatColors[i * 3 + 2] = lerpedColor.b;
      } else {
        flatColors[i * 3] = colorStart.r;
        flatColors[i * 3 + 1] = colorStart.g;
        flatColors[i * 3 + 2] = colorStart.b;
      }
    }
    return { positions: flatPositions, colors: flatColors, lastState: points[points.length - 1] };
  }, [points, visuals, systemType, params]);

  useEffect(() => {
    if (geometryRef.current && positions.length > 0) {
      geometryRef.current.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometryRef.current.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometryRef.current.attributes.position.needsUpdate = true;
      geometryRef.current.attributes.color.needsUpdate = true;
    }
  }, [positions, colors]);

  const pendulumParts = useMemo(() => {
    if (systemType !== 'double-pendulum' || !lastState) return null;
    const [th1, th2] = lastState;
    const { l1, l2 } = params;

    const x1 = l1 * Math.sin(th1);
    const y1 = -l1 * Math.cos(th1) + 25; 
    const x2 = x1 + l2 * Math.sin(th2);
    const y2 = y1 - l2 * Math.cos(th2);

    const p0 = new THREE.Vector3(0, 25, 0.2);
    const p1 = new THREE.Vector3(x1, y1, 0.2);
    const p2 = new THREE.Vector3(x2, y2, 0.2);

    // Calculate center, length and rotation for rod 1
    const center1 = new THREE.Vector3().addVectors(p0, p1).multiplyScalar(0.5);
    const length1 = p0.distanceTo(p1);
    const angle1 = Math.atan2(p1.y - p0.y, p1.x - p0.x);

    // Calculate center, length and rotation for rod 2
    const center2 = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    const length2 = p1.distanceTo(p2);
    const angle2 = Math.atan2(p2.y - p1.y, p2.x - p1.x);

    return {
      p0, p1, p2,
      rod1: { position: center1, length: length1, rotation: angle1 },
      rod2: { position: center2, length: length2, rotation: angle2 }
    };
  }, [systemType, lastState, params]);

  return (
    <group>
      {/* Trail */}
      <ThreeLine frustumCulled={false}>
        <bufferGeometry ref={geometryRef} />
        <lineBasicMaterial vertexColors transparent opacity={0.6} />
      </ThreeLine>

      {/* Double Pendulum Specifics */}
      {pendulumParts && (
        <>
          {/* Rod 1 */}
          <mesh 
            position={pendulumParts.rod1.position} 
            rotation={[0, 0, pendulumParts.rod1.rotation]}
          >
            <planeGeometry args={[pendulumParts.rod1.length, 0.4]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
          </mesh>
          
          {/* Rod 2 */}
          <mesh 
            position={pendulumParts.rod2.position} 
            rotation={[0, 0, pendulumParts.rod2.rotation]}
          >
            <planeGeometry args={[pendulumParts.rod2.length, 0.4]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
          </mesh>
          
          {/* Bobs */}
          <mesh position={pendulumParts.p1}>
            <circleGeometry args={[1, 32]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={pendulumParts.p2}>
            <circleGeometry args={[1.5, 32]} />
            <meshBasicMaterial color={visuals.color} />
          </mesh>
          
          {/* Pivot */}
          <mesh position={pendulumParts.p0}>
            <circleGeometry args={[0.5, 32]} />
            <meshBasicMaterial color="#888" />
          </mesh>
        </>
      )}
    </group>
  );
};

export default SimulationVisualizer2D;
