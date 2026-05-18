import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import SimulationCanvas from "@/components/canvas/SimulationCanvas";
import Controls from "@/components/ui/Controls";
import { SYSTEM_REGISTRY } from "@/core/systems";
import { useSimulationStore } from "@/stores/useSimulationStore";
import styles from "./SimulationPage.module.css";
import { Play, Pause, RotateCcw } from "lucide-react";
import ControlsGuide from "@/components/ui/ControlsGuide";
import Sidebar from "@/components/ui/Sidebar";

const MasterControls: React.FC = () => {
  const toggleAllPause = useSimulationStore((state) => state.toggleAllPause);
  const syncAll = useSimulationStore((state) => state.syncAll);
  const leftPaused = useSimulationStore((state) => state.sims.left.isPaused);
  const rightPaused = useSimulationStore((state) => state.sims.right.isPaused);
  
  const bothPaused = leftPaused && rightPaused;

  return (
    <div className={styles.masterControls}>
      <span className={styles.masterLabel}>Master Controls</span>
      <div className={styles.masterButtons}>
        <button className={styles.masterButton} onClick={toggleAllPause}>
          {bothPaused ? <Play size={16} /> : <Pause size={16} />}
          {bothPaused ? "Resume Both" : "Pause Both"}
        </button>
        <button className={styles.masterButton} onClick={syncAll}>
          <RotateCcw size={16} /> Reset Both
        </button>
      </div>
    </div>
  );
};

const SimulationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const system = SYSTEM_REGISTRY[id || "lorenz"];
  
  const resetSimulationState = useSimulationStore((state) => state.resetSimulationState);
  const comparisonMode = useSimulationStore((state) => state.comparisonMode);

  const lastId = React.useRef<string | undefined>(undefined);

  useEffect(() => {
    const targetId = id || "lorenz";

    if (lastId.current !== id) {
      lastId.current = id;
      resetSimulationState(targetId);
    }
  }, [id, resetSimulationState]);

  if (!system) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>System "{id}" not found.</div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      {!comparisonMode && <Sidebar />}
      <div className={styles.page}>
        <div
          className={`${styles.container} ${comparisonMode ? styles.wide : ""}`}
        >
          <header className={styles.header}>
            <h1>{system.meta.name}</h1>
          </header>

          {!comparisonMode && (
            <div className={styles.mobileGuide}>
              <ControlsGuide />
            </div>
          )}

          {comparisonMode && (
            <div className={styles.masterWrapper}>
              <MasterControls />
            </div>
          )}

          {/* First part: visualizer and controls */}
          <div
            className={`${styles.simPart} ${comparisonMode ? styles.split : ""}`}
          >
            <div className={styles.simColumn}>
              <div className={styles.simCard}>
                <div className={styles.canvasWrapper}>
                  <SimulationCanvas side="left" />
                </div>
              </div>
              <div className={styles.controlsCard}>
                <Controls side="left" />
              </div>
            </div>

            {comparisonMode && (
              <div className={styles.simColumn}>
                <div className={styles.simCard}>
                  <div className={styles.canvasWrapper}>
                    <SimulationCanvas side="right" />
                  </div>
                </div>
                <div className={styles.controlsCard}>
                  <Controls side="right" />
                </div>
              </div>
            )}
          </div>

          {/* Second part: information and equations */}
          <div className={styles.infoPart}>
            <section className={styles.infoCard}>
              <h3>About the model</h3>
              <p>{system.meta.description}</p>
            </section>

            <section className={styles.infoCard}>
              <h3>Differential Equations</h3>
              <div className={styles.equationsList}>
                {system.meta.equations.map((eq: any, i: any) => (
                  <div key={i} className={styles.equation}>
                    <code>{eq}</code>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.infoCard}>
              <h3>Historical significance</h3>
              <p>{system.meta.history}</p>
            </section>

            <section className={styles.infoCard}>
              <h3>Real-World Applications</h3>
              <div className={styles.useList}>
                {system.meta.use.map((use: any, i: any) => (
                  <div key={i} className={styles.use}>
                    {use}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
      {!comparisonMode && (
        <div className={styles.desktopGuide}>
          <ControlsGuide />
        </div>
      )}
    </div>
  );
};

export default SimulationPage;
