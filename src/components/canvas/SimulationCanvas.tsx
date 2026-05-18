import React, { useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Grid,
  GizmoHelper,
  GizmoViewport,
} from "@react-three/drei";
import SimulationVisualizer from "@/components/canvas/SimulationVisualizer";
import SimulationVisualizer2D from "@/components/canvas/SimulationVisualizer2D";
import { useSimulationStore } from "@/stores/useSimulationStore";
import { useUIStore } from "@/stores/useUIStore";
import type { Side } from "@/stores/useSimulationStore";
import * as THREE from "three";
import { SYSTEM_REGISTRY } from "@/core/systems";

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
        const dataUrl = gl.domElement.toDataURL("image/png");
        const link = document.createElement("a");
        const filename = `nonlinear-sim-${side}-${Date.now()}.png`;
        link.setAttribute("download", filename);
        link.setAttribute("href", dataUrl);
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
  const isProgrammaticUpdate = useRef(false);

  const butterflyMode = useSimulationStore((state) => state.butterflyMode);
  const sideConfig = useSimulationStore((state) => state.sims[side].cameraConfig);
  const setCameraConfig = useSimulationStore((state) => state.setCameraConfig);
  const systemType = useSimulationStore((state) => state.sims[side].systemType);
  const is2D = SYSTEM_REGISTRY[systemType]?.dimension === 2;

  // Camera Syncing Logic (This handles updating the target safely!)
  useEffect(() => {
    if (!controlsRef.current) return;

    const currentPos = new THREE.Vector3().fromArray(sideConfig.position);
    const currentTarget = new THREE.Vector3().fromArray(sideConfig.target);

    const distPos = camera.position.distanceTo(currentPos);
    const distTarget = controlsRef.current.target.distanceTo(currentTarget);

    if (distPos > 0.01 || distTarget > 0.01) {
      console.log(`[CameraSync] Updating camera for ${side} to:`, sideConfig.position);
      isProgrammaticUpdate.current = true;
      camera.position.copy(currentPos);
      controlsRef.current.target.copy(currentTarget);
      controlsRef.current.update();
      
      setTimeout(() => {
        isProgrammaticUpdate.current = false;
      }, 50);
    }
  }, [sideConfig, camera, side]);

  const handleCameraChange = (e: any) => {
    if (isProgrammaticUpdate.current) return;

    const controls = e.target;
    const position = controls.object.position.toArray() as [number, number, number];
    const target = controls.target.toArray() as [number, number, number];

    const currentPos = new THREE.Vector3().fromArray(sideConfig.position);
    const currentTarget = new THREE.Vector3().fromArray(sideConfig.target);
    const newPos = new THREE.Vector3().fromArray(position);
    const newTarget = new THREE.Vector3().fromArray(target);

    if (newPos.distanceTo(currentPos) > 0.01 || newTarget.distanceTo(currentTarget) > 0.01) {
      setCameraConfig(side, { position, target });
    }
  };

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        makeDefault
        // target={sideConfig.target} <-- REMOVED to prevent the update race condition
        enableDamping={true}
        dampingFactor={0.05}
        screenSpacePanning={true}
        enablePan={true}
        enableRotate={!is2D}
        onChange={handleCameraChange}
      />
      {butterflyMode ? (
        <>
          {is2D ? (
            <SimulationVisualizer2D side="left" />
          ) : (
            <SimulationVisualizer side="left" />
          )}
          {is2D ? (
            <SimulationVisualizer2D side="right" />
          ) : (
            <SimulationVisualizer side="right" />
          )}
        </>
      ) : is2D ? (
        <SimulationVisualizer2D side={side} />
      ) : (
        <SimulationVisualizer side={side} />
      )}
    </>
  );
};

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  side = "left",
}) => {
  const systemType = useSimulationStore((state) => state.sims[side].systemType);
  const sideConfig = useSimulationStore((state) => state.sims[side].cameraConfig);
  const theme = useUIStore((state) => state.theme);
  const is2D = SYSTEM_REGISTRY[systemType]?.dimension === 2;

  const bgColor = theme === "dark" ? "#050505" : "#f0f0f0";
  const gridColor = theme === "dark" ? "#222" : "#ccc";
  const sectionColor = theme === "dark" ? "#444" : "#bbb";

  return (
    <div style={{ width: "100%", height: "100%", background: bgColor }}>
      <Canvas
        camera={{ position: is2D ? [0, 0, 100] : sideConfig.position, fov: 45 }}
        gl={{ antialias: false, stencil: false, depth: true }}
      >
        <color attach="background" args={[bgColor]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[100, 100, 100]} />

        <CameraSync side={side} />
        <ScreenshotHandler side={side} />

        {!is2D && <axesHelper args={[50]} />}

        {!is2D && (
          <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
            <GizmoViewport
              axisColors={["#ff3e00", "#71ff2d", "#0070ff"]}
              labelColor={theme === "dark" ? "white" : "black"}
            />
          </GizmoHelper>
        )}

        {!is2D && (
          <Grid
            infiniteGrid
            fadeDistance={100}
            fadeStrength={5}
            sectionSize={10}
            sectionThickness={1}
            cellColor={gridColor}
            sectionColor={sectionColor}
          />
        )}
      </Canvas>
    </div>
  );
};

export default SimulationCanvas;
