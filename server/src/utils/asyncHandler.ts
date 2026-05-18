/**
 * @file asyncHandler.ts
 * @description Function wrapper eliminating repetitive try/catch blocks 
 * in asynchronous Express routing handlers.
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";

export const asyncHandler = (fn: (...args: any[]) => Promise<any>): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};