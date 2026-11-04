import { z } from "zod";
import { TransactionType } from "@prisma/client";

const amountSchema = z.number().finite().positive().max(100_000_000).refine(
  (amount) => Math.abs(amount * 100 - Math.round(amount * 100)) < 0.000001,
  "Amount must have no more than 2 decimal places",
);

const isoDateSchema = z.string().datetime({ offset: true }).refine(
  (value) => {
    const date = new Date(value);
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    return Number.isFinite(date.getTime()) && date <= oneYearFromNow;
  },
  "Date must be valid and no more than one year in the future",
);

export const createTransactionSchema = z.object({
  body: z.object({
    type: z.nativeEnum(TransactionType),
    categoryId: z.string().cuid(),
    amount: amountSchema,
    note: z.string().trim().max(200).optional(),
    date: isoDateSchema,
  }),
});

export const updateTransactionSchema = z.object({
  body: z.object({
    type: z.nativeEnum(TransactionType).optional(),
    categoryId: z.string().cuid().optional(),
    amount: amountSchema.optional(),
    note: z.string().trim().max(200).optional(),
    date: isoDateSchema.optional(),
  }).refine((body) => Object.keys(body).length > 0, "At least one field is required"),
});

export const listTransactionsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10),
    type: z.nativeEnum(TransactionType).optional(),
    categoryId: z.string().cuid().optional(),
    from: z.string().datetime({ offset: true }).optional(),
    to: z.string().datetime({ offset: true }).optional(),
    search: z.string().trim().max(200).optional(),
    sortBy: z.enum(["date", "amount"]).default("date"),
    order: z.enum(["asc", "desc"]).default("desc"),
  }).refine((query) => !query.from || !query.to || new Date(query.from) <= new Date(query.to), "from must be before or equal to to"),
});

export const transactionIdSchema = z.object({ params: z.object({ id: z.string().cuid() }) });
export const listCategoriesSchema = z.object({ query: z.object({ type: z.nativeEnum(TransactionType).optional() }) });
