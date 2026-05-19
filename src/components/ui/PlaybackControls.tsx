/**
 * @file PlaybackControls.tsx
 * @description Manages core simulation playback triggers, state alterations,
 * view splits and the Butterfly Effect config layout.
 */

import React from "react";
import { useSimulationStore } from "@/stores/useSimulationStore";
import type { Side } from "@/stores/useSimulationStore";
import { useVisualsStore } from "@/stores/useVisualsStore";
import { SYSTEM_REGISTRY } from "@/core/systems";
import {
  Play,
  Pause,
  RotateCcw,
  Columns,
  Link,
  Link2Off,
  Camera,
  EqualApproximately,
} from "lucide-react";
import styles from "./Controls.module.css";

interface PlaybackControlsProps {
  side: Side;
}

/**
 * PlaybackControls Component
 */
export const PlaybackControls: React.FC<PlaybackControlsProps> = ({ side }) => {
  // Selectors for reactive primitive state bindings
  const isPaused = useSimulationStore((state) => state.sims[side].isPaused);
  const comparisonMode = useSimulationStore((state) => state.comparisonMode);
  const syncCameras = useSimulationStore((state) => state.syncCameras);
  const butterflyMode = useSimulationStore((state) => state.butterflyMode);
  const initialDifference = useSimulationStore(
    (state) => state.initialDifference,
  );
  const systemType = useSimulationStore((state) => state.sims[side].systemType);

  const isMap = SYSTEM_REGISTRY[systemType].math.type === "map";

  // Store actions
  const {
    togglePause,
    resetSimulation,
    triggerScreenshot,
    toggleButterflyMode,
    toggleComparison,
    toggleSyncCameras,
    setInitialDifference,
    runButterflyEffect,
  } = useSimulationStore();

  const butterflyVisuals = useVisualsStore((state) => state.configs.right);
  const setVisuals = useVisualsStore((state) => state.setVisuals);

  return (
    <>
      <div className={styles.headerRow}>
        <div className={styles.headerActions}>
          {!isMap && (
            <>
              <button
                className={`${styles.button} ${isPaused ? styles.buttonPrimary : ""}`}
                onClick={() => togglePause(side)}
              >
                {isPaused ? <Play size={18} /> : <Pause size={18} />}
                {isPaused ? "Resume" : "Pause"}
              </button>
              <button
                className={styles.button}
                onClick={() => resetSimulation(side)}
              >
                <RotateCcw size={18} /> Reset
              </button>
            </>
          )}

          <button
            className={styles.button}
            onClick={() => triggerScreenshot(side)}
            title="Capture screenshot"
          >
            <Camera size={18} /> Screenshot
          </button>

          {side === "left" && (
            <>
              {!comparisonMode && !isMap && (
                <button
                  className={`${styles.button} ${butterflyMode ? styles.active : ""}`}
                  onClick={toggleButterflyMode}
                  title="Butterfly mode"
                >
                  <EqualApproximately size={18} /> Butterfly mode
                </button>
              )}

              <button
                className={`${styles.button} ${comparisonMode ? styles.active : ""}`}
                onClick={toggleComparison}
                title="Toggle split view"
              >
                <Columns size={18} /> Split view
              </button>

              {comparisonMode && (
                <button
                  className={`${styles.iconButton} ${syncCameras ? styles.active : ""}`}
                  onClick={toggleSyncCameras}
                  title="Sync cameras"
                >
                  {syncCameras ? <Link size={20} /> : <Link2Off size={20} />}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Butterfly configurations */}
      {side === "left" && !comparisonMode && butterflyMode && (
        <div className={styles.butterflySection}>
          <div className={styles.controlGroup} style={{ marginBottom: 0 }}>
            <label>
              Initial Diff:{" "}
              <span className={styles.value}>
                {initialDifference.toFixed(5)}
              </span>
            </label>
            <input
              type="range"
              min="0.00001"
              max="0.01"
              step="0.00001"
              value={initialDifference}
              onChange={(e) => setInitialDifference(parseFloat(e.target.value))}
            />

            <div className={styles.visualsGrid} style={{ marginTop: "15px" }}>
              <div className={styles.controlGroup}>
                <label>Butterfly Color</label>
                <input
                  type="color"
                  value={butterflyVisuals.color}
                  onChange={(e) =>
                    setVisuals("right", { color: e.target.value })
                  }
                  className={styles.colorPicker}
                />
              </div>
            </div>

            <button
              className={styles.syncAllButton}
              style={{ marginTop: "15px", marginBottom: 0 }}
              onClick={runButterflyEffect}
            >
              <RotateCcw size={16} /> Run Comparison
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PlaybackControls;
