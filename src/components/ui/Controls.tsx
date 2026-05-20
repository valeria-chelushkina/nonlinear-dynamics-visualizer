/**
 * @file Controls.tsx
 * @description Groups sub-components into one control container.
 */

import type { Side } from "@/stores/useSimulationStore";
import PlaybackControls from "./PlaybackControls";
import ParameterSliders from "./ParameterSliders";
import VisualSettings from "./VisualSettings";
import PresetActions from "./PresetActions";
import styles from "./Controls.module.css";

interface ControlsProps {
  side?: Side;
}

export const Controls = ({ side = "left" }: ControlsProps) => {
  return (
    <div className={styles.controlsContainer}>
      <PlaybackControls side={side} />
      <ParameterSliders side={side} />
      <VisualSettings side={side} />
      <PresetActions side={side} />
    </div>
  );
};

export default Controls;
