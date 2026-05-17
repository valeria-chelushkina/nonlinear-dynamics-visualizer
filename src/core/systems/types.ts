import type { StateVector, Vector3, DerivativeFn } from "@/core/math/types";

export interface SliderConfig {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
}

export interface SystemDefinition {
  id: string;
  name: string;
  description: string;
  equations: string[];
  history: string;
  use: string[];
  dimension?: 2 | 3;
  defaultParams: Record<string, number>;
  getDerivative: (params: any) => DerivativeFn;
  sliders: SliderConfig[];
  cameraConfig?: {
    position: [number, number, number];
    target: [number, number, number];
  };
  initialPoint?: StateVector; // Legacy, will use initialState if present
  initialState?: StateVector;
  mapStateToPoint?: (state: StateVector, params: any) => Vector3;
  initialSpeed?: number;
}
