import type { RequestHandler } from "express";
import { authService } from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signAuthToken } from "../utils/jwt.js";
import { clearAuthCookie, setAuthCookie } from "../utils/cookies.js";
import { AppError } from "../utils/AppError.js";

export const register: RequestHandler = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body as { name: string; email: string; password: string });
  const { user } = result;
  setAuthCookie(res, signAuthToken(user.id, result.tokenVersion));
  res.status(201).json({ success: true, message: "Registration successful", data: { user } });
});

export const login: RequestHandler = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body as { email: string; password: string });
  const { user } = result;
  setAuthCookie(res, signAuthToken(user.id, result.tokenVersion));
  res.status(200).json({ success: true, message: "Login successful", data: { user } });
});

export const logout: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  await authService.revokeSessions(req.user.id);
  clearAuthCookie(res);
  res.status(200).json({ success: true, message: "Logout successful" });
});

export const getMe: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const user = await authService.getMe(req.user.id);
  res.status(200).json({ success: true, message: "Profile retrieved", data: { user } });
});

export const updateProfile: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const user = await authService.updateProfile(req.user.id, req.body as { name: string; currency: "INR" | "USD" });
  res.status(200).json({ success: true, message: "Profile updated", data: { user } });
});

export const changePassword: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const input = req.body as { currentPassword: string; newPassword: string };
  await authService.changePassword(req.user.id, input.currentPassword, input.newPassword);
  res.status(200).json({ success: true, message: "Password changed successfully" });
});
