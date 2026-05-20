/**
 * @file ParameterSlider.tsx
 * @description Dynamically tracks, builds, maps and updates slider configurations
 * extracted from the system registry.
 */

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
export const ParameterSliders = ({ side }: ParameterSlidersProps) => {
  const systemType = useSimulationStore((state) => state.sims[side].systemType);
  const params = useSimulationStore((state) => state.sims[side].params);
  const speed = useSimulationStore((state) => state.sims[side].speed);
  const maxPoints = useSimulationStore((state) => state.sims[side].maxPoints);

  const comparisonMode = useSimulationStore((state) => state.comparisonMode);

  const isMap = SYSTEM_REGISTRY[systemType].math.type === "map";

  const {
    setParams,
    setMaxPoints,
    setSpeed,
    copyParam,
    copySpeed,
    resetParams,
  } = useSimulationStore();

  const otherSide: Side = side === "left" ? "right" : "left";
  const currentSystem =
    SYSTEM_REGISTRY[systemType] || SYSTEM_REGISTRY["lorenz"];

  return (
    <div className={styles.section}>
      <div className={styles.paramsGrid}>
        {/* Render mathematical system parameters dynamically */}
        {currentSystem.meta.sliders.map((slider: SliderConfig) => (
          <div key={slider.key} className={styles.controlGroup}>
            <div className={styles.labelRow}>
              <label>{slider.label}</label>
              <input
                type="number"
                className={styles.numberInput}
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={params[slider.key] || 0}
                onChange={(e) => {
                  let val = parseFloat(e.target.value);
                  if (isNaN(val)) return;
                  val = Math.max(slider.min, Math.min(slider.max, val));
                  setParams(side, { [slider.key]: val });
                }}
              />
            </div>
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

        {!isMap && (
          <>
            {/* Global tail point limits */}
            <div className={styles.controlGroup}>
              <div className={styles.labelRow}>
                <label>Tail length</label>
                <input
                  type="number"
                  className={styles.numberInput}
                  min="1000"
                  max="200000"
                  step="1000"
                  style={{ width: "90px" }}
                  value={maxPoints}
                  onChange={(e) => {
                    let val = parseInt(e.target.value);
                    if (isNaN(val)) return;
                    val = Math.max(1000, Math.min(200000, val));
                    setMaxPoints(side, val);
                  }}
                />
              </div>
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
              <div className={styles.labelRow}>
                <label>Speed</label>
                <input
                  type="number"
                  className={styles.numberInput}
                  min="0.5"
                  max="25"
                  step="0.1"
                  value={speed}
                  onChange={(e) => {
                    let val = parseFloat(e.target.value);
                    if (isNaN(val)) return;
                    val = Math.max(0.5, Math.min(25, val));
                    setSpeed(side, val);
                  }}
                />
              </div>
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
          </>
        )}

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
