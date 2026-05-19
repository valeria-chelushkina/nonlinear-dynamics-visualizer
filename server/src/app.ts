/**
 * @file app.ts
 * @description Configures the framework engine, global middleware and routing layout.
 */

import express from "express";
import cors from "cors";
import { requestLogger } from "./middleware/requestLogger.js";
import authRouter from "./routes/auth.routes.js";
import presetRouter from "./routes/preset.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Global middleware
app.use(requestLogger);
app.use(cors()); // Enables cross-origin requests
app.use(express.json()); // Parses incoming 'application/json' bodies

/**
 * Auth Network Mapping.
 *
 * - POST /api/auth/register -> Creates a new user profile
 * - POST /api/auth/login    -> Validates credentials and signs JSON Web Tokens
 * - GET  /api/users/:userId -> Extracts high-level profile statistics
 */
app.use("/api/auth", authRouter);
app.use("/api", authRouter);

/**
 * Attractor Config & Presets Network Mapping.
 *
 * - GET    /api/presets               -> Retreives shared / public preset lists
 * - POST   /api/presets               -> Appends a new calculation setup (Protected)
 * - DELETE /api/presets/:id           -> Remotely drops a mathematical setup configuration (Protected)
 * - GET    /api/users/:userId/presets -> Fetches configurations linked to a specific developer profile
 */
app.use("/api", presetRouter);

// 3. System Diagnostics & Utilities
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Application is configured cleanly" });
});

app.use(errorHandler);

// Export the configured app instance
export default app;
