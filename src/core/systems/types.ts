import type { DerivativeFn } from '@/core/math/types';

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
  defaultParams: Record<string, number>;
  getDerivative: (params: any) => DerivativeFn;
  sliders: SliderConfig[];
  cameraConfig?: {
    position: [number, number, number];
    target: [number, number, number];
  };
  initialPoint?: [number, number, number];
  initialSpeed?: number;
}
