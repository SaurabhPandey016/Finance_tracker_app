import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import { validate } from "../middlewares/validate.js";
import { changePasswordSchema, loginSchema, registerSchema, updateProfileSchema } from "../validators/auth.validator.js";
import { changePassword, getMe, login, logout, register, updateProfile } from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", authLimiter, validate(registerSchema), register);
authRouter.post("/login", authLimiter, validate(loginSchema), login);
authRouter.post("/logout", logout);
authRouter.get("/me", authenticate, getMe);
authRouter.patch("/me", authenticate, validate(updateProfileSchema), updateProfile);
authRouter.patch("/password", authenticate, validate(changePasswordSchema), changePassword);
