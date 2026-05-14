import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '@/store/useSimulationStore';
import { rk4 } from '@/core/math/integrator';
import { lorenzDerivative } from '@/core/systems/lorenz';

const LorenzVisualizer: React.FC = () => {
  const { params, points, addPoint, isPaused, speed } = useSimulationStore();
  const lineRef = useRef<THREE.Line>(null);

  // Derivative function based on current params
  const derivative = useMemo(() => lorenzDerivative(params), [params]);

  useFrame((_state, delta) => {
    if (isPaused) return;

    // If points were reset - wait one frame
    if(points.length < 1) return;

    // Simulation step
    const lastPoint = points[points.length - 1];

    if(!lastPoint) return;

    // Run multiple sub-steps per frame for better stability or speed
    const subSteps = 5;
    const dt = (delta * speed) / subSteps;
    
    let currentPoint = lastPoint;
    for (let i = 0; i < subSteps; i++) {
      currentPoint = rk4(currentPoint, 0, dt, derivative);
    }
    
    addPoint(currentPoint);
  });

  // Convert points to Three.js positions
  const positions = useMemo(() => {
    const flatPositions = new Float32Array(points.length * 3);
    for (let i = 0; i < points.length; i++) {
      // Map Math (x, y, z) -> Three (x, z, y) or (x, y, z)
      flatPositions[i * 3] = points[i][0];     // Three X = Math X
      flatPositions[i * 3 + 1] = points[i][2]; // Three Y = Math Z
      flatPositions[i * 3 + 2] = points[i][1]; // Three Z = Math Y
    }
    return flatPositions;
  }, [points]);

  return (
    <primitive object={new THREE.Line()} ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#00ffcc" linewidth={1} />
    </primitive>
  );
};

export default LorenzVisualizer;
