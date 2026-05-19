/**
 * @file auth.ts
 * @description Authentication middleware for JWT validation and request enrichment.
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger.js";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  const authHeader = req.headers.authorization;

  // Check if authorization header exists and follows 'Bearer <token>' format
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    logger.warn(`Auth Failed: No token provided by ${req.ip}`);
    return res.status(401).json({
      error: "Access denied. No authentication token provided.",
    });
  }

  if (!JWT_SECRET) {
    logger.error("CRITICAL: JWT_SECRET is not defined in the environment.");
    return res.status(500).json({
      error: "Internal server configuration error.",
    });
  }

  try {
    // Verify token signature and expiration
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Attach userId to the request object
    req.userId = decoded.userId;

    // Proceed to the next middleware or controller
    next();
  } catch (err) {
    // Distinguish between expired and invalid tokens if needed
    const message =
      err instanceof jwt.TokenExpiredError
        ? "Session expired. Please log in again."
        : "Invalid authentication token.";

    logger.warn(`Auth Failed: ${message} from ${req.ip}`);
    return res.status(403).json({ error: message });
  }
};
