/**
 * @file preseta.ts
 * @description Presets API Data Access Object (DAO)
 * Handles all network requests, header serialization, and payload transport
 * for user system configurations and simulation presets.
 */

export interface SavePresetPayload {
  /** The name of simulation preset that user sets */
  name: string;
  /** Tupe of the system, for example: 'lorenz', 'rossler', etc... */
  systemType: string;
  /** Saved parameters */
  parameters: Record<string, number>;
  /** Whether preset is public or private */
  isPublic: boolean;
  /** Three-dimensional perspective camera coordinates configuration */
  cameraConfig: {
    position: [number, number, number];
    target: [number, number, number];
  } | null;
  /** Color profiles and rendering options applied to the WebGL trace path lines */
  visuals: {
    color: string;
    useGradient: boolean;
    colorEnd?: string;
  };
}

/**
 * Transmits a completed chaotic system simulation configuration payload 
 * to the backend database architecture storage layer.
 * 
 * @param payload - Complete structural settings payload mapping for the preset.
 * @param token - Valid JWT identifying the authenticated user context.
 * @returns Promise resolving to the unmarshalled JSON backend response object.
 * @throws {Error} If HTTP response status resolves outside the standard 2xx success footprint.
 */
export const savePresetApi = async (
  payload: SavePresetPayload,
  token: string
): Promise<any> => {
  const response = await fetch("http://localhost:3000/api/presets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorDetails = await response.text().catch(() => "Unknown error");
    throw new Error(`Failed to save simulation preset: ${response.status} - ${errorDetails}`);
  }

  return response.json();
};