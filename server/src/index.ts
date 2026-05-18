/**
 * @file index.ts
 * @description Binds the configured Express application factory to a physical network port.
 */

import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
  console.error("ERROR: JWT_SECRET is missing from your .env configuration.");
  process.exit(1);
}

app.listen(PORT, () => {
  // Server restarted to pick up new Prisma Client
  console.log(`Production server executing at: http://localhost:${PORT}`);
});
