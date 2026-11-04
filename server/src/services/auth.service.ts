import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const toPublicUser = (user: {
  id: string;
  name: string;
  email: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}): PublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  currency: user.currency,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
const dummyPasswordHash = await bcrypt.hash("DummyPasswordNotARealCredential!1", 12);

export const authService = {
  async register(input: { name: string; email: string; password: string }) {
    const email = input.email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError(409, "Email already registered");
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({ data: { name: input.name.trim(), email, passwordHash } });
    return toPublicUser(user);
  },

  async login(input: { email: string; password: string }) {
    const email = input.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    const hash = user?.passwordHash ?? dummyPasswordHash;
    const passwordMatches = await bcrypt.compare(input.password, hash);
    if (!user || !passwordMatches) throw new AppError(401, "Invalid email or password");
    return toPublicUser(user);
  },

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(401, "Unauthorized");
    return toPublicUser(user);
  },

  async updateProfile(userId: string, input: { name: string; currency: "INR" | "USD" }) {
    const user = await prisma.user.update({ where: { id: userId }, data: { name: input.name.trim(), currency: input.currency } });
    return toPublicUser(user);
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(401, "Unauthorized");
    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) throw new AppError(401, "Current password is incorrect");
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  },
};
