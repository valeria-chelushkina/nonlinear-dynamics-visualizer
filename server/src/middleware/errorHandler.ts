/**
 * @file errorHandler.ts
 * @description Central error interceptor normalizing API exception responses and validation payloads.
 */

import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import { ZodError } from "zod";
import { logger } from "../utils/logger.js";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation Failed",
      details: err.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  const statusCode = (err as any).statusCode || 500;
  const message = err.message || "An unexpected server error occurred.";

  logger.error(`[Error Boundary]: ${message}`, err);

  res.status(statusCode).json({
    error: statusCode === 500 ? "Internal Server Error" : "Application Error",
    message,
  });
};
