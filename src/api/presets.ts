/**
 * @file presets.ts
 * @description Handles saving and loading saved simulation presets from (and to) the server.
 */

export interface SavePresetPayload {
  /** The name of simulation preset that user sets. */
  name: string;
  /** Type of the system, for example: 'lorenz', 'rossler', etc... */
  systemType: string;
  /** Saved parameters. */
  parameters: Record<string, number>;
  /** Whether preset is public or private. */
  isPublic: boolean;
  /** Where the 3D camera is looking and positioned. */
  cameraConfig: {
    position: [number, number, number];
    target: [number, number, number];
  } | null;
  /** How the 3D lines look on screen (colors, gradients). */
  visuals: {
    color: string;
    useGradient: boolean;
    colorEnd?: string;
  };
}

/**
 * Sends the current simulation settings to the database to save them.
 * 
 * @param payload - The settings data to save.
 * @param token - The user's login token (JWT) for authentication.
 * @returns The server's response data.
 * @throws An error if the server fails to save the data.
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