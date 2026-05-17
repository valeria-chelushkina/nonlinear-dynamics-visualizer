import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '@/store/useSimulationStore';
import type { Side } from '@/store/useSimulationStore';
import type { StateVector } from '@/core/math/types';
import { rk4 } from '@/core/math/integrator';
import { SYSTEM_REGISTRY } from '@/core/systems';

interface SimulationVisualizerProps {
  side?: Side;
}

const ThreeLine = 'line' as any;

const SimulationVisualizer: React.FC<SimulationVisualizerProps> = ({ side = 'left' }) => {
  const sim = useSimulationStore((state) => state.sims[side]);
  const addPoints = useSimulationStore((state) => state.addPoints);
  
  const { systemType, params, points, isPaused, speed, visuals } = sim;
  const geometryRef = useRef<THREE.BufferGeometry>(null);

  // Derivative function loaded from registry
  const derivative = useMemo(() => {
    const system = SYSTEM_REGISTRY[systemType] || SYSTEM_REGISTRY['lorenz'];
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
    if (points.length < 2) return { positions: new Float32Array(0), colors: new Float32Array(0) };

    const system = SYSTEM_REGISTRY[systemType];
    const mapFn = system?.mapStateToPoint || ((s: any) => [s[0], s[1], s[2]]);

    const flatPositions = new Float32Array(points.length * 3);
    const flatColors = new Float32Array(points.length * 3);

    const colorStart = new THREE.Color(visuals.color);
    const colorEnd = new THREE.Color(visuals.colorEnd || visuals.color);

    for (let i = 0; i < points.length; i++) {
      const renderPoint = mapFn(points[i], params);
      
      // Standard 3D mapping: X->X, Y->Z, Z->Y (to have Z as up in equations but Y as up in Three.js)
      // or just trust mapFn to return Vector3 [x, y, z] and we decide where they go.
      // The previous logic was: X->0, Y->2, Z->1.
      flatPositions[i * 3] = renderPoint[0];     
      flatPositions[i * 3 + 1] = renderPoint[2]; 
      flatPositions[i * 3 + 2] = renderPoint[1]; 

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
    return { positions: flatPositions, colors: flatColors };
  }, [points, visuals, systemType, params]);

  useEffect(() => {
    if (geometryRef.current && positions.length > 0) {
      geometryRef.current.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
      );
      geometryRef.current.setAttribute(
        'color',
        new THREE.BufferAttribute(colors, 3)
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
          linewidth={visuals.isNeon ? 2 : 1} 
          transparent 
          opacity={visuals.isNeon ? 1 : 0.8}
          toneMapped={false} 
        />
      </ThreeLine>
      {visuals.isNeon && (
        <ThreeLine frustumCulled={false}>
          <bufferGeometry ref={geometryRef} />
          <lineBasicMaterial 
            vertexColors
            linewidth={4} 
            transparent 
            opacity={0.3}
            toneMapped={false}
          />
        </ThreeLine>
      )}
    </group>
  );
};

export default SimulationVisualizer;
