import type { RequestHandler } from "express";
import { prisma } from "../config/prisma.js";
import { verifyAuthToken } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";

export const authenticate: RequestHandler = async (req, res, next) => {
  void res;
  try {
    const token = req.cookies?.token;
    if (typeof token !== "string") throw new AppError(401, "Unauthorized");
    const payload = verifyAuthToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw new AppError(401, "Unauthorized");
    req.user = user;
    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError(401, "Unauthorized"));
  }
};
