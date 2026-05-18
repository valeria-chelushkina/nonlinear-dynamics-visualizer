import type { Request, Response, NextFunction } from "express";
import type { ZodObject } from "zod";

export const validate = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Strips unregistered parameter elements out automatically
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = parsed.body;
      next();
    } catch (error) {
      next(error); // Pass schema validation errors into the central error handler
    }
  };
};