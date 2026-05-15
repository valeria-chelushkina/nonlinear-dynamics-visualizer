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
  defaultParams: Record<string, number>;
  getDerivative: (params: any) => DerivativeFn;
  sliders: SliderConfig[];
}
