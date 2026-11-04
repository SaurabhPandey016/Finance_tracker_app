import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { categoryRouter, transactionRouter } from "./transaction.routes.js";
import { healthRouter } from "./health.routes.js";
import { analyticsRouter } from "./analytics.routes.js";

export const apiRouter = Router();
apiRouter.use(healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use(categoryRouter);
apiRouter.use("/transactions", transactionRouter);
apiRouter.use("/analytics", analyticsRouter);
