import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import LorenzVisualizer from '@/components/canvas/LorenzVisualizer';
import type { Side } from '@/store/useSimulationStore';

interface SimulationCanvasProps {
  side?: Side;
}

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ side = 'left' }) => {
  return (
    <div style={{ width: '100%', height: '100%', background: '#050505' }}>
      <Canvas
        camera={{ position: [-108, 30, 40], fov: 45 }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[100, 100, 100]} />
        
        <LorenzVisualizer side={side} />
        
        <axesHelper args={[50]} />
        
        <GizmoHelper
          alignment="bottom-right"
          margin={[80, 80]}
        >
          <GizmoViewport axisColors={['#ff3e00', '#71ff2d', '#0070ff']} labelColor="white" />
        </GizmoHelper>

        <OrbitControls 
          makeDefault 
          target={[0, 25, 0]} 
          enableDamping={true}
          dampingFactor={0.05}
          screenSpacePanning={true}
          enablePan={true}
        />
        <Grid 
          infiniteGrid 
          fadeDistance={100} 
          fadeStrength={5} 
          sectionSize={10} 
          sectionThickness={1}
          cellColor="#222"
          sectionColor="#444"
        />
      </Canvas>
    </div>
  );
};

export default SimulationCanvas;
