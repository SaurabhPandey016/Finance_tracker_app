import type { NextFunction, Request, Response } from "express";
import type { AnyZodObject } from "zod";

export const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!result.success) {
    res.status(400).json({ success: false, message: "Validation failed", errors: result.error.flatten() });
    return;
  }
  if (result.data.body !== undefined) req.body = result.data.body;
  if (result.data.query !== undefined) Object.assign(req.query, result.data.query);
  if (result.data.params !== undefined) Object.assign(req.params, result.data.params);
  next();
};
