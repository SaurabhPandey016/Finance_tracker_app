import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { logger } from "./utils/logger.js";
import { isDatabaseUnavailableError } from "./utils/dbErrors.js";
import { reportFirstConnectionFailure } from "./config/prisma.js";

const server = app.listen(env.PORT, () => {
  logger.info(`FinTrack API listening on port ${env.PORT}`);
});

let shuttingDown = false;
const shutdown = (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`${signal} received; shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  if (isDatabaseUnavailableError(reason)) {
    reportFirstConnectionFailure(reason);
    logger.warn("Unhandled database rejection; keeping server running");
    return;
  }
  logger.error("Unhandled rejection", reason);
  shutdown("unhandledRejection");
});

process.on("uncaughtException", (error) => {
  if (isDatabaseUnavailableError(error)) {
    reportFirstConnectionFailure(error);
    logger.warn("Uncaught database exception; keeping server running");
    return;
  }
  logger.error("Uncaught exception", error);
  shutdown("uncaughtException");
});
