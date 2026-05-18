/**
 * @file PresetActions.tsx
 * @description Manages state forms and transmission logic required to save system variations.
 */

import React, { useState } from "react";
import { useSimulationStore } from "@/stores/useSimulationStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useVisualsStore } from "@/stores/useVisualsStore";
import type { Side } from "@/stores/useSimulationStore";
import styles from "./Controls.module.css";

interface PresetActionsProps {
  side: Side;
}

/**
 * PresetActions Component
 */
export const PresetActions: React.FC<PresetActionsProps> = ({ side }) => {
  const sim = useSimulationStore((state) => state.sims[side]);
  const visuals = useVisualsStore((state) => state.configs[side]);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  // Local interaction state definitions
  const [presetName, setPresetName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [saveCamera, setSaveCamera] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /** Package parameters and POST them securely to local API endpoints */
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
          systemType: sim.systemType,
          parameters: sim.params,
          isPublic: isPublic,
          cameraConfig: saveCamera ? sim.cameraConfig : null,
          visuals: visuals,
        }),
      });

      if (response.ok) {
        alert("Preset saved successfully.");
        setPresetName("");
      } else {
        throw new Error("Server processing error");
      }
    } catch (error) {
      alert("Failed to save a preset.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
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
          {isSaving ? "Saving..." : "Save to gallery"}
        </button>
      ) : (
        <div className={styles.loginMessage}>Login to save</div>
      )}
    </div>
  );
};

export default PresetActions;