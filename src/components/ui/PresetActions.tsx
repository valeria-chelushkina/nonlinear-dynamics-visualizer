import { useState } from "react";
import { useSimulationStore } from "@/stores/useSimulationStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useVisualsStore } from "@/stores/useVisualsStore";
import type { Side } from "@/stores/useSimulationStore";
import { savePresetApi } from "@/api/presets";
import styles from "./Controls.module.css";

interface PresetActionsProps {
  side: Side;
}

export const PresetActions = ({ side }: PresetActionsProps) => {
  const sim = useSimulationStore((state) => state.sims[side]);
  const visuals = useVisualsStore((state) => state.configs[side]);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const [presetName, setPresetName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [saveCamera, setSaveCamera] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const handleSave = async () => {
    if (!presetName) return alert("Enter a name for your preset.");
    if (!token)
      return alert("Authentication token is missing. Please re-login.");

    setIsSaving(true);
    try {
      await savePresetApi(
        {
          name: presetName,
          systemType: sim.systemType,
          parameters: sim.params,
          isPublic: isPublic,
          cameraConfig: saveCamera ? sim.cameraConfig : null,
          visuals: {
            color: visuals.color,
            useGradient: visuals.useGradient,
            colorEnd: visuals.colorEnd,
          },
        },
        token,
      );

      alert("Preset saved successfully.");
      setPresetName("");
    } catch (error) {
      console.error("[PresetActions] Save routine failure:", error);
      alert(
        "Failed to save preset. Please verify connection metrics and retry.",
      );
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
