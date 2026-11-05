import { z } from "zod";
import { TransactionType } from "@prisma/client";

export const analyticsSummarySchema = z.object({
  query: z.object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    type: z.nativeEnum(TransactionType).optional(),
    categoryId: z.string().cuid().optional(),
  }).refine((query) => !query.from || !query.to || query.from <= query.to, "from must be before or equal to to"),
});

export const analyticsByCategorySchema = z.object({
  query: z.object({
    type: z.nativeEnum(TransactionType).default("EXPENSE"),
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    categoryId: z.string().cuid().optional(),
  }),
});

export const analyticsMonthlySchema = z.object({
  query: z.object({
    months: z.coerce.number().int().positive().max(24).default(6),
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    type: z.nativeEnum(TransactionType).optional(),
    categoryId: z.string().cuid().optional(),
  }),
});
