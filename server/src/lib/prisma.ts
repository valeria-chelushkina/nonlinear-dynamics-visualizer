/**
 * @file prisma.ts
 * @description Configures Prisma PostgreSQL driver adapter using a connection pool.
 */

import { PrismaClient } from "@prisma/client"; // Prisma ORM's generated query builder
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("ERROR: DATABASE_URL is not defined in .env file");
  process.exit(1);
}

// Connect to the DB
const pool = new pg.Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
