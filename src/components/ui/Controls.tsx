/**
 * @file Controls.tsx
 * @description Serves as a wrapper component that groups sub-components 
 * into a single unified workspace control column interface.
 */

import React from "react";
import type { Side } from "@/stores/useSimulationStore";
import PlaybackControls from "./PlaybackControls";
import ParameterSliders from "./ParameterSliders";
import VisualSettings from "./VisualSettings";
import PresetActions from "./PresetActions";
import styles from "./Controls.module.css";

interface ControlsProps {
  side?: Side;
}

/**
 * Controls Root Component Shell
 */
export const Controls: React.FC<ControlsProps> = ({ side = "left" }) => {
  return (
    <div className={styles.controlsContainer}>
      {/* Playback action orchestration toolbar */}
      <PlaybackControls side={side} />
      
      {/* Parameter range modifier grid list */}
      <ParameterSliders side={side} />
      
      {/* Render line profile styling properties panel */}
      <VisualSettings side={side} />
      
      {/* Database sync operations console panel */}
      <PresetActions side={side} />
    </div>
  );
};

export default Controls;