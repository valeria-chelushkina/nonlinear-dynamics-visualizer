/**
 * @file ParameterSlider.tsx
 * @description Dynamically tracks, builds, maps and updates slider configurations
 * extracted from the system registry.
 */

import React from "react";
import { useSimulationStore } from "@/stores/useSimulationStore";
import type { Side } from "@/stores/useSimulationStore";
import { SYSTEM_REGISTRY } from "@/core/systems";
import type { SliderConfig } from "@/core/systems";
import { ArrowRightLeft } from "lucide-react";
import styles from "./Controls.module.css";

interface ParameterSlidersProps {
  side: Side;
}

/**
 * ParameterSliders Component
 */
export const ParameterSliders: React.FC<ParameterSlidersProps> = ({ side }) => {
  const sim = useSimulationStore((state) => state.sims[side]);
  const comparisonMode = useSimulationStore((state) => state.comparisonMode);

  const {
    setParams,
    setMaxPoints,
    setSpeed,
    copyParam,
    copySpeed,
    resetParams,
  } = useSimulationStore();

  const { systemType, params, speed, maxPoints } = sim;
  const otherSide: Side = side === "left" ? "right" : "left";
  const currentSystem = SYSTEM_REGISTRY[systemType] || SYSTEM_REGISTRY["lorenz"];

  return (
    <div className={styles.section}>
      <div className={styles.paramsGrid}>
        {/* Render mathematical system parameters dynamically */}
        {currentSystem.meta.sliders.map((slider: SliderConfig) => (
          <div key={slider.key} className={styles.controlGroup}>
            <label>
              {slider.label}{" "}
              <span className={styles.value}>
                {(params[slider.key] || 0).toFixed(slider.step < 0.1 ? 3 : 1)}
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
                  title={`Copy parameter to ${otherSide}`}
                >
                  <ArrowRightLeft size={14} />
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Global tail point limits */}
        <div className={styles.controlGroup}>
          <label>
            Tail length{" "}
            <span className={styles.value}>{maxPoints.toLocaleString()} pts</span>
          </label>
          <div className={styles.inputRow}>
            <input
              type="range"
              min="1000"
              max="200000"
              step="1000"
              value={maxPoints}
              onChange={(e) => setMaxPoints(side, parseInt(e.target.value))}
            />
          </div>
        </div>

        {/* Core multiplier simulation run speeds */}
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
                title={`Copy integration speed to ${otherSide}`}
              >
                <ArrowRightLeft size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Parameter reset */}
        <div className={styles.controlGroup}>
          <button
            className={styles.buttonPrimary}
            style={{ fontSize: "17px" }}
            onClick={() => resetParams(side)}
          >
            Reset parameters
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParameterSliders;