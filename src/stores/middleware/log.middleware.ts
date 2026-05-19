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
        AppLogger.stateChange(name, actionName, nextState);
      },
      get,
      api,
    );
