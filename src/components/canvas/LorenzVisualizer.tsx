import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '@/store/useSimulationStore';
import type { Side } from '@/store/useSimulationStore';
import { rk4 } from '@/core/math/integrator';
import { lorenzDerivative } from '@/core/systems/lorenz';

interface LorenzVisualizerProps {
  side?: Side;
}

const LorenzVisualizer: React.FC<LorenzVisualizerProps> = ({ side = 'left' }) => {
  const sim = useSimulationStore((state) => state.sims[side]);
  const addPoint = useSimulationStore((state) => state.addPoint);
  
  const { params, points, isPaused, speed } = sim;
  const geometryRef = useRef<THREE.BufferGeometry>(null);

  // Derivative function based on current params
  const derivative = useMemo(() => lorenzDerivative(params), [params]);

  useFrame((_state, delta) => {
    if (isPaused) return;

    if (points.length === 0) return;

    const cappedDelta = Math.min(delta, 0.05);

    const lastPoint = points[points.length - 1];
    if (!lastPoint) return;

    const subSteps = 5;
    const dt = (cappedDelta * speed) / subSteps;
    
    let currentPoint = lastPoint;
    for (let i = 0; i < subSteps; i++) {
      currentPoint = rk4(currentPoint, 0, dt, derivative);
    }
    
    addPoint(side, currentPoint);
  });

  // Convert points to Three.js positions
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

    const lineObject = useMemo(() => new THREE.Line(), []);

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
    <primitive object={lineObject} frustumCulled={false}>
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

export default LorenzVisualizer;
