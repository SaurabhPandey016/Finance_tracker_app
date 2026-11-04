import type { NextFunction, Request, Response } from "express";
import type { AnyZodObject } from "zod";

export const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!result.success) {
    res.status(400).json({ success: false, message: "Validation failed", errors: result.error.flatten() });
    return;
  }
  req.body = result.data.body ?? req.body;
  next();
};
