import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import { analyticsByCategorySchema, analyticsMonthlySchema, analyticsSummarySchema } from "../validators/analytics.validator.js";
import { analyticsByCategory, analyticsMonthly, analyticsSummary } from "../controllers/analytics.controller.js";

export const analyticsRouter = Router();
analyticsRouter.use(authenticate);
analyticsRouter.get("/summary", validate(analyticsSummarySchema), analyticsSummary);
analyticsRouter.get("/by-category", validate(analyticsByCategorySchema), analyticsByCategory);
analyticsRouter.get("/monthly", validate(analyticsMonthlySchema), analyticsMonthly);
