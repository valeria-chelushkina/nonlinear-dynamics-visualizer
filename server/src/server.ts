/**
 * @file server.ts
 * @description Application Entry Point
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import presetRouter from "./routes/preset.routes.js";

// Environmental guard checks
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error("ERROR: JWT_SECRET is not defined in .env file");
  process.exit(1);
}

const app = express();
const PORT = 3000;

// Global middleware
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

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running cleanly" });
});

// Service lifecycle listen event
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
