import React from "react";
import { useVisualsStore } from "@/stores/useVisualsStore";
import type { Side } from "@/stores/useSimulationStore";
import styles from "./Controls.module.css";

interface VisualSettingsProps {
  side: Side;
}

export const VisualSettings: React.FC<VisualSettingsProps> = ({ side }) => {
  const visuals = useVisualsStore((state) => state.configs[side]);
  const setVisuals = useVisualsStore((state) => state.setVisuals);

  return (
    <div className={styles.visualsSection}>
      <h4 className={styles.visualsHeader}>Visual Settings</h4>
      <div className={styles.visualsGrid}>
        <div className={styles.controlGroup}>
          <label>Primary Color</label>
          <input
            type="color"
            value={visuals.color}
            onChange={(e) => setVisuals(side, { color: e.target.value })}
            className={styles.colorPicker}
          />
        </div>
        {visuals.useGradient && (
          <div className={styles.controlGroup}>
            <label>End Color</label>
            <input
              type="color"
              value={visuals.colorEnd || visuals.color}
              onChange={(e) => setVisuals(side, { colorEnd: e.target.value })}
              className={styles.colorPicker}
            />
          </div>
        )}

        <div className={styles.controlGroup}>
          <label
            className={styles.checkboxLabel}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={visuals.useGradient}
              onChange={(e) =>
                setVisuals(side, { useGradient: e.target.checked })
              }
            />
            Use Gradient
          </label>
        </div>
      </div>
    </div>
  );
};

export default VisualSettings;
