import type { Prisma, TransactionType } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

export interface TransactionFilters {
  userId: string;
  type?: TransactionType;
  categoryId?: string;
  from?: string;
  to?: string;
  search?: string;
}

export const buildTransactionWhere = (filters: TransactionFilters): Prisma.TransactionWhereInput => {
  const where: Prisma.TransactionWhereInput = { userId: filters.userId };
  if (filters.type) where.type = filters.type;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.search) where.note = { contains: filters.search, mode: "insensitive" };
  if (filters.from || filters.to) {
    where.date = {};
    if (filters.from) where.date.gte = new Date(filters.from);
    if (filters.to) {
      const end = new Date(filters.to);
      end.setUTCHours(23, 59, 59, 999);
      where.date.lte = end;
    }
  }
  return where;
};

const toMajorUnits = (amountMinor: number): number => amountMinor / 100;

const categorySelection = {
  id: true,
  name: true,
  icon: true,
  color: true,
} satisfies Prisma.CategorySelect;

const toTransactionResponse = (transaction: {
  id: string; userId: string; categoryId: string; type: TransactionType; amountMinor: number;
  note: string | null; date: Date; createdAt: Date; updatedAt: Date;
  category: { id: string; name: string; icon: string; color: string };
}) => ({ ...transaction, amount: toMajorUnits(transaction.amountMinor), category: transaction.category });

const validateCategory = async (categoryId: string, type: TransactionType) => {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category || category.type !== type) throw new AppError(400, "Category type must match transaction type");
};

export const transactionService = {
  async listCategories(type?: TransactionType) {
    return prisma.category.findMany({
      where: { isSystem: true, ...(type ? { type } : {}) },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });
  },

  async create(userId: string, input: { type: TransactionType; categoryId: string; amount: number; note?: string; date: string }) {
    await validateCategory(input.categoryId, input.type);
    const transaction = await prisma.transaction.create({
      data: { userId, type: input.type, categoryId: input.categoryId, amountMinor: Math.round(input.amount * 100), note: input.note, date: new Date(input.date) },
      include: { category: { select: categorySelection } },
    });
    return toTransactionResponse(transaction);
  },

  async list(userId: string, filters: TransactionFilters, options: { page: number; limit: number; sortBy: "date" | "amount"; order: "asc" | "desc" }) {
    const where = buildTransactionWhere(filters);
    const [items, total] = await prisma.$transaction([
      prisma.transaction.findMany({
        where, skip: (options.page - 1) * options.limit, take: options.limit,
        orderBy: options.sortBy === "amount" ? { amountMinor: options.order } : { date: options.order },
        include: { category: { select: categorySelection } },
      }),
      prisma.transaction.count({ where }),
    ]);
    const totalPages = Math.ceil(total / options.limit);
    return {
      items: items.map(toTransactionResponse),
      pagination: { page: options.page, limit: options.limit, total, totalPages, hasNext: options.page < totalPages, hasPrev: options.page > 1 },
    };
  },

  async getById(userId: string, id: string) {
    const transaction = await prisma.transaction.findFirst({ where: { id, userId }, include: { category: { select: categorySelection } } });
    if (!transaction) throw new AppError(404, "Transaction not found");
    return toTransactionResponse(transaction);
  },

  async update(userId: string, id: string, input: { type?: TransactionType; categoryId?: string; amount?: number; note?: string; date?: string }) {
    const existing = await prisma.transaction.findFirst({ where: { id, userId } });
    if (!existing) throw new AppError(404, "Transaction not found");
    const type = input.type ?? existing.type;
    const categoryId = input.categoryId ?? existing.categoryId;
    await validateCategory(categoryId, type);
    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...(input.type !== undefined ? { type: input.type } : {}),
        ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
        ...(input.amount !== undefined ? { amountMinor: Math.round(input.amount * 100) } : {}),
        ...(input.note !== undefined ? { note: input.note } : {}),
        ...(input.date !== undefined ? { date: new Date(input.date) } : {}),
      },
      include: { category: { select: categorySelection } },
    });
    return toTransactionResponse(transaction);
  },

  async delete(userId: string, id: string) {
    const existing = await prisma.transaction.findFirst({ where: { id, userId }, select: { id: true } });
    if (!existing) throw new AppError(404, "Transaction not found");
    await prisma.transaction.delete({ where: { id } });
  },
};
