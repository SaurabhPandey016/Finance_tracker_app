import { z } from "zod";
import { TransactionType } from "@prisma/client";

const amountSchema = z.number().finite().positive().max(100_000_000).refine(
  (amount) => Math.abs(amount * 100 - Math.round(amount * 100)) < 0.000001,
  "Amount must have no more than 2 decimal places",
);

const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format").refine(
  (value) => {
    const today = new Date();
    const max = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1, 23, 59, 59, 999));
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(date.getTime()) && date <= max;
  },
  "Date cannot be in the future",
);

export const createTransactionSchema = z.object({
  body: z.object({
    type: z.nativeEnum(TransactionType),
    categoryId: z.string().cuid(),
    amount: amountSchema,
    note: z.string().trim().max(200).optional(),
    date: dateOnlySchema,
  }),
});

export const updateTransactionSchema = z.object({
  body: z.object({
    type: z.nativeEnum(TransactionType).optional(),
    categoryId: z.string().cuid().optional(),
    amount: amountSchema.optional(),
    note: z.string().trim().max(200).optional(),
    date: dateOnlySchema.optional(),
  }).refine((body) => Object.keys(body).length > 0, "At least one field is required"),
});

export const listTransactionsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10),
    type: z.nativeEnum(TransactionType).optional(),
    categoryId: z.string().cuid().optional(),
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    search: z.string().trim().max(200).optional(),
    sortBy: z.enum(["date", "amount"]).default("date"),
    order: z.enum(["asc", "desc"]).default("desc"),
  }).refine((query) => !query.from || !query.to || query.from <= query.to, "from must be before or equal to to"),
});

export const transactionIdSchema = z.object({ params: z.object({ id: z.string().cuid() }) });
export const listCategoriesSchema = z.object({ query: z.object({ type: z.nativeEnum(TransactionType).optional() }) });
