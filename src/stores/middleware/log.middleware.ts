/**
 * @file log.middleware.ts
 * @description Zustand middleware for automatic state change logging.
 */

import { AppLogger } from "@/core/utils/logger";

export const logger =
  (name: string) => (config: any) => (set: any, get: any, api: any) =>
    config(
      (args: any) => {
        // Find the action name if possible
        const actionName =
          typeof args === "function" ? "Anonymous Action" : "Direct Set";

        set(args);

        const nextState = get();

        const loggableState = {
          ...nextState,
          sims: nextState.sims ? {
            left: nextState.sims.left ? { 
              ...nextState.sims.left, 
              points: `[Array(${nextState.sims.left.points?.length || 0})]` 
            } : undefined,
            right: nextState.sims.right ? { 
              ...nextState.sims.right, 
              points: `[Array(${nextState.sims.right.points?.length || 0})]` 
            } : undefined,
          } : undefined
        };

        AppLogger.stateChange(name, actionName, loggableState);
      },
      get,
      api,
    );
