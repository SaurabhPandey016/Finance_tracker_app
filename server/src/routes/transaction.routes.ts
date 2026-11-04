import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import { createTransaction, deleteTransaction, getTransaction, listCategories, listTransactions, updateTransaction } from "../controllers/transaction.controller.js";
import { createTransactionSchema, listCategoriesSchema, listTransactionsSchema, transactionIdSchema, updateTransactionSchema } from "../validators/transaction.validator.js";

export const categoryRouter = Router();
categoryRouter.get("/categories", authenticate, validate(listCategoriesSchema), listCategories);

export const transactionRouter = Router();
transactionRouter.use(authenticate);
transactionRouter.post("/", validate(createTransactionSchema), createTransaction);
transactionRouter.get("/", validate(listTransactionsSchema), listTransactions);
transactionRouter.get("/:id", validate(transactionIdSchema), getTransaction);
transactionRouter.patch("/:id", validate(transactionIdSchema.merge(updateTransactionSchema)), updateTransaction);
transactionRouter.delete("/:id", validate(transactionIdSchema), deleteTransaction);
