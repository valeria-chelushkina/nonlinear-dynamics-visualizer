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
app.use(express.json());

/**
 * Auth mapping.
 *
 * - POST /api/auth/register -> Creates a new user profile
 * - POST /api/auth/login    -> Validates credentials and signs JWT
 * - GET  /api/users/:userId -> Gets profile statistics
 */
app.use("/api/auth", authRouter);
app.use("/api", authRouter);

/**
 * Presets mapping.
 *
 * - GET    /api/presets               -> Gets public presets lists
 * - POST   /api/presets               -> Creates a new preset
 * - DELETE /api/presets/:id           -> Deletes a preset by id (only user that created can delete it)
 * - GET    /api/users/:userId/presets -> Gets all presets by a specific user
 */
app.use("/api", presetRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Application is configured cleanly" });
});

app.use(errorHandler);

export default app;
