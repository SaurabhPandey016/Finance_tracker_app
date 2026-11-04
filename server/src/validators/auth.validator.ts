import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(50),
    email: z.string().trim().email().max(254),
    password: z.string().min(8).regex(/[A-Za-z]/, "Password must contain a letter").regex(/[0-9]/, "Password must contain a number"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email().max(254),
    password: z.string().min(1),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(50),
    currency: z.enum(["INR", "USD"]),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).regex(/[A-Za-z]/, "Password must contain a letter").regex(/[0-9]/, "Password must contain a number"),
  }),
});
