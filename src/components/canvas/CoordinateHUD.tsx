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

const PositionBlock = ({ 
  title, 
  coords, 
  dimension, 
  isDark 
}: { 
  title: string; 
  coords: number[]; 
  dimension: number; 
  isDark: boolean; 
}) => {
  const [x, y, z] = coords;
  return (
    <div>
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
          marginBottom: "4px",
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
        <span style={{ color: "#ff3e00", fontWeight: "bold" }}>X</span>
        <span>{x.toFixed(4)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
        <span style={{ color: "#319b00", fontWeight: "bold" }}>Y</span>
        <span>{y.toFixed(4)}</span>
      </div>
      {dimension === 3 && (
        <div style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
          <span style={{ color: "#0070ff", fontWeight: "bold" }}>Z</span>
          <span>{z.toFixed(4)}</span>
        </div>
      )}
    </div>
  );
};

const CoordinateHUD = ({ side }: CoordinateHUDProps) => {
  const theme = useUIStore((state) => state.theme);
  const butterflyMode = useSimulationStore((state) => state.butterflyMode);
  
  const systemType = useSimulationStore((state) => state.sims[side].systemType);
  const params = useSimulationStore((state) => state.sims[side].params);
  const lastPoint = useSimulationStore((state) => 
    state.sims[side].points[state.sims[side].points.length - 1]
  );
  
  const showButterfly = butterflyMode && side === "left";
  const lastPointB = useSimulationStore((state) => 
    showButterfly ? state.sims.right.points[state.sims.right.points.length - 1] : null
  );

  // If the simulation hasn't started yet -> hide the HUD box
  if (!lastPoint) return null;

  const system = SYSTEM_REGISTRY[systemType];
  const dimension = system?.math.dimension || 3;
  const mapFn =
    system?.math.mapStateToPoint || ((s: any) => [s[0], s[1], s[2]]);
  
  const coords = mapFn(lastPoint, params);
  const coordsB = lastPointB ? mapFn(lastPointB, params) : null;

  const isDark = theme === "dark";

  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        padding: "10px 14px",
        backgroundColor: isDark
          ? "rgba(10, 10, 10, 0.85)"
          : "rgba(255, 255, 255, 0.9)",
        color: isDark ? "#fff" : "#111",
        borderRadius: "8px",
        fontSize: "11px",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        pointerEvents: "none",
        zIndex: 100,
        backdropFilter: "blur(12px)",
        border: `1px solid ${
          isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)"
        }`,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        display: "flex",
        flexDirection: "column",
        minWidth: "160px",
        transition: "all 0.2s ease-in-out",
        gap: "12px",
      }}
    >
      <PositionBlock 
        title={showButterfly ? "Main Position" : "Position"} 
        coords={coords} 
        dimension={dimension} 
        isDark={isDark} 
      />

      {showButterfly && coordsB && (
        <PositionBlock 
          title="Butterfly Position" 
          coords={coordsB} 
          dimension={dimension} 
          isDark={isDark} 
        />
      )}
    </div>
  );
};

export default CoordinateHUD;
