import React, { useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import SimulationVisualizer from '@/components/canvas/SimulationVisualizer';
import SimulationVisualizer2D from '@/components/canvas/SimulationVisualizer2D';
import { useSimulationStore } from '@/store/useSimulationStore';
import type { Side } from '@/store/useSimulationStore';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { SYSTEM_REGISTRY } from '@/core/systems';

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
  
  const butterflyMode = useSimulationStore((state) => state.butterflyMode);
  const sideConfig = useSimulationStore((state) => state.sims[side].cameraConfig);
  const setCameraConfig = useSimulationStore((state) => state.setCameraConfig);
  const systemType = useSimulationStore((state) => state.sims[side].systemType);
  const is2D = SYSTEM_REGISTRY[systemType]?.dimension === 2;

  // Camera Syncing Logic
  useEffect(() => {
    if (!controlsRef.current) return;

    const currentPos = new THREE.Vector3().fromArray(sideConfig.position);
    const currentTarget = new THREE.Vector3().fromArray(sideConfig.target);

    const distPos = camera.position.distanceTo(currentPos);
    const distTarget = controlsRef.current.target.distanceTo(currentTarget);

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
        enableRotate={!is2D}
        onChange={handleCameraChange}
      />
      {butterflyMode ? (
        <>
          {is2D ? <SimulationVisualizer2D side="left" /> : <SimulationVisualizer side="left" />}
          {is2D ? <SimulationVisualizer2D side="right" /> : <SimulationVisualizer side="right" />}
        </>
      ) : (
        is2D ? <SimulationVisualizer2D side={side} /> : <SimulationVisualizer side={side} />
      )}
    </>
  );
};

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ side = 'left' }) => {
  const systemType = useSimulationStore((state) => state.sims[side].systemType);
  const is2D = SYSTEM_REGISTRY[systemType]?.dimension === 2;
  const isNeonLeft = useSimulationStore((state) => state.sims.left.visuals.isNeon);
  const isNeonRight = useSimulationStore((state) => state.sims.right.visuals.isNeon);
  const anyNeon = isNeonLeft || isNeonRight;

  return (
    <div style={{ width: '100%', height: '100%', background: '#050505' }}>
      <Canvas
        camera={{ position: is2D ? [0, 0, 100] : [-108, 30, 40], fov: 45 }}
        gl={{ antialias: false, stencil: false, depth: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[100, 100, 100]} />
        
        <CameraSync side={side} />
        <ScreenshotHandler side={side} />
        
        {!is2D && <axesHelper args={[50]} />}
        
        {!is2D && (
          <GizmoHelper
            alignment="bottom-right"
            margin={[80, 80]}
          >
            <GizmoViewport axisColors={['#ff3e00', '#71ff2d', '#0070ff']} labelColor="white" />
          </GizmoHelper>
        )}

        {!is2D && (
          <Grid 
            infiniteGrid 
            fadeDistance={100} 
            fadeStrength={5} 
            sectionSize={10} 
            sectionThickness={1}
            cellColor="#222"
            sectionColor="#444"
          />
        )}

        {anyNeon && (
          <EffectComposer enableNormalPass={false}>
            <Bloom 
              luminanceThreshold={0.2} 
              mipmapBlur 
              intensity={1.5} 
              radius={0.4}
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
};

export default SimulationCanvas;
