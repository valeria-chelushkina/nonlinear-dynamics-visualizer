import React from "react";
import { useSimulationStore } from "@/store/useSimulationStore";
import type { Side } from "@/store/useSimulationStore";
import { SYSTEM_REGISTRY } from "@/core/systems";
import styles from "./Controls.module.css";
import {
  Play,
  Pause,
  RotateCcw,
  Columns,
  ArrowRightLeft,
  Link,
  Link2Off,
  Camera,
  EqualApproximately,
} from "lucide-react";

interface ControlsProps {
  side?: Side;
}

const Controls: React.FC<ControlsProps> = ({ side = "left" }) => {
  const sim = useSimulationStore((state) => state.sims[side]);
  const comparisonMode = useSimulationStore((state) => state.comparisonMode);
  const syncCameras = useSimulationStore((state) => state.syncCameras);
  const butterflyMode = useSimulationStore((state) => state.butterflyMode);
  const initialDifference = useSimulationStore(
    (state) => state.initialDifference,
  );
  const user = useSimulationStore((state) => state.user);
  const token = useSimulationStore((state) => state.token);

  const {
    setParams,
    togglePause,
    resetSimulation,
    setSpeed,
    toggleComparison,
    toggleSyncCameras,

    triggerScreenshot,
    copyParam,
    copySpeed,
    toggleButterflyMode,
    setInitialDifference,
    runButterflyEffect,
  } = useSimulationStore();

  const { systemType, params, isPaused, speed } = sim;

  const [presetName, setPresetName] = React.useState("");
  const [isPublic, setIsPublic] = React.useState(true);
  const [saveCamera, setSaveCamera] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const otherSide = side === "left" ? "right" : "left";
  const cameraConfig = sim.cameraConfig;
  const currentSystem =
    SYSTEM_REGISTRY[systemType] || SYSTEM_REGISTRY["lorenz"];

  const handleSave = async () => {
    if (!presetName) return alert("Enter a name for your preset.");

    setIsSaving(true);
    try {
      const response = await fetch("http://localhost:3000/api/presets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: presetName,
          systemType: systemType,
          parameters: params,
          isPublic: isPublic,
          cameraConfig: saveCamera ? cameraConfig : null,
        }),
      });

      if (response.ok) {
        alert("Preset saved successfully.");
        setPresetName("");
      }
    } catch (error) {
      alert("Failed to save a preset.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.controlsContainer}>
      <div className={styles.headerRow}>
        <div className={styles.headerActions}>
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

          <button
            className={styles.button}
            onClick={() => triggerScreenshot(side)}
            title="Capture screenshot"
          >
            <Camera size={18} /> Screenshot
          </button>

          {side === "left" && (
            <>
              {!comparisonMode && (
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

      <div className={styles.section}>
        <div className={styles.paramsGrid}>
          {currentSystem.sliders.map((slider) => (
            <div key={slider.key} className={styles.controlGroup}>
              <label>
                {slider.label}{" "}
                <span className={styles.value}>
                  {(params[slider.key] || 0).toFixed(slider.step < 0.1 ? 2 : 1)}
                </span>
              </label>
              <div className={styles.inputRow}>
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={params[slider.key] || 0}
                  onChange={(e) =>
                    setParams(side, {
                      [slider.key]: parseFloat(e.target.value),
                    })
                  }
                />
                {comparisonMode && (
                  <button
                    className={styles.copyButton}
                    onClick={() => copyParam(side, otherSide, slider.key)}
                  >
                    <ArrowRightLeft size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className={styles.controlGroup}>
            <label>
              Speed <span className={styles.value}>{speed.toFixed(1)}x</span>
            </label>
            <div className={styles.inputRow}>
              <input
                type="range"
                min="0.5"
                max="25"
                step="0.5"
                value={speed}
                onChange={(e) => setSpeed(side, parseFloat(e.target.value))}
              />
              {comparisonMode && (
                <button
                  className={styles.copyButton}
                  onClick={() => copySpeed(side, otherSide)}
                >
                  <ArrowRightLeft size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.saveSection}>
        <input
          type="text"
          placeholder="Preset name..."
          className={styles.textInput}
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
        />

        <div className={styles.checkboxRow}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={!isPublic}
              onChange={(e) => setIsPublic(!e.target.checked)}
            />
            Private
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={saveCamera}
              onChange={(e) => setSaveCamera(e.target.checked)}
            />
            Save Camera
          </label>
        </div>

        {user ? (
          <button
            className={styles.buttonPrimary}
            style={{ fontSize: "17px" }}
            onClick={handleSave}
            disabled={isSaving}
          >
            Save to gallery
          </button>
        ) : (
          <div className={styles.loginMessage}>Login to save</div>
        )}
      </div>
    </div>
  );
};

export default Controls;
