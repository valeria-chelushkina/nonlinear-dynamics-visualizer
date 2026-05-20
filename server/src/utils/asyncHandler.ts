/**
 * @file asyncHandler.ts
 * @description Eliminates try/catch blocks in async Express routing handlers.
 */

import type { Request, Response, NextFunction } from "express";

export const asyncHandler = (fn: (...args: any[]) => Promise<any>): any => {
  return (req: Request, res: Response, next: NextFunction) => {
    return fn(req, res, next).catch(next);
  };
};
