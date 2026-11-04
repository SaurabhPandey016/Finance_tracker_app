import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { isDatabaseUnavailableError } from "../utils/dbErrors.js";
import { reportFirstConnectionFailure } from "../config/prisma.js";

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  void next;
  let statusCode = 500;
  let message = "Internal server error";
  let errors: unknown;

  if (isDatabaseUnavailableError(error)) {
    reportFirstConnectionFailure(error);
    logger.warn("Database unavailable", error instanceof Error ? error.name : undefined);
    res.setHeader("Retry-After", "30");
    res.status(503).json({
      success: false,
      code: "DB_UNAVAILABLE",
      message: "The database is currently paused or unreachable. Please try again shortly or contact the developer for a live demo.",
    });
    return;
  }

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    errors = error.flatten();
  } else if (typeof error === "object" && error !== null && "code" in error) {
    const code = String(error.code);
    if (code === "P2002") { statusCode = 409; message = "A record with this value already exists"; }
    if (code === "P2025") { statusCode = 404; message = "Record not found"; }
  } else if (typeof error === "object" && error !== null && "name" in error) {
    const name = String(error.name);
    if (["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(name)) {
      statusCode = 401;
      message = "Invalid or expired authentication token";
    }
  }

  if (env.NODE_ENV !== "production") {
    logger.error(error);
    errors = errors ?? (error instanceof Error ? error.stack : error);
  }

  res.status(statusCode).json({ success: false, message, ...(errors === undefined ? {} : { errors }) });
};
