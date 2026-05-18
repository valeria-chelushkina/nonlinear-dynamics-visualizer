import { aizawaSystem } from "./aizawa";
import { chenSystem } from "./chen";
import { chuaSystem } from "./chua";
import { halvorsenSystem } from "./halvorsen";
import { hindmarshRoseSystem } from "./hindmarshRose";
import { lorenzSystem } from "./lorenz";
import { rosslerSystem } from "./rossler";
import { thomasSystem } from "./thomas";
import type { RegisteredSystem } from "./types";
import { doublePendulumSystem } from "./doublePendulum";

export const SYSTEM_REGISTRY: Record<string, RegisteredSystem> = {
  lorenz: lorenzSystem,
  rossler: rosslerSystem,
  aizawa: aizawaSystem,
  chua: chuaSystem,
  "hindmarsh-rose": hindmarshRoseSystem,
  chen: chenSystem,
  halvorsen: halvorsenSystem,
  thomas: thomasSystem,
  "double-pendulum": doublePendulumSystem,
};

export const SYSTEM_LIST = Object.values(SYSTEM_REGISTRY);

export type { RegisteredSystem, SliderConfig } from "./types";
