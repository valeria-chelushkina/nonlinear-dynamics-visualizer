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
import { henonSystem } from "./henon";
import { ikedaSystem } from "./ikeda";
import { cliffordSystem } from "./clifford";
import { logisticMapSystem } from "./logistic";

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
  henon: henonSystem,
  ikeda: ikedaSystem,
  clifford: cliffordSystem,
  logistic: logisticMapSystem,
};

export const SYSTEM_LIST = Object.values(SYSTEM_REGISTRY);

export type { RegisteredSystem, SliderConfig } from "./types";
