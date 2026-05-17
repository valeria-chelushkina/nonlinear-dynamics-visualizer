import React, { useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import SimulationVisualizer from '@/components/canvas/SimulationVisualizer';
import { useSimulationStore } from '@/store/useSimulationStore';
import type { Side } from '@/store/useSimulationStore';
import * as THREE from 'three';

interface SimulationCanvasProps {
  side?: Side;
}

const ScreenshotHandler: React.FC<{ side: Side }> = ({ side }) => {
  const { gl, scene, camera } = useThree();
  const signal = useSimulationStore((state) => state.screenshotSignal);

  useEffect(() => {
    if (signal.side === side && signal.timestamp > 0) {
      gl.render(scene, camera);
      try {
        const dataUrl = gl.domElement.toDataURL('image/png');
        const link = document.createElement('a');
        const filename = `nonlinear-sim-${side}-${Date.now()}.png`;
        link.setAttribute('download', filename);
        link.setAttribute('href', dataUrl);
        link.click();
      } catch (err) {
        console.error("Failed to capture screenshot:", err);
      }
    }
  }, [signal, side, gl, scene, camera]);

  return null;
};

const CameraSync: React.FC<{ side: Side }> = ({ side }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  
  const syncCameras = useSimulationStore((state) => state.syncCameras);
  const butterflyMode = useSimulationStore((state) => state.butterflyMode);
  const sideConfig = useSimulationStore((state) => state.sims[side].cameraConfig);
  const setCameraConfig = useSimulationStore((state) => state.setCameraConfig);

  // Camera Syncing Logic
  useEffect(() => {
    if (!controlsRef.current) return;

    const currentPos = new THREE.Vector3().fromArray(sideConfig.position);
    const currentTarget = new THREE.Vector3().fromArray(sideConfig.target);

    const distPos = camera.position.distanceTo(currentPos);
    const distTarget = controlsRef.current.target.distanceTo(currentTarget);

    // Only update camera if the store actually changed (to avoid infinite loops)
    if (distPos > 0.01 || distTarget > 0.01) {
      camera.position.copy(currentPos);
      controlsRef.current.target.copy(currentTarget);
      controlsRef.current.update();
    }
  }, [sideConfig, camera]);

  const handleCameraChange = (e: any) => {
    const controls = e.target;
    const position = controls.object.position.toArray() as [number, number, number];
    const target = controls.target.toArray() as [number, number, number];

    // Always update the store so 'Save Camera' works.
    // If syncCameras is on, the store action will handle updating both sides.
    setCameraConfig(side, { position, target });
  };

  return (
    <>
      <OrbitControls 
        ref={controlsRef}
        makeDefault 
        target={[0, 25, 0]} 
        enableDamping={true}
        dampingFactor={0.05}
        screenSpacePanning={true}
        enablePan={true}
        onChange={handleCameraChange}
      />
      {butterflyMode ? (
        <>
          <SimulationVisualizer side="left" />
          <SimulationVisualizer side="right" />
        </>
      ) : (
        <SimulationVisualizer side={side} />
      )}
    </>
  );
};

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ side = 'left' }) => {
  return (
    <div style={{ width: '100%', height: '100%', background: '#050505' }}>
      <Canvas
        camera={{ position: [-108, 30, 40], fov: 45 }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[100, 100, 100]} />
        
        <CameraSync side={side} />
        <ScreenshotHandler side={side} />
        
        <axesHelper args={[50]} />
        
        <GizmoHelper
          alignment="bottom-right"
          margin={[80, 80]}
        >
          <GizmoViewport axisColors={['#ff3e00', '#71ff2d', '#0070ff']} labelColor="white" />
        </GizmoHelper>

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
