import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '@/store/useSimulationStore';
import type { Side } from '@/store/useSimulationStore';
import { rk4 } from '@/core/math/integrator';
import { SYSTEM_REGISTRY } from '@/core/systems';

interface SimulationVisualizerProps {
  side?: Side;
}

const SimulationVisualizer: React.FC<SimulationVisualizerProps> = ({ side = 'left' }) => {
  const sim = useSimulationStore((state) => state.sims[side]);
  const addPoints = useSimulationStore((state) => state.addPoints);
  
  const { systemType, params, points, isPaused, speed } = sim;
  const geometryRef = useRef<THREE.BufferGeometry>(null);

  // Derivative function loaded from registry
  const derivative = useMemo(() => {
    const system = SYSTEM_REGISTRY[systemType] || SYSTEM_REGISTRY['lorenz']; // lorenz - standard model
    return system.getDerivative(params);
  }, [systemType, params]);

  useFrame((_state, delta) => {
    if (isPaused) return;
    if (points.length === 0) return;

    const lastPoint = points[points.length - 1];
    if (!lastPoint) return;

    // Fixed time step for stability and smoothness
    const dt = 0.01;
    // Calculate how many steps we need to take this frame based on delta and speed
    const totalTime = Math.min(delta, 0.1) * speed;
    const numSteps = Math.max(1, Math.floor(totalTime / dt));
    
    const newBatch: Vector3[] = [];
    let currentPoint = lastPoint;
    
    for (let i = 0; i < numSteps; i++) {
      currentPoint = rk4(currentPoint, 0, dt, derivative);
      newBatch.push(currentPoint);
    }
    
    addPoints(side, newBatch);
  });

  const positions = useMemo(() => {
    if (points.length < 2) return new Float32Array(0);

    const flatPositions = new Float32Array(points.length * 3);
    for (let i = 0; i < points.length; i++) {
      flatPositions[i * 3] = points[i][0];     
      flatPositions[i * 3 + 1] = points[i][2]; 
      flatPositions[i * 3 + 2] = points[i][1]; 
    }
    return flatPositions;
  }, [points]);

  useEffect(() => {
    if (geometryRef.current && positions.length > 0) {
      geometryRef.current.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
      );
      geometryRef.current.attributes.position.needsUpdate = true;
    }
  }, [positions]);

  if (points.length < 5) return null;

  return (
    <primitive object={new THREE.Line()} frustumCulled={false}>
      <bufferGeometry ref={geometryRef} />
      <lineBasicMaterial 
        color={side === 'left' ? "#00ffcc" : "#ff3e00"} 
        linewidth={1} 
        transparent 
        opacity={0.8}
      />
    </primitive>
  );
};

export default SimulationVisualizer;
