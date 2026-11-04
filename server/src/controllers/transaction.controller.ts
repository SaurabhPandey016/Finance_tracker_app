import type { RequestHandler } from "express";
import { transactionService } from "../services/transaction.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import type { TransactionType } from "@prisma/client";

const requireUser = (req: Parameters<RequestHandler>[0]) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  return req.user.id;
};

const getIdParam = (req: Parameters<RequestHandler>[0]): string => {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] ?? "" : id;
};

export const listCategories: RequestHandler = asyncHandler(async (req, res) => {
  const categories = await transactionService.listCategories(req.query.type as TransactionType | undefined);
  res.status(200).json({ success: true, message: "Categories retrieved", data: { categories } });
});

export const createTransaction: RequestHandler = asyncHandler(async (req, res) => {
  const userId = requireUser(req);
  const transaction = await transactionService.create(userId, req.body);
  res.status(201).json({ success: true, message: "Transaction created", data: { transaction } });
});

export const listTransactions: RequestHandler = asyncHandler(async (req, res) => {
  const userId = requireUser(req);
  const query = req.query as unknown as { page: number; limit: number; type?: TransactionType; categoryId?: string; from?: string; to?: string; search?: string; sortBy: "date" | "amount"; order: "asc" | "desc" };
  const result = await transactionService.list(userId, {
    userId,
    type: query.type,
    categoryId: query.categoryId,
    from: query.from,
    to: query.to,
    search: query.search,
  }, {
    page: Number(query.page || 1),
    limit: Number(query.limit || 10),
    sortBy: query.sortBy || "date",
    order: query.order || "desc",
  });
  res.status(200).json({ success: true, message: "Transactions retrieved", data: result });
});

export const getTransaction: RequestHandler = asyncHandler(async (req, res) => {
  const userId = requireUser(req);
  const transaction = await transactionService.getById(userId, getIdParam(req));
  res.status(200).json({ success: true, message: "Transaction retrieved", data: { transaction } });
});

export const updateTransaction: RequestHandler = asyncHandler(async (req, res) => {
  const userId = requireUser(req);
  const transaction = await transactionService.update(userId, getIdParam(req), req.body);
  res.status(200).json({ success: true, message: "Transaction updated", data: { transaction } });
});

export const deleteTransaction: RequestHandler = asyncHandler(async (req, res) => {
  const userId = requireUser(req);
  await transactionService.delete(userId, getIdParam(req));
  res.status(200).json({ success: true, message: "Transaction deleted" });
});
