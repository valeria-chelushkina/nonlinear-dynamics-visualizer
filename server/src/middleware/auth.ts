/**
 * @file auth.ts
 * @description Authentication middleware for JWT validation and request enrichment.
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Verifies the identity of the requester by validating the JWT provided in the 'Authorization' header.
 *
 * @example
 * // Authorization: Bearer <token>
 *
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction to pass control to the next handler
 *
 * @returns
 * - 401 Unauthorized: If the token is missing or the header format is incorrect.
 * - 403 Forbidden: If the token is invalid or has expired.
 * - Calls next(): If the token is valid, injecting the userId into the request object.
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  // Check if authorization header exists and follows 'Bearer <token>' format
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Access denied. No authentication token provided.",
    });
  }

  if (!JWT_SECRET) {
    console.error("CRITICAL: JWT_SECRET is not defined in the environment.");
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

    return res.status(403).json({ error: message });
  }
};
