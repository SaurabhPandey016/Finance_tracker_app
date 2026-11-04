import { z } from "zod";
import { TransactionType } from "@prisma/client";

export const analyticsSummarySchema = z.object({
  query: z.object({
    from: z.string().datetime({ offset: true }).optional(),
    to: z.string().datetime({ offset: true }).optional(),
    type: z.nativeEnum(TransactionType).optional(),
    categoryId: z.string().cuid().optional(),
  }).refine((query) => !query.from || !query.to || new Date(query.from) <= new Date(query.to), "from must be before or equal to to"),
});

export const analyticsByCategorySchema = z.object({
  query: z.object({
    type: z.nativeEnum(TransactionType).default("EXPENSE"),
    from: z.string().datetime({ offset: true }).optional(),
    to: z.string().datetime({ offset: true }).optional(),
    categoryId: z.string().cuid().optional(),
  }),
});

export const analyticsMonthlySchema = z.object({
  query: z.object({ months: z.coerce.number().int().positive().max(24).default(6) }),
});
