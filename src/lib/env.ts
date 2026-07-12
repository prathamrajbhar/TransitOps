/**
 * src/lib/env.ts
 * Validated, typed environment variables using Zod.
 * Import this instead of process.env directly.
 */
import { z } from "zod";

const envSchema = z.object({
  // ── Database ─────────────────────────────────────────────────
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .url("DATABASE_URL must be a valid URL"),

  // ── Auth (JWT signing) ────────────────────────────────────────
  AUTH_SECRET: z
    .string()
    .min(32, "AUTH_SECRET must be at least 32 characters"),

  // ── App URL ───────────────────────────────────────────────────
  APP_URL: z
    .string()
    .url("APP_URL must be a valid URL")
    .default("http://localhost:3000"),

  // ── Environment ──────────────────────────────────────────────
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const messages = Object.entries(errors)
      .map(([key, msgs]) => `  ${key}: ${msgs?.join(", ")}`)
      .join("\n");

    throw new Error(
      `❌ Invalid environment variables:\n${messages}\n\nCheck your .env file.`
    );
  }

  return result.data;
}

// Validate once at module load time; throws immediately if misconfigured
export const env = validateEnv();
