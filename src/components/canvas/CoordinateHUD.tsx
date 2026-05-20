/**
 * @file CoordinateHUD.tsx
 * @description A floating heads-up display (HUD) text box.
 * Displays live XYZ coordinate numbers.
 */

import { useSimulationStore } from "@/stores/useSimulationStore";
import { useUIStore } from "@/stores/useUIStore";
import { SYSTEM_REGISTRY } from "@/core/systems";
import type { Side } from "@/stores/types/simulation.types";

interface CoordinateHUDProps {
  side: Side;
}

const CoordinateHUD = ({ side }: CoordinateHUDProps) => {
  const sim = useSimulationStore((state) => state.sims[side]);
  const theme = useUIStore((state) => state.theme);

  const { points, systemType, params } = sim;

  // Grab the very last point in the array
  const lastPoint = points[points.length - 1];

  // If the simulation hasn't started yet -> hide the HUD box
  if (!lastPoint) return null;

  const system = SYSTEM_REGISTRY[systemType];
  const dimension = system?.math.dimension || 3;
  const mapFn =
    system?.math.mapStateToPoint || ((s: any) => [s[0], s[1], s[2]]);
  const [x, y, z] = mapFn(lastPoint, params);

  const isDark = theme === "dark";

  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        padding: "8px 12px",
        backgroundColor: isDark
          ? "rgba(10, 10, 10, 0.75)"
          : "rgba(255, 255, 255, 0.8)",
        color: isDark ? "#fff" : "#111",
        borderRadius: "8px",
        fontSize: "11px",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        pointerEvents: "none",
        zIndex: 100,
        backdropFilter: "blur(8px)",
        border: `1px solid ${
          isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"
        }`,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        display: "flex",
        flexDirection: "column",
        minWidth: "120px",
        transition: "all 0.2s ease-in-out",
      }}
    >
      <div
        style={{
          fontWeight: 600,
          fontSize: "9px",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          opacity: 0.6,
          borderBottom: `1px solid ${
            isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"
          }`,
          paddingBottom: "4px",
          marginBottom: "2px",
        }}
      >
        Position
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "#ff3e00", fontWeight: "bold" }}>X</span>
        <span>{x.toFixed(4)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "#319b00", fontWeight: "bold" }}>Y</span>
        <span>{y.toFixed(4)}</span>
      </div>
      {dimension === 3 && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#0070ff", fontWeight: "bold" }}>Z</span>
          <span>{z.toFixed(4)}</span>
        </div>
      )}
    </div>
  );
};

export default CoordinateHUD;
