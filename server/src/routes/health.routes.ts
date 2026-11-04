import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { logger } from "../utils/logger.js";
import { isDatabaseUnavailableError } from "../utils/dbErrors.js";
import { reportFirstConnectionFailure } from "../config/prisma.js";
import { rateLimit } from "express-rate-limit";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    server: "up",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

const statusLimiter = rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: "draft-7", legacyHeaders: false });

healthRouter.get("/status", statusLimiter, async (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const startedAt = Date.now();
  let database: "up" | "down" = "down";

  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Database status check timed out")), 4_000);
      }),
    ]);
    database = "up";
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      reportFirstConnectionFailure(error);
      logger.warn("Database status check unavailable", error instanceof Error ? error.name : undefined);
    }
  }

  res.status(200).json({
    success: true,
    server: "up",
    database,
    checkedAt: new Date().toISOString(),
    responseTimeMs: Date.now() - startedAt,
  });
});
