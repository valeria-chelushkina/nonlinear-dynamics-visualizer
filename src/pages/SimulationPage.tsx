import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SimulationCanvas from "@/components/canvas/SimulationCanvas";
import Controls from "@/components/ui/Controls";
import { SYSTEM_REGISTRY } from "@/core/systems";
import { useSimulationStore } from "@/stores/useSimulationStore";
import styles from "./SimulationPage.module.css";
import { Play, Pause, RotateCcw } from "lucide-react";
import ControlsGuide from "@/components/ui/ControlsGuide";
import Sidebar from "@/components/ui/Sidebar";

const MasterControls = () => {
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

const SimulationPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const leftSystemType = useSimulationStore((state) => state.sims.left.systemType);
  const rightSystemType = useSimulationStore((state) => state.sims.right.systemType);
  const comparisonMode = useSimulationStore((state) => state.comparisonMode);
  const toggleComparison = useSimulationStore((state) => state.toggleComparison);
  
  const systemLeft = SYSTEM_REGISTRY[leftSystemType] || SYSTEM_REGISTRY["lorenz"];
  const systemRight = SYSTEM_REGISTRY[rightSystemType] || SYSTEM_REGISTRY["lorenz"];
  
  const resetSimulationState = useSimulationStore((state) => state.resetSimulationState);

  const lastId = React.useRef<string | undefined>(undefined);

  useEffect(() => {
    const targetId = id || "lorenz";

    if (lastId.current !== id) {
      lastId.current = id;
      resetSimulationState(targetId, comparisonMode ? "left" : undefined);
    }
  }, [id, resetSimulationState, comparisonMode]);

  if (!systemLeft) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>System "{id}" not found.</div>
      </div>
    );
  }

  const navigateToSystem = (type: string) => {
    if (comparisonMode) {
      toggleComparison();
    }
    navigate(`/sim/${type}`);
  };

  return (
    <div className={styles.pageWrapper}>
      {!comparisonMode && <Sidebar />}
      <div className={styles.page}>
        <div
          className={`${styles.container} ${comparisonMode ? styles.wide : ""}`}
        >
          <header className={styles.header}>
            {comparisonMode && leftSystemType !== rightSystemType ? (
              <h1 className={styles.comparisonTitle}>
                <span 
                  className={styles.clickableSystem}
                  onClick={() => navigateToSystem(leftSystemType)}
                >
                  {systemLeft.meta.name}
                </span>
                <span className={styles.vs}>vs</span>
                <span 
                  className={styles.clickableSystem}
                  onClick={() => navigateToSystem(rightSystemType)}
                >
                  {systemRight.meta.name}
                </span>
              </h1>
            ) : (
              <h1 
                className={comparisonMode ? styles.clickableSystem : ""}
                onClick={() => comparisonMode && navigateToSystem(leftSystemType)}
              >
                {systemLeft.meta.name}
              </h1>
            )}
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
              <p>{systemLeft.meta.description}</p>
            </section>

            <section className={styles.infoCard}>
              <h3>Differential Equations</h3>
              <div className={styles.equationsList}>
                {systemLeft.meta.equations.map((eq: any, i: any) => (
                  <div key={i} className={styles.equation}>
                    <code>{eq}</code>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.infoCard}>
              <h3>Parameter Details</h3>
              <div className={styles.parametersList}>
                {systemLeft.meta.sliders.map((slider: any, i: any) => (
                  <div key={i} className={styles.parameter}>
                    <span className={styles.parameterName}>{slider.label}</span>
                    <span className={styles.parameterDescription}>{slider.description}</span>
                    <span className={styles.parameterImpact}><strong>Impact:</strong> {slider.impact}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.infoCard}>
              <h3>Historical significance</h3>
              <p>{systemLeft.meta.history}</p>
            </section>

            <section className={styles.infoCard}>
              <h3>Real-World Applications</h3>
              <div className={styles.useList}>
                {systemLeft.meta.use.map((use: any, i: any) => (
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
