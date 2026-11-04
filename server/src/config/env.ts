import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(10000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  CLIENT_URL: z.string().url().transform((value) => value.replace(/\/+$/, "")).default("http://localhost:3000"),
  DATABASE_URL: z.string().url().or(z.string().startsWith("postgresql://")).default("postgresql://postgres:postgres@localhost:5432/fintrack?schema=public"),
  DIRECT_URL: z.string().url().or(z.string().startsWith("postgresql://")).default("postgresql://postgres:postgres@localhost:5432/fintrack?schema=public"),
  JWT_SECRET: z.string().min(32).default("development-only-secret-change-me-32-characters"),
  JWT_EXPIRES_IN: z.string().min(1).default("7d"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n");
  throw new Error(`Invalid environment configuration:\n${details}`);
}

export const env = parsed.data;
