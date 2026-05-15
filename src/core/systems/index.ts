import { lorenzSystem } from './lorenz';
import { rosslerSystem } from './rossler';
import type { SystemDefinition } from './types';

export const SYSTEM_REGISTRY: Record<string, SystemDefinition> = {
  lorenz: lorenzSystem,
  rossler: rosslerSystem,
};

export const SYSTEM_LIST = Object.values(SYSTEM_REGISTRY);

export type { SystemDefinition, SliderConfig } from './types';
