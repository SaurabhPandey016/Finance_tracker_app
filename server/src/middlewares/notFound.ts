import type { RequestHandler } from "express";
import { AppError } from "../utils/AppError.js";

export const notFound: RequestHandler = (req, res, next) => {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};
