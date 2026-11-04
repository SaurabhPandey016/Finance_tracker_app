import type { RequestHandler } from "express";
import type { TransactionType } from "@prisma/client";
import { analyticsService } from "../services/analytics.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

const requireUser = (req: Parameters<RequestHandler>[0]): string => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  return req.user.id;
};

export const analyticsSummary: RequestHandler = asyncHandler(async (req, res) => {
  const userId = requireUser(req);
  const query = req.query as unknown as { from?: string; to?: string; type?: TransactionType; categoryId?: string };
  const data = await analyticsService.summary(userId, query);
  res.status(200).json({ success: true, message: "Analytics summary retrieved", data });
});

export const analyticsByCategory: RequestHandler = asyncHandler(async (req, res) => {
  const userId = requireUser(req);
  const query = req.query as unknown as { type: TransactionType; from?: string; to?: string; categoryId?: string };
  const data = await analyticsService.byCategory(userId, query.type ?? "EXPENSE", query);
  res.status(200).json({ success: true, message: "Category analytics retrieved", data });
});

export const analyticsMonthly: RequestHandler = asyncHandler(async (req, res) => {
  const userId = requireUser(req);
  const months = Number((req.query as unknown as { months?: number }).months ?? 6);
  const data = await analyticsService.monthly(userId, months);
  res.status(200).json({ success: true, message: "Monthly analytics retrieved", data });
});
