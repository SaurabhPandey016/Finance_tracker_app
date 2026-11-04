import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";
import { isDatabaseUnavailableError } from "../utils/dbErrors.js";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient; dbConnectionWarningLogged?: boolean };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

export const reportFirstConnectionFailure = (error: unknown): void => {
  if (!isDatabaseUnavailableError(error) || globalForPrisma.dbConnectionWarningLogged) return;
  globalForPrisma.dbConnectionWarningLogged = true;
  logger.warn("Database connection unavailable; continuing without a database connection");
};

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
